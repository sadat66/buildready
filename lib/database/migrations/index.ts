/**
 * Migration Index - Imports all migrations to ensure they're registered
 * This file must be imported to load all migrations into the registry
 */

// Import all migrations to register them
import './002_proposal_resubmission'

// Export the migration registry for external use
export { migrationRegistry } from '../migrations'

// Re-export migration types
export type { Migration, MigrationStatus } from '../migrations'