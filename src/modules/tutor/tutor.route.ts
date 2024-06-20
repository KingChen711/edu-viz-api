// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'
import { TutorController } from './tutor.controller'
import express from 'express'
import { container } from '../../config/inversify.config'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { getTutorSchema } from './tutor.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authentication } from '../../middleware/authentication.middleware'

const router = express.Router()

const tutorController = container.get(TutorController)

router.get(
  '/:id',
  ClerkExpressWithAuth(),
  authentication(false),
  validateRequestData(getTutorSchema),
  tutorController.getTutor
)

export { router as tutorRoute }
