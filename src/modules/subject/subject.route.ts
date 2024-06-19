// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'
import express from 'express'
import { container } from '../../config/inversify.config'
import { SubjectController } from './subject.controller'

const router = express.Router()

const subjectController = container.get(SubjectController)

router.get('/', subjectController.getAllSubjects)

export { router as subjectRoute }
