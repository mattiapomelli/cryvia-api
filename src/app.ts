import express, { Express } from 'express'
import dotenv from 'dotenv'
// import glob from 'glob'
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'

// import controllers from './utils/controllers'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// c'è da capire come fare le stanze per ogni domanda dinamicamente
// const questions: WebSocket[][] = [[], [], [], [], [], [], [], [], []]

// questa è la lobby (io avrei fatto pure una HASHMAP ma ho avuto problemi con i tipi)
// const lobby: WebSocket[] = []
const lobby = new Map<number, WebSocket>()

wss.on('connection', (client, req) => {
  // prendo id utente dall'url
  // trasformare req.url in classe URLsearchparams per migliore ricerca di chiave nel querystring
  const userId = Number(req.url?.split('=')[1])

  // aggiungi client alla lobby
  lobby.set(userId, client)

  // questo è un copia incolla dei messaggi preso da internet

  // //connection is up, let's add a simple simple event
  // client.on('message', (message: string) => {
  //   //log the received message and send it back to the client
  //   console.log('received: %s', message)
  //   client.send(`Hello, you sent -> ${message}`)
  // })

  // quando un client chiude connessione al socket
  client.on('close', function () {
    // se client esiste nella lobby lo elimina
    if (lobby.has(userId)) {
      lobby.delete(userId)
    }

    // manda messaggio al client con quanti utenti sono collegati alla lobby dopo la sua uscita
    // TODO broadcastare agli utenti nella lobby quanti sono i client collegati al socket
    client.send(lobby.size)
  })

  // manda al client connesso subito dopo la connesione quanti client sono collegati al socket
  // TODO broadcastare agli utenti nella lobby quanti sono i client collegati al socket
  client.send(lobby.size)
})

app.use(express.json())

// controllers.init(app)

// Load controllers

// const files = glob.sync('src/controllers/**/*.ts')

// for (const filePath of files) {
//   const path = '.' + filePath.replace('src', '').split('.')[0]
//   import(path)
// }

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
