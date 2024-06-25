import { ReservationService } from './reservation.service'
import { Request } from 'express'
import { inject, injectable } from 'inversify'

import BadRequestException from '../../helpers/errors/bad-request.exception'
import { noContent } from '../../helpers/utils'

import { ResponseWithUser } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class ReservationController {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ReservationService) private readonly reservationService: ReservationService
  ) {}

  public createReservation = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user

    if (user.lockPayment) throw new BadRequestException('Payment is already locked')

    await this.prismaService.client.user.update({
      where: {
        id: user.id
      },
      data: {
        lockPayment: true
      }
    })

    try {
      await this.reservationService.createReservation(user, res.locals.requestData)
    } finally {
      await this.prismaService.client.user.update({
        where: {
          id: user.id
        },
        data: {
          lockPayment: false
        }
      })
    }

    return noContent(res)
  }
}
