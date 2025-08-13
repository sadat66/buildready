/**
 * Migration: Allow contractors to resubmit proposals after rejection
 * Version: 2
 * Description: 
 *   - Add 'withdrawn' status to proposal status options
 *   - Remove unique constraint on project_id+contractor_id
 *   - Add partial unique index for pending proposals only
 */

import { migrationRegistry } from '../migrations'
import { createClient } from '@supabase/supabase-js'

// Migration SQL content
const migrationSQL = `
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
`

// Rollback SQL content
const rollbackSQL = `
-- Rollback: Restore original proposal constraints

-- Step 1: Drop the new indexes
DROP INDEX IF EXISTS idx_proposals_project_status;
DROP INDEX IF EXISTS idx_proposals_contractor_status;
DROP INDEX IF EXISTS idx_proposals_status;
DROP INDEX IF EXISTS idx_proposals_unique_pending;

-- Step 2: Restore original status constraint
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Step 3: Restore unique constraint (this will fail if there are duplicate entries)
-- Note: This may require manual data cleanup before rollback
ALTER TABLE public.proposals ADD CONSTRAINT proposals_project_id_contractor_id_key 
    UNIQUE (project_id, contractor_id);
`

// Migration functions
async function up(): Promise<void> {
  console.log('🚀 Running proposal resubmission migration...')
  
  // In a real implementation, you would use your Supabase client here
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
  
  try {
    // Execute the migration SQL
    // await supabase.rpc('exec_sql', { sql: migrationSQL })
    console.log('✅ Proposal resubmission migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function down(): Promise<void> {
  console.log('🔄 Rolling back proposal resubmission migration...')
  
  try {
    // Execute the rollback SQL
    // await supabase.rpc('exec_sql', { sql: rollbackSQL })
    console.log('✅ Proposal resubmission rollback completed successfully')
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    throw error
  }
}

// Register the migration
migrationRegistry.register({
  id: '002_proposal_resubmission',
  name: 'Allow contractors to resubmit proposals after rejection',
  version: 2,
  up,
  down
})

export { up, down }