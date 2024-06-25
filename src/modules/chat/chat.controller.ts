import { ChatService } from './chat.service'
import { SocketService } from './socket.service'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Socket } from 'socket.io'

import { ok } from '../../helpers/utils'

@injectable()
export class ChatController {
  constructor(
    @inject(ChatService) private readonly chatService: ChatService,
    @inject(SocketService) private readonly socketService: SocketService
  ) {}

  public handleConnection(socket: Socket) {
    console.log('A user connected')

    socket.on('joinRoom', (room: string) => this.socketService.joinRoom(socket, room))
    socket.on('leaveRoom', (room: string) => this.socketService.leaveRoom(socket, room))
    socket.on('chatMessage', (msg: { room: string; message: string }) => this.socketService.sendMessage(socket, msg))

    socket.on('disconnect', () => console.log('A user disconnected'))
  }

  public sendMessage = async (req: Request, res: Response) => {
    return ok(res)
  }
}
