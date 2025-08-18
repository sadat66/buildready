import { User } from './auth'
import { Project } from './projects'

// Base proposal interface (matches the comprehensive schema exactly)
export interface Proposal {
  id: string
  createdAt: Date
  updatedAt: Date
  
  // Core proposal fields
  title: string
  description_of_work: string
  
  // Project and user relationships (flat ID references)
  project: string
  contractor: string
  homeowner: string
  
  // Financial fields
  subtotal_amount: number
  tax_included: 'yes' | 'no'
  total_amount: number
  deposit_amount: number
  deposit_due_on: Date
  
  // Timeline fields
  proposed_start_date: Date
  proposed_end_date: Date
  expiry_date: Date
  
  // Status and workflow fields
  status: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  is_selected: 'yes' | 'no'
  is_deleted: 'yes' | 'no'
  
  // Dates and timestamps
  submitted_date?: Date
  accepted_date?: Date
  rejected_date?: Date
  withdrawn_date?: Date
  viewed_date?: Date
  last_updated: Date
  
  // Rejection handling
  rejected_by?: string
  rejection_reason?: 'price_too_high' | 'timeline_unrealistic' | 'experience_insufficient' | 'scope_mismatch' | 'other'
  rejection_reason_notes?: string
  
  // Content and documentation
  clause_preview_html?: string
  attached_files: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: Date
  }>
  notes?: string
  
  // Relationships and references
  agreement?: string
  proposals: string[]
  
  // User tracking
  created_by: string
  last_modified_by: string
  
  // Visibility and sharing
  visibility_settings: 'private' | 'public' | 'shared'
}

// Additional proposal types from the schema
export interface ProposalCreate {
  title: string
  description_of_work: string
  project: string
  contractor: string
  homeowner: string
  subtotal_amount: number
  tax_included: 'yes' | 'no'
  total_amount: number
  deposit_amount: number
  deposit_due_on: Date
  proposed_start_date: Date
  proposed_end_date: Date
  expiry_date: Date
  clause_preview_html?: string
  attached_files?: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: Date
  }>
  notes?: string
  visibility_settings?: 'private' | 'public' | 'shared'
}

export interface ProposalUpdate {
  title?: string
  description_of_work?: string
  subtotal_amount?: number
  tax_included?: 'yes' | 'no'
  total_amount?: number
  deposit_amount?: number
  deposit_due_on?: Date
  proposed_start_date?: Date
  proposed_end_date?: Date
  expiry_date?: Date
  status?: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  is_selected?: 'yes' | 'no'
  clause_preview_html?: string
  attached_files?: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: Date
  }>
  notes?: string
  visibility_settings?: 'private' | 'public' | 'shared'
}

export interface ProposalStatusUpdate {
  proposal_id: string
  new_status: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  status_reason?: string
  updated_by: string
}

export interface ProposalResubmission {
  original_proposal_id: string
  new_subtotal_amount: number
  new_description_of_work: string
  new_timeline: {
    proposed_start_date: Date
    proposed_end_date: Date
  }
  resubmission_reason?: string
}

export interface ProposalSearch {
  project?: string
  contractor?: string
  homeowner?: string
  status?: 'draft' | 'submitted' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  subtotal_amount_min?: number
  subtotal_amount_max?: number
  date_from?: Date
  date_to?: Date
  is_selected?: 'yes' | 'no'
}

export interface ProposalComparison {
  proposal_ids: string[]
  comparison_criteria: ('price' | 'timeline' | 'experience' | 'rating' | 'availability')[]
}

export interface ProposalFeedback {
  proposal_id: string
  feedback_type: 'acceptance' | 'rejection' | 'revision_request' | 'question'
  feedback_message: string
  feedback_by: string
  feedback_date: Date
}

export interface ProposalRevisionRequest {
  proposal_id: string
  requested_changes: string[]
  revision_deadline: Date
  revision_notes?: string
  requested_by: string
}
