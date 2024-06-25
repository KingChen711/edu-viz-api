import { UserService } from './user.service'
import { Request } from 'express'
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
}
