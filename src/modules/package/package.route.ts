// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'

import { PackageController } from './package.controller'
import { createPackageSchema, getFeedbacksSchema, getPackageSchema, getPackagesSchema } from './package.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import express from 'express'
import { authorize } from 'src/middleware/authorize.middleware'
import { Role } from 'src/types'

import { container } from '../../config/inversify.config'

import { authentication } from '../../middleware/authentication.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'

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

router.get('/my-packages', ClerkExpressWithAuth(), authorize([Role.TUTOR]), packageController.getMyPackages)

router.post(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.TUTOR]),
  validateRequestData(createPackageSchema),
  packageController.createPackage
)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authentication(false),
  validateRequestData(getPackagesSchema),
  packageController.getPackages
)

export { router as packageRoute }
