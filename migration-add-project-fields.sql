-- Migration to add new fields to projects table for enhanced project creation workflow
-- Run this after the initial schema setup to add the new required fields

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS proposal_deadline DATE,
ADD COLUMN IF NOT EXISTS preferred_start_date DATE,
ADD COLUMN IF NOT EXISTS preferred_end_date DATE,
ADD COLUMN IF NOT EXISTS decision_date DATE,
ADD COLUMN IF NOT EXISTS permit_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS site_photos TEXT[],
ADD COLUMN IF NOT EXISTS project_files TEXT[],
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false;

-- Update existing projects to have default values for new required fields
-- This is only needed if you have existing projects in your database
UPDATE public.projects 
SET 
  proposal_deadline = COALESCE(proposal_deadline, deadline, CURRENT_DATE + INTERVAL '7 days'),
  preferred_start_date = COALESCE(preferred_start_date, CURRENT_DATE + INTERVAL '14 days'),
  preferred_end_date = COALESCE(preferred_end_date, CURRENT_DATE + INTERVAL '30 days'),
  decision_date = COALESCE(decision_date, CURRENT_DATE + INTERVAL '10 days'),
  permit_required = COALESCE(permit_required, false),
  site_photos = COALESCE(site_photos, '{}'),
  project_files = COALESCE(project_files, '{}'),
  is_closed = COALESCE(is_closed, false)
WHERE 
  proposal_deadline IS NULL 
  OR preferred_start_date IS NULL 
  OR preferred_end_date IS NULL 
  OR decision_date IS NULL;

-- Make the new fields NOT NULL after setting default values
ALTER TABLE public.projects 
ALTER COLUMN proposal_deadline SET NOT NULL,
ALTER COLUMN preferred_start_date SET NOT NULL,
ALTER COLUMN preferred_end_date SET NOT NULL,
ALTER COLUMN decision_date SET NOT NULL;

-- Add indexes for better performance on new date fields
CREATE INDEX IF NOT EXISTS idx_projects_proposal_deadline ON public.projects(proposal_deadline);
CREATE INDEX IF NOT EXISTS idx_projects_preferred_start_date ON public.projects(preferred_start_date);
CREATE INDEX IF NOT EXISTS idx_projects_decision_date ON public.projects(decision_date);
CREATE INDEX IF NOT EXISTS idx_projects_is_closed ON public.projects(is_closed);