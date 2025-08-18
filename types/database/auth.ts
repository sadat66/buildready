 
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
