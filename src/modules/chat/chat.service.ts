import { MessageType } from '@prisma/client'
import { inject, injectable } from 'inversify'

import { io } from '../../'
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
      reservationId: string
    }
)

@injectable()
export class ChatService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  private connectUserToHub = async (userId: string, hubId: string) => {
    return await this.prismaService.client.user.update({
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

  public getOrCreateHub = async (senderId: string, receiverId: string) => {
    const hub = await this.prismaService.client.hub.findFirst({
      where: {
        AND: { userIds: { hasEvery: [senderId, receiverId] } }
      },
      include: { users: true }
    })

    if (hub) return hub
    const newHub = await this.prismaService.client.hub.create({
      data: { userIds: [] },
      include: { users: true }
    })

    const connectSenderPromise = this.connectUserToHub(senderId, newHub.id)
    const connectReceiverPromise = this.connectUserToHub(receiverId, newHub.id)
    const [receiver] = await Promise.all([connectReceiverPromise, connectSenderPromise])

    //create first message
    await this.prismaService.client.message.create({
      data: {
        type: 'Text',
        content: receiver.tutor?.automaticGreeting || "Hello, let's order my services",
        hub: {
          connect: {
            id: newHub.id
          }
        },
        receiver: {
          connect: {
            id: senderId
          }
        },
        sender: {
          connect: {
            id: receiverId
          }
        },
        isSeen: false
      }
    })

    return newHub
  }

  public createMessage = async (params: TCreateMessage) => {
    const { receiverId, senderId, type } = params
    let content: string | undefined = undefined
    let image: string | undefined = undefined
    let video: string | undefined = undefined
    let reservationId: string | undefined = undefined

    switch (type) {
      case 'Text': {
        content = params.content
        break
      }
      case 'Image': {
        image = params.image
        break
      }
      case 'Video': {
        video = params.video
        break
      }
      default: {
        reservationId = params.reservationId
      }
    }

    const hub = await this.getOrCreateHub(senderId, receiverId)

    const message = await this.prismaService.client.message.create({
      data: {
        reservationId,
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
        hub: {
          connect: {
            id: hub.id
          }
        }
      }
    })

    await this.prismaService.client.hub.update({
      where: { id: hub.id },
      data: {
        lastMessageAt: message.createdAt
      }
    })

    let reservation: any
    if (message.reservationId) {
      reservation = await this.prismaService.client.reservation.findUnique({
        where: {
          id: reservationId
        },
        include: {
          package: {
            include: {
              subject: true
            }
          }
        }
      })
    }

    const clerkIds = hub.users.map((u) => u.clerkId) as string[]

    io.to(clerkIds[0]).emit('chatMessage', { ...message, reservation })
    io.to(clerkIds[1]).emit('chatMessage', { ...message, reservation })

    return { hub, message }
  }

  public createReservationOrderMessage = async (studentId: string, tutorId: string, reservationId: string) =>
    await this.createMessage({
      reservationId,
      type: 'ReservationOrder',
      receiverId: tutorId,
      senderId: studentId
    })

  public createReservationApproveMessage = async (studentId: string, tutorId: string, reservationId: string) =>
    await this.createMessage({
      reservationId,
      type: 'ReservationApprove',
      receiverId: studentId,
      senderId: tutorId
    })

  public createReservationRejectMessage = async (studentId: string, tutorId: string, reservationId: string) =>
    await this.createMessage({
      reservationId,
      type: 'ReservationReject',
      receiverId: studentId,
      senderId: tutorId
    })

  public createReservationCompleteMessage = async (studentId: string, tutorId: string, reservationId: string) =>
    await this.createMessage({
      reservationId,
      type: 'ReservationComplete',
      receiverId: tutorId,
      senderId: studentId
    })
}
