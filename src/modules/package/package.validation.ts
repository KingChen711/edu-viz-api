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
    status: z.enum(['All', 'Pending', 'Reject', 'Active', 'Disable']).catch('Active'),
    subjectName: z.string().optional(),
    sort: z.enum(['highest-price', 'lowest-price', 'highest-rating', 'newest']).catch('highest-rating')
  })
})

export type TGetPackagesSchema = z.infer<typeof getPackagesSchema>

export const getPackageSchema = z.object({
  params: z.object({
    id: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TGetPackageSchema = z.infer<typeof getPackageSchema>

export const getFeedbacksSchema = z.object({
  params: z.object({
    packageId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id')
  })
})

export type TGetFeedbacksSchema = z.infer<typeof getFeedbacksSchema>

export const createPackageSchema = z.object({
  body: z.object({
    subjectId: z.string().refine((data) => !data || isValidObjectId(data), 'Invalid id'),
    images: z.array(z.string()).catch([]),
    video: z.string().catch(''),
    pricePerHour: z
      .number()
      .int()
      .min(50)
      .max(500)
      .transform((data) => {
        return data - (data % 50) //làm tròn xuống sao cho chia hết cho 50
      })
  })
})

export type TCreatePackageSchema = z.infer<typeof createPackageSchema>
