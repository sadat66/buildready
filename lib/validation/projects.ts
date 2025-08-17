import { z } from 'zod'
import { 
  projectTypeEnum, 
  visibilitySettingsEnum, 
  tradeCategoryEnum 
} from '@/lib/database/schemas/projects'

// Create Project Form Schema - Essential fields only for initial project creation
export const createProjectFormSchema = z.object({
  // Core required fields for project creation
  project_title: z.string().min(1, 'Project title is required'),
  statement_of_work: z.string().min(1, 'Statement of work is required'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.array(tradeCategoryEnum).min(1, 'At least one category is required'),
  pid: z.string().min(1, 'Project ID is required'),
  location: z.string().min(1, 'Location is required'),
  project_type: projectTypeEnum,
  visibility_settings: visibilitySettingsEnum,
  start_date: z.string().min(1, 'Start date is required').transform(str => new Date(str)),
  end_date: z.string().min(1, 'End date is required').transform(str => new Date(str)),
  expiry_date: z.string().min(1, 'Expiry date is required').transform(str => new Date(str)),
  project_photos: z.array(z.string().url()).min(1, 'At least one project photo is required'),
  // Optional fields (can be added later)
  certificate_of_title: z.string().url().optional().or(z.literal('')),
  substantial_completion: z.string().optional().transform(str => str ? new Date(str) : undefined),
  is_verified_project: z.boolean().default(false),
  files: z.array(z.string().url()).default([]),
  // Form-only fields (not stored in database)
  decision_date: z.string().min(1, 'Decision date is required').transform(str => new Date(str)),
  permit_required: z.boolean().default(false),
  // creator will be set automatically from user context
})

// Form input type (before transformation) - Essential fields only
export const createProjectFormInputSchema = z.object({
  // Core required fields
  project_title: z.string().min(1, 'Project title is required'),
  statement_of_work: z.string().min(1, 'Statement of work is required'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.array(tradeCategoryEnum).min(1, 'At least one category is required'),
  pid: z.string().min(1, 'Project ID is required'),
  location: z.string().min(1, 'Location is required'),
  project_type: projectTypeEnum,
  visibility_settings: visibilitySettingsEnum,
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  project_photos: z.array(z.string()).min(1, 'At least one project photo is required'),
  // Optional fields
  certificate_of_title: z.string().url().optional().or(z.literal('')),
  substantial_completion: z.string().optional(),
  is_verified_project: z.boolean().default(false),
  files: z.array(z.string()).default([]),
  // Form-only fields (not stored in database)
  decision_date: z.string().min(1, 'Decision date is required'),
  permit_required: z.boolean().default(false),
})

export type CreateProjectFormData = z.infer<typeof createProjectFormSchema>
export type CreateProjectFormInputData = z.infer<typeof createProjectFormInputSchema>
