-- Migration: Fix RLS policies for projects table
-- Fix conflicting policies that reference non-existent columns

-- Drop old conflicting policies that reference homeowner_id (which doesn't exist in new schema)
DROP POLICY IF EXISTS "Anyone can view open projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can delete own projects" ON public.projects;

-- Drop any other conflicting policies to start fresh
DROP POLICY IF EXISTS "Users can view projects based on visibility" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can delete their own projects" ON public.projects;

-- Ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create correct RLS policies using the 'creator' field from new schema
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

-- Add comment for tracking
COMMENT ON TABLE public.projects IS 'Projects table with fixed RLS policies using creator field';