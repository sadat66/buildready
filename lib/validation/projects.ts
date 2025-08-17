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
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  project_type: projectTypeEnum,
  visibility_settings: visibilitySettingsEnum,
  start_date: z.string().min(1, 'Start date is required').transform(str => new Date(str)),
  end_date: z.string().min(1, 'End date is required').transform(str => new Date(str)),
  expiry_date: z.string().min(1, 'Expiry date is required').transform(str => new Date(str)),
  project_photos: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  })).min(1, 'At least one project photo is required'),
  // Optional fields (can be added later)
  certificate_of_title: z.string().url().optional().or(z.literal('')),
  substantial_completion: z.string().optional().transform(str => str ? new Date(str) : undefined),
  is_verified_project: z.boolean().default(false),
  files: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  })).default([]),
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
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  project_type: projectTypeEnum,
  visibility_settings: visibilitySettingsEnum,
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  project_photos: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  })).min(1, 'At least one project photo is required'),
  // Optional fields
  certificate_of_title: z.string().url().optional().or(z.literal('')),
  substantial_completion: z.string().optional(),
  is_verified_project: z.boolean().default(false),
  files: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string().min(1),
    url: z.string().url(),
    size: z.number().positive().optional(),
    mimeType: z.string().optional(),
    uploadedAt: z.date().optional(),
  })).default([]),
  // Form-only fields (not stored in database)
  decision_date: z.string().min(1, 'Decision date is required'),
  permit_required: z.boolean().default(false),
})

export type CreateProjectFormData = z.infer<typeof createProjectFormSchema>
export type CreateProjectFormInputData = z.infer<typeof createProjectFormInputSchema>
export type ProjectLocation = z.infer<typeof createProjectFormInputSchema>['location']
export type ProjectFile = z.infer<typeof createProjectFormInputSchema>['project_photos'][0]
