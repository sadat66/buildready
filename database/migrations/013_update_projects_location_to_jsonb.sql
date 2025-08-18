-- Migration: 013_update_projects_location_to_jsonb.sql
-- Version: 13
-- Description: Update projects table to use JSONB location column instead of separate location columns
-- Applied: 2024-12-19

-- First, backup existing location data
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

-- Add new JSONB location column
ALTER TABLE public.projects 
ADD COLUMN location JSONB;

-- Migrate existing location data to JSONB format
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

-- Drop old location columns
ALTER TABLE public.projects 
DROP COLUMN location_address,
DROP COLUMN location_city,
DROP COLUMN location_province,
DROP COLUMN location_postal_code,
DROP COLUMN location_latitude,
DROP COLUMN location_longitude;

-- Update the geometry trigger function to work with JSONB location
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

-- Update the distance calculation function
CREATE OR REPLACE FUNCTION calculate_project_distance(
    project1_id UUID,
    project2_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    distance DECIMAL;
BEGIN
    SELECT ST_Distance(
        p1.location_geom::geography,
        p2.location_geom::geography
    ) / 1000 -- Convert to kilometers
    INTO distance
    FROM public.projects p1, public.projects p2
    WHERE p1.id = project1_id AND p2.id = project2_id;
    
    RETURN distance;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the new location column
COMMENT ON COLUMN public.projects.location IS 'JSONB object containing address, city, province, postalCode, latitude, longitude';

-- Update table comment
COMMENT ON TABLE public.projects IS 'Construction projects with JSONB location data and geospatial support';
