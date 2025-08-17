import { z } from 'zod'
import { baseSchema, validationPatterns } from './base'

export const projectTypeEnum = z.enum(['New Build', 'Renovation', 'Maintenance', 'Repair', 'Inspection'])

export const projectStatusEnum = z.enum(['Draft', 'Published', 'Bidding', 'Awarded', 'In Progress', 'Completed', 'Cancelled'])

export const visibilitySettingsEnum = z.enum(['Public', 'Private', 'Invitation Only'])

export const tradeCategoryEnum = z.enum(['Electrical', 'Framing', 'HVAC', 'Plumbing', 'Roofing', 'Masonry'])

export const projectSchema = z.object({
  ...baseSchema,
  project_title: validationPatterns.nonEmptyString,
  statement_of_work: validationPatterns.nonEmptyString,
  budget: validationPatterns.positiveNumber,
  category: z.array(tradeCategoryEnum).default([]),
  pid: validationPatterns.nonEmptyString,
  location: validationPatterns.geospatialLocation, // Updated to handle geospatial data
  certificate_of_title: validationPatterns.optionalUrl,
  project_type: projectTypeEnum,
  status: projectStatusEnum.default('Published'),
  visibility_settings: visibilitySettingsEnum.default('Public'),
  start_date: z.date(),
  end_date: z.date(),
  expiry_date: z.date(),
  substantial_completion: validationPatterns.optionalDate,
  is_verified_project: z.boolean().default(false),
  project_photos: z.array(validationPatterns.fileReference).default([]), // Updated to handle actual files
  files: z.array(validationPatterns.fileReference).default([]), // Updated to handle actual files
  creator: validationPatterns.uuid,
  proposal_count: z.number().int().min(0).default(0),
})

export type Project = z.infer<typeof projectSchema>
export type ProjectType = z.infer<typeof projectTypeEnum>
export type ProjectStatus = z.infer<typeof projectStatusEnum>
export type VisibilitySettings = z.infer<typeof visibilitySettingsEnum>
export type TradeCategory = z.infer<typeof tradeCategoryEnum>


export const validateProject = (data: unknown): Project => projectSchema.parse(data)
