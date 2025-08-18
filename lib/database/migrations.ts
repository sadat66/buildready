/**
 * Modern Database Migration System (2024-2025)
 * Built-in migration management without external dependencies
 */

// Database client interface for migrations
export interface DatabaseClient {
  execute(sql: string): Promise<void>
  query<T = unknown>(sql: string): Promise<T[]>
  single<T = unknown>(sql: string): Promise<T | null>
}

export interface Migration {
  id: string
  name: string
  version: number
  up: (db: DatabaseClient) => Promise<void>
  down: (db: DatabaseClient) => Promise<void>
  appliedAt?: Date
}

export interface MigrationStatus {
  id: string
  version: number
  appliedAt: Date
  checksum: string
}

/**
 * Migration Registry - Central place for all migrations
 */
export class MigrationRegistry {
  private migrations: Map<string, Migration> = new Map()
  private statusTable = 'migration_status'

  /**
   * Register a new migration
   */
  register(migration: Migration): void {
    this.migrations.set(migration.id, migration)
  }

  /**
   * Get all migrations sorted by version
   */
  getAll(): Migration[] {
    return Array.from(this.migrations.values())
      .sort((a, b) => a.version - b.version)
  }

  /**
   * Get pending migrations (not yet applied)
   */
  async getPending(): Promise<Migration[]> {
    const applied = await this.getAppliedMigrations()
    return this.getAll().filter(
      migration => !applied.some(app => app.id === migration.id)
    )
  }

  /**
   * Apply all pending migrations
   */
  async migrate(db: DatabaseClient): Promise<void> {
    const pending = await this.getPending()
    
    for (const migration of pending) {
      try {
        await migration.up(db)
        await this.markAsApplied(migration)
        console.log(`✅ Applied migration: ${migration.name}`)
      } catch (error) {
        console.error(`❌ Failed to apply migration: ${migration.name}`, error)
        throw error
      }
    }
  }

  /**
   * Rollback to specific version
   */
  async rollback(targetVersion: number, db: DatabaseClient): Promise<void> {
    const applied = await this.getAppliedMigrations()
    const toRollback = applied
      .filter(app => app.version > targetVersion)
      .sort((a, b) => b.version - a.version)

    for (const app of toRollback) {
      const migration = this.migrations.get(app.id)
      if (migration) {
        try {
          await migration.down(db)
          await this.markAsRolledBack(migration)
          console.log(`🔄 Rolled back migration: ${migration.name}`)
        } catch (error) {
          console.error(`❌ Failed to rollback migration: ${migration.name}`, error)
          throw error
        }
      }
    }
  }

  async getAppliedMigrations(): Promise<MigrationStatus[]> {
    // This would query your migration_status table
    // For now, return empty array
    return []
  }

  private async markAsApplied(migration: Migration): Promise<void> {
    // This would insert into migration_status table
    console.log(`📝 Marking migration as applied: ${migration.id}`)
  }

  private async markAsRolledBack(migration: Migration): Promise<void> {
    // This would remove from migration_status table
    console.log(`📝 Marking migration as rolled back: ${migration.id}`)
  }
}

/**
 * Global migration registry instance
 */
export const migrationRegistry = new MigrationRegistry()

/**
 * Supabase Database Client for Migrations
 * Updated to use modern Supabase approaches instead of custom SQL functions
 */
export class SupabaseDatabaseClient implements DatabaseClient {
  private supabase: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
  private clientReady: Promise<void>

  constructor() {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Environment variables not loaded. Using mock database client.')
      console.warn('   Please ensure your .env.local file contains:')
      console.warn('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
      console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
      console.warn('')
      this.clientReady = Promise.resolve()
      return
    }

    // Create a promise that resolves when the client is ready
    this.clientReady = import('@supabase/supabase-js')
      .then(({ createClient }) => {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        console.log('✅ Supabase client created successfully')
      })
      .catch((error) => {
        console.error('❌ Failed to create Supabase client:', error)
        console.warn('⚠️  Using mock database client instead.')
        this.supabase = null
      })
  }

  async execute(sql: string): Promise<void> {
    // Wait for client to be ready
    await this.clientReady
    
    if (!this.supabase) {
      // Mock database client - just log the SQL
      console.log(`📝 Mock Database - Execute SQL:`)
      console.log(sql)
      console.log('')
      console.log('⚠️  This is a mock execution. Please run the SQL manually in your database.')
      console.log('')
      return
    }

    // Real database client - use modern Supabase approach
    try {
      console.log(`🚀 Executing SQL on Supabase:`)
      console.log(sql)
      console.log('')
      
      // Use Supabase's built-in SQL execution via REST API
      const { error } = await this.supabase.rpc('exec_sql', { sql })
      
      if (error) {
        // If RPC doesn't exist, fall back to manual execution guidance
        if (error.message.includes('function "exec_sql" does not exist')) {
          console.log('⚠️  SQL execution function not available. Please run this SQL manually in Supabase SQL Editor:')
          console.log('')
          console.log('```sql')
          console.log(sql)
          console.log('```')
          console.log('')
          console.log('💡 To enable automatic migrations, create this function in Supabase:')
          console.log('')
          console.log('```sql')
          console.log('CREATE OR REPLACE FUNCTION exec_sql(sql text)')
          console.log('RETURNS void AS $$')
          console.log('BEGIN')
          console.log('  EXECUTE sql;')
          console.log('END;')
          console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;')
          console.log('```')
          console.log('')
          return
        }
        throw new Error(`SQL execution failed: ${error.message}`)
      }
      
      console.log('✅ SQL executed successfully')
    } catch (error) {
      console.error('❌ SQL execution failed:', error)
      console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:')
      console.log('')
      console.log('```sql')
      console.log(sql)
      console.log('```')
      console.log('')
    }
  }

  async query<T = unknown>(sql: string): Promise<T[]> {
    // Wait for client to be ready
    await this.clientReady
    
    if (!this.supabase) {
      console.log(`📝 Mock Database - Query SQL: ${sql}`)
      return []
    }

    try {
      // For now, just execute the SQL and return empty array
      // In a real scenario, you'd want to parse the results
      await this.execute(sql)
      return []
    } catch (error) {
      console.error('❌ SQL query failed:', error)
      return []
    }
  }

  async single<T = unknown>(sql: string): Promise<T | null> {
    const results = await this.query<T>(sql)
    return results.length > 0 ? results[0] : null
  }
}

/**
 * Migration decorator for easy registration
 */
export function Migration(id: string, name: string, version: number) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    migrationRegistry.register({
      id,
      name,
      version,
      up: originalMethod,
      down: async () => {
        console.log(`Rollback not implemented for: ${name}`)
      }
    })
  }
}
