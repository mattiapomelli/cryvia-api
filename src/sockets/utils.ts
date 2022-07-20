import { verifyJwt } from '@lib/jwt'
import { VerifyClientCallbackAsync } from 'ws'
import {
  ExtendedRequest,
  MessagePayload,
  OutputMessageType,
  Room,
} from './types'

// Broadcast message to all clients in a room
export function broadcast(room: Room, message: MessagePayload) {
  for (const roomClient of room.values()) {
    roomClient.send(JSON.stringify(message))
  }
}

// Broadcasts the size of a room to every client in that room
export function broadcastSize(room: Room) {
  broadcast(room, {
    type: OutputMessageType.RoomSize,
    payload: room.size,
  })
}

export const verifyClient: VerifyClientCallbackAsync = (info, callback) => {
  console.log(`Verifying client...`)

  // Since browsers cannot set headers with web sockets, we use the protocols field to add the auth token
  const token = info.req.headers['sec-websocket-protocol']
  const extendedReq = info.req as ExtendedRequest

  if (!token) {
    console.log(`Verification failed`)
    callback(false, 401, 'Unauthorized')
    return
  }

  try {
    const payload = verifyJwt(token.toString())
    extendedReq.user = payload

    console.log(`Verification successfull`)
    callback(true)
  } catch (error) {
    console.log(`Verification failed`)
    callback(false, 401, 'Unauthorized')
  }
}
