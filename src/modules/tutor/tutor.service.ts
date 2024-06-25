import { TGetTutorSchema } from './tutor.validation'
import { PackageStatus } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { Role, UserWithRole } from 'src/types'

import BadRequestException from 'src/helpers/errors/bad-request.exception'
import NotFoundException from 'src/helpers/errors/not-found.exception'

import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class TutorService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public getTutor = async (user: UserWithRole | null, schema: TGetTutorSchema) => {
    const {
      params: { id }
    } = schema

    const tutor = await this.prismaService.client.user.findUnique({
      where: { id },
      include: {
        role: true,
        packages: {
          include: {
            subject: true
          }
        }
      }
    })

    if (!tutor) {
      throw new NotFoundException(`Not found tutor with id: ${id}`)
    }

    if (tutor.role.roleName !== Role.TUTOR) {
      throw new BadRequestException('This user is not a tutor')
    }

    const isAdmin = user?.role.roleName === Role.ADMIN
    const isTutorAndOwnsPackages = user?.role.roleName === Role.TUTOR && user.id === id

    if (!isAdmin && !isTutorAndOwnsPackages) {
      tutor.packages = tutor.packages.filter((p) => p.status === PackageStatus.Active)
    }

    return tutor
  }
}
