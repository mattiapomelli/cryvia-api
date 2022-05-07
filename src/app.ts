import express, { Express } from 'express'
import dotenv from 'dotenv'
import glob from 'glob'
import { WebSocketServer } from 'ws'
import http from 'http'
import handleSocketConnection from 'sockets/quiz'

import controllers from './utils/controllers'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

const server = http.createServer(app)

const wss = new WebSocketServer({ server })
wss.on('connection', handleSocketConnection)

app.use(express.json())

controllers.init(app)

// Load controllers

const files = glob.sync('src/controllers/**/*.ts')

for (const filePath of files) {
  const path = '.' + filePath.replace('src', '').split('.')[0]
  import(path)
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
