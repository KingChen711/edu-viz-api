import { ChatService } from './chat.service'
import { inject, injectable } from 'inversify'
import { Socket } from 'socket.io'

import { io } from '../..'
import { PrismaService } from '../prisma/prisma.service'

export type TSendMessage = { receiverId: string; senderId: string; type: 'Text' | 'Image' | 'Video' } & (
  | {
      type: 'Text'
      content: string
    }
  | {
      type: 'Image'
      image: string
    }
  | {
      type: 'Video'
      video: string
    }
)

@injectable()
export class SocketService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ChatService) private readonly chatService: ChatService
  ) {}

  public joinRoom(socket: Socket, room: string) {
    socket.join(room)
    console.log('message', `User ${socket.id} has joined the room ${room}`)
    io.to(room).emit('message', `User ${socket.id} has joined the room ${room}`)
  }

  public leaveRoom(socket: Socket, room: string) {
    socket.leave(room)
    io.to(room).emit('message', `User ${socket.id} has left the room ${room}`)
  }

  public async sendMessage(socket: Socket, msg: TSendMessage) {
    try {
      await this.chatService.createMessage(msg)
    } catch (error) {
      console.log(error)
    }
  }
}
