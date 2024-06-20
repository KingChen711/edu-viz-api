import { inject, injectable } from 'inversify'
import { TutorService } from './tutor.service'
import { Request, Response } from 'express'

import { ok } from '../../helpers/utils'

@injectable()
export class TutorController {
  constructor(@inject(TutorService) private readonly tutorService: TutorService) {}

  public getTutor = async (req: Request, res: Response) => {
    const user = res.locals.user
    const tutor = await this.tutorService.getTutor(user, res.locals.requestData)
    return ok(res, tutor)
  }
}
