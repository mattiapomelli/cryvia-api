import { WebSocket } from 'ws'

import { OutputMessageType, Room } from './types'
import { broadcast, broadcastSize } from './utils'

class RoomManager {
  // Room of clients waiting to start the quiz
  private waitingRoom: Room

  // Question rooms
  private questionRooms: Room[]

  // Room with clients who finished the quiz
  finalRoom: Room

  // TODO: keep track of number of users that finished (even if they left final room).
  // Should be already done

  // Tracks the room where each user is at the moment. We need this to know which room
  // to remove the user from when disconnecting
  // -1 means waitingRoom, while numbers >= 0 mean the corresponding question room
  private userToRoom: Map<number, number>

  constructor() {
    this.waitingRoom = new Map()
    this.questionRooms = []
    this.finalRoom = new Map()
    this.userToRoom = new Map()
  }

  getUserRoom(userId: number) {
    return this.userToRoom.get(userId)
  }

  /**
   * Creates a given number of question rooms
   * @param amount how many rooms to create
   */
  createQuestionRooms(amount: number) {
    const rooms: Room[] = []

    for (let i = 0; i < amount; i++) {
      rooms.push(new Map())
    }

    this.questionRooms = rooms
  }

  addToWaitingRoom(userId: number, client: WebSocket) {
    // Add client to waiting room
    this.waitingRoom.set(userId, client)
    this.userToRoom.set(userId, -1)

    console.log(`User ${userId} joined waiting room`)

    broadcastSize(this.waitingRoom)
  }

  /**
   * Moves a client to a new question room
   * @param userId
   * @param client
   * @param roomNumber
   * @returns
   */
  addToQuestionRoom(userId: number, client: WebSocket, roomNumber: number) {
    // Check if received room number is valid
    if (roomNumber > this.questionRooms.length - 1) {
      console.error(
        `Invalid request: user ${userId} asked to join room non existent question room ${roomNumber}`,
      )
      return
    }

    // TODO: check user is coming from previous room

    const newRoom = this.questionRooms[roomNumber]
    // NOTE: this doesn't seem to work?
    const oldRoom =
      roomNumber === 0 ? this.waitingRoom : this.questionRooms[roomNumber - 1]

    // Remove client from old room
    oldRoom.delete(userId)

    // Add client to new question room
    newRoom.set(userId, client)
    this.userToRoom.set(userId, roomNumber)

    console.log(`User ${userId} passed to question room ${roomNumber}`)

    // Broadcast to all clients of old room the new room size
    broadcastSize(oldRoom)

    // Broadcast to all clients of new room the new room size
    broadcastSize(newRoom)
  }

  addToFinalRoom(userId: number, client: WebSocket) {
    // Remove client from last question room
    const oldRoom = this.questionRooms[this.questionRooms.length - 1]
    oldRoom.delete(userId)
    this.userToRoom.delete(userId)

    // TODO: check that user is actually in this room

    // Add user to leaderboard room
    this.finalRoom.set(userId, client)

    // TODO: broadcast number of users who finished quiz
    console.log(`User ${userId} passed to final room`)

    broadcastSize(oldRoom)
  }

  removeFromRoom(userId: number) {
    const roomNumber = this.getUserRoom(userId)
    if (!roomNumber) return

    // Remove client from his room
    const room =
      roomNumber === -1 ? this.waitingRoom : this.questionRooms[roomNumber]
    room.delete(userId)
    this.userToRoom.delete(userId)

    console.log(`Removed user ${userId} from room ${roomNumber}`)

    // Broadcast to all clients new room size
    broadcastSize(room)
  }

  usersPlayingCount() {
    return this.userToRoom.size
  }

  broadcastEnd() {
    broadcast(this.finalRoom, {
      type: OutputMessageType.QuizFinished,
    })

    // Close connection with all clients and empty leaderboard room
    for (const client of this.finalRoom.values()) {
      client.close()
    }

    this.finalRoom = new Map()
  }
}

export default RoomManager
