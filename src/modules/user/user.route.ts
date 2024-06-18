// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'
import { UserController } from './user.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import express from 'express'
import { container } from '../../config/inversify.config'
import { authorize } from '../../middleware/authorize.middleware'

const router = express.Router()

const userController = container.get(UserController)

router.get('/who-am-i', ClerkExpressWithAuth(), authorize(), userController.whoAmI)

export { router as userRoute }
