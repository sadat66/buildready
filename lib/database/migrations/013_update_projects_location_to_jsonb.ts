import { Migration } from '../migrations'

export const migration_013_update_projects_location_to_jsonb: Migration = {
  id: '013_update_projects_location_to_jsonb',
  version: 13,
  name: 'Update projects table to use JSONB location column',
  up: async (db) => {
    // First, backup existing location data
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.projects_location_backup AS 
      SELECT 
          id,
          location_address,
          location_city,
          location_province,
          location_postal_code,
          location_latitude,
          location_longitude
      FROM public.projects;
    `)

    // Add new JSONB location column
    await db.query(`
      ALTER TABLE public.projects 
      ADD COLUMN location JSONB;
    `)

    // Migrate existing location data to JSONB format
    await db.query(`
      UPDATE public.projects 
      SET location = jsonb_build_object(
          'address', location_address,
          'city', location_city,
          'province', location_province,
          'postalCode', location_postal_code,
          'latitude', location_latitude,
          'longitude', location_longitude
      )
      WHERE location_address IS NOT NULL;
    `)

    // Drop old location columns
    await db.query(`
      ALTER TABLE public.projects 
      DROP COLUMN location_address,
      DROP COLUMN location_city,
      DROP COLUMN location_province,
      DROP COLUMN location_postal_code,
      DROP COLUMN location_latitude,
      DROP COLUMN location_longitude;
    `)

    // Update the geometry trigger function to work with JSONB location
    await db.query(`
      CREATE OR REPLACE FUNCTION update_project_location_geometry()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Update geometry when latitude/longitude change in JSONB location
          IF NEW.location IS NOT NULL 
             AND NEW.location ? 'latitude' 
             AND NEW.location ? 'longitude'
             AND NEW.location->>'latitude' IS NOT NULL 
             AND NEW.location->>'longitude' IS NOT NULL THEN
              NEW.location_geom = ST_SetSRID(
                  ST_MakePoint(
                      (NEW.location->>'longitude')::DECIMAL, 
                      (NEW.location->>'latitude')::DECIMAL
                  ), 
                  4326
              );
          ELSE
              NEW.location_geom = NULL;
          END IF;
          
          -- Update timestamp
          NEW.updated_at = NOW();
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Add comment for the new location column
    await db.query(`
      COMMENT ON COLUMN public.projects.location IS 'JSONB object containing address, city, province, postalCode, latitude, longitude';
    `)

    // Update table comment
    await db.query(`
      COMMENT ON TABLE public.projects IS 'Construction projects with JSONB location data and geospatial support';
    `)
  },
  down: async (db) => {
    // Rollback: Add back the old location columns
    await db.query(`
      ALTER TABLE public.projects 
      ADD COLUMN location_address TEXT,
      ADD COLUMN location_city TEXT,
      ADD COLUMN location_province TEXT,
      ADD COLUMN location_postal_code TEXT,
      ADD COLUMN location_latitude DECIMAL(10,8),
      ADD COLUMN location_longitude DECIMAL(11,8);
    `)

    // Restore data from backup if it exists
    await db.query(`
      UPDATE public.projects 
      SET 
        location_address = location->>'address',
        location_city = location->>'city',
        location_province = location->>'province',
        location_postal_code = location->>'postalCode',
        location_latitude = (location->>'latitude')::DECIMAL,
        location_longitude = (location->>'longitude')::DECIMAL
      WHERE location IS NOT NULL;
    `)

    // Drop the JSONB location column
    await db.query(`
      ALTER TABLE public.projects 
      DROP COLUMN location;
    `)

    // Restore the old trigger function
    await db.query(`
      CREATE OR REPLACE FUNCTION update_project_location_geometry()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Update geometry when latitude/longitude change
          IF NEW.location_latitude IS NOT NULL AND NEW.location_longitude IS NOT NULL THEN
              NEW.location_geom = ST_SetSRID(ST_MakePoint(NEW.location_longitude, NEW.location_latitude), 4326);
          ELSE
              NEW.location_geom = NULL;
          END IF;
          
          -- Update timestamp
          NEW.updated_at = NOW();
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)
  }
}
