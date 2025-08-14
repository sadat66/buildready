-- Fix RLS Policies for BuildReady Platform
-- Run this script in your Supabase SQL Editor to fix the contractor projects issue

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

-- Create RLS policies for Users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for Projects table
-- This is the key policy that allows contractors to view open projects
CREATE POLICY "Anyone can view open projects" ON public.projects
    FOR SELECT USING (status = 'open');

CREATE POLICY "Homeowners can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = homeowner_id);

CREATE POLICY "Homeowners can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = homeowner_id);

CREATE POLICY "Homeowners can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = homeowner_id);

CREATE POLICY "Homeowners can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = homeowner_id);

-- Create RLS policies for Proposals table
CREATE POLICY "Contractors can view own proposals" ON public.proposals
    FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Homeowners can view project proposals" ON public.proposals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.homeowner_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can submit proposals" ON public.proposals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.status = 'open'
            AND projects.homeowner_id != auth.uid()
        )
        AND auth.uid() = contractor_id
    );

CREATE POLICY "Contractors can update own proposals" ON public.proposals
    FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Homeowners can update project proposals" ON public.proposals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.homeowner_id = auth.uid()
        )
    );

-- Create RLS policies for Reviews table
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
            AND projects.homeowner_id = auth.uid()
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
    p.title,
    p.status,
    u.full_name as homeowner_name
FROM public.projects p
JOIN public.users u ON p.homeowner_id = u.id
WHERE p.status = 'open'
LIMIT 5;
