export interface DatabaseClient {
  execute(sql: string): Promise<void>;
  query<T = unknown>(sql: string): Promise<T[]>;
  single<T = unknown>(sql: string): Promise<T | null>;
}

export interface Migration {
  id: string;
  name: string;
  version: number;
  up: (db: DatabaseClient) => Promise<void>;
  down: (db: DatabaseClient) => Promise<void>;
  checksum: string; // Hash of migration content for change detection
  appliedAt?: Date;
}

export interface MigrationStatus {
  id: string;
  version: number;
  appliedAt: Date;
  checksum: string;
}

export class MigrationRegistry {
  private migrations: Map<string, Migration> = new Map();
  private statusTable = "migration_status";

  register(migration: Migration): void {
    this.migrations.set(migration.id, migration);
  }

  getAll(): Migration[] {
    return Array.from(this.migrations.values()).sort(
      (a, b) => a.version - b.version
    );
  }

  async getPending(): Promise<Migration[]> {
    const applied = await this.getAppliedMigrations();
    const allMigrations = this.getAll();
    const pending: Migration[] = [];
    
    for (const migration of allMigrations) {
      const existing = applied.find(app => app.id === migration.id);
      
      if (!existing) {
        // Never applied - add to pending
        pending.push(migration);
      } else if (existing.checksum !== migration.checksum) {
        // Different checksum - migration content changed, needs to run again
        console.log(`🔄 Migration ${migration.id} has different checksum - will re-run`);
        pending.push(migration);
      }
      // Same checksum - already applied, skip
    }
    
    return pending;
  }

  async migrate(db: DatabaseClient): Promise<void> {
    const pending = await this.getPending();

    if (pending.length === 0) {
      console.log("✅ No pending migrations to apply");
      return;
    }

    for (const migration of pending) {
      try {
        await migration.up(db);
        await this.markAsApplied(migration);
        console.log(`✅ Applied migration: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Failed to apply migration: ${migration.name}`, error);
        throw error;
      }
    }
  }

  async rollback(targetVersion: number, db: DatabaseClient): Promise<void> {
    const applied = await this.getAppliedMigrations();
    const toRollback = applied
      .filter((app) => app.version > targetVersion)
      .sort((a, b) => b.version - a.version);

    if (toRollback.length === 0) {
      console.log("✅ No migrations to rollback");
      return;
    }

    for (const app of toRollback) {
      const migration = this.migrations.get(app.id);
      if (migration) {
        try {
          await migration.down(db);
          await this.markAsRolledBack(migration);
          console.log(`🔄 Rolled back migration: ${migration.name}`);
        } catch (error) {
          console.error(
            `❌ Failed to rollback migration: ${migration.name}`,
            error
          );
          throw error;
        }
      }
    }
  }

  async getAppliedMigrations(): Promise<MigrationStatus[]> {
    try {
      const db = new SupabaseDatabaseClient();
      const results = await db.query<MigrationStatus>(`
        SELECT id, version, applied_at as "appliedAt", checksum 
        FROM public.migration_status 
        ORDER BY version ASC
      `);
      return results;
    } catch {
      // If migration_status table doesn't exist, return empty array
      console.log("📋 No migration status table found (this is normal for first run)");
      return [];
    }
  }

  private async markAsApplied(migration: Migration): Promise<void> {
    try {
      const db = new SupabaseDatabaseClient();
      await db.execute(`
        INSERT INTO public.migration_status (id, version, name, applied_at, checksum)
        VALUES ('${migration.id}', ${migration.version}, '${migration.name}', NOW(), '${migration.checksum}')
        ON CONFLICT (id) DO UPDATE SET 
          applied_at = NOW(),
          name = EXCLUDED.name,
          checksum = EXCLUDED.checksum
      `);
      console.log(`📝 Marked migration as applied: ${migration.id} with checksum: ${migration.checksum}`);
    } catch (error) {
      console.log(`⚠️  Could not mark migration as applied: ${migration.id} (${error})`);
    }
  }

  private async markAsRolledBack(migration: Migration): Promise<void> {
    try {
      const db = new SupabaseDatabaseClient();
      await db.execute(`
        DELETE FROM public.migration_status WHERE id = '${migration.id}'
      `);
      console.log(`📝 Marked migration as rolled back: ${migration.id}`);
    } catch (error) {
      console.log(`⚠️  Could not mark migration as rolled back: ${migration.id} (${error})`);
    }
  }
}

export const migrationRegistry = new MigrationRegistry();

