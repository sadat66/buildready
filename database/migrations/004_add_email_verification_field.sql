-- Migration: 004_add_email_verification_field.sql
-- Version: 4
-- Description: Add email verification field to users table
-- Applied: 2024-12-19

-- Add is_verified_email field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified_email BOOLEAN DEFAULT false;

-- Update existing users to have is_verified_email = true if they have confirmed emails
-- This assumes that existing users have already confirmed their emails
UPDATE public.users 
SET is_verified_email = true 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
);

-- Create index for better performance on email verification queries
CREATE INDEX IF NOT EXISTS idx_users_email_verification ON public.users(is_verified_email);

-- Add comment to document the field
COMMENT ON COLUMN public.users.is_verified_email IS 'Indicates whether the user has verified their email address';
