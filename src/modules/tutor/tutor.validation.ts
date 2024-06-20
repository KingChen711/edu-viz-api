import { isValidObjectId } from 'mongoose'
import z from 'zod'

export const getTutorSchema = z.object({
  params: z.object({
    id: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TGetTutorSchema = z.infer<typeof getTutorSchema>