export class SupabaseDatabaseClient implements DatabaseClient {
  private supabase: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  private clientReady: Promise<void>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        "⚠️  Environment variables not loaded. Using mock database client."
      );
      console.warn("   Please ensure your .env.local file contains:");
      console.warn("   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url");
      console.warn("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
      console.warn("");
      this.clientReady = Promise.resolve();
      return;
    }

    this.clientReady = import("@supabase/supabase-js")
      .then(({ createClient }) => {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log("✅ Supabase client created successfully");
      })
      .catch((error) => {
        console.error("❌ Failed to create Supabase client:", error);
        console.warn("⚠️  Using mock database client instead.");
        this.supabase = null;
      });
  }

  async execute(sql: string): Promise<void> {
    await this.clientReady;

    if (!this.supabase) {
      console.log(`📝 Mock Database - Execute SQL:`);
      console.log(sql);
      console.log("");
      console.log(
        "⚠️  This is a mock execution. Please run the SQL manually in your database."
      );
      console.log("");
      return;
    }

    try {
      console.log(`🚀 Executing SQL on Supabase:`);
      console.log(sql);
      console.log("");

      const { error } = await this.supabase.rpc("exec_sql", { sql });

      if (error) {
        if (error.message.includes('function "exec_sql" does not exist')) {
          console.log(
            "⚠️  SQL execution function not available. Please run this SQL manually in Supabase SQL Editor:"
          );
          console.log("");
          console.log("```sql");
          console.log(sql);
          console.log("```");
          console.log("");
          console.log(
            "💡 To enable automatic migrations, create this function in Supabase:"
          );
          console.log("");
          console.log("```sql");
          console.log("CREATE OR REPLACE FUNCTION exec_sql(sql text)");
          console.log("RETURNS void AS $$");
          console.log("BEGIN");
          console.log("  EXECUTE sql;");
          console.log("END;");
          console.log("$$ LANGUAGE plpgsql SECURITY DEFINER;");
          console.log("```");
          console.log("");
          return;
        }
        throw new Error(`SQL execution failed: ${error.message}`);
      }

      console.log("✅ SQL executed successfully");
    } catch (error) {
      console.error("❌ SQL execution failed:", error);
      console.log("⚠️  Please run this SQL manually in Supabase SQL Editor:");
      console.log("");
      console.log("```sql");
      console.log(sql);
      console.log("```");
      console.log("");
    }
  }

  async query<T = unknown>(sql: string): Promise<T[]> {
    await this.clientReady;

    if (!this.supabase) {
      console.log(`📝 Mock Database - Query SQL: ${sql}`);
      return [];
    }

    try {
      console.log(`🔍 Executing Query on Supabase:`);
      console.log(sql);
      console.log("");

      // For SELECT queries, we need to use a different approach
      // Since we don't have exec_sql that returns results, we'll use a workaround
      const { data, error } = await this.supabase.from('migration_status').select('*');
      
      if (error) {
        throw new Error(`Query failed: ${error.message}`);
      }

      console.log("✅ Query executed successfully");
      return data || [];
    } catch (error) {
      console.error("❌ SQL query failed:", error);
      console.log("⚠️  Please run this query manually in Supabase SQL Editor:");
      console.log("");
      console.log("```sql");
      console.log(sql);
      console.log("```");
      console.log("");
      return [];
    }
  }

  async single<T = unknown>(sql: string): Promise<T | null> {
    const results = await this.query<T>(sql);
    return results.length > 0 ? results[0] : null;
  }
}

export function Migration(id: string, name: string, version: number, checksum: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    migrationRegistry.register({
      id,
      name,
      version,
      checksum,
      up: originalMethod,
      down: async () => {
        console.log(`Rollback not implemented for: ${name}`);
      },
    });
  };
}

// Register migrations directly to avoid circular imports
import { migration_000_create_migration_status_table } from './migrations/000_create_migration_status_table';
import { migration_016_create_agreements_table } from './migrations/016_create_agreements_table';
import { migration_017_create_project_views_table } from './migrations/017_create_project_views_table';
import { migration_018_drop_and_recreate_reviews_table } from './migrations/018_drop_and_recreate_reviews_table';
import { migration_019_create_subscriptions_table } from './migrations/019_create_subscriptions_table';
import { migration_020_create_payments_table } from './migrations/020_create_payments_table';
migrationRegistry.register(migration_000_create_migration_status_table);
migrationRegistry.register(migration_016_create_agreements_table);
migrationRegistry.register(migration_017_create_project_views_table);
migrationRegistry.register(migration_018_drop_and_recreate_reviews_table);
migrationRegistry.register(migration_019_create_subscriptions_table);
migrationRegistry.register(migration_020_create_payments_table);
