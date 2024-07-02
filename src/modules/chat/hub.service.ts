import { TGetHubSchema, TGetMessagesSchema } from './chat.validation'
import { Message, Reservation } from '@prisma/client'
import { inject, injectable } from 'inversify'

import ForbiddenException from '../../helpers/errors/forbidden-exception'
import NotFoundException from '../../helpers/errors/not-found.exception'

import { UserWithRole } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class HubService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public getHubs = async (user: UserWithRole) => {
    // await new Promise((resolve) => setTimeout(resolve, 10000))
    const hubs = await this.prismaService.client.hub.findMany({
      where: {
        id: {
          in: user.hubIds
        }
      },
      include: {
        users: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    const mappedHubs = hubs.map(({ id, messages, users }) => ({
      currentUser: users.find((u) => u.id == user.id),
      otherUser: users.find((u) => u.id != user.id),
      lastMessage: messages[0],
      id
    }))

    return mappedHubs
  }

  public getHub = async (user: UserWithRole, schema: TGetHubSchema) => {
    // await new Promise((resolve) => setTimeout(resolve, 5000))
    const {
      params: { id }
    } = schema

    const hub = await this.prismaService.client.hub.findUnique({
      where: {
        id
      },
      include: {
        users: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!hub) {
      throw new NotFoundException(`Not found hub with id: ${id}`)
    }

    if (!hub.userIds.find((ui) => ui === user.id)) {
      throw new ForbiddenException()
    }

    const mappedHub = {
      currentUser: hub.users.find((u) => u.id == user.id),
      otherUser: hub.users.find((u) => u.id != user.id),
      lastMessage: hub.messages[0],
      id
    }

    return mappedHub
  }

  public getMessages = async (user: UserWithRole, schema: TGetMessagesSchema) => {
    // await new Promise((resolve) => setTimeout(resolve, 15000))

    const {
      params: { id },
      query: { pageNumber, pageSize }
    } = schema

    const hub = await this.prismaService.client.hub.findUnique({
      where: {
        id
      },
      include: {
        users: true
      }
    })

    if (!hub) {
      throw new NotFoundException(`Not found hub with id: ${id}`)
    }

    if (!hub.userIds.find((ui) => ui === user.id)) {
      throw new ForbiddenException()
    }

    const messages = (await this.prismaService.client.message.findMany({
      where: { hubId: id },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize
    })) as (Message & { reservation: Reservation | undefined })[]

    //load reservations
    const reservationIdToIndex: Record<string, number> = {}
    messages.forEach((m, index) => {
      if (m.reservationId) {
        reservationIdToIndex[m.reservationId] = index
      }
    })

    const reservations = await this.prismaService.client.reservation.findMany({
      where: {
        id: {
          in: Object.keys(reservationIdToIndex)
        }
      },
      include: {
        package: {
          include: {
            subject: true
          }
        }
      }
    })

    reservations.forEach((reservation) => {
      const index = reservationIdToIndex[reservation.id]
      messages[index].reservation = reservation
    })

    return messages
  }
}
