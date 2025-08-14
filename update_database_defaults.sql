-- Update database schema to set default values for boolean fields
-- This ensures the application doesn't need to hardcode these values

-- Set default values for boolean fields in users table
ALTER TABLE public.users 
ALTER COLUMN is_active SET DEFAULT true;

ALTER TABLE public.users 
ALTER COLUMN is_verified_email SET DEFAULT false;

ALTER TABLE public.users 
ALTER COLUMN is_verified_contractor SET DEFAULT false;

ALTER TABLE public.users 
ALTER COLUMN is_verified_homeowner SET DEFAULT false;

ALTER TABLE public.users 
ALTER COLUMN is_verified_phone SET DEFAULT false;

ALTER TABLE public.users 
ALTER COLUMN user_agreed_to_terms SET DEFAULT false;

-- Ensure these fields are NOT NULL with defaults
ALTER TABLE public.users 
ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE public.users 
ALTER COLUMN is_verified_email SET NOT NULL;

ALTER TABLE public.users 
ALTER COLUMN is_verified_contractor SET NOT NULL;

ALTER TABLE public.users 
ALTER COLUMN is_verified_homeowner SET NOT NULL;

ALTER TABLE public.users 
ALTER COLUMN is_verified_phone SET NOT NULL;

ALTER TABLE public.users 
ALTER COLUMN user_agreed_to_terms SET NOT NULL;

-- Add comments to document the default values
COMMENT ON COLUMN public.users.is_active IS 'Indicates if user account is enabled (default: true)';
COMMENT ON COLUMN public.users.is_verified_email IS 'Indicates if user has verified email (default: false)';
COMMENT ON COLUMN public.users.is_verified_contractor IS 'Indicates if contractor is verified (default: false)';
COMMENT ON COLUMN public.users.is_verified_homeowner IS 'Indicates if homeowner is verified (default: false)';
COMMENT ON COLUMN public.users.is_verified_phone IS 'Indicates if phone is verified (default: false)';
COMMENT ON COLUMN public.users.user_agreed_to_terms IS 'Indicates if user agreed to terms (default: false)';
