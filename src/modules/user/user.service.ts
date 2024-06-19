import { injectable } from 'inversify'
import { Role as ERole, UserWithRole } from '../../types'
import { User, UserDoc } from './user.model'
import { Role } from './role.model'
import InternalServerErrorException from '../../helpers/errors/internal-server-error.exception'

@injectable()
export class UserService {
  constructor() {}

  public getUserByClerkIdWithRole = async (clerkId: string): Promise<UserWithRole | null> =>
    (await User.findOne({ clerkId }).populate('role')) as UserWithRole

  public getUserEmail = async (email: string) => await User.findOne({ email })

  public createUserStudent = async (user: Partial<UserDoc>) => {
    const studentRole = await Role.findOne({ roleName: ERole.STUDENT })

    if (!studentRole) {
      throw new InternalServerErrorException('Missing student role in Db')
    }

    return await User.create({ ...user, roleId: studentRole.id })
  }

  public updateUserByClerkId = async (clerkId: string, user: Partial<UserDoc>) =>
    await User.findOneAndUpdate({ clerkId }, user)

  public updateUserByEmail = async (email: string, user: Partial<UserDoc>) =>
    await User.findOneAndUpdate({ email }, user)
}
