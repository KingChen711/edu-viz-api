import {
  TApproveOrRejectReservationSchema,
  TCompleteReservationSchema,
  TCreateReservationSchema
} from './reservation.validation'
import { ReservationStatus } from '@prisma/client'
import { inject, injectable } from 'inversify'

import BadRequestException from '../../helpers/errors/bad-request.exception'
import ForbiddenException from '../../helpers/errors/forbidden-exception'
import NotFoundException from '../../helpers/errors/not-found.exception'

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

    const reservation = await this.prismaService.client.reservation.create({
      data: {
        duration,
        studentId: user.id,
        packageId,
        paidPrice: _package.pricePerHour * duration
      }
    })

    await this.chatService.createReservationOrderMessage(user.id, _package.tutor.id, reservation.id)

    //TODO: auto reject reservation in 1 hour if not approve
  }

  public approveReservation = async (user: UserWithRole, schema: TApproveOrRejectReservationSchema) => {
    const {
      params: { reservationId }
    } = schema

    const reservation = await this.prismaService.client.reservation.findUnique({
      where: {
        id: reservationId
      },
      include: {
        package: {
          include: {
            tutor: true
          }
        },
        student: true
      }
    })

    if (!reservation) {
      throw new NotFoundException(`Not found reservations with id: ${reservationId}`)
    }

    if (reservation.package.tutorId !== user.id) {
      throw new ForbiddenException()
    }

    if (reservation.status !== 'Pending') {
      throw new BadRequestException('Only can approve pending reservation')
    }

    await this.prismaService.client.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        status: 'Progress'
      }
    })

    await this.chatService.createReservationApproveMessage(
      reservation.studentId,
      reservation.package.tutorId,
      reservation.id
    )

    //TODO: auto complete reservation in 24 hour if not complete
  }

  public rejectReservation = async (user: UserWithRole, schema: TApproveOrRejectReservationSchema) => {
    const {
      params: { reservationId }
    } = schema

    const reservation = await this.prismaService.client.reservation.findUnique({
      where: {
        id: reservationId
      },
      include: {
        package: {
          include: {
            tutor: true
          }
        },
        student: true
      }
    })

    if (!reservation) {
      throw new NotFoundException(`Not found reservations with id: ${reservationId}`)
    }

    if (reservation.package.tutorId !== user.id) {
      throw new ForbiddenException()
    }

    if (reservation.status !== 'Pending') {
      throw new BadRequestException('Only can reject pending reservation')
    }

    await this.prismaService.client.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        status: 'Reject'
      }
    })

    await this.prismaService.client.user.update({
      where: { id: reservation.studentId },
      data: {
        balance: reservation.student.balance + reservation.paidPrice
      }
    })

    await this.chatService.createReservationRejectMessage(
      reservation.studentId,
      reservation.package.tutorId,
      reservation.id
    )
  }

  public completeReservation = async (user: UserWithRole, schema: TCompleteReservationSchema) => {
    const {
      params: { reservationId },
      body: { value, content }
    } = schema

    const reservation = await this.prismaService.client.reservation.findUnique({
      where: {
        id: reservationId
      },
      include: {
        package: {
          include: {
            tutor: true
          }
        },
        student: true
      }
    })

    if (!reservation) {
      throw new NotFoundException(`Not found reservations with id: ${reservationId}`)
    }

    if (reservation.studentId !== user.id) {
      throw new ForbiddenException()
    }

    if (reservation.status !== 'Progress') {
      throw new BadRequestException('Only can complete progress reservation')
    }

    await this.prismaService.client.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        status: 'Completed',
        feedback: {
          content,
          value
        }
      }
    })

    await this.prismaService.client.user.update({
      where: { id: reservation.package.tutorId },
      data: {
        balance: reservation.package.tutor.balance + reservation.paidPrice
      }
    })

    await this.chatService.createReservationCompleteMessage(
      reservation.studentId,
      reservation.package.tutorId,
      reservation.id
    )
  }
}
