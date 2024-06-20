import 'dotenv/config'

import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { NextFunction, Request, Response } from 'express'

import { container } from '../config/inversify.config'

import ForbiddenException from '../helpers/errors/forbidden-exception'
import UnauthorizedException from '../helpers/errors/unauthorized-exception'

import { UserService } from '../modules/user/user.service'

const authentication =
  (required: boolean = true) =>
  async (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
    try {
      if (!req?.auth?.sessionId && required) throw new UnauthorizedException('Invalid Token')

      const clerkId = req?.auth?.userId
      if (!clerkId && required) throw new UnauthorizedException('Invalid Token')

      const userService = container.get(UserService)
      const user = clerkId ? await userService.getUserByClerkIdWithRole(clerkId) : null
      if (!user && required) throw new UnauthorizedException('Invalid Token')

      res.locals.user = user

      next()
    } catch (error) {
      throw new ForbiddenException()
    }
  }

export { authentication }
