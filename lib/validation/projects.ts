import { z } from 'zod'
import { 
  projectTypeEnum, 
  visibilitySettingsEnum, 
  tradeCategoryEnum 
} from '@/lib/database/schemas/projects'

// Create Project Form Schema - Based on the actual project schema
export const createProjectFormSchema = z.object({
  // Core project fields from projectSchema (will be stored in database)
  project_title: z.string().min(1, 'Project title is required'),
  statement_of_work: z.string().min(1, 'Statement of work is required'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.array(tradeCategoryEnum).min(1, 'At least one category is required'),
  pid: z.string().min(1, 'Project ID is required'),
  location: z.string().min(1, 'Location is required'),
  certificate_of_title: z.string().url().optional().or(z.literal('')),
  project_type: projectTypeEnum,
  visibility_settings: visibilitySettingsEnum,
  start_date: z.string().min(1, 'Start date is required').transform(str => new Date(str)),
  end_date: z.string().min(1, 'End date is required').transform(str => new Date(str)),
  expiry_date: z.string().min(1, 'Expiry date is required').transform(str => new Date(str)),
  substantial_completion: z.string().optional().transform(str => str ? new Date(str) : undefined),
  is_verified_project: z.boolean().default(false),
  project_photos: z.array(z.string().url()).min(1, 'At least one project photo is required'),
  files: z.array(z.string().url()).default([]),
  // Form-only fields (not stored in database)
  decision_date: z.string().min(1, 'Decision date is required').transform(str => new Date(str)),
  permit_required: z.boolean().default(false),
  // creator will be set automatically from user context
})

// Form input type (before transformation)
export const createProjectFormInputSchema = z.object({
  // Database fields (will be stored)
  project_title: z.string().min(1, 'Project title is required'),
  statement_of_work: z.string().min(1, 'Statement of work is required'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.array(tradeCategoryEnum).min(1, 'At least one category is required'),
  pid: z.string().min(1, 'Project ID is required'),
  location: z.string().min(1, 'Location is required'),
  certificate_of_title: z.string().url().optional().or(z.literal('')),
  project_type: projectTypeEnum,
  visibility_settings: visibilitySettingsEnum,
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  substantial_completion: z.string().optional(),
  is_verified_project: z.boolean().default(false),
  project_photos: z.array(z.string()).min(1, 'At least one project photo is required'),
  files: z.array(z.string()).default([]),
  // Form-only fields (not stored in database)
  decision_date: z.string().min(1, 'Decision date is required'),
  permit_required: z.boolean().default(false),
})

export type CreateProjectFormData = z.infer<typeof createProjectFormSchema>
export type CreateProjectFormInputData = z.infer<typeof createProjectFormInputSchema>
