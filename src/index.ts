import 'dotenv/config'
import 'reflect-metadata'
import 'express-async-errors'
import corsMiddleware from './middleware/cors.middleware'
import errorHandlingMiddleware from './middleware/error-handling.middleware'
import multerErrorHandlingMiddleware from './middleware/multer-error-handling.middleware'
import { clerkRoute } from './modules/clerk/clerk.route'
import { userRoute } from './modules/user/user.route'
import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import NotFoundException from './helpers/errors/not-found.exception'
import { ok } from './helpers/utils'
import { subjectRoute } from './modules/subject/subject.route'

//!Just for development
const DELAY = 0

const app = express()

app.use((req, res, next) => {
  setTimeout(next, DELAY)
})

app.use(helmet())
app.use(morgan('dev'))
app.use(express.static('public'))

//!Must place before app.use(bodyParser.), do not move it.
app.use('/api/webhook/clerk', clerkRoute)

app.use(bodyParser.json())
app.use(corsMiddleware)

app.use('/api/users', userRoute)
app.use('/api/subjects', subjectRoute)

app.get('/', (req, res) => {
  return ok(res, { message: 'hello world' })
})

app.all('*', () => {
  throw new NotFoundException()
})

app.use(multerErrorHandlingMiddleware)
app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000

const bootstrap = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!)

    console.log('Mongoose connected')
  } catch (error) {
    console.error(error)
  }

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!!!`)
  })
}

bootstrap()

export default app
