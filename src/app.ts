import express, { Express } from 'express'
import dotenv from 'dotenv'
import glob from 'glob'
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import cors from 'cors'

import controllers from './utils/controllers'
import QuizSocketHandler from 'sockets/quizSocketHandler'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

const server = http.createServer(app)

// Setup web socket server
// to push
const wss = new WebSocketServer({ server })
const quizSocketHandler = new QuizSocketHandler()

wss.on('connection', (client: WebSocket, req: http.IncomingMessage) =>
  quizSocketHandler.onConnection(client, req),
)

// Setup middlewares
app.use(cors())
app.use(express.json())

// Initialize and load controllers
controllers.init(app)
const files = glob.sync('src/controllers/**/*.ts')

for (const filePath of files) {
  const path = '.' + filePath.replace('src', '').split('.')[0]
  import(path)
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
