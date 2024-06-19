import { isValidObjectId } from 'mongoose'
import z from 'zod'

export const getPackagesSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().catch(1),
    pageSize: z.coerce
      .number()
      .catch(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    subjectId: z
      .string()
      .optional()
      .refine((data) => !data || isValidObjectId(data), 'Invalid id'),
    sort: z.enum(['highest-price', 'lowest-price', 'highest-rating', 'newest']).catch('highest-rating')
  })
})

export type TGetPackagesSchema = z.infer<typeof getPackagesSchema>
