export type UserRole = 'homeowner' | 'contractor' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string
  phone?: string
  location?: string
  bio?: string
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  homeowner_id: string
  title: string
  description: string
  budget: number
  location: string
  category: string
  status: 'open' | 'bidding' | 'awarded' | 'completed' | 'cancelled'
  deadline?: string
  proposal_deadline: string
  preferred_start_date: string
  preferred_end_date: string
  decision_date: string
  permit_required: boolean
  site_photos: string[]
  project_files: string[]
  is_closed: boolean
  created_at: string
  updated_at: string
  homeowner?: User
}

export interface Proposal {
  id: string
  project_id: string
  contractor_id: string
  bid_amount: number
  description: string
  timeline: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  contractor?: User
  project?: Project
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  project_id: string
  rating: number
  comment: string
  created_at: string
  reviewer?: User
  reviewed?: User
  project?: Project
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  project_id?: string
  content: string
  created_at: string
  sender?: User
  receiver?: User
}