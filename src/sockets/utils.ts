import { MessagePayload, OutputMessageType, Room } from './types'

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
