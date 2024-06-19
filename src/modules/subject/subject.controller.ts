import { inject, injectable } from 'inversify'
import { SubjectService } from './subject.service'
import { Request, Response } from 'express'

import { ok } from '../../helpers/utils'

@injectable()
export class SubjectController {
  constructor(@inject(SubjectService) private readonly subjectService: SubjectService) {}

  public getAllSubjects = async (req: Request, res: Response) => {
    const subjects = await this.subjectService.getAllSubjects()
    return ok(res, subjects)
  }
}
