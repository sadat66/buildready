import { z } from 'zod'
import { baseSchema, validationPatterns, commonEnums } from './base'

// Use the centralized project type enum from base schema
export const projectTypeEnum = commonEnums.projectType

// Use the centralized project status enum from base schema
export const projectStatusEnum = commonEnums.projectStatus

// Use the centralized visibility settings enum from base schema
export const visibilitySettingsEnum = commonEnums.visibilitySettings

// Use the centralized trade category enum from base schema
export const tradeCategoryEnum = commonEnums.tradeCategory

export const projectSchema = z.object({
  ...baseSchema,
  project_title: validationPatterns.nonEmptyString,
  statement_of_work: validationPatterns.nonEmptyString,
  budget: validationPatterns.positiveNumber,
  category: z.array(tradeCategoryEnum).default([]),
  pid: validationPatterns.nonEmptyString,
  location: validationPatterns.geospatialLocation,
  certificate_of_title: validationPatterns.optionalUrl,
  project_type: projectTypeEnum,
  status: projectStatusEnum.default('Open for Proposals'),
  visibility_settings: visibilitySettingsEnum.default('Public To Marketplace'),
  start_date: z.date(),
  end_date: z.date(),
  expiry_date: z.date(),
  // ✅ NEW WORKFLOW FIELDS
  decision_date: validationPatterns.optionalDate, // Required in workflow, but optional in schema for flexibility
  permit_required: z.boolean().default(false), // Optional permit toggle
  substantial_completion: validationPatterns.optionalDate,
  is_verified_project: z.boolean().default(false),
  project_photos: z.array(validationPatterns.fileReference).default([]),
  files: z.array(validationPatterns.fileReference).default([]),
  creator: validationPatterns.uuid,
  proposal_count: z.number().int().min(0).default(0),
})

export type Project = z.infer<typeof projectSchema>
export type ProjectType = z.infer<typeof projectTypeEnum>
export type ProjectStatus = z.infer<typeof projectStatusEnum>
export type VisibilitySettings = z.infer<typeof visibilitySettingsEnum>
export type TradeCategory = z.infer<typeof tradeCategoryEnum>


export const validateProject = (data: unknown): Project => projectSchema.parse(data)
