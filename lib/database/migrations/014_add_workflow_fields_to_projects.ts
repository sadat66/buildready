import { Migration } from '../migrations'

export const migration_014_add_workflow_fields_to_projects: Migration = {
  id: '014_add_workflow_fields_to_projects',
  version: 14,
  name: 'Add workflow fields to projects table',
  up: async (db) => {
    // Add decision_date column
    await db.execute(`
      ALTER TABLE public.projects 
      ADD COLUMN decision_date DATE;
    `)

    // Add permit_required column
    await db.execute(`
      ALTER TABLE public.projects 
      ADD COLUMN permit_required BOOLEAN DEFAULT FALSE;
    `)

    // Add comment for the new columns
    await db.execute(`
      COMMENT ON COLUMN public.projects.decision_date IS 'Date when homeowner must choose the winning contractor';
    `)

    await db.execute(`
      COMMENT ON COLUMN public.projects.permit_required IS 'Indicates whether the project requires building permits';
    `)

    // Update table comment
    await db.execute(`
      COMMENT ON TABLE public.projects IS 'Construction projects with workflow fields for decision dates and permit requirements';
    `)
  },
  down: async (db) => {
    // Remove the new columns
    await db.execute(`
      ALTER TABLE public.projects 
      DROP COLUMN decision_date;
    `)

    await db.execute(`
      ALTER TABLE public.projects 
      DROP COLUMN permit_required;
    `)

    // Restore original table comment
    await db.execute(`
      COMMENT ON TABLE public.projects IS 'Construction projects with JSONB location data and geospatial support';
    `)
  }
}
