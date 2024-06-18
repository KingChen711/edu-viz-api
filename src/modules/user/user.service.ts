import { Prisma, Role, User } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { Role as ERole, UserWithRole } from '../../types'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'

@injectable()
export class UserService {
  constructor() {}

  getUserByClerkIdWithRole = async (clerkId: string): Promise<UserWithRole | null> => {
    // return await this.prismaService.client.user.findUnique({
    //   where: {
    //     clerkId
    //   },
    //   include: {
    //     role: true
    //   }
    // })
    return null
  }

  getUserEmail = async (email: string) => {
    // return await this.prismaService.client.user.findUnique({
    //   where: {
    //     email
    //   }
    // })
  }

  createUser = async (user: Prisma.UserCreateInput) => {
    // return await this.prismaService.client.user.create({
    //   data: user
    // })
  }

  updateUserByClerkId = async (clerkId: string, user: Prisma.UserUpdateInput) => {
    // return await this.prismaService.client.user.update({
    //   where: { clerkId },
    //   data: user
    // })
  }

  updateUserByEmail = async (email: string, user: Prisma.UserUpdateInput) => {
    // return await this.prismaService.client.user.update({
    //   where: { email },
    //   data: user
    // })
  }
}
