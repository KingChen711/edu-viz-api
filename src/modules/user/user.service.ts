import { Prisma } from '@prisma/client'
import { inject, injectable } from 'inversify'

import { UserWithRole } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public getUserByClerkIdWithRole = async (clerkId: string): Promise<UserWithRole | null> =>
    await this.prismaService.client.user.findUnique({
      where: {
        clerkId
      },
      include: {
        role: true
      }
    })

  public getUserEmail = async (email: string) =>
    await this.prismaService.client.user.findFirst({
      where: {
        email
      }
    })

  public createUser = async (user: Prisma.UserCreateInput) =>
    await this.prismaService.client.user.create({
      data: user
    })

  public updateUserByClerkId = async (clerkId: string, user: Prisma.UserUpdateInput) =>
    await this.prismaService.client.user.update({
      where: { clerkId },
      data: user
    })

  public updateUserByEmail = async (email: string, user: Prisma.UserUpdateInput) =>
    await this.prismaService.client.user.update({
      where: { email },
      data: user
    })

  public getAll = async () => await this.prismaService.client.user.findMany()
}
