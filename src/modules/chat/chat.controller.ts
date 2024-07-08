import { ChatService } from './chat.service'
import { TGetHubIdSchema } from './chat.validation'
import { HubService } from './hub.service'
import { SocketService, TSendMessage } from './socket.service'
import { Request } from 'express'
import { inject, injectable } from 'inversify'
import { Socket } from 'socket.io'

import { ok } from '../../helpers/utils'

import { ResponseWithUser } from '../../types'

@injectable()
export class ChatController {
  constructor(
    @inject(ChatService) private readonly chatService: ChatService,
    @inject(HubService) private readonly hubService: HubService,
    @inject(SocketService) private readonly socketService: SocketService
  ) {}

  public handleConnection(socket: Socket) {
    console.log('A user connected')

    socket.on('joinRoom', (room: string) => this.socketService.joinRoom(socket, room))
    socket.on('leaveRoom', (room: string) => this.socketService.leaveRoom(socket, room))
    socket.on('chatMessage', (msg: TSendMessage) => this.socketService.sendMessage(socket, msg))

    socket.on('disconnect', () => console.log('A user disconnected'))
  }

  public getHubs = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const hubs = await this.hubService.getHubs(user)
    return ok(res, hubs)
  }

  public getHub = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const hub = await this.hubService.getHub(user, res.locals.requestData)
    return ok(res, hub)
  }

  public getMessages = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const hubs = await this.hubService.getMessages(user, res.locals.requestData)
    return ok(res, hubs)
  }

  public getHubId = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const {
      params: { otherUserId }
    } = res.locals.requestData as TGetHubIdSchema
    const hub = await this.chatService.getOrCreateHub(user.id, otherUserId)
    return ok(res, hub.id)
  }
}
