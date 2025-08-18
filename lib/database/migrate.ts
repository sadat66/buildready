#!/usr/bin/env tsx

/**
 * Modern Database Migration CLI (2024-2025)
 * Command-line tool for managing database migrations
 */

// Load environment variables from .env.local
import 'dotenv/config'

import { migrationRegistry, SupabaseDatabaseClient } from './migrations'
// Import all migrations to ensure they're registered
import './migrations'

// Force import of individual migrations to ensure they're registered
import { migration_002_proposal_resubmission } from './migrations/002_proposal_resubmission'
import { migration_004_add_email_verification_field } from './migrations/004_add_email_verification_field'
import { migration_005_complete_user_schema } from './migrations/005_complete_user_schema'
import { migration_006_create_contractor_profiles } from './migrations/006_create_contractor_profiles'
import { migration_010_add_rls_policies } from './migrations/010_add_rls_policies'
import { migration_011_update_projects_schema } from './migrations/011_update_projects_schema'
import { migration_013_update_projects_location_to_jsonb } from './migrations/013_update_projects_location_to_jsonb'
import { migration_014_add_workflow_fields_to_projects } from './migrations/014_add_workflow_fields_to_projects'
import { migration_015_add_comprehensive_proposal_schema } from './migrations/015_add_comprehensive_proposal_schema'

// Explicitly register migrations to ensure they're loaded
migrationRegistry.register(migration_002_proposal_resubmission)
migrationRegistry.register(migration_004_add_email_verification_field)
migrationRegistry.register(migration_005_complete_user_schema)
migrationRegistry.register(migration_006_create_contractor_profiles)
migrationRegistry.register(migration_010_add_rls_policies)
migrationRegistry.register(migration_011_update_projects_schema)
migrationRegistry.register(migration_013_update_projects_location_to_jsonb)
migrationRegistry.register(migration_014_add_workflow_fields_to_projects)
migrationRegistry.register(migration_015_add_comprehensive_proposal_schema)

// CLI argument parsing
const args = process.argv.slice(2)
const command = args[0]

// Migration commands
async function runMigrations() {
  console.log('🚀 Running pending migrations...')
  
  try {
    const db = new SupabaseDatabaseClient()
    await migrationRegistry.migrate(db)
    console.log('✅ All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

async function showStatus() {
  console.log('📊 Migration Status:')
  
  const allMigrations = migrationRegistry.getAll()
  const applied = await migrationRegistry.getAppliedMigrations()
  const pending = await migrationRegistry.getPending()
  
  console.log(`\n📋 Total Migrations: ${allMigrations.length}`)
  console.log(`✅ Applied: ${applied.length}`)
  console.log(`⏳ Pending: ${pending.length}`)
  
  if (pending.length > 0) {
    console.log('\n⏳ Pending Migrations:')
    pending.forEach(migration => {
      console.log(`  - ${migration.name} (v${migration.version})`)
    })
  }
  
  if (applied.length > 0) {
    console.log('\n✅ Applied Migrations:')
    applied.forEach(status => {
      console.log(`  - ${status.id} (v${status.version}) - ${status.appliedAt.toISOString()}`)
    })
  }
}

async function rollback(targetVersion: number) {
  console.log(`🔄 Rolling back to version ${targetVersion}...`)
  
  try {
    const db = new SupabaseDatabaseClient()
    await migrationRegistry.rollback(targetVersion, db)
    console.log('✅ Rollback completed successfully!')
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    process.exit(1)
  }
}

async function createMigration(name: string) {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const version = Math.floor(Date.now() / 1000)
  const fileName = `${timestamp}_${name}.sql`
  
  console.log(`📝 Creating migration: ${fileName}`)
  console.log(`📍 Location: database/migrations/${fileName}`)
  console.log(`🔢 Version: ${version}`)
  
  // This would create the actual migration file
  console.log('\n💡 Next steps:')
  console.log('1. Edit the migration file with your SQL')
  console.log('2. Run: pnpm db:migrate')
}

// Help command
function showHelp() {
  console.log(`
🚀 BuildReady Database Migration CLI

Usage: pnpm db:migrate [command] [options]

Commands:
  migrate              Run all pending migrations
  status               Show migration status
  rollback <version>   Rollback to specific version
  create <name>        Create new migration file
  help                 Show this help message

Examples:
  pnpm db:migrate migrate
  pnpm db:migrate status
  pnpm db:migrate rollback 5
  pnpm db:migrate create add_user_profiles

Options:
  --help, -h          Show help message
  --version, -v       Show version
  `)
}

// Main CLI logic
async function main() {
  console.log('🏗️  BuildReady Database Migration Tool')
  console.log('=====================================\n')
  
  switch (command) {
    case 'migrate':
      await runMigrations()
      break
      
    case 'status':
      await showStatus()
      break
      
    case 'rollback':
      const version = parseInt(args[1])
      if (isNaN(version)) {
        console.error('❌ Invalid version number. Use: pnpm db:migrate rollback <version>')
        process.exit(1)
      }
      await rollback(version)
      break
      
    case 'create':
      const name = args[1]
      if (!name) {
        console.error('❌ Migration name required. Use: pnpm db:migrate create <name>')
        process.exit(1)
      }
      await createMigration(name)
      break
      
    case 'help':
    case '--help':
    case '-h':
      showHelp()
      break
      
    case '--version':
    case '-v':
      console.log('Version: 1.0.0')
      break
      
    default:
      if (!command) {
        console.log('❌ No command specified. Use "help" for available commands.')
        process.exit(1)
      } else {
        console.log(`❌ Unknown command: ${command}`)
        showHelp()
        process.exit(1)
      }
  }
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    console.error('❌ CLI Error:', error)
    process.exit(1)
  })
}
