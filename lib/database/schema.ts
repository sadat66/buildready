/**
 * Modern Database Schema Management (2024-2025)
 * Structured schema definitions with type safety and validation
 */

import { z } from 'zod'

// Base schema patterns
export const baseSchema = {
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
} as const

// User schema - exactly matching the CREATE TABLE statement
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  user_role: z.enum(['homeowner', 'contractor', 'admin']),
  full_name: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  profile_photo: z.string().optional(),
  is_active: z.boolean().default(true),
  is_verified_email: z.boolean().default(false),
  is_verified_contractor: z.boolean().default(false),
  is_verified_homeowner: z.boolean().default(false),
  is_verified_phone: z.boolean().default(false),
  user_agreed_to_terms: z.boolean().default(false),
  last_login: z.date().optional(),
  contractor_profile: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

// ContractorProfile schema - exactly matching the ContractorProfile schema image
export const contractorProfileSchema = z.object({
  ...baseSchema,
  bio: z.string().optional(), // short biography or description of contractor's experience
  business_name: z.string().min(1), // legal or trade business name of the contractor
  contractor_contacts: z.array(z.string().uuid()).default([]), // list of linked internal contacts for the contractor
  gst_hst_number: z.string().optional(), // CRA ID used for compliance verification
  insurance_builders_risk: z.number().positive().optional(), // monetary amount of the builder's risk insurance
  insurance_expiry: z.date().optional(), // expiry date of the insurance
  insurance_general_liability: z.number().positive().optional(), // monetary amount of the general liability insurance
  insurance_upload: z.string().url().optional(), // file representing proof of insurance
  is_insurance_verified: z.boolean().default(false), // indicates whether the insurance status has been verified
  legal_entity_type: z.enum(['Corporation', 'Partnership', 'Sole Proprietorship', 'LLC']).optional(), // corporate structure
  licenses: z.array(z.string().url()).default([]), // list of uploaded license files
  logo: z.string().url().optional(), // company's logo file
  phone_number: z.string().optional(), // primary business phone number
  portfolio: z.array(z.string().url()).default([]), // list of past project images or documents
  service_location: z.string().optional(), // central service location
  trade_category: z.array(z.string()).default([]), // list specifying primary and secondary trades
  user_id: z.string().uuid(), // linked user account
  wcb_number: z.string().optional(), // Workers' Compensation Board number
  work_guarantee: z.number().int().positive().optional(), // work and materials guarantee in months
})

// Project schema
export const projectSchema = z.object({
  ...baseSchema,
  homeownerId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  budget: z.number().positive(),
  location: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(['open', 'bidding', 'awarded', 'completed', 'cancelled']).default('open'),
  deadline: z.date().optional(),
  proposalDeadline: z.date(),
  preferredStartDate: z.date(),
  preferredEndDate: z.date(),
  decisionDate: z.date(),
  permitRequired: z.boolean().default(false),
  sitePhotos: z.array(z.string().url()).default([]),
  projectFiles: z.array(z.string().url()).default([]),
  isClosed: z.boolean().default(false),
})

// Proposal schema
export const proposalSchema = z.object({
  ...baseSchema,
  projectId: z.string().uuid(),
  contractorId: z.string().uuid(),
  bidAmount: z.number().positive(),
  description: z.string().min(1),
  timeline: z.string().min(1),
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).default('pending'),
})

// Review schema
export const reviewSchema = z.object({
  ...baseSchema,
  reviewerId: z.string().uuid(),
  reviewedId: z.string().uuid(),
  projectId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
})

// Message schema
export const messageSchema = z.object({
  ...baseSchema,
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  content: z.string().min(1),
})

// Schema registry
export const schemaRegistry = {
  users: userSchema,
  contractor_profiles: contractorProfileSchema,
  projects: projectSchema,
  proposals: proposalSchema,
  reviews: reviewSchema,
  messages: messageSchema,
} as const

// Type exports
export type User = z.infer<typeof userSchema>
export type ContractorProfile = z.infer<typeof contractorProfileSchema>
export type Project = z.infer<typeof projectSchema>
export type Proposal = z.infer<typeof proposalSchema>
export type Review = z.infer<typeof reviewSchema>
export type Message = z.infer<typeof messageSchema>

// Schema validation helpers
export const validateUser = (data: unknown): User => userSchema.parse(data)
export const validateContractorProfile = (data: unknown): ContractorProfile => contractorProfileSchema.parse(data)
export const validateProject = (data: unknown): Project => projectSchema.parse(data)
export const validateProposal = (data: unknown): Proposal => proposalSchema.parse(data)
export const validateReview = (data: unknown): Review => reviewSchema.parse(data)
export const validateMessage = (data: unknown): Message => messageSchema.parse(data)

// Partial schemas for updates
export const userUpdateSchema = userSchema.partial().omit({ id: true, createdAt: true })
export const contractorProfileUpdateSchema = contractorProfileSchema.partial().omit({ id: true, createdAt: true })
export const projectUpdateSchema = projectSchema.partial().omit({ id: true, createdAt: true })
export const proposalUpdateSchema = proposalSchema.partial().omit({ id: true, createdAt: true })

// Type exports for updates
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type ContractorProfileUpdate = z.infer<typeof contractorProfileUpdateSchema>
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>
export type ProposalUpdate = z.infer<typeof proposalUpdateSchema>

// Schema metadata
export const schemaMetadata = {
  users: {
    tableName: 'users',
    description: 'User profiles and authentication data with verification status',
    indexes: ['email', 'user_role', 'is_verified_email', 'is_active'],
  },
  contractor_profiles: {
    tableName: 'contractor_profiles',
    description: 'Main business profile for contractors with company information, compliance data, and service areas',
    indexes: ['user_id', 'business_name', 'is_insurance_verified', 'trade_category'],
  },
  projects: {
    tableName: 'projects',
    description: 'Homeowner project requests',
    indexes: ['homeowner_id', 'status', 'category', 'location'],
  },
  proposals: {
    tableName: 'proposals',
    description: 'Contractor project proposals',
    indexes: ['project_id', 'contractor_id', 'status'],
  },
  reviews: {
    tableName: 'reviews',
    description: 'User reviews and ratings',
    indexes: ['reviewer_id', 'reviewed_id', 'project_id'],
  },
  messages: {
    tableName: 'messages',
    description: 'User communication messages',
    indexes: ['sender_id', 'receiver_id', 'project_id'],
  },
} as const
