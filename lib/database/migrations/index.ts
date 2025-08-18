/**
 * Migration Index - Imports all migrations to ensure they're registered
 * This file must be imported to load all migrations into the registry
 */

import { migrationRegistry } from '../migrations'

// Import all migrations to register them
import { migration_002_proposal_resubmission } from './002_proposal_resubmission'
import { migration_004_add_email_verification_field } from './004_add_email_verification_field'
import { migration_005_complete_user_schema } from './005_complete_user_schema'
import { migration_006_create_contractor_profiles } from './006_create_contractor_profiles'
import { migration_007_fix_role_field_conflicts } from './007_fix_role_field_conflicts'
import { migration_010_add_rls_policies } from './010_add_rls_policies'
import { migration_011_update_projects_schema } from './011_update_projects_schema'
import { migration_015_add_comprehensive_proposal_schema } from './015_add_comprehensive_proposal_schema'
import { migration_016_enable_contractor_profiles_rls } from './016_enable_contractor_profiles_rls'

// Register all migrations
migrationRegistry.register(migration_002_proposal_resubmission)
migrationRegistry.register(migration_004_add_email_verification_field)
migrationRegistry.register(migration_005_complete_user_schema)
migrationRegistry.register(migration_006_create_contractor_profiles)
migrationRegistry.register(migration_007_fix_role_field_conflicts)
migrationRegistry.register(migration_010_add_rls_policies)
migrationRegistry.register(migration_011_update_projects_schema)
migrationRegistry.register(migration_015_add_comprehensive_proposal_schema)
migrationRegistry.register(migration_016_enable_contractor_profiles_rls)

// Export the migration registry for external use
export { migrationRegistry } from '../migrations'

// Re-export migration types
export type { Migration, MigrationStatus, DatabaseClient } from '../migrations'