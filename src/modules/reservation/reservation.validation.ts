import { isValidObjectId } from 'mongoose'
import z from 'zod'

export const createReservationSchema = z.object({
  body: z.object({
    packageId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id'),
    duration: z.number().int().min(1).max(5)
  })
})

export type TCreateReservationSchema = z.infer<typeof createReservationSchema>
