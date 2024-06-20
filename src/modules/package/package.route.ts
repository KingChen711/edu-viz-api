// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'
import express from 'express'
import { container } from '../../config/inversify.config'
import { PackageController } from './package.controller'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { getFeedbacksSchema, getPackageSchema, getPackagesSchema } from './package.validation'
import { authentication } from '../../middleware/authentication.middleware'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'

const router = express.Router()

const packageController = container.get(PackageController)

router.get(
  '/:packageId/feedbacks',
  ClerkExpressWithAuth(),
  authentication(false),
  validateRequestData(getFeedbacksSchema),
  packageController.getFeedbacks
)

router.get(
  '/:id',
  ClerkExpressWithAuth(),
  authentication(false),
  validateRequestData(getPackageSchema),
  packageController.getPackage
)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authentication(false),
  validateRequestData(getPackagesSchema),
  packageController.getPackages
)

export { router as packageRoute }
