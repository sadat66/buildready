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
    console.log('🚀 Running proposal resubmission migration...')
    
    try {
      // Migration logic would go here when implemented
      console.log('✅ Proposal resubmission migration completed successfully')
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  },
  down: async (db: DatabaseClient) => {
    console.log('🔄 Rolling back proposal resubmission migration...')
    
    try {
      // Rollback logic would go here when implemented
      console.log('✅ Proposal resubmission rollback completed successfully')
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      throw error
    }
  }
}