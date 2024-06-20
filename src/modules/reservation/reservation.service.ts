import { injectable } from 'inversify'
import { Reservation } from './reservation.model'
import { TGetFeedbacksSchema } from '../package/package.validation'
import { Types } from 'mongoose'

@injectable()
export class ReservationService {
  constructor() {}

  public getFeedbacks = async (schema: TGetFeedbacksSchema) => {
    const {
      params: { packageId },
      query: { pageNumber, pageSize }
    } = schema

    const skip = (pageNumber - 1) * pageSize
    const limit = pageSize

    const feedbacks = await Reservation.aggregate([
      {
        $match: {
          packageId: new Types.ObjectId(packageId),
          'feedback.value': { $exists: true }
        }
      },
      {
        $unwind: '$feedback'
      },
      {
        $group: {
          _id: '$packageId',
          totalFeedbacks: { $sum: 1 },
          avgFeedbackValue: { $avg: '$feedback.value' },
          feedbacks: { $push: '$feedback' }
        }
      },
      {
        $project: {
          totalFeedbacks: 1,
          avgFeedbackValue: 1,
          feedbacks: { $slice: ['$feedbacks', skip, limit] }
        }
      }
    ])

    return feedbacks.length > 0 ? feedbacks[0] : { totalFeedbacks: 0, avgFeedbackValue: 0, feedbacks: [] }
  }
}
