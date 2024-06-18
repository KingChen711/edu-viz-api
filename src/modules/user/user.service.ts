import { inject, injectable } from 'inversify'
import { Role as ERole, UserWithRole } from '../../types'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'
import { User, UserDoc } from './user.model'
import { Role } from './role.model'
import InternalServerErrorException from '../../helpers/errors/internal-server-error.exception'

@injectable()
export class UserService {
  constructor() {}

  getUserByClerkIdWithRole = async (clerkId: string): Promise<UserWithRole | null> =>
    (await User.findOne({ clerkId }).populate('role')) as UserWithRole

  getUserEmail = async (email: string) => await User.findOne({ email })

  createUserStudent = async (user: Partial<UserDoc>) => {
    const studentRole = await Role.findOne({ roleName: ERole.STUDENT })

    if (!studentRole) {
      throw new InternalServerErrorException('Missing student role in Db')
    }

    return await User.create({ ...user, roleId: studentRole.id })
  }

  updateUserByClerkId = async (clerkId: string, user: Partial<UserDoc>) =>
    await User.findOneAndUpdate({ clerkId }, user)

  updateUserByEmail = async (email: string, user: Partial<UserDoc>) => await User.findOneAndUpdate({ email }, user)
}
