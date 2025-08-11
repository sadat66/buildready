-- Migration: Add location coordinates to projects table
-- This migration adds latitude and longitude fields to store precise location data

-- Add latitude and longitude columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add a check constraint to ensure valid coordinate ranges
ALTER TABLE public.projects 
ADD CONSTRAINT check_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT check_longitude_range CHECK (longitude >= -180 AND longitude <= 180);

-- Create an index on coordinates for better geospatial queries
CREATE INDEX IF NOT EXISTS idx_projects_coordinates ON public.projects(latitude, longitude);

-- Add a comment explaining the new fields
COMMENT ON COLUMN public.projects.latitude IS 'Latitude coordinate in decimal degrees (-90 to 90)';
COMMENT ON COLUMN public.projects.longitude IS 'Longitude coordinate in decimal degrees (-180 to 180)';
