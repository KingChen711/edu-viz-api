import { Role as TRole, User } from '@prisma/client'
import { Response } from 'express'

export enum Role {
  STUDENT = 'Student',
  TUTOR = 'Tutor',
  ADMIN = 'Admin'
}

export type UserWithRole = User & { role: TRole }

export type ResponseWithUser = Response & {
  locals: {
    user: UserWithRole
  }
}
