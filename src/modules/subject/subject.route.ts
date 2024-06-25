// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'

import { SubjectController } from './subject.controller'
import express from 'express'

import { container } from '../../config/inversify.config'

const router = express.Router()

const subjectController = container.get(SubjectController)

router.get('/', subjectController.getAllSubjects)

export { router as subjectRoute }
