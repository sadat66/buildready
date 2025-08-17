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
  up: async (_db: DatabaseClient) => {
    // Migration logic here
    console.log('Running migration: 002_proposal_resubmission')
  },
  down: async (_db: DatabaseClient) => {
    // Rollback logic here
    console.log('Rolling back migration: 002_proposal_resubmission')
  }
}