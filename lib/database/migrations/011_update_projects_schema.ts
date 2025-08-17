import { Migration, DatabaseClient } from '../migrations'

export const migration_011_update_projects_schema: Migration = {
  id: '011_update_projects_schema',
  name: 'Update projects table with new schema fields and enums - clean slate approach',
  version: 11,
  up: async (db: DatabaseClient) => {
    // First, drop all existing columns except id, created_at, updated_at
    await db.execute(`
      ALTER TABLE projects 
      DROP COLUMN IF EXISTS title,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS homeowner_id,
      DROP COLUMN IF EXISTS contractor_id,
      DROP COLUMN IF EXISTS project_status,
      DROP COLUMN IF EXISTS estimated_cost,
      DROP COLUMN IF EXISTS actual_cost,
      DROP COLUMN IF EXISTS completion_date,
      DROP COLUMN IF EXISTS notes,
      DROP COLUMN IF EXISTS attachments,
      DROP COLUMN IF EXISTS location_address,
      DROP COLUMN IF EXISTS project_category,
      DROP COLUMN IF EXISTS priority_level,
      DROP COLUMN IF EXISTS assigned_to,
      DROP COLUMN IF EXISTS project_manager,
      DROP COLUMN IF EXISTS start_date_planned,
      DROP COLUMN IF EXISTS end_date_planned,
      DROP COLUMN IF EXISTS progress_percentage,
      DROP COLUMN IF EXISTS risk_level,
      DROP COLUMN IF EXISTS quality_score,
      DROP COLUMN IF EXISTS client_satisfaction,
      DROP COLUMN IF EXISTS warranty_period,
      DROP COLUMN IF EXISTS maintenance_schedule,
      DROP COLUMN IF EXISTS inspection_reports,
      DROP COLUMN IF EXISTS permits_required,
      DROP COLUMN IF EXISTS insurance_coverage,
      DROP COLUMN IF EXISTS subcontractors,
      DROP COLUMN IF EXISTS materials_used,
      DROP COLUMN IF EXISTS equipment_required,
      DROP COLUMN IF EXISTS safety_requirements,
      DROP COLUMN IF EXISTS environmental_impact,
      DROP COLUMN IF EXISTS budget_approved,
      DROP COLUMN IF EXISTS change_orders,
      DROP COLUMN IF EXISTS punch_list,
      DROP COLUMN IF EXISTS final_inspection,
      DROP COLUMN IF EXISTS project_closeout,
      DROP COLUMN IF EXISTS lessons_learned,
      DROP COLUMN IF EXISTS future_recommendations;
    `)

    // Create new enums
    await db.execute(`
      CREATE TYPE IF NOT EXISTS project_type AS ENUM ('New Build', 'Renovation', 'Maintenance', 'Repair', 'Inspection');
    `)
    
    await db.execute(`
      CREATE TYPE IF NOT EXISTS project_status AS ENUM ('Draft', 'Published', 'Bidding', 'Awarded', 'In Progress', 'Completed', 'Cancelled');
    `)
    
    await db.execute(`
      CREATE TYPE IF NOT EXISTS visibility_settings AS ENUM ('Public', 'Private', 'Invitation Only');
    `)
    
    await db.execute(`
      CREATE TYPE IF NOT EXISTS trade_category AS ENUM ('Electrical', 'Framing', 'HVAC', 'Plumbing', 'Roofing', 'Masonry');
    `)

    // Add only the new schema columns
    await db.execute(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS project_title TEXT,
      ADD COLUMN IF NOT EXISTS statement_of_work TEXT,
      ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS category trade_category[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS pid TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS certificate_of_title TEXT,
      ADD COLUMN IF NOT EXISTS project_type project_type,
      ADD COLUMN IF NOT EXISTS status project_status DEFAULT 'Draft',
      ADD COLUMN IF NOT EXISTS visibility_settings visibility_settings DEFAULT 'Public',
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS end_date DATE,
      ADD COLUMN IF NOT EXISTS expiry_date DATE,
      ADD COLUMN IF NOT EXISTS substantial_completion DATE,
      ADD COLUMN IF NOT EXISTS is_verified_project BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS project_photos TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS files TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS creator UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS proposal_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false;
    `)

    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_category ON projects USING GIN(category);
      CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
    `)
  },
  down: async (db: DatabaseClient) => {
    // Remove indexes
    await db.execute(`DROP INDEX IF EXISTS idx_projects_creator;`)
    await db.execute(`DROP INDEX IF EXISTS idx_projects_status;`)
    await db.execute(`DROP INDEX IF EXISTS idx_projects_category;`)
    await db.execute(`DROP INDEX IF EXISTS idx_projects_location;`)

    // Remove new columns
    await db.execute(`
      ALTER TABLE projects 
      DROP COLUMN IF EXISTS project_title,
      DROP COLUMN IF EXISTS statement_of_work,
      DROP COLUMN IF EXISTS budget,
      DROP COLUMN IF EXISTS category,
      DROP COLUMN IF EXISTS pid,
      DROP COLUMN IF EXISTS location,
      DROP COLUMN IF EXISTS certificate_of_title,
      DROP COLUMN IF EXISTS project_type,
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS visibility_settings,
      DROP COLUMN IF EXISTS start_date,
      DROP COLUMN IF EXISTS end_date,
      DROP COLUMN IF EXISTS expiry_date,
      DROP COLUMN IF EXISTS substantial_completion,
      DROP COLUMN IF EXISTS is_verified_project,
      DROP COLUMN IF EXISTS project_photos,
      DROP COLUMN IF EXISTS files,
      DROP COLUMN IF EXISTS creator,
      DROP COLUMN IF EXISTS proposal_count,
      DROP COLUMN IF EXISTS is_closed;
    `)

    // Remove enums
    await db.execute(`DROP TYPE IF EXISTS project_type;`)
    await db.execute(`DROP TYPE IF EXISTS project_status;`)
    await db.execute(`DROP TYPE IF EXISTS visibility_settings;`)
    await db.execute(`DROP TYPE IF EXISTS trade_category;`)
  }
}
