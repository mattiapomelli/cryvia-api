import { WebSocket } from 'ws'
import http from 'http'

import {
  createSubmission,
  CurrentQuiz,
  getNextQuiz,
  setQuizWinners,
} from '../lib/quizzes'
import { InputMessageType } from './types'
import RoomManager from './rooms'

// Current quiz that is being played/waited
let currentQuiz: CurrentQuiz | null = null

const rooms = new RoomManager()

export default async function handleSocketConnection(
  client: WebSocket,
  req: http.IncomingMessage,
) {
  // Get userId from url
  const userId = Number(req.url?.split('=')[1])
  console.log('Client connected, user id: ', userId)

  // TODO: Reject connection if quiz already started

  // Add client to waiting room
  rooms.addToWaitingRoom(userId, client)

  if (!currentQuiz) {
    // Get next quiz
    const nextQuiz = await getNextQuiz()
    if (!nextQuiz) return

    currentQuiz = nextQuiz

    // Create a room for each question of the quiz
    rooms.createQuestionRooms(currentQuiz.questions.length)
  }

  // On message received from client
  client.on('message', async (message: string) => {
    const messageData = JSON.parse(message)

    // User landed on a question
    if (messageData.type === InputMessageType.EnterQuestion) {
      const roomNumber = messageData.payload

      rooms.addToQuestionRoom(userId, client, roomNumber)
    }

    // User finished the quiz
    if (messageData.type === InputMessageType.SubmitQuiz) {
      rooms.addToFinalRoom(userId, client)
      console.log(`User ${userId} finished quiz`)

      // Create submission
      const { answers } = messageData.payload
      if (currentQuiz) {
        // TODO: await if is last user to avoid concurrenct with setWinners?
        createSubmission({
          answers,
          quiz: currentQuiz,
          userId,
        })
      }

      // TODO: set next quiz to null when finished
      // When all users have finished quiz empty leadeboard
      if (rooms.usersPlayingCount() === 0) {
        console.log('All users finished quiz')

        // Set quiz winners
        if (currentQuiz) {
          await setQuizWinners(currentQuiz.id)
        }

        rooms.broadcastEnd()
      }
    }
  })

  // When client closes connection
  client.on('close', async () => {
    console.log(`User ${userId} closing connection`)

    rooms.removeFromRoom(userId)

    // TODO: check to don't call this twice, if already been called skip
    // If there are no more users playing tell clients the quiz is finished
    if (rooms.usersPlayingCount() === 0) {
      console.log('All users finished quiz')

      // Set quiz winners
      if (currentQuiz) {
        await setQuizWinners(currentQuiz.id)
      }

      rooms.broadcastEnd()
    }
  })
}
