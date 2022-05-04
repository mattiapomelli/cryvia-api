import { WebSocket } from 'ws'
import http from 'http'

type Room = Map<number, WebSocket>

const waitingRoom: Room = new Map()

// TODO: get the actual number of rooms from the quiz questions
const questionRooms: Room[] = [new Map(), new Map(), new Map()]

// Tracks the room where each user is at the moment. We need this to know
// which room to remove the user from when disconnecting
const userToRoom: Map<number, number> = new Map()

export default function handleSocketConnection(
  client: WebSocket,
  req: http.IncomingMessage,
) {
  // Get userId from url
  const userId = Number(req.url?.split('=')[1])

  // Add client to waiting room
  waitingRoom.set(userId, client)
  userToRoom.set(userId, -1)

  console.log('Client connected, user id: ', userId)

  // Send room size to client
  client.send(waitingRoom.size)

  const broadcastSize = (room: Room) => {
    for (const roomClient of room.values()) {
      roomClient.send(room.size)
    }
  }

  // On message received from client
  client.on('message', (message: string) => {
    const messageData = JSON.parse(message)

    // User landed on a question
    if (messageData.type === 'questionRoom') {
      const roomNumber = messageData.value
      console.log(`User ${userId} passed to room ${roomNumber}`)

      const newRoom = questionRooms[roomNumber]
      const oldRoom =
        roomNumber === 0 ? waitingRoom : questionRooms[roomNumber - 1]

      // Remove client from old room
      oldRoom.delete(userId)

      // Add client to new question room
      newRoom.set(userId, client)
      userToRoom.set(userId, roomNumber)

      // Broadcast to all clients of old room the new room size
      broadcastSize(oldRoom)

      // Broadcast to all clients of new room the new room size
      broadcastSize(newRoom)
    }

    // User finished the quiz
    if (messageData.type === 'finishedQuiz') {
      // Remove client from last question room
      const room = questionRooms[questionRooms.length - 1]
      room.delete(userId)

      // Broadcast to all clients of new room the new room size
      broadcastSize(room)
    }
  })

  // When client closes connection
  client.on('close', () => {
    const roomNumber = userToRoom.get(userId)
    console.log(
      `User ${userId} closing connection, leaving room: ${roomNumber}`,
    )

    if (roomNumber !== undefined) {
      // Remove client from his room
      const room = roomNumber === -1 ? waitingRoom : questionRooms[roomNumber]
      room.delete(userId)

      // Broadcast to all clients new room size
      broadcastSize(room)
    }
  })
}