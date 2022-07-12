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

  private settingWinners: boolean

  constructor() {
    this.rooms = new RoomManager()
    this.currentQuiz = null
    this.settingWinners = false
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

    if (!this.currentQuiz) {
      await this.setupQuiz()
    }

    // Reject connection if quiz already started
    if (this.currentQuiz) {
      const quizStartTime = new Date(this.currentQuiz.startTime).getTime()
      const now = Date.now()

      if (quizStartTime < now) {
        console.log(
          `User ${userId} tried to join quiz ${this.currentQuiz.id} when already started`,
        )
        return
      }
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

      const isLastUser = this.rooms.getUsersPlayingCount() === 0

      // Create submission
      const { answers } = messageData.payload

      if (this.currentQuiz) {
        const submissionData = {
          answers,
          quiz: this.currentQuiz,
          userId,
        }

        // If is last user wait the submission creation to avoid to set winners before submission is created
        if (isLastUser) {
          await createSubmission(submissionData)
        } else {
          createSubmission(submissionData)
        }
      }

      // If no more users are playing end quiz
      if (this.rooms.getUsersPlayingCount() === 0) {
        this.endCurrentQuiz()
      }
    }
  }

  async onClose(userId: number) {
    console.log(`User ${userId} closing connection`)

    const isUserPlaying = this.rooms.isUserPlaying(userId)

    this.rooms.removeFromRoom(userId)

    // If user was playing and now there are no more playingg users, end the quiz
    if (isUserPlaying && this.rooms.getUsersPlayingCount() === 0) {
      this.endCurrentQuiz()
    }
  }

  async endCurrentQuiz() {
    console.log(`Quiz ${this.currentQuiz?.id} ended`)

    // Set quiz winners
    if (this.currentQuiz && !this.settingWinners) {
      console.log(`Setting winners of quiz ${this.currentQuiz.id}`)

      // Use variable as a lock to avoid concurrency
      this.settingWinners = true
      await setQuizWinners(this.currentQuiz.id)
      this.settingWinners = false
    }

    this.rooms.broadcastEnd()
    this.currentQuiz = null
  }
}

export default QuizSocketHandler
