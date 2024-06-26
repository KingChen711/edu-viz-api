import { isValidObjectId } from 'mongoose'
import z from 'zod'

export const getHubSchema = z.object({
  params: z.object({
    id: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TGetHubSchema = z.infer<typeof getHubSchema>
