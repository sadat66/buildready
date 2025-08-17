-- Migration: 011_update_projects_schema.sql
-- Version: 11
-- Description: Update projects table to match new schema with geospatial data and file handling
-- Applied: 2024-12-19

-- Enable PostGIS extension for geospatial data (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- First, backup existing data by creating a temporary table
CREATE TABLE IF NOT EXISTS public.projects_backup AS 
SELECT * FROM public.projects;

-- Drop existing projects table
DROP TABLE IF EXISTS public.projects CASCADE;

-- Create new projects table with updated schema
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Core project information
    project_title TEXT NOT NULL,
    statement_of_work TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    category TEXT[] NOT NULL DEFAULT '{}',
    pid TEXT NOT NULL UNIQUE, -- Permanent parcel identifier (BC Land Title)
    
    -- Location (geospatial)
    location_address TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_province TEXT NOT NULL,
    location_postal_code TEXT NOT NULL,
    location_latitude DECIMAL(10,8),
    location_longitude DECIMAL(11,8),
    location_geom GEOMETRY(POINT, 4326), -- PostGIS geometry for spatial queries
    
    -- Project classification
    project_type TEXT NOT NULL CHECK (project_type IN ('New Build', 'Renovation', 'Maintenance', 'Repair', 'Inspection')),
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Bidding', 'Awarded', 'In Progress', 'Completed', 'Cancelled')),
    visibility_settings TEXT NOT NULL DEFAULT 'Public' CHECK (visibility_settings IN ('Public', 'Private', 'Invitation Only')),
    
    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    substantial_completion DATE,
    
    -- Verification and compliance
    is_verified_project BOOLEAN DEFAULT FALSE,
    certificate_of_title TEXT, -- URL to certificate file
    
    -- Files and media
    project_photos JSONB DEFAULT '[]', -- Array of file reference objects
    files JSONB DEFAULT '[]', -- Array of file reference objects
    
    -- Relationships and metadata
    creator UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    proposal_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_creator ON public.projects(creator);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON public.projects(visibility_settings);
CREATE INDEX IF NOT EXISTS idx_projects_pid ON public.projects(pid);
CREATE INDEX IF NOT EXISTS idx_projects_location_geom ON public.projects USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_projects_expiry_date ON public.projects(expiry_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_projects_location_spatial ON public.projects USING GIST(location_geom);

-- Add comments for documentation
COMMENT ON TABLE public.projects IS 'Construction projects initiated by homeowners with full metadata for proposals, budgeting, scheduling, and compliance workflows';
COMMENT ON COLUMN public.projects.pid IS 'Permanent parcel identifier - nine-digit number from BC Land Title Authority';
COMMENT ON COLUMN public.projects.location_geom IS 'PostGIS geometry for spatial queries and distance calculations';
COMMENT ON COLUMN public.projects.project_photos IS 'JSON array of file reference objects with metadata';
COMMENT ON COLUMN public.projects.files IS 'JSON array of file reference objects for project documents';

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
-- Policy 1: Users can view projects based on visibility settings
CREATE POLICY "Users can view projects based on visibility" ON public.projects
    FOR SELECT USING (
        visibility_settings = 'Public' OR
        creator = auth.uid() OR
        (visibility_settings = 'Invitation Only' AND creator = auth.uid())
    );

-- Policy 2: Homeowners can create their own projects
CREATE POLICY "Homeowners can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        creator = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (user_metadata->>'role' = 'homeowner' OR user_role = 'homeowner')
        )
    );

-- Policy 3: Project creators can update their own projects
CREATE POLICY "Project creators can update their own projects" ON public.projects
    FOR UPDATE USING (creator = auth.uid());

-- Policy 4: Project creators can delete their own projects
CREATE POLICY "Project creators can delete their own projects" ON public.projects
    FOR DELETE USING (creator = auth.uid());

-- Create function to update location geometry when coordinates change
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

-- Create trigger to automatically update geometry and timestamp
CREATE TRIGGER trigger_update_project_location_geometry
    BEFORE INSERT OR UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_project_location_geometry();

-- Create function to calculate distance between projects
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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Note: After running this migration, you may want to migrate existing data from the backup table
-- This would require additional SQL to transform the old data structure to the new one
