-- Migration: 015_comprehensive_proposal_schema.sql
-- Version: 15
-- Description: Update proposals table to match comprehensive schema from image
-- Applied: 2024-12-19

-- Step 1: Add new columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description_of_work TEXT,
ADD COLUMN IF NOT EXISTS homeowner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_included TEXT CHECK (tax_included IN ('yes', 'no')),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_due_on DATE,
ADD COLUMN IF NOT EXISTS proposed_start_date DATE,
ADD COLUMN IF NOT EXISTS proposed_end_date DATE,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS is_selected TEXT CHECK (is_selected IN ('yes', 'no')) DEFAULT 'no',
ADD COLUMN IF NOT EXISTS is_deleted TEXT CHECK (is_deleted IN ('yes', 'no')) DEFAULT 'no',
ADD COLUMN IF NOT EXISTS submitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS withdrawn_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS viewed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS rejected_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT CHECK (rejection_reason IN ('price_too_high', 'timeline_unrealistic', 'experience_insufficient', 'scope_mismatch', 'other')),
ADD COLUMN IF NOT EXISTS rejection_reason_notes TEXT,
ADD COLUMN IF NOT EXISTS clause_preview_html TEXT,
ADD COLUMN IF NOT EXISTS attached_files JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS agreement_id UUID,
ADD COLUMN IF NOT EXISTS parent_proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS last_modified_by_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS visibility_settings TEXT CHECK (visibility_settings IN ('private', 'public', 'shared')) DEFAULT 'private';

-- Step 2: Update status enum to include new values
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check 
    CHECK (status IN ('draft', 'submitted', 'viewed', 'accepted', 'rejected', 'withdrawn', 'expired'));

-- Step 3: Update existing data to populate new required fields
UPDATE public.proposals 
SET 
    title = COALESCE(title, 'Proposal for Project'),
    description_of_work = COALESCE(description_of_work, description),
    homeowner_id = (SELECT homeowner_id FROM public.projects WHERE id = project_id),
    subtotal_amount = COALESCE(subtotal_amount, bid_amount),
    total_amount = COALESCE(total_amount, bid_amount),
    proposed_start_date = COALESCE(proposed_start_date, (SELECT preferred_start_date FROM public.projects WHERE id = project_id)),
    proposed_end_date = COALESCE(proposed_end_date, (SELECT preferred_end_date FROM public.projects WHERE id = project_id)),
    expiry_date = COALESCE(expiry_date, (SELECT proposal_deadline FROM public.projects WHERE id = project_id)),
    created_by_id = COALESCE(created_by_id, contractor_id),
    last_modified_by_id = COALESCE(last_modified_by_id, contractor_id),
    last_updated = COALESCE(last_updated, updated_at);

-- Step 4: Make required fields NOT NULL after populating data
ALTER TABLE public.proposals 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description_of_work SET NOT NULL,
ALTER COLUMN homeowner_id SET NOT NULL,
ALTER COLUMN subtotal_amount SET NOT NULL,
ALTER COLUMN total_amount SET NOT NULL,
ALTER COLUMN proposed_start_date SET NOT NULL,
ALTER COLUMN proposed_end_date SET NOT NULL,
ALTER COLUMN expiry_date SET NOT NULL,
ALTER COLUMN created_by_id SET NOT NULL,
ALTER COLUMN last_modified_by_id SET NOT NULL;

-- Step 5: Drop old columns that are no longer needed
ALTER TABLE public.proposals 
DROP COLUMN IF EXISTS bid_amount,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS timeline;

-- Step 6: Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_proposals_homeowner_id ON public.proposals(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_proposals_subtotal_amount ON public.proposals(subtotal_amount);
CREATE INDEX IF NOT EXISTS idx_proposals_total_amount ON public.proposals(total_amount);
CREATE INDEX IF NOT EXISTS idx_proposals_proposed_start_date ON public.proposals(proposed_start_date);
CREATE INDEX IF NOT EXISTS idx_proposals_proposed_end_date ON public.proposals(proposed_end_date);
CREATE INDEX IF NOT EXISTS idx_proposals_expiry_date ON public.proposals(expiry_date);
CREATE INDEX IF NOT EXISTS idx_proposals_is_selected ON public.proposals(is_selected);
CREATE INDEX IF NOT EXISTS idx_proposals_is_deleted ON public.proposals(is_deleted);
CREATE INDEX IF NOT EXISTS idx_proposals_submitted_date ON public.proposals(submitted_date);
CREATE INDEX IF NOT EXISTS idx_proposals_accepted_date ON public.proposals(accepted_date);
CREATE INDEX IF NOT EXISTS idx_proposals_rejected_date ON public.proposals(rejected_date);
CREATE INDEX IF NOT EXISTS idx_proposals_withdrawn_date ON public.proposals(withdrawn_date);
CREATE INDEX IF NOT EXISTS idx_proposals_viewed_date ON public.proposals(viewed_date);
CREATE INDEX IF NOT EXISTS idx_proposals_rejected_by_id ON public.proposals(rejected_by_id);
CREATE INDEX IF NOT EXISTS idx_proposals_rejection_reason ON public.proposals(rejection_reason);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by_id ON public.proposals(created_by_id);
CREATE INDEX IF NOT EXISTS idx_proposals_last_modified_by_id ON public.proposals(last_modified_by_id);
CREATE INDEX IF NOT EXISTS idx_proposals_visibility_settings ON public.proposals(visibility_settings);

-- Step 7: Update RLS policies to include new fields
-- (This will be handled by existing RLS setup)

-- Mark migration as applied
INSERT INTO public.migration_status (id, version, name, checksum, execution_time_ms)
VALUES ('015_comprehensive_proposal_schema', 15, 'Comprehensive proposal schema update', 'sha256:def456...', 200);
