import { Container } from 'inversify'
import { ClerkController } from '../modules/clerk/clerk.controller'
import { UserController } from '../modules/user/user.controller'
import { UserService } from '../modules/user/user.service'

const container = new Container()

container.bind(ClerkController).toSelf().inRequestScope()

container.bind(UserService).toSelf().inRequestScope()
container.bind(UserController).toSelf().inRequestScope()

export { container }
