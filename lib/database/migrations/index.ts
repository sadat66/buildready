/**
 * Migration Index - Imports all migrations to ensure they're registered
 * This file must be imported to load all migrations into the registry
 */

import { migrationRegistry } from '../migrations'

// Import all migrations to register them
// Note: All user, contractor profile, proposal, and project related migrations have been removed

// Register all migrations
// Note: All user, contractor profile, proposal, and project related migrations have been removed

// Export the migration registry for external use
export { migrationRegistry } from '../migrations'

// Re-export migration types
export type { Migration, MigrationStatus, DatabaseClient } from '../migrations'