import { ReservationService } from './reservation.service'
import { Request } from 'express'
import { inject, injectable } from 'inversify'

import BadRequestException from '../../helpers/errors/bad-request.exception'
import { noContent, ok } from '../../helpers/utils'

import { ResponseWithUser, UserWithRole } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class ReservationController {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ReservationService) private readonly reservationService: ReservationService
  ) {}

  private noReentrancy = async (user: UserWithRole, callBack: () => Promise<void>) => {
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
      await callBack()
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
  }

  public createReservation = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user

    await this.noReentrancy(user, async () => {
      await this.reservationService.createReservation(user, res.locals.requestData)
    })

    return noContent(res)
  }

  public approveReservation = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const data = await this.reservationService.approveReservation(user, res.locals.requestData)
    return ok(res, data)
  }

  public rejectReservation = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user

    const data = { hubId: '' }
    await this.noReentrancy(user, async () => {
      const { hubId } = await this.reservationService.rejectReservation(user, res.locals.requestData)
      data.hubId = hubId
    })

    return ok(res, data)
  }

  public completeReservation = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user

    const data = { hubId: '' }
    await this.noReentrancy(user, async () => {
      const { hubId } = await this.reservationService.completeReservation(user, res.locals.requestData)
      data.hubId = hubId
    })

    return ok(res, data)
  }
}
