import { isValidObjectId } from 'mongoose'
import z from 'zod'

export const createReservationSchema = z.object({
  body: z.object({
    packageId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id'),
    duration: z.number().int().min(1).max(5)
  })
})

export type TCreateReservationSchema = z.infer<typeof createReservationSchema>

export const approveOrRejectReservationSchema = z.object({
  params: z.object({
    reservationId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TApproveOrRejectReservationSchema = z.infer<typeof approveOrRejectReservationSchema>

export const completeReservationSchema = z.object({
  params: z.object({
    reservationId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  }),
  body: z.object({
    content: z.string().optional(),
    value: z.number().int().min(1).max(5)
  })
})

export type TCompleteReservationSchema = z.infer<typeof completeReservationSchema>
