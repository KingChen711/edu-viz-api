import { isValidObjectId } from 'mongoose'
import z from 'zod'

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  }),
  query: z.object({
    pageNumber: z.coerce.number().catch(1),
    pageSize: z.coerce
      .number()
      .catch(30)
      .transform((data) => Math.min(data, 50))
  })
})

export type TGetMessagesSchema = z.infer<typeof getMessagesSchema>

export const getHubSchema = z.object({
  params: z.object({
    id: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TGetHubSchema = z.infer<typeof getHubSchema>

export const getHubIdSchema = z.object({
  params: z.object({
    otherUserId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TGetHubIdSchema = z.infer<typeof getHubIdSchema>
