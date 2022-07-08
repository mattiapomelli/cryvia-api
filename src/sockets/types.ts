import { WebSocket } from 'ws'

export type Room = Map<number, WebSocket>

export interface MessagePayload {
  type: string
  payload?: any
}

export enum InputMessageType {
  EnterQuestion = 'enterQuestion',
  SubmitQuiz = 'submitQuiz',
}

export enum OutputMessageType {
  QuizFinished = 'quizFinished',
  RoomSize = 'roomSize',
}
