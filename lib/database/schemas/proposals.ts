import { z } from 'zod'
import { baseSchema, commonEnums, validationPatterns } from './base'

export const proposalSchema = z.object({
  ...baseSchema,
  projectId: validationPatterns.uuid,
  contractorId: validationPatterns.uuid,
  bidAmount: validationPatterns.positiveNumber,
  description: validationPatterns.nonEmptyString,
  timeline: validationPatterns.nonEmptyString,
  status: commonEnums.proposalStatus.default('pending'),
})

export const proposalCreateSchema = proposalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
})

export const proposalUpdateSchema = proposalSchema.partial().omit({
  id: true,
  createdAt: true,
  projectId: true,
  contractorId: true,
})

export const proposalStatusUpdateSchema = z.object({
  proposal_id: validationPatterns.uuid,
  new_status: commonEnums.proposalStatus,
  status_reason: validationPatterns.optionalString,
  updated_by: validationPatterns.uuid,
})

export const proposalResubmissionSchema = z.object({
  original_proposal_id: validationPatterns.uuid,
  new_bid_amount: validationPatterns.positiveNumber,
  new_description: validationPatterns.nonEmptyString,
  new_timeline: validationPatterns.nonEmptyString,
  resubmission_reason: validationPatterns.optionalString,
})

export const proposalSearchSchema = z.object({
  project_id: validationPatterns.uuid.optional(),
  contractor_id: validationPatterns.uuid.optional(),
  status: commonEnums.proposalStatus.optional(),
  bid_amount_min: validationPatterns.optionalNumber,
  bid_amount_max: validationPatterns.optionalNumber,
  date_from: validationPatterns.optionalDate,
  date_to: validationPatterns.optionalDate,
})

export const proposalComparisonSchema = z.object({
  proposal_ids: z.array(validationPatterns.uuid).min(2),
  comparison_criteria: z.array(z.enum(['price', 'timeline', 'experience', 'rating', 'availability'])),
})

export const proposalFeedbackSchema = z.object({
  proposal_id: validationPatterns.uuid,
  feedback_type: z.enum(['acceptance', 'rejection', 'revision_request', 'question']),
  feedback_message: validationPatterns.nonEmptyString,
  feedback_by: validationPatterns.uuid,
  feedback_date: z.date(),
})

export const proposalRevisionRequestSchema = z.object({
  proposal_id: validationPatterns.uuid,
  requested_changes: z.array(validationPatterns.nonEmptyString),
  revision_deadline: z.date(),
  revision_notes: validationPatterns.optionalString,
  requested_by: validationPatterns.uuid,
})

export type Proposal = z.infer<typeof proposalSchema>
export type ProposalCreate = z.infer<typeof proposalCreateSchema>
export type ProposalUpdate = z.infer<typeof proposalUpdateSchema>
export type ProposalStatusUpdate = z.infer<typeof proposalStatusUpdateSchema>
export type ProposalResubmission = z.infer<typeof proposalResubmissionSchema>
export type ProposalSearch = z.infer<typeof proposalSearchSchema>
export type ProposalComparison = z.infer<typeof proposalComparisonSchema>
export type ProposalFeedback = z.infer<typeof proposalFeedbackSchema>
export type ProposalRevisionRequest = z.infer<typeof proposalRevisionRequestSchema>

export const validateProposal = (data: unknown): Proposal => proposalSchema.parse(data)
export const validateProposalCreate = (data: unknown): ProposalCreate => proposalCreateSchema.parse(data)
export const validateProposalUpdate = (data: unknown): ProposalUpdate => proposalUpdateSchema.parse(data)
export const validateProposalStatusUpdate = (data: unknown): ProposalStatusUpdate => proposalStatusUpdateSchema.parse(data)
export const validateProposalResubmission = (data: unknown): ProposalResubmission => proposalResubmissionSchema.parse(data)
export const validateProposalSearch = (data: unknown): ProposalSearch => proposalSearchSchema.parse(data)
export const validateProposalComparison = (data: unknown): ProposalComparison => proposalComparisonSchema.parse(data)
export const validateProposalFeedback = (data: unknown): ProposalFeedback => proposalFeedbackSchema.parse(data)
export const validateProposalRevisionRequest = (data: unknown): ProposalRevisionRequest => proposalRevisionRequestSchema.parse(data)
