import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { ChatService } from './chat.service'
import { Socket } from 'socket.io'

@injectable()
export class SocketService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ChatService) private readonly chatService: ChatService
  ) {}

  public joinRoom(socket: Socket, room: string) {
    socket.join(room)
    socket.to(room).emit('message', `User ${socket.id} has joined the room`)
  }

  public leaveRoom(socket: Socket, room: string) {
    socket.leave(room)
    socket.to(room).emit('message', `User ${socket.id} has left the room`)
  }

  public sendMessage(socket: Socket, msg: { room: string; message: string }) {
    socket.to(msg.room).emit('message', msg.message)
  }
}
