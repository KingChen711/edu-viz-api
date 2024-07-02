import { ChatController } from './chat.controller'
import { getHubIdSchema, getHubSchema, getMessagesSchema } from './chat.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import express from 'express'
import { Role } from 'src/types'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'

const router = express.Router()

const chatController = container.get(ChatController)

router.get('/hubs', ClerkExpressWithAuth(), authorize(), chatController.getHubs)

router.get('/hubs/:id', ClerkExpressWithAuth(), authorize(), validateRequestData(getHubSchema), chatController.getHub)

router.get(
  '/hubs/:id/messages',
  ClerkExpressWithAuth(),
  authorize(),
  validateRequestData(getMessagesSchema),
  chatController.getMessages
)

router.get(
  '/hubs/get-hub-id/:otherUserId',
  ClerkExpressWithAuth(),
  authorize([Role.STUDENT]),
  validateRequestData(getHubIdSchema),
  chatController.getHubId
)

export { router as chatRoute }
