export type UserRole = 'homeowner' | 'contractor' | 'admin'

export interface User {
  id: string
  email: string
  user_role: UserRole
  full_name: string
  first_name: string
  last_name: string
  phone_number?: string
  address?: string
  profile_photo?: string
  is_active: boolean
  is_verified_email: boolean
  is_verified_contractor: boolean
  is_verified_homeowner: boolean
  is_verified_phone: boolean
  user_agreed_to_terms: boolean
  last_login?: string
  contractor_profile?: string
  created_at: string
  updated_at: string
}

export interface ContractorProfile {
  id: string
  bio?: string // short biography or description of contractor's experience
  business_name: string // legal or trade business name of the contractor
  contractor_contacts: string[] // list of linked internal contacts for the contractor
  gst_hst_number?: string // CRA ID used for compliance verification
  insurance_builders_risk?: number // monetary amount of the builder's risk insurance
  insurance_expiry?: string // expiry date of the insurance
  insurance_general_liability?: number // monetary amount of the general liability insurance
  insurance_upload?: string // file representing proof of insurance
  is_insurance_verified: boolean // indicates whether the insurance status has been verified
  legal_entity_type?: 'Corporation' | 'Partnership' | 'Sole Proprietorship' | 'LLC' // corporate structure
  licenses: string[] // list of uploaded license files
  logo?: string // company's logo file
  phone_number?: string // primary business phone number
  portfolio: string[] // list of past project images or documents
  service_location?: string // central service location
  trade_category: string[] // list specifying primary and secondary trades
  user_id: string // linked user account
  wcb_number?: string // Workers' Compensation Board number
  work_guarantee?: number // work and materials guarantee in months
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
  latitude?: number
  longitude?: number
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
  bid_amount?: number // Made optional for backward compatibility
  description: string
  timeline: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  
  // Financial details
  net_amount?: number
  tax_amount?: number
  total_amount?: number
  deposit_amount?: number
  deposit_due_date?: string
  
  // Timeline details
  proposed_start_date?: string
  proposed_end_date?: string
  estimated_days?: number
  
  // Penalties
  delay_penalty?: number
  abandonment_penalty?: number
  
  // Additional information
  uploaded_files?: string[]
  materials_included?: boolean
  warranty_period?: string
  additional_notes?: string
  feedback?: string
  
  // Relationships
  contractor?: User
  project?: Project
  // Database query aliases
  projects?: Project
  users?: User
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