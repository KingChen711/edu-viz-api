import { isValidObjectId } from 'mongoose'
import z from 'zod'
import { PackageStatus } from './package.model'

PackageStatus

export const getPackagesSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().catch(1),
    pageSize: z.coerce
      .number()
      .catch(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['All', 'Pending', 'Reject', 'Active', 'Disable']).catch('Active'),
    subjectId: z
      .string()
      .optional()
      .refine((data) => !data || isValidObjectId(data), 'Invalid id'),
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
  }),
  query: z.object({
    pageNumber: z.coerce.number().catch(1),
    pageSize: z.coerce
      .number()
      .catch(5)
      .transform((data) => Math.min(data, 50))
  })
})

export type TGetFeedbacksSchema = z.infer<typeof getFeedbacksSchema>
