// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import 'dotenv/config'

import { ReservationController } from './reservation.controller'
import {
  approveOrRejectReservationSchema,
  completeReservationSchema,
  createReservationSchema
} from './reservation.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import express from 'express'
import { authorize } from '../../middleware/authorize.middleware'

import { container } from '../../config/inversify.config'

import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

const router = express.Router()

const reservationController = container.get(ReservationController)

router.patch(
  '/:reservationId/complete',
  ClerkExpressWithAuth(),
  authorize([Role.STUDENT]),
  validateRequestData(completeReservationSchema),
  reservationController.completeReservation
)

router.patch(
  '/:reservationId/reject',
  ClerkExpressWithAuth(),
  authorize([Role.TUTOR]),
  validateRequestData(approveOrRejectReservationSchema),
  reservationController.rejectReservation
)

router.patch(
  '/:reservationId/approve',
  ClerkExpressWithAuth(),
  authorize([Role.TUTOR]),
  validateRequestData(approveOrRejectReservationSchema),
  reservationController.approveReservation
)

router.post(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.STUDENT]),
  validateRequestData(createReservationSchema),
  reservationController.createReservation
)

export { router as reservationRoute }
