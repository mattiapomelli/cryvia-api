import { WebSocket } from 'ws'
import http from 'http'
import { QuizQuestions } from '@prisma/client'

import { createSubmission, getNextQuiz } from './utils'

interface CurrentQuiz {
  id: number
  startTime: Date
  questions: QuizQuestions[]
}

// Current quiz that is being played/waited
let currentQuiz: CurrentQuiz | null = null

type Room = Map<number, WebSocket>

// Room of clients waiting to start the quiz
const waitingRoom: Room = new Map()

// TODO: get the actual number of rooms from the quiz questions
const questionRooms: Room[] = []

// Room with clients who finished the quiz
let leaderBoardRoom: Room = new Map()
let leaderboard: number[] = []

// Tracks the room where each user is at the moment. We need this to know which room
// to remove the user from when disconnecting
// -1 means waitingRoom, while numbers >= 0 mean the corresponding question room
const userToRoom: Map<number, number> = new Map()

interface MessagePayload {
  type: string
  payload?: any
}

// Broadcast message to all clients in a room
function broadcast(room: Room, message: MessagePayload) {
  for (const roomClient of room.values()) {
    roomClient.send(JSON.stringify(message))
  }
}

// Broadcasts the size of a room to every client in that room
function broadcastSize(room: Room) {
  broadcast(room, {
    type: 'roomSize',
    payload: room.size,
  })
}

export default async function handleSocketConnection(
  client: WebSocket,
  req: http.IncomingMessage,
) {
  // Get userId from url
  const userId = Number(req.url?.split('=')[1])

  // TODO: Reject connection if quiz already started

  // Add client to waiting room
  waitingRoom.set(userId, client)
  userToRoom.set(userId, -1)

  console.log('Client connected, user id: ', userId)

  if (!currentQuiz) {
    // Get next quiz
    const nextQuiz = await getNextQuiz()

    // Create a room for each question of the quiz
    nextQuiz?.questions.forEach(() => {
      questionRooms.push(new Map())
    })

    currentQuiz = nextQuiz
  }

  // Send room size to client
  broadcastSize(waitingRoom)

  // On message received from client
  client.on('message', (message: string) => {
    const messageData = JSON.parse(message)

    // User landed on a question
    if (messageData.type === 'questionRoom') {
      const roomNumber = messageData.payload

      // Check if received room number is valid
      if (roomNumber > questionRooms.length - 1) {
        console.error(
          `Invalid request: client asked to join room non existent room ${roomNumber}`,
        )
        return
      }

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
      userToRoom.delete(userId)

      // Create submission
      // TODO: calculate score
      const { answers, time } = messageData.payload
      if (currentQuiz) {
        createSubmission({
          answers,
          time,
          quiz: currentQuiz,
          userId: 1,
        })
      }

      // Add user to leaderboard room
      leaderBoardRoom.set(userId, client)
      leaderboard.push(userId)

      // Broadcast new leaderboard to everyone in leaderboard room
      broadcast(leaderBoardRoom, {
        type: 'leaderboard',
        payload: leaderboard,
      })

      console.log(`User ${userId} finished quiz`)

      // When all users have finished quiz empty leadeboard
      if (userToRoom.size === 0) {
        console.log('All users finished quiz')
        leaderboard = []

        // Close connection with all clients and empty leaderboard room
        broadcast(leaderBoardRoom, {
          type: 'quizFinished',
        })

        // Close connection with all clients and empty leaderboard room
        for (const roomClient of leaderBoardRoom.values()) {
          roomClient.close()
        }

        leaderBoardRoom = new Map()
        console.log(leaderBoardRoom)
      }

      // Broadcast to all clients of new room the new room size
      broadcastSize(room)
    }
  })

  // When client closes connection
  client.on('close', () => {
    const roomNumber = userToRoom.get(userId)

    if (roomNumber !== undefined) {
      console.log(
        `User ${userId} closing connection, leaving room: ${roomNumber}`,
      )

      // Remove client from his room
      const room = roomNumber === -1 ? waitingRoom : questionRooms[roomNumber]
      room.delete(userId)
      userToRoom.delete(userId)

      // Broadcast to all clients new room size
      broadcastSize(room)

      // If there are no more users playing tell clients the quiz is finished
      if (userToRoom.size === 0) {
        broadcast(leaderBoardRoom, {
          type: 'quizFinished',
        })
      }
    }
  })
}
