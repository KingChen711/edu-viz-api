import { inject, injectable } from 'inversify'
import { PackageService } from './package.service'
import { Request, Response } from 'express'

import { ok } from '../../helpers/utils'
import { TGetPackagesSchema } from './package.validation'
import { Role, UserWithRole } from 'src/types'
import { PackageStatus } from './package.model'
import ForbiddenException from 'src/helpers/errors/forbidden-exception'

@injectable()
export class PackageController {
  constructor(@inject(PackageService) private readonly packageService: PackageService) {}

  public getPackages = async (req: Request, res: Response) => {
    const user = res.locals.user as UserWithRole | null
    const {
      query: { status }
    } = res.locals.requestData as TGetPackagesSchema

    if (status !== PackageStatus.ACTIVE && user?.role.roleName !== Role.ADMIN) {
      throw new ForbiddenException()
    }

    const packages = await this.packageService.getPackages(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(packages.metaData))
    return ok(res, packages)
  }
}
