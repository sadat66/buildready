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

// User schema
export const userSchema = z.object({
  ...baseSchema,
  email: z.string().email(),
  role: z.enum(['homeowner', 'contractor', 'admin']),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
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
  projects: projectSchema,
  proposals: proposalSchema,
  reviews: reviewSchema,
  messages: messageSchema,
} as const

// Type exports
export type User = z.infer<typeof userSchema>
export type Project = z.infer<typeof projectSchema>
export type Proposal = z.infer<typeof proposalSchema>
export type Review = z.infer<typeof reviewSchema>
export type Message = z.infer<typeof messageSchema>

// Schema validation helpers
export const validateUser = (data: unknown): User => userSchema.parse(data)
export const validateProject = (data: unknown): Project => projectSchema.parse(data)
export const validateProposal = (data: unknown): Proposal => proposalSchema.parse(data)
export const validateReview = (data: unknown): Review => reviewSchema.parse(data)
export const validateMessage = (data: unknown): Message => messageSchema.parse(data)

// Partial schemas for updates
export const userUpdateSchema = userSchema.partial().omit({ id: true, createdAt: true })
export const projectUpdateSchema = projectSchema.partial().omit({ id: true, createdAt: true })
export const proposalUpdateSchema = proposalSchema.partial().omit({ id: true, createdAt: true })

// Type exports for updates
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>
export type ProposalUpdate = z.infer<typeof proposalUpdateSchema>

// Schema metadata
export const schemaMetadata = {
  users: {
    tableName: 'users',
    description: 'User profiles and authentication data',
    indexes: ['email', 'role', 'rating'],
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
