import { z } from 'zod'

export const baseSchema = {
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
} as const

export const commonFields = {
  id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
} as const

export const commonEnums = {
  userRole: z.enum(['homeowner', 'contractor', 'admin']),
  proposalStatus: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']),
  legalEntityType: z.enum(['Corporation', 'Partnership', 'Sole Proprietorship', 'LLC']),
} as const

export const validationPatterns = {
  email: z.string().email(),
  uuid: z.string().uuid(),
  positiveNumber: z.number().positive(),
  positiveInteger: z.number().int().positive(),
  url: z.string().url(),
  nonEmptyString: z.string().min(1),
  optionalString: z.string().optional(),
  optionalBoolean: z.boolean().optional(),
  optionalDate: z.date().optional(),
  optionalNumber: z.number().optional(),
  optionalUrl: z.string().url().optional(),
} as const

export type BaseSchema = z.infer<typeof baseSchema>
export type CommonFields = z.infer<typeof commonFields>
