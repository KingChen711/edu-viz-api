import { ChatService } from './chat.service'
import { HubService } from './hub.service'
import { SocketService } from './socket.service'
import { Request } from 'express'
import { inject, injectable } from 'inversify'
import { Socket } from 'socket.io'
import { ResponseWithUser } from 'src/types'

import { ok } from '../../helpers/utils'

@injectable()
export class ChatController {
  constructor(
    @inject(ChatService) private readonly chatService: ChatService,
    @inject(ChatService) private readonly hubService: HubService,
    @inject(SocketService) private readonly socketService: SocketService
  ) {}

  public handleConnection(socket: Socket) {
    console.log('A user connected')

    socket.on('joinRoom', (room: string) => this.socketService.joinRoom(socket, room))
    socket.on('leaveRoom', (room: string) => this.socketService.leaveRoom(socket, room))
    socket.on('chatMessage', (msg: { room: string; message: string }) => this.socketService.sendMessage(socket, msg))

    socket.on('disconnect', () => console.log('A user disconnected'))
  }

  public getHubs = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const hubs = await this.hubService.getHubs(user)
    return ok(res, hubs)
  }

  public getHub = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const hubs = await this.hubService.getHub(user, res.locals.requestData)
    return ok(res, hubs)
  }
}
