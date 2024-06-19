import { inject, injectable } from 'inversify'
import { PackageService } from './package.service'
import { Request, Response } from 'express'

import { ok } from '../../helpers/utils'

@injectable()
export class PackageController {
  constructor(@inject(PackageService) private readonly packageService: PackageService) {}

  public getPackages = async (req: Request, res: Response) => {
    const packages = await this.packageService.getPackages(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(packages.metaData))
    return ok(res, packages)
  }
}
