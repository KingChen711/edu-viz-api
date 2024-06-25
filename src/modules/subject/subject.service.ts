import { inject, injectable } from 'inversify'

import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class SubjectService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public getAllSubjects = async () => await this.prismaService.client.subject.findMany()
}
