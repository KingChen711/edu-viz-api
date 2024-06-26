import { TGetHubSchema } from './chat.validation'
import { inject, injectable } from 'inversify'

import ForbiddenException from '../../helpers/errors/forbidden-exception'
import NotFoundException from '../../helpers/errors/not-found.exception'

import { UserWithRole } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class HubService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public getHubs = async (user: UserWithRole) => {
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
    const {
      params: { id }
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

    // const mappedHubs = hubs.map(({ id, messages, users }) => ({
    //   currentUser: users.find((u) => u.id == user.id),
    //   otherUser: users.find((u) => u.id != user.id),
    //   lastMessage: messages[0],
    //   id
    // }))

    return null
  }
}
