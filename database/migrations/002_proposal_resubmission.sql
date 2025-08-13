-- Migration: Allow contractors to resubmit proposals after rejection
-- Date: 2024
-- Description: 
--   - Add 'withdrawn' status to proposal status options
--   - Remove unique constraint on project_id+contractor_id
--   - Add partial unique index for pending proposals only

-- Step 1: Drop the existing unique constraint
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_project_id_contractor_id_key;

-- Step 2: Update the status check constraint to include 'withdrawn'
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'));

-- Step 3: Create a partial unique index to ensure only one pending proposal per contractor per project
-- This allows contractors to resubmit after rejection/withdrawal while preventing multiple pending proposals
CREATE UNIQUE INDEX IF NOT EXISTS idx_proposals_unique_pending 
    ON public.proposals (project_id, contractor_id) 
    WHERE status = 'pending';

-- Step 4: Add an index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_proposals_status 
    ON public.proposals (status);

-- Step 5: Add an index for contractor queries
CREATE INDEX IF NOT EXISTS idx_proposals_contractor_status 
    ON public.proposals (contractor_id, status);

-- Step 6: Add an index for project queries
CREATE INDEX IF NOT EXISTS idx_proposals_project_status 
    ON public.proposals (project_id, status);