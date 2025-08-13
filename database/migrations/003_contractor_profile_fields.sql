-- Migration: Add contractor profile fields to users table
-- Date: 2025-01-13
-- Description: Add comprehensive contractor profile fields including business info, licensing, insurance, and contact details

-- Add contractor-specific fields to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trade_category TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS portfolio TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS logo TEXT,
  ADD COLUMN IF NOT EXISTS licenses TEXT[] DEFAULT '{}',
  
  -- Legal and compliance information
  ADD COLUMN IF NOT EXISTS legal_entity_type TEXT,
  ADD COLUMN IF NOT EXISTS gst_hst_number TEXT,
  ADD COLUMN IF NOT EXISTS wcb_number TEXT,
  ADD COLUMN IF NOT EXISTS work_guarantee_months INTEGER DEFAULT 12,
  
  -- Insurance details
  ADD COLUMN IF NOT EXISTS insurance_general_liability DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insurance_builders_risk DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS insurance_proof_upload TEXT,
  ADD COLUMN IF NOT EXISTS insurance_is_verified BOOLEAN DEFAULT false,
  
  -- Service location
  ADD COLUMN IF NOT EXISTS service_address TEXT,
  ADD COLUMN IF NOT EXISTS service_city TEXT,
  ADD COLUMN IF NOT EXISTS service_province TEXT,
  ADD COLUMN IF NOT EXISTS service_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS service_country TEXT DEFAULT 'Canada',
  
  -- Contractor contacts (JSON array)
  ADD COLUMN IF NOT EXISTS contractor_contacts JSONB DEFAULT '[]';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_trade_category ON public.users USING GIN(trade_category);
CREATE INDEX IF NOT EXISTS idx_users_specialties ON public.users USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_users_service_location ON public.users(service_city, service_province);
CREATE INDEX IF NOT EXISTS idx_users_insurance_verified ON public.users(insurance_is_verified) WHERE role = 'contractor';

-- Add comments for documentation
COMMENT ON COLUMN public.users.contractor_contacts IS 'JSON array of contact objects with name, role, email, phone fields';
COMMENT ON COLUMN public.users.trade_category IS 'Array of trade categories for contractors';
COMMENT ON COLUMN public.users.specialties IS 'Array of contractor specialties';
COMMENT ON COLUMN public.users.portfolio IS 'Array of portfolio image URLs';
COMMENT ON COLUMN public.users.licenses IS 'Array of license document URLs';