import { TGetPackageSchema, TGetPackagesSchema } from './package.validation'
import { Feedback, PackageStatus, Prisma } from '@prisma/client'
import { inject, injectable } from 'inversify'

import ForbiddenException from '../../helpers/errors/forbidden-exception'
import NotFoundException from '../../helpers/errors/not-found.exception'
import { PagedList } from '../../helpers/paged-list'

import { Role, UserWithRole } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class PackageService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}
  private sortMapping: Record<string, Prisma.PackageOrderByWithRelationInput> = {
    'highest-price': { pricePerHour: 'desc' },
    'lowest-price': { pricePerHour: 'asc' },
    newest: { createdAt: 'desc' }
  } as const

  public getPackages = async (schema: TGetPackagesSchema) => {
    const {
      query: { pageNumber, pageSize, sort, subjectName, search, status }
    } = schema

    console.log({ subjectName })

    const subjectFilter: Prisma.PackageWhereInput = subjectName
      ? {
          subject: {
            name: {
              contains: subjectName,
              mode: 'insensitive'
            }
          }
        }
      : {}

    const statusFilter: Prisma.PackageWhereInput = status !== 'All' ? { status } : {}

    const searchFilter: Prisma.PackageWhereInput = search
      ? {
          OR: [
            {
              subject: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            },
            {
              tutor: {
                fullName: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            },
            {
              tutor: {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          ]
        }
      : {}

    const query: Prisma.PackageFindManyArgs = { where: { AND: [subjectFilter, statusFilter, searchFilter] } }

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    const packages = await this.prismaService.client.package.findMany({
      ...query,
      include: {
        subject: true,
        tutor: true,
        reservations: true
      }
    })

    const mappedPackages = packages.map((_package) => {
      const feedbacks = _package.reservations.filter((r) => r.feedback).map((r) => r.feedback) as Feedback[]

      const averageFeedbacksValue = Number(
        (
          feedbacks.reduce((totalFeedbackValue, currentFeedback) => totalFeedbackValue + currentFeedback.value, 0) /
          feedbacks.length
        ).toFixed(1)
      )

      return {
        ..._package,
        reservations: undefined,
        totalReservations: _package.reservations.length,
        averageFeedbacksValue
      }
    })

    if (sort === 'highest-rating') {
      mappedPackages.toSorted((a, b) => b.averageFeedbacksValue - a.averageFeedbacksValue)
    }

    const skip = (pageNumber - 1) * pageSize
    const take = pageSize
    const paginatedProducts = mappedPackages.slice(skip, skip + take)

    return new PagedList(paginatedProducts, packages.length, pageNumber, pageSize)
  }

  public getPackage = async (user: UserWithRole | null, schema: TGetPackageSchema) => {
    const {
      params: { id }
    } = schema

    const _package = await this.prismaService.client.package.findUnique({
      where: { id },
      include: {
        subject: true
      }
    })

    if (!_package) {
      throw new NotFoundException(`Not found package with id: ${id}`)
    }

    const isAdmin = user?.role.roleName === Role.ADMIN
    const isTutorAndOwnsPackages = user?.role.roleName === Role.TUTOR && user.id === _package?.tutorId

    if (_package.status !== PackageStatus.Active && !isAdmin && !isTutorAndOwnsPackages) {
      throw new ForbiddenException()
    }

    const reservations = await this.prismaService.client.reservation.findMany({
      where: {
        packageId: id
      }
    })

    const feedbacks = reservations.filter((r) => r.feedback).map((r) => r.feedback) as Feedback[]

    const averageFeedbacksValue = Number(
      feedbacks.reduce((totalFeedbackValue, currentFeedback) => totalFeedbackValue + currentFeedback.value, 0) /
        feedbacks.length
    ).toFixed(1)

    return { ..._package, totalReservations: reservations.length, averageFeedbacksValue }
  }

  public getPackageGroupInfor = async (packageId: string) => {
    const reservations = await this.prismaService.client.reservation.findMany({
      where: {
        packageId
      }
    })

    const feedbacks = reservations.filter((r) => r.feedback).map((r) => r.feedback) as Feedback[]

    const averageFeedbacksValue = Number(
      feedbacks.reduce((totalFeedbackValue, currentFeedback) => totalFeedbackValue + currentFeedback.value, 0) /
        feedbacks.length
    ).toFixed(1)
    return { averageFeedbacksValue, totalReservations: reservations.length }
  }
}
