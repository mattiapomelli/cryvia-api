import { WebSocket } from 'ws'

import { OutputMessageType, Room } from './types'
import { broadcast, broadcastSize } from './utils'

const WAITING_ROOM_ID = -1
const FINAL_ROOM_ID = -2

class RoomManager {
  // Room of clients waiting to start the quiz
  private waitingRoom: Room

  // Question rooms
  private questionRooms: Room[]

  // Room with clients who finished the quiz
  finalRoom: Room

  // Tracks the room where each user is at the moment. We need this to know which room
  // to remove the user from when disconnecting.
  // -1 means waitingRoom, -2 final room, while numbers >= 0 mean the corresponding question room
  private userToRoom: Map<number, number>

  // Number of users who have finished current the quiz
  private usersFinishedCount: number

  // Number of users who are still completing the current quiz
  private usersPlayingCount: number

  constructor() {
    this.waitingRoom = new Map()
    this.questionRooms = []
    this.finalRoom = new Map()
    this.userToRoom = new Map()
    this.usersFinishedCount = 0
    this.usersPlayingCount = 0
  }

  init() {
    this.waitingRoom = new Map()
    this.questionRooms = []
    this.finalRoom = new Map()
    this.userToRoom = new Map()
    this.usersFinishedCount = 0
    this.usersPlayingCount = 0
  }

  isQuestionRoom(roomId: number) {
    return (
      roomId !== WAITING_ROOM_ID &&
      roomId !== FINAL_ROOM_ID &&
      roomId >= 0 &&
      roomId < this.questionRooms.length
    )
  }

  getRoomFromId(roomId: number) {
    if (roomId === WAITING_ROOM_ID) return this.waitingRoom
    if (roomId === FINAL_ROOM_ID) return this.finalRoom
    if (roomId >= this.questionRooms.length || roomId < 0) return null

    return this.questionRooms[roomId]
  }

  /**
   * Creates a given number of question rooms
   * @param amount how many rooms to create
   */
  createQuestionRooms(amount: number) {
    // TODO: rename this functino to general setup, clean all rooms just in case and reinitialize counters
    const rooms: Room[] = []

    for (let i = 0; i < amount; i++) {
      rooms.push(new Map())
    }

    this.questionRooms = rooms
  }

  /**
   * Adds a client to the waiting room
   * @param userId id of the user
   * @param client client socket
   */
  addToWaitingRoom(userId: number, client: WebSocket) {
    // Add client to waiting room
    this.waitingRoom.set(userId, client)
    this.userToRoom.set(userId, WAITING_ROOM_ID)

    console.log(`User ${userId} joined waiting room`)

    broadcastSize(this.waitingRoom)
  }

  /**
   * Moves a client to a given question room. This must respect the order of rules, so only
   * users coming from previous rooms are allowed
   * @param userId id of the user
   * @param client client socket
   * @param roomNumber question room number
   */
  addToQuestionRoom(userId: number, client: WebSocket, roomNumber: number) {
    // Check if received room number is valid
    if (roomNumber > this.questionRooms.length - 1) {
      console.error(
        `Invalid request: user ${userId} asked to join non existent question room ${roomNumber}`,
      )
      return
    }

    // Check user is actually coming from the previous room
    const userRoom = this.userToRoom.get(userId)
    if (
      (roomNumber === 0 && userRoom !== WAITING_ROOM_ID) ||
      (roomNumber > 0 && userRoom !== roomNumber - 1)
    ) {
      console.log(
        `Invalid request: user ${userId} asked to join room ${roomNumber} coming from room ${userRoom}, instead of previous room`,
      )
      return
    }

    const newRoom = this.questionRooms[roomNumber]
    const oldRoom =
      roomNumber === 0 ? this.waitingRoom : this.questionRooms[roomNumber - 1]

    // Remove client from old room
    oldRoom.delete(userId)

    // Add client to new question room
    newRoom.set(userId, client)
    this.userToRoom.set(userId, roomNumber)

    console.log(`User ${userId} passed to question room ${roomNumber}`)

    // If a user came to the first question, increase the counter of playing users
    if (roomNumber === 0) {
      this.usersPlayingCount++
    }

    console.log('Users playing: ', this.usersPlayingCount)

    // Broadcast to all clients of old room the new room size
    broadcastSize(oldRoom)

    // Broadcast to all clients of new room the new room size
    broadcastSize(newRoom)
  }

  /**
   * Moves a client to the final room
   * @param userId id of the user
   * @param client client socket
   */
  addToFinalRoom(userId: number, client: WebSocket) {
    // Check user is actually coming from the previous room
    const userRoom = this.userToRoom.get(userId)
    if (userRoom !== this.questionRooms.length - 1) {
      console.log(
        `Invalid request: user ${userId} asked to join final room coming from room ${userRoom}, instead of previous room`,
      )
      return
    }

    // Remove client from last question room
    const oldRoom = this.questionRooms[this.questionRooms.length - 1]
    oldRoom.delete(userId)
    this.userToRoom.set(userId, FINAL_ROOM_ID)

    // Add user to leaderboard room
    this.finalRoom.set(userId, client)

    console.log(`User ${userId} passed to final room`)

    // Increase counter of users who finished the quiz
    this.usersFinishedCount++
    this.usersPlayingCount--

    console.log('Users playing: ', this.usersPlayingCount)

    broadcastSize(oldRoom)
    broadcast(this.finalRoom, {
      type: OutputMessageType.RoomSize,
      payload: this.usersFinishedCount,
    })
  }

  /**
   * Removes a user from his room
   * @param userId id of the user
   */
  removeFromRoom(userId: number) {
    const roomNumber = this.userToRoom.get(userId)
    if (!roomNumber) return

    const room = this.getRoomFromId(roomNumber)
    if (!room) return

    // If user left room while playing, decrease counter of plyaing user
    if (this.isQuestionRoom(roomNumber)) {
      this.usersPlayingCount--
    }

    // Remove client from his room
    room.delete(userId)
    this.userToRoom.delete(userId)

    console.log(`Removed user ${userId} from room ${roomNumber}`)

    // Broadcast to all clients new room size
    if (roomNumber === FINAL_ROOM_ID) {
      broadcast(this.finalRoom, {
        type: OutputMessageType.RoomSize,
        payload: this.usersFinishedCount,
      })
    } else {
      broadcastSize(room)
    }
  }

  getUsersPlayingCount() {
    return this.usersPlayingCount
  }

  /**
   * Broadcasts the end of the quiz to all the clients
   */
  broadcastEnd() {
    broadcast(this.finalRoom, {
      type: OutputMessageType.QuizFinished,
    })

    // There should be nobody in question rooms when quiz is over, but just to be sure broadcast end of quiz
    // even to them
    for (const room of this.questionRooms) {
      broadcast(room, {
        type: OutputMessageType.QuizFinished,
      })
    }

    // Close connection with all clients
    for (const client of this.finalRoom.values()) {
      client.close()
    }

    // Reinitialize state
    this.init()
  }

  isUserPlaying(userId: number) {
    const roomNumber = this.userToRoom.get(userId)
    if (!roomNumber) return false

    if (!this.isQuestionRoom(roomNumber)) return false

    return true
  }

  getInfo() {
    return {
      usersPlayingCount: this.usersPlayingCount,
      usersFinishedCount: this.usersFinishedCount,
      roomSize: {
        waitingRoom: this.waitingRoom.size,
        questionRooms: this.questionRooms.map((room) => room.size),
        finalRoom: this.finalRoom.size,
      },
      userToRoom: Object.fromEntries(this.userToRoom),
    }
  }
}

export default RoomManager
