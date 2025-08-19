/**
 * Migration: Allow contractors to resubmit proposals after rejection
 * Version: 2
 * Description: 
 *   - Add 'withdrawn' status to proposal status options
 *   - Remove unique constraint on project_id+contractor_id
 *   - Add partial unique index for pending proposals only
 */

import { Migration, DatabaseClient } from '../migrations'

export const migration_002_proposal_resubmission: Migration = {
  id: '002_proposal_resubmission',
  name: 'Allow contractors to resubmit proposals after rejection',
  version: 2,
  up: async (db: DatabaseClient) => {
    console.log('Running migration: 002_proposal_resubmission')
    
    // Add 'withdrawn' status to proposal status enum
    await db.execute(`
      ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'withdrawn';
    `)
    
    // Remove the unique constraint on project_id + contractor_id to allow resubmissions
    await db.execute(`
      ALTER TABLE proposals 
      DROP CONSTRAINT IF EXISTS proposals_project_id_contractor_id_key;
    `)
    
    // Add a partial unique index that only applies to pending proposals
    // This prevents multiple active proposals from the same contractor for the same project
    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_proposals_unique_pending 
      ON proposals(project_id, contractor_id) 
      WHERE status IN ('pending', 'under_review');
    `)
    
    console.log('✅ Migration 002_proposal_resubmission completed successfully')
  },
  down: async (db: DatabaseClient) => {
    console.log('Rolling back migration: 002_proposal_resubmission')
    
    // Remove the partial unique index
    await db.execute(`
      DROP INDEX IF EXISTS idx_proposals_unique_pending;
    `)
    
    // Note: We cannot easily remove the 'withdrawn' enum value in PostgreSQL
    // This would require recreating the enum type, which is complex
    // The rollback will only remove the index and constraint changes
    
    console.log('🔄 Migration 002_proposal_resubmission rolled back')
  }
}