import { Prisma } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { Types } from 'mongoose'

import { TGetFeedbacksSchema } from '../package/package.validation'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class ReservationService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public getFeedbacks = async (schema: TGetFeedbacksSchema) => {
    const {
      params: { packageId }
    } = schema

    return (await this.prismaService.client.reservation.findMany({ where: { packageId } })).map((r) => r.feedback)
  }
}
