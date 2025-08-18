import { User } from './auth'
import { Project } from './projects'

// Base proposal interface (matches the schema exactly)
export interface Proposal {
  id: string
  projectId: string
  contractorId: string
  bidAmount: number
  description: string
  timeline: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: Date
  updated_at: Date
  
  // Optional relationships for database queries
  contractor?: User
  project?: Project
}

// Additional proposal types from the schema
export interface ProposalCreate {
  projectId: string
  contractorId: string
  bidAmount: number
  description: string
  timeline: string
}

export interface ProposalUpdate {
  bidAmount?: number
  description?: string
  timeline?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
}

export interface ProposalStatusUpdate {
  proposal_id: string
  new_status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  status_reason?: string
  updated_by: string
}

export interface ProposalResubmission {
  original_proposal_id: string
  new_bid_amount: number
  new_description: string
  new_timeline: string
  resubmission_reason?: string
}

export interface ProposalSearch {
  project_id?: string
  contractor_id?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  bid_amount_min?: number
  bid_amount_max?: number
  date_from?: Date
  date_to?: Date
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
