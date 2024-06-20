import { injectable } from 'inversify'
import { TGetTutorSchema } from './tutor.validation'
import { User } from '../user/user.model'

import { Role, UserWithRole } from 'src/types'
import BadRequestException from 'src/helpers/errors/bad-request.exception'
import { Package, PackageDoc, PackageStatus } from '../package/package.model'

@injectable()
export class TutorService {
  constructor() {}

  public getTutor = async (user: UserWithRole | null, schema: TGetTutorSchema) => {
    const {
      params: { id }
    } = schema

    const tutor = (await User.findOne({ _id: id }).populate('packages').populate('role')) as
      | (UserWithRole & {
          packages: PackageDoc[]
        })
      | null

    if (tutor?.role.roleName !== Role.TUTOR) {
      throw new BadRequestException('This user is not a tutor')
    }

    const isAdmin = user?.role.roleName === Role.ADMIN
    const isTutorAndOwnsPackages = user?.role.roleName === Role.TUTOR && user.id === id

    if (!isAdmin && !isTutorAndOwnsPackages) {
      tutor.packages = tutor.packages.filter((p) => p.status === PackageStatus.ACTIVE)
    }

    //load subject name
    const packageIds = tutor.packages.map((p) => p.id)
    const packages = await Package.find({ _id: { $in: packageIds } }).populate('subject')
    tutor.packages = packages

    return tutor
  }
}
