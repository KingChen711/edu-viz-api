import { MessageType } from '@prisma/client'
import { inject, injectable } from 'inversify'

import { PrismaService } from '../prisma/prisma.service'

type TCreateMessage = {
  senderId: string
  receiverId: string
} & (
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
  | {
      type: Exclude<MessageType, 'Text' | 'Image' | 'Video'>
    }
)

@injectable()
export class ChatService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  private connectUserToHub = async (userId: string, hubId: string) => {
    await this.prismaService.client.user.update({
      where: {
        id: userId
      },
      data: {
        hubs: {
          connect: {
            id: hubId
          }
        }
      }
    })
  }

  private getOrCreateHub = async (userId1: string, userId2: string) => {
    const hub = await this.prismaService.client.hub.findFirst({
      where: {
        AND: { userIds: { hasEvery: [userId1, userId2] } }
      }
    })

    if (hub) return hub
    const newHub = await this.prismaService.client.hub.create({
      data: { userIds: [] }
    })

    const connectUser1Promise = this.connectUserToHub(userId1, newHub.id)
    const connectUser2Promise = this.connectUserToHub(userId2, newHub.id)
    await Promise.all([connectUser1Promise, connectUser2Promise])

    return newHub
  }

  private createMessage = async (params: TCreateMessage) => {
    const { receiverId, senderId, type } = params
    const image = type === 'Image' ? params.image : undefined
    const video = type === 'Video' ? params.video : undefined
    const content = type === 'Text' ? params.content : undefined

    const hub = await this.getOrCreateHub(senderId, receiverId)

    const now = new Date(Date.now())
    await this.prismaService.client.hub.update({
      where: { id: hub.id },
      data: {
        lastMessageAt: now,
        messages: {
          create: {
            image,
            content,
            video,
            isSeen: false,
            type: type,
            receiver: {
              connect: {
                id: receiverId
              }
            },
            sender: {
              connect: {
                id: senderId
              }
            },
            createdAt: now
          }
        }
      }
    })
  }

  public createSystemOrderMessage = async (studentId: string, tutorId: string) =>
    await this.createMessage({
      type: 'SystemOrder',
      receiverId: tutorId,
      senderId: studentId
    })

  public createSystemApproveMessage = async (studentId: string, tutorId: string) =>
    await this.createMessage({
      type: 'SystemApprove',
      receiverId: studentId,
      senderId: tutorId
    })

  public createSystemRejectMessage = async (studentId: string, tutorId: string) =>
    await this.createMessage({
      type: 'SystemReject',
      receiverId: studentId,
      senderId: tutorId
    })

  public createSystemCompleteMessage = async (studentId: string, tutorId: string) =>
    await this.createMessage({
      type: 'SystemComplete',
      receiverId: tutorId,
      senderId: studentId
    })
}
