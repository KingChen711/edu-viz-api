import { UserService } from './user.service'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { ok } from '../../helpers/utils'

import { ResponseWithUser } from '../../types'

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  public whoAmI = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    return ok(res, user)
  }

  public getAll = async (req: Request, res: Response) => {
    const users = await this.userService.getAll()
    return ok(res, users)
  }
}
