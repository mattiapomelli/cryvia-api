import { WebSocket } from 'ws'
import http from 'http'

import {
  createSubmission,
  CurrentQuiz,
  getNextQuiz,
  setQuizWinners,
} from '@lib/quizzes'
import RoomManager from './roomManager'
import { InputMessageType } from './types'

class QuizSocketHandler {
  private rooms: RoomManager

  // Current quiz that is being played/waited
  private currentQuiz: CurrentQuiz | null

  constructor() {
    this.rooms = new RoomManager()
    this.currentQuiz = null
  }

  async setupQuiz() {
    const nextQuiz = await getNextQuiz()
    if (!nextQuiz) return

    this.currentQuiz = nextQuiz

    // Create a room for each question of the quiz
    this.rooms.createQuestionRooms(this.currentQuiz.questions.length)
  }

  async onConnection(client: WebSocket, req: http.IncomingMessage) {
    // Get userId from url
    const userId = Number(req.url?.split('=')[1])
    console.log('Client connected, user id: ', userId)

    // TODO: Reject connection if quiz already started
    if (!this.currentQuiz) {
      this.setupQuiz()
    }

    // Add client to waiting room
    this.rooms.addToWaitingRoom(userId, client)

    // Setup message handler
    client.on('message', async (message: string) =>
      this.onMessage(userId, client, message),
    )

    // Setup close connection handler
    client.on('close', async () => this.onClose(userId))
  }

  async onMessage(userId: number, client: WebSocket, message: string) {
    const messageData = JSON.parse(message)

    // User landed on a question
    if (messageData.type === InputMessageType.EnterQuestion) {
      const roomNumber = messageData.payload
      this.rooms.addToQuestionRoom(userId, client, roomNumber)
    }

    // User finished the quiz
    if (messageData.type === InputMessageType.SubmitQuiz) {
      this.rooms.addToFinalRoom(userId, client)
      console.log(`User ${userId} finished quiz`)

      // Create submission
      const { answers } = messageData.payload
      if (this.currentQuiz) {
        // TODO: await if is last user to avoid concurrenct with setWinners?
        createSubmission({
          answers,
          quiz: this.currentQuiz,
          userId,
        })
      }

      // TODO: set next quiz to null when finished
      // When all users have finished quiz empty leadeboard
      if (this.rooms.usersPlayingCount() === 0) {
        this.endCurrentQuiz()
      }
    }
  }

  async onClose(userId: number) {
    console.log(`User ${userId} closing connection`)

    this.rooms.removeFromRoom(userId)

    // TODO: check to don't call this twice, if already been called skip
    // If there are no more users playing tell clients the quiz is finished
    if (this.rooms.usersPlayingCount() === 0) {
      this.endCurrentQuiz()
    }
  }

  async endCurrentQuiz() {
    console.log('Quiz ended')

    // Set quiz winners
    if (this.currentQuiz) {
      await setQuizWinners(this.currentQuiz.id)
    }

    this.rooms.broadcastEnd()
    this.currentQuiz = null
  }
}

export default QuizSocketHandler
