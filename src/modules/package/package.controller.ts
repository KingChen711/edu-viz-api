import { PackageService } from './package.service'
import { TGetFeedbacksSchema, TGetPackagesSchema } from './package.validation'
import { PackageStatus } from '@prisma/client'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Role, UserWithRole } from 'src/types'

import { ok } from '../../helpers/utils'
import ForbiddenException from 'src/helpers/errors/forbidden-exception'
import NotFoundException from 'src/helpers/errors/not-found.exception'

import { PrismaService } from '../prisma/prisma.service'
import { ReservationService } from '../reservation/reservation.service'

@injectable()
export class PackageController {
  constructor(
    @inject(PackageService) private readonly packageService: PackageService,
    @inject(ReservationService) private readonly reservationService: ReservationService,
    @inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  public getPackages = async (req: Request, res: Response) => {
    const user = res.locals.user as UserWithRole | null
    const {
      query: { status }
    } = res.locals.requestData as TGetPackagesSchema

    if (status !== PackageStatus.Active && user?.role.roleName !== Role.ADMIN) {
      throw new ForbiddenException()
    }

    const packages = await this.packageService.getPackages(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(packages.metaData))
    return ok(res, packages)
  }

  public getPackage = async (req: Request, res: Response) => {
    const user = res.locals.user as UserWithRole | null

    const item = await this.packageService.getPackage(user, res.locals.requestData)
    return ok(res, item)
  }

  public getFeedbacks = async (req: Request, res: Response) => {
    const user = res.locals.user as UserWithRole | null
    const {
      params: { packageId }
    } = res.locals.requestData as TGetFeedbacksSchema
    const _package = await this.prismaService.client.package.findUnique({ where: { id: packageId } })

    if (!_package) {
      throw new NotFoundException(`Not found packaged with id: ${packageId}`)
    }

    const isAdmin = user?.role.roleName === Role.ADMIN
    const isTutorAndOwnsPackages = user?.role.roleName === Role.TUTOR && user.id === _package?.tutorId

    if (_package.status !== PackageStatus.Active && !isAdmin && !isTutorAndOwnsPackages) {
      throw new ForbiddenException()
    }

    const feedbacks = await this.reservationService.getFeedbacks(res.locals.requestData)
    return ok(res, feedbacks)
  }
}
