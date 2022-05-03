import express, { Express } from 'express'
import dotenv from 'dotenv'
import glob from 'glob'
import * as WebSocket from 'ws'
import * as http from 'http'

// import controllers from './utils/controllers'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// c'è da capire come fare le stanze per ogni domanda dinamicamente
// const questions: WebSocket[][] = [[], [], [], [], [], [], [], [], []]

// questa è la lobby (io avrei fatto pure una HASHMAP ma ho avuto problemi con i tipi)
const lobby: WebSocket[] = []

wss.on('connection', (client: WebSocket, req) => {
  // prendo id utente dall'url
  const user = req.url?.split('=')[1]
  // assegno id ad una nuova chiave dell'oggetto socket
  // TODO @TIA tu se riesci estendi interfaccia WebSocket
  client.userId = user

  // aggiungi client alla lobby
  lobby.push(client)

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
    lobby.indexOf(this) > -1 ? lobby.splice(lobby.indexOf(this), 1) : false

    // manda messaggio al client con quanti utenti sono collegati alla lobby dopo la sua uscita
    // TODO broadcastare agli utenti nella lobby quanti sono i client collegati al socket
    client.send(lobby.length)
  })

  // manda al client connesso subito dopo la connesione quanti client sono collegati al socket
  // TODO broadcastare agli utenti nella lobby quanti sono i client collegati al socket
  client.send(lobby.length)
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
