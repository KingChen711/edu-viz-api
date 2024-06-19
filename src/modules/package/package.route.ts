// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'
import express from 'express'
import { container } from '../../config/inversify.config'
import { PackageController } from './package.controller'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import { getPackagesSchema } from './package.validation'

const router = express.Router()

const packageController = container.get(PackageController)

router.get('/', validateRequestData(getPackagesSchema), packageController.getPackages)

export { router as packageRoute }
