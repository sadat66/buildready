-- Migration: Add comprehensive proposal fields for contractor proposals
-- This migration adds all the fields needed for detailed contractor proposals

-- Add new columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS proposed_start_date DATE,
ADD COLUMN IF NOT EXISTS proposed_end_date DATE,
ADD COLUMN IF NOT EXISTS estimated_days INTEGER,
ADD COLUMN IF NOT EXISTS delay_penalty DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS abandonment_penalty DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_due_date DATE,
ADD COLUMN IF NOT EXISTS uploaded_files TEXT[],
ADD COLUMN IF NOT EXISTS materials_included BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS warranty_period TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Update the existing bid_amount column to be more flexible
-- (keeping it for backward compatibility but making it optional)
ALTER TABLE public.proposals 
ALTER COLUMN bid_amount DROP NOT NULL;

-- Add constraints for the new fields (only if they don't exist)
DO $$ 
BEGIN
    -- Add amount constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_proposal_amounts' 
        AND conrelid = 'public.proposals'::regclass
    ) THEN
        ALTER TABLE public.proposals 
        ADD CONSTRAINT check_proposal_amounts 
        CHECK (
          (net_amount IS NULL AND tax_amount IS NULL AND total_amount IS NULL) OR
          (net_amount IS NOT NULL AND tax_amount IS NOT NULL AND total_amount IS NOT NULL)
        );
    END IF;

    -- Add date constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_proposal_dates' 
        AND conrelid = 'public.proposals'::regclass
    ) THEN
        ALTER TABLE public.proposals 
        ADD CONSTRAINT check_proposal_dates 
        CHECK (
          (proposed_start_date IS NULL AND proposed_end_date IS NULL AND estimated_days IS NULL) OR
          (proposed_start_date IS NOT NULL AND proposed_end_date IS NOT NULL AND estimated_days IS NOT NULL)
        );
    END IF;
END $$;

-- Add indexes for better performance on new fields (only if they don't exist)
DO $$ 
BEGIN
    -- Add proposed start date index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_proposals_proposed_start_date'
    ) THEN
        CREATE INDEX idx_proposals_proposed_start_date ON public.proposals(proposed_start_date);
    END IF;

    -- Add proposed end date index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_proposals_proposed_end_date'
    ) THEN
        CREATE INDEX idx_proposals_proposed_end_date ON public.proposals(proposed_end_date);
    END IF;

    -- Add total amount index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_proposals_total_amount'
    ) THEN
        CREATE INDEX idx_proposals_total_amount ON public.proposals(total_amount);
    END IF;
END $$;

-- Update the proposals table comment
COMMENT ON TABLE public.proposals IS 'Comprehensive contractor proposals with detailed financial, timeline, and penalty information';
