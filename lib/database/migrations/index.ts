/**
 * Migration Index - Imports all migrations to ensure they're registered
 * This file must be imported to load all migrations into the registry
 */

// Import all migrations to register them
import { migration_016_create_agreements_table } from './016_create_agreements_table'
import { migrationRegistry } from '../migrations'

// Register all migrations
migrationRegistry.register(migration_016_create_agreements_table)

// Note: All user, contractor profile, proposal, and project related migrations have been removed

// Export the migration registry for external use
export { migrationRegistry } from '../migrations'

// Re-export migration types
export type { Migration, MigrationStatus, DatabaseClient } from '../migrations'