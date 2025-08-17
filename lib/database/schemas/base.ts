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
  // New patterns for geospatial and file handling
  geospatialLocation: z.object({
    address: z.string().min(1, 'Address is required'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  fileReference: z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  }),
  fileArray: z.array(z.string().url()).default([]), // For backward compatibility
} as const

export type BaseSchema = z.infer<typeof baseSchema>
export type CommonFields = z.infer<typeof commonFields>
export type GeospatialLocation = z.infer<typeof validationPatterns.geospatialLocation>
export type FileReference = z.infer<typeof validationPatterns.fileReference>
