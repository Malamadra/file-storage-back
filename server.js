const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const asyncBusboy = require('async-busboy')
const WebSocket = require('ws')
const http = require('http')

const app = new Koa()

const server = http.createServer(app.callback())

const wss = new WebSocket.Server({ server })

const router = new Router()

app.use(cors()).use(bodyParser()).use(router.routes())

router.post('/upload-file', async (ctx) => {
  const { files } = await asyncBusboy(ctx.req)

  const fileStream = files[0]

  const filename = fileStream.filename

  const writebleStream = fs.createWriteStream(__dirname + `/files/${filename}`)

  const fileSize = Number(ctx.request.headers['content-length'])

  let uploaded = 0

  fileStream.on('data', (chunk) => {
    uploaded += chunk.length

    const percentage = Math.floor((uploaded / fileSize) * 100)
    console.log(percentage)
  })

  fileStream.on('end', () => {
    uploaded = 0
  })

  fileStream.pipe(writebleStream)

  ctx.body = ''
})

server.listen(4000, () => {
  console.log('Server is running')
})
