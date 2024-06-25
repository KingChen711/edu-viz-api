import { inject, injectable } from 'inversify'
import { ChatService } from './chat.service'
import { Server, Socket } from 'socket.io'
import { io } from '../../'
import { SocketService } from './socket.service'

@injectable()
export class ChatController {
  private readonly io: Server

  constructor(
    @inject(ChatService) private readonly chatService: ChatService,
    @inject(SocketService) private readonly socketService: SocketService
  ) {
    this.io = io
    this.io.on('connection', (socket: Socket) => this.handleConnection(socket))
  }

  private handleConnection(socket: Socket) {
    console.log('A user connected')

    socket.on('joinRoom', (room: string) => this.socketService.joinRoom(socket, room))
    socket.on('leaveRoom', (room: string) => this.socketService.leaveRoom(socket, room))
    socket.on('chatMessage', (msg: { room: string; message: string }) => this.socketService.sendMessage(socket, msg))

    socket.on('disconnect', () => console.log('A user disconnected'))
  }
}
