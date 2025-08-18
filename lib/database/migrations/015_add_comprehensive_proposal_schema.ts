import { Migration } from '../migrations'

export const migration_015_add_comprehensive_proposal_schema: Migration = {
  id: '015_add_comprehensive_proposal_schema',
  version: 15,
  name: 'Comprehensive proposal schema update - recreate table with schema only',
  up: async (db) => {
    // First, completely drop the existing proposals table
    await db.execute(`
      DROP TABLE IF EXISTS public.proposals CASCADE;
    `)

    // Now recreate the table with ONLY the schema fields from your image
    await db.execute(`
      CREATE TABLE public.proposals (
        -- Base schema fields
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Core proposal fields (from your image)
        title TEXT NOT NULL,
        description_of_work TEXT NOT NULL,
        
        -- Project and user relationships (flat ID references from your image)
        project UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
        contractor UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        homeowner UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        
        -- Financial fields (from your image)
        subtotal_amount DECIMAL(10,2) NOT NULL,
        tax_included TEXT CHECK (tax_included IN ('yes', 'no')) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2) NOT NULL,
        deposit_due_on DATE NOT NULL,
        
        -- Timeline fields (from your image)
        proposed_start_date DATE NOT NULL,
        proposed_end_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        
        -- Status and workflow fields (from your image)
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'viewed', 'accepted', 'rejected', 'withdrawn', 'expired')),
        is_selected TEXT CHECK (is_selected IN ('yes', 'no')) DEFAULT 'no' NOT NULL,
        is_deleted TEXT CHECK (is_deleted IN ('yes', 'no')) DEFAULT 'no' NOT NULL,
        
        -- Dates and timestamps (from your image)
        submitted_date TIMESTAMP WITH TIME ZONE,
        accepted_date TIMESTAMP WITH TIME ZONE,
        rejected_date TIMESTAMP WITH TIME ZONE,
        withdrawn_date TIMESTAMP WITH TIME ZONE,
        viewed_date TIMESTAMP WITH TIME ZONE,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        
        -- Rejection handling (from your image)
        rejected_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        rejection_reason TEXT CHECK (rejection_reason IN ('price_too_high', 'timeline_unrealistic', 'experience_insufficient', 'scope_mismatch', 'other')),
        rejection_reason_notes TEXT,
        
        -- Content and documentation (from your image)
        clause_preview_html TEXT,
        attached_files JSONB DEFAULT '[]' NOT NULL,
        notes TEXT,
        
        -- Relationships and references (from your image)
        agreement UUID,
        proposals TEXT[] DEFAULT '{}' NOT NULL,
        
        -- User tracking (from your image)
        created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        last_modified_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        
        -- Visibility and sharing (from your image)
        visibility_settings TEXT CHECK (visibility_settings IN ('private', 'public', 'shared')) DEFAULT 'private' NOT NULL
      );
    `)

    // Create indexes for performance
    await db.execute(`
      CREATE INDEX idx_proposals_homeowner ON public.proposals(homeowner);
      CREATE INDEX idx_proposals_project ON public.proposals(project);
      CREATE INDEX idx_proposals_contractor ON public.proposals(contractor);
      CREATE INDEX idx_proposals_subtotal_amount ON public.proposals(subtotal_amount);
      CREATE INDEX idx_proposals_total_amount ON public.proposals(total_amount);
      CREATE INDEX idx_proposals_proposed_start_date ON public.proposals(proposed_start_date);
      CREATE INDEX idx_proposals_proposed_end_date ON public.proposals(proposed_end_date);
      CREATE INDEX idx_proposals_expiry_date ON public.proposals(expiry_date);
      CREATE INDEX idx_proposals_is_selected ON public.proposals(is_selected);
      CREATE INDEX idx_proposals_is_deleted ON public.proposals(is_deleted);
      CREATE INDEX idx_proposals_submitted_date ON public.proposals(submitted_date);
      CREATE INDEX idx_proposals_accepted_date ON public.proposals(accepted_date);
      CREATE INDEX idx_proposals_rejected_date ON public.proposals(rejected_date);
      CREATE INDEX idx_proposals_withdrawn_date ON public.proposals(withdrawn_date);
      CREATE INDEX idx_proposals_viewed_date ON public.proposals(viewed_date);
      CREATE INDEX idx_proposals_rejected_by ON public.proposals(rejected_by);
      CREATE INDEX idx_proposals_rejection_reason ON public.proposals(rejection_reason);
      CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);
      CREATE INDEX idx_proposals_last_modified_by ON public.proposals(last_modified_by);
      CREATE INDEX idx_proposals_visibility_settings ON public.proposals(visibility_settings);
    `)

    // Add comments for all columns
    await db.execute(`
      COMMENT ON COLUMN public.proposals.title IS 'Display name or summary of the proposal';
      COMMENT ON COLUMN public.proposals.description_of_work IS 'Description of the work proposed, including scope, exclusions, and assumptions';
      COMMENT ON COLUMN public.proposals.homeowner IS 'Direct reference to the homeowner who owns the project';
      COMMENT ON COLUMN public.proposals.project IS 'Direct reference to the project';
      COMMENT ON COLUMN public.proposals.contractor IS 'Direct reference to the contractor';
      COMMENT ON COLUMN public.proposals.subtotal_amount IS 'Amount before taxes';
      COMMENT ON COLUMN public.proposals.tax_included IS 'Indicates whether taxes are included in the subtotal';
      COMMENT ON COLUMN public.proposals.total_amount IS 'Final amount including tax';
      COMMENT ON COLUMN public.proposals.deposit_amount IS 'The deposit due on deposit_due_date';
      COMMENT ON COLUMN public.proposals.deposit_due_on IS 'The date the deposit is due';
      COMMENT ON COLUMN public.proposals.proposed_start_date IS 'Proposed start date for the work';
      COMMENT ON COLUMN public.proposals.proposed_end_date IS 'Proposed project completion date by the contractor';
      COMMENT ON COLUMN public.proposals.expiry_date IS 'Date the proposal expires and can no longer be accepted without resubmission';
      COMMENT ON COLUMN public.proposals.is_selected IS 'Marks the proposal as selected or awarded by the homeowner (distinct from accepted)';
      COMMENT ON COLUMN public.proposals.is_deleted IS 'Used to soft-delete proposals from the UI without removing the record';
      COMMENT ON COLUMN public.proposals.clause_preview_html IS 'HTML-rendered version of clauses for preview before signing';
      COMMENT ON COLUMN public.proposals.attached_files IS 'Files uploaded with the proposal (e.g., plans, photos, quotes)';
      COMMENT ON COLUMN public.proposals.notes IS 'Internal notes or comments, not visible to the homeowner';
      COMMENT ON COLUMN public.proposals.visibility_settings IS 'Controls who can view the proposal or link it via CRM/share settings';
    `)

    // Update table comment
    await db.execute(`
      COMMENT ON TABLE public.proposals IS 'Comprehensive proposal system with full workflow tracking, financial details, and document management - schema only fields';
    `)
  },
  down: async (db) => {
    // Drop the new table
    await db.execute(`
      DROP TABLE IF EXISTS public.proposals CASCADE;
    `)

    // Recreate the original basic table structure
    await db.execute(`
      CREATE TABLE public.proposals (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
        contractor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        bid_amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        timeline TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(project_id, contractor_id)
      );
    `)

    // Recreate original indexes
    await db.execute(`
      CREATE INDEX idx_proposals_project_id ON public.proposals(project_id);
      CREATE INDEX idx_proposals_contractor_id ON public.proposals(contractor_id);
      CREATE INDEX idx_proposals_status ON public.proposals(status);
    `)

    // Restore original table comment
    await db.execute(`
      COMMENT ON TABLE public.proposals IS 'Basic proposal system for construction projects';
    `)
  }
}
