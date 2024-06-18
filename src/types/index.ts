import { User } from '@prisma/client'
import { Role as TRole } from '@prisma/client'
import { Response } from 'express'

export enum Role {
  STUDENT = 'Student',
  TUTOR = 'Tutor',
  MODERATOR = 'Moderator',
  ADMIN = 'Admin'
}

export type UserWithRole = User & { role: TRole }

export type ResponseWithUser = Response & {
  locals: {
    user: UserWithRole
  }
}
