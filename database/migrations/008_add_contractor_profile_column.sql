-- Migration: 008_add_contractor_profile_column.sql
-- Version: 8
-- Description: Add contractor_profile column to users table for linking to contractor profiles
-- Applied: 2024-12-19

-- Add the contractor_profile column to the users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS contractor_profile UUID;

-- Add a foreign key constraint to reference the contractor_profiles table
-- Check if constraint already exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_contractor_profile_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_contractor_profile_fkey 
    FOREIGN KEY (contractor_profile) 
    REFERENCES public.contractor_profiles(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add an index on the contractor_profile column for better query performance
CREATE INDEX IF NOT EXISTS idx_users_contractor_profile 
ON public.users(contractor_profile);

-- Add comment for the new column
COMMENT ON COLUMN public.users.contractor_profile IS 'Reference to contractor profile for users with contractor role';

-- Ensure the column allows NULL values (optional relationship)
ALTER TABLE public.users 
ALTER COLUMN contractor_profile DROP NOT NULL;
