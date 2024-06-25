import { ChatController } from './chat.controller'
import express from 'express'

import { container } from '../../config/inversify.config'

const router = express.Router()

const chatController = container.get(ChatController)

router.get('/', chatController.sendMessage)

export { router as chatRoute }
