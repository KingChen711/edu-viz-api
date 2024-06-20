import { injectable } from 'inversify'
import { Package, PackageDoc, PackageStatus } from './package.model'
import { TGetPackageSchema, TGetPackagesSchema } from './package.validation'
import { FilterQuery, Types } from 'mongoose'
import { PagedList } from '../../helpers/paged-list'
import { Role, UserWithRole } from '../../types'
import NotFoundException from 'src/helpers/errors/not-found.exception'
import ForbiddenException from 'src/helpers/errors/forbidden-exception'

@injectable()
export class PackageService {
  constructor() {}
  private sortMapping = {
    'highest-price': { pricePerHour: -1 },
    'lowest-price': { pricePerHour: 1 },
    'highest-rating': { avgFeedbackValue: -1 },
    newest: { createdAt: -1 }
  } as const

  public getPackages = async (schema: TGetPackagesSchema) => {
    const {
      query: { pageNumber, pageSize, sort, subjectId, search, status }
    } = schema

    const subjectFilter: FilterQuery<PackageDoc> = subjectId ? { subjectId: new Types.ObjectId(subjectId) } : {}

    const statusFilter: FilterQuery<PackageDoc> = status !== 'All' ? { status } : {}

    const searchFilter: FilterQuery<PackageDoc> = search
      ? {
          $or: [
            { 'subject.name': { $regex: search, $options: 'i' } },
            { 'tutor.fullName': { $regex: search, $options: 'i' } },
            { 'tutor.email': { $regex: search, $options: 'i' } }
          ]
        }
      : {}

    const $match: FilterQuery<PackageDoc> = { $and: [subjectFilter, searchFilter, statusFilter] }

    // Aggregation pipeline stages
    const pipeLines = [
      { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $lookup: { from: 'users', localField: 'tutorId', foreignField: '_id', as: 'tutor' } },
      { $unwind: '$tutor' },
      { $lookup: { from: 'reservations', localField: '_id', foreignField: 'packageId', as: 'reservations' } },
      { $match },
      {
        $project: {
          subjectId: 1,
          tutorId: 1,
          pricePerHour: 1,
          images: 1,
          video: 1,
          status: 1,
          createdAt: 1,
          'subject.name': 1,
          'tutor.fullName': 1,
          'tutor.email': 1,
          'tutor.avatar': 1,
          'tutor.tutor.isAvailable': 1,
          totalReservations: { $size: '$reservations' }, // Calculate total reservations per package
          avgFeedbackValue: { $avg: '$reservations.feedback.value' } // Calculate average feedback value
        }
      }
    ]

    const totalCountResult = await Package.aggregate([
      ...pipeLines,
      {
        $count: 'total'
      }
    ])

    const packages = await Package.aggregate([
      ...pipeLines,
      { $sort: this.sortMapping[sort] },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize }
    ])

    const totalCount = totalCountResult[0] ? totalCountResult[0].total : 0

    return new PagedList(packages, totalCount, pageNumber, pageSize)
  }

  public getPackage = async (user: UserWithRole | null, schema: TGetPackageSchema) => {
    const {
      params: { id }
    } = schema

    const packageResult = await Package.aggregate([
      {
        $lookup: {
          from: 'reservations',
          localField: '_id',
          foreignField: 'packageId',
          as: 'reservations'
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' },
      {
        $match: {
          _id: new Types.ObjectId(id)
        }
      },
      {
        $project: {
          _id: 1,
          subjectId: 1,
          tutorId: 1,
          pricePerHour: 1,
          status: 1,
          'subject.name': 1,
          'subject.image': 1,
          'subject.description': 1,
          totalReservations: { $size: '$reservations' }, // Calculate total reservations per package
          avgFeedbackValue: { $avg: '$reservations.feedback.value' } // Calculate average feedback value
        }
      }
    ])

    const _package = packageResult.length > 0 ? packageResult[0] : null

    if (!_package) {
      throw new NotFoundException(`Not found package with id: ${id}`)
    }

    const isAdmin = user?.role.roleName === Role.ADMIN
    const isTutorAndOwnsPackages = user?.role.roleName === Role.TUTOR && user.id === _package?.tutorId

    if (_package.status !== PackageStatus.ACTIVE && !isAdmin && !isTutorAndOwnsPackages) {
      throw new ForbiddenException()
    }

    return _package
  }
}
