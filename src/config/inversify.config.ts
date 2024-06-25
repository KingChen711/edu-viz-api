import { Container } from 'inversify'

import { ChatService } from '../modules/chat/chat.service'
import { ClerkController } from '../modules/clerk/clerk.controller'
import { PackageController } from '../modules/package/package.controller'
import { PackageService } from '../modules/package/package.service'
import { PrismaService } from '../modules/prisma/prisma.service'
import { ReservationController } from '../modules/reservation/reservation.controller'
import { ReservationService } from '../modules/reservation/reservation.service'
import { SubjectController } from '../modules/subject/subject.controller'
import { SubjectService } from '../modules/subject/subject.service'
import { TutorController } from '../modules/tutor/tutor.controller'
import { TutorService } from '../modules/tutor/tutor.service'
import { UserController } from '../modules/user/user.controller'
import { UserService } from '../modules/user/user.service'

const container = new Container()

container.bind(PrismaService).toSelf().inRequestScope()

container.bind(ClerkController).toSelf().inRequestScope()

container.bind(UserService).toSelf().inRequestScope()
container.bind(UserController).toSelf().inRequestScope()

container.bind(SubjectService).toSelf().inRequestScope()
container.bind(SubjectController).toSelf().inRequestScope()

container.bind(PackageService).toSelf().inRequestScope()
container.bind(PackageController).toSelf().inRequestScope()

container.bind(ReservationService).toSelf().inRequestScope()
container.bind(ReservationController).toSelf().inRequestScope()

container.bind(TutorService).toSelf().inRequestScope()
container.bind(TutorController).toSelf().inRequestScope()

container.bind(ChatService).toSelf().inRequestScope()

export { container }
