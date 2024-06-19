import { Response } from 'express'
import { RoleDoc } from '../modules/user/role.model'
import { UserDoc } from '../modules/user/user.model'

export enum Role {
  STUDENT = 'Student',
  TUTOR = 'Tutor',
  ADMIN = 'Admin'
}

export type UserWithRole = UserDoc & { role: RoleDoc }

export type ResponseWithUser = Response & {
  locals: {
    user: UserWithRole
  }
}
