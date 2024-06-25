import { TCreateReservationSchema } from './reservation.validation'
import { ReservationStatus } from '@prisma/client'
import { inject, injectable } from 'inversify'

import BadRequestException from '../../helpers/errors/bad-request.exception'

import { UserWithRole } from '../../types'
import { ChatService } from '../chat/chat.service'
import { TGetFeedbacksSchema } from '../package/package.validation'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class ReservationService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ChatService) private readonly chatService: ChatService
  ) {}

  public getFeedbacks = async (schema: TGetFeedbacksSchema) => {
    const {
      params: { packageId }
    } = schema

    const reservations = await this.prismaService.client.reservation.findMany({
      where: { packageId },
      include: {
        student: true
      }
    })

    return reservations.map((r) => ({
      feedback: r.feedback,
      student: r.student
    }))
  }

  public createReservation = async (user: UserWithRole, schema: TCreateReservationSchema) => {
    const {
      body: { packageId, duration }
    } = schema

    const hasReservationIsActive = await this.prismaService.client.reservation.findFirst({
      where: {
        studentId: user.id,
        status: { in: [ReservationStatus.Pending, ReservationStatus.Progress] }
      }
    })

    if (hasReservationIsActive) {
      throw new BadRequestException('Cannot create a reservation while already have a active reservation')
    }

    const _package = await this.prismaService.client.package.findUnique({
      where: { id: packageId },
      include: {
        tutor: true
      }
    })

    if (!_package) {
      throw new BadRequestException(`Not found package with id: ${packageId}`)
    }

    const paidPrice = _package.pricePerHour * duration

    if (user.balance < paidPrice) {
      throw new BadRequestException(`Balance is not enough.`)
    }

    await this.prismaService.client.user.update({
      where: {
        id: user.id
      },
      data: {
        balance: user.balance - paidPrice
      }
    })

    await this.prismaService.client.reservation.create({
      data: {
        duration,
        studentId: user.id,
        packageId,
        paidPrice: _package.pricePerHour * duration
      }
    })

    await this.chatService.createSystemOrderMessage(user.id, _package.tutor.id)

    //TODO: auto reject reservation in 1 hour if not approve
  }
}
