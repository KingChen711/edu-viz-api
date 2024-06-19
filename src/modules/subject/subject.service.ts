import { injectable } from 'inversify'
import { Subject } from './subject.model'

@injectable()
export class SubjectService {
  constructor() {}

  public getAllSubjects = async () => await Subject.find()
}
