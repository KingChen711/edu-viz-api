// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'
import express from 'express'
import { container } from '../../config/inversify.config'
import { PackageController } from './package.controller'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { getPackagesSchema } from './package.validation'
import { Package } from './package.model'
import { ok } from '../../helpers/utils'
import mongoose from 'mongoose'
import { authentication } from '../../middleware/authentication.middleware'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'

const router = express.Router()

const packageController = container.get(PackageController)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authentication(false),
  validateRequestData(getPackagesSchema),
  packageController.getPackages
)
router.get('/test', validateRequestData(getPackagesSchema), async (req, res) => {
  return ok(
    res,
    await Package.aggregate([
      { $match: { subjectId: new mongoose.Types.ObjectId('667332306e55c6686d20a8ee') } },
      { $project: { tutorId: 1 } }
    ])
  )
})

export { router as packageRoute }
