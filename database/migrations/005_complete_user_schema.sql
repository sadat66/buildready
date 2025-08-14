-- Migration: 005_complete_user_schema.sql
-- Version: 5
-- Description: Complete user schema with all fields from User schema image
-- Applied: 2024-12-19

-- Add all new fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_role TEXT CHECK (user_role IN ('homeowner', 'contractor', 'admin')),
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified_contractor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified_homeowner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified_phone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_agreed_to_terms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contractor_profile UUID;

-- Update existing users to populate new fields from existing data
UPDATE public.users 
SET 
  user_role = role,
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN full_name) > 0 
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END,
  phone_number = phone,
  address = location,
  is_active = true,
  user_agreed_to_terms = true
WHERE user_role IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON public.users(is_verified_email, is_verified_contractor, is_verified_homeowner, is_verified_phone);
CREATE INDEX IF NOT EXISTS idx_users_active_status ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_contractor_profile ON public.users(contractor_profile);

-- Add comments to document the fields
COMMENT ON COLUMN public.users.user_role IS 'Defines the user role on the platform (Homeowner, Contractor, Inspector, Notary)';
COMMENT ON COLUMN public.users.first_name IS 'The user''s given name';
COMMENT ON COLUMN public.users.last_name IS 'The user''s family name or surname';
COMMENT ON COLUMN public.users.phone_number IS 'The user''s primary contact phone number';
COMMENT ON COLUMN public.users.address IS 'Geographic address for matching, jurisdiction, or correspondence';
COMMENT ON COLUMN public.users.profile_photo IS 'Optional image for user''s profile or dashboard';
COMMENT ON COLUMN public.users.is_active IS 'Indicates if user account is enabled, disabled, or soft-deleted';
COMMENT ON COLUMN public.users.is_verified_contractor IS 'Indicates if contractor has submitted valid ContractorProfile company identity verification';
COMMENT ON COLUMN public.users.is_verified_homeowner IS 'Indicates if homeowner has submitted valid identity verification';
COMMENT ON COLUMN public.users.is_verified_phone IS 'Indicates if user has verified phone number via SMS or call';
COMMENT ON COLUMN public.users.user_agreed_to_terms IS 'Indicates if user has agreed to platform''s Terms of Service';
COMMENT ON COLUMN public.users.last_login IS 'Timestamp of most recent login time';
COMMENT ON COLUMN public.users.contractor_profile IS 'Link to ContractorProfile if user is contractor';
