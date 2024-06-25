import 'dotenv/config'

import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { NextFunction, Request, Response } from 'express'

import { container } from '../config/inversify.config'

import ForbiddenException from '../helpers/errors/forbidden-exception'
import UnauthorizedException from '../helpers/errors/unauthorized-exception'

import { UserService } from '../modules/user/user.service'

//*check token(user) and may not required token(user) if required=false
//*It's like trying to get the user from the request but it doesn't require a user
//*Using this middleware for the endpoint that its business logic based on each role even Guest (no token)
const authentication =
  (required: boolean = true) =>
  async (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
    try {
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
