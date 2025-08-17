-- Fix RLS Policies for BuildReady Platform - Updated for new schema
-- Run this script in your Supabase SQL Editor to fix the RLS policies
-- This addresses the schema change from homeowner_id to creator field
-- 
-- IMPORTANT: Run this AFTER running the 011_update_projects_schema.sql migration
-- This script will clean up and recreate all RLS policies to ensure consistency

-- First, let's check if RLS is enabled and what policies exist
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'projects', 'proposals', 'reviews', 'messages');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view open projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Homeowners can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Contractors can view own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Homeowners can view project proposals" ON public.proposals;
DROP POLICY IF EXISTS "Contractors can submit proposals" ON public.proposals;
DROP POLICY IF EXISTS "Contractors can update own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Homeowners can update project proposals" ON public.proposals;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews for involved projects" ON public.reviews;
DROP POLICY IF EXISTS "Users can view involved messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Create a helper function to check if a user is a homeowner
CREATE OR REPLACE FUNCTION is_homeowner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Try different possible column names for user role
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_metadata') THEN
        RETURN EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id AND user_metadata->>'role' = 'homeowner'
        );
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_role') THEN
        RETURN EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id AND user_role = 'homeowner'
        );
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
        RETURN EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id AND role = 'homeowner'
        );
    ELSE
        -- If we can't determine role, allow the operation (fallback)
        RETURN true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for Users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for Projects table - UPDATED FOR NEW SCHEMA
-- Allow all authenticated users to view published projects (for contractors to browse)
CREATE POLICY "Anyone can view published projects" ON public.projects
    FOR SELECT USING (status = 'Published' OR status = 'Bidding');

-- Allow project creators to view their own projects (all statuses)
CREATE POLICY "Creators can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = creator);

-- Allow project creators to insert their own projects (with homeowner role check)
CREATE POLICY "Creators can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() = creator AND is_homeowner(auth.uid())
    );

-- Allow project creators to update their own projects
CREATE POLICY "Creators can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = creator);

-- Allow project creators to delete their own projects
CREATE POLICY "Creators can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = creator);

-- Create RLS policies for Proposals table - UPDATED FOR NEW SCHEMA
CREATE POLICY "Contractors can view own proposals" ON public.proposals
    FOR SELECT USING (auth.uid() = contractor_id);

-- Allow project creators to view proposals for their projects
CREATE POLICY "Creators can view project proposals" ON public.proposals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.creator = auth.uid()
        )
    );

-- Allow contractors to insert proposals for published projects
CREATE POLICY "Contractors can submit proposals" ON public.proposals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND (projects.status = 'Published' OR projects.status = 'Bidding')
            AND projects.creator != auth.uid()
        )
        AND auth.uid() = contractor_id
    );

CREATE POLICY "Contractors can update own proposals" ON public.proposals
    FOR UPDATE USING (auth.uid() = contractor_id);

-- Allow project creators to update proposals for their projects (e.g., accept/reject)
CREATE POLICY "Creators can update project proposals" ON public.proposals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.creator = auth.uid()
        )
    );

-- Create RLS policies for Reviews table - UPDATED FOR NEW SCHEMA
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert reviews for involved projects" ON public.reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.proposals 
            WHERE proposals.project_id = reviews.project_id 
            AND proposals.contractor_id = auth.uid()
            AND proposals.status = 'accepted'
        )
        OR EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = reviews.project_id 
            AND projects.creator = auth.uid()
        )
    );

-- Create RLS policies for Messages table
CREATE POLICY "Users can view involved messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test query to see if contractors can now view projects
-- This should work after the policies are in place
SELECT 
    p.id,
    p.project_title,
    p.status,
    u.full_name as creator_name
FROM public.projects p
JOIN public.users u ON p.creator = u.id
WHERE p.status IN ('Published', 'Bidding')
LIMIT 5;