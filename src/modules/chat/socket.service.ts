import { ChatService } from './chat.service'
import { inject, injectable } from 'inversify'
import { Socket } from 'socket.io'

import { io } from '../..'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class SocketService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ChatService) private readonly chatService: ChatService
  ) {}

  public joinRoom(socket: Socket, room: string) {
    socket.join(room)
    io.to(room).emit('message', `User ${socket.id} has joined the room ${room}`)
  }

  public leaveRoom(socket: Socket, room: string) {
    socket.leave(room)
    io.to(room).emit('message', `User ${socket.id} has left the room ${room}`)
  }

  public sendMessage(socket: Socket, msg: { room: string; message: string }) {
    io.to(msg.room).emit('message', msg.message)
  }
}
