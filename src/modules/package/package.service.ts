import { injectable } from 'inversify'
import { Package, PackageDoc } from './package.model'
import { TGetPackagesSchema } from './package.validation'
import { FilterQuery } from 'mongoose'
import { PagedList } from 'src/helpers/paged-list'

@injectable()
export class PackageService {
  constructor() {}
  // "highest-price" | "lowest-price" | "highest-rating" | "newest" |
  private sortMapping = {
    'highest-price': { pricePerHour: -1 },
    'lowest-price': { pricePerHour: 1 },
    'highest-rating': {},
    newest: { createdAt: -1 }
  } as const

  public getPackages = async (schema: TGetPackagesSchema) => {
    const {
      query: { pageNumber, pageSize, sort, subjectId, search }
    } = schema

    const subjectFilter: FilterQuery<PackageDoc> = subjectId
      ? {
          subjectId
        }
      : {}

    const searchFilter: FilterQuery<PackageDoc> = search
      ? {
          $or: [
            {
              'subject.name': {
                $regex: search,
                $options: 'i'
              }
            },
            {
              'tutor.fullName': {
                $regex: search,
                $options: 'i'
              }
            },
            {
              'tutor.email': {
                $regex: search,
                $options: 'i'
              }
            }
          ]
        }
      : {}

    const query: FilterQuery<PackageDoc> = { $and: [subjectFilter, searchFilter] }

    const pipeLines = [
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject'
        }
      },
      {
        $unwind: '$subject'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'tutorId',
          foreignField: '_id',
          as: 'tutor'
        }
      },
      {
        $unwind: '$tutor'
      },
      {
        $lookup: {
          from: 'reservations',
          localField: '_id',
          foreignField: 'packageId',
          as: 'reservations'
        }
      },

      {
        $match: query
      },
      {
        $project: {
          subjectId: 1,
          tutorId: 1,
          pricePerHour: 1,
          images: 1,
          video: 1,
          status: 1,
          subject: { name: 1 },
          tutor: { fullName: 1, email: 1 },
          reservations: { duration: 1, paidPrice: 1, feedback: { content: 1, value: 1 } }
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

    console.log({ totalCountResult })

    return new PagedList(packages, totalCount, pageNumber, pageSize)
  }
}
