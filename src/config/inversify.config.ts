import { Container } from 'inversify'
import { ClerkController } from '../modules/clerk/clerk.controller'
import { UserController } from '../modules/user/user.controller'
import { UserService } from '../modules/user/user.service'
import { SubjectService } from '../modules/subject/subject.service'
import { SubjectController } from '../modules/subject/subject.controller'
import { PackageService } from '../modules/package/package.service'
import { PackageController } from '../modules/package/package.controller'
import { TutorService } from '../modules/tutor/tutor.service'
import { TutorController } from '../modules/tutor/tutor.controller'
import { ReservationService } from '../modules/reservation/reservation.service'

const container = new Container()

container.bind(ClerkController).toSelf().inRequestScope()

container.bind(UserService).toSelf().inRequestScope()
container.bind(UserController).toSelf().inRequestScope()

container.bind(SubjectService).toSelf().inRequestScope()
container.bind(SubjectController).toSelf().inRequestScope()

container.bind(PackageService).toSelf().inRequestScope()
container.bind(PackageController).toSelf().inRequestScope()

container.bind(ReservationService).toSelf().inRequestScope()

container.bind(TutorService).toSelf().inRequestScope()
container.bind(TutorController).toSelf().inRequestScope()

export { container }
