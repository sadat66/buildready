-- Migration: 010_add_rls_policies.sql
-- Version: 10
-- Description: Add Row Level Security policies for proper data access
-- Applied: 2024-12-19

-- Enable RLS on all tables (already done in initial schema)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (when first created)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects table policies
-- Allow all authenticated users to view open projects (for contractors to browse)
CREATE POLICY "Anyone can view open projects" ON public.projects
    FOR SELECT USING (status = 'open');

-- Allow homeowners to view their own projects (all statuses)
CREATE POLICY "Homeowners can view own projects" ON public.projects
    FOR SELECT USING (
        auth.uid() = homeowner_id
    );

-- Allow homeowners to insert their own projects
CREATE POLICY "Homeowners can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() = homeowner_id
    );

-- Allow homeowners to update their own projects
CREATE POLICY "Homeowners can update own projects" ON public.projects
    FOR UPDATE USING (
        auth.uid() = homeowner_id
    );

-- Allow homeowners to delete their own projects
CREATE POLICY "Homeowners can delete own projects" ON public.projects
    FOR DELETE USING (
        auth.uid() = homeowner_id
    );

-- Proposals table policies
-- Allow contractors to view proposals they've submitted
CREATE POLICY "Contractors can view own proposals" ON public.proposals
    FOR SELECT USING (
        auth.uid() = contractor_id
    );

-- Allow homeowners to view proposals for their projects
CREATE POLICY "Homeowners can view project proposals" ON public.proposals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.homeowner_id = auth.uid()
        )
    );

-- Allow contractors to insert proposals for open projects
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

-- Allow contractors to update their own proposals
CREATE POLICY "Contractors can update own proposals" ON public.proposals
    FOR UPDATE USING (
        auth.uid() = contractor_id
    );

-- Allow homeowners to update proposals for their projects (e.g., accept/reject)
CREATE POLICY "Homeowners can update project proposals" ON public.proposals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = proposals.project_id 
            AND projects.homeowner_id = auth.uid()
        )
    );

-- Reviews table policies
-- Allow users to view reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

-- Allow users to insert reviews for projects they're involved in
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

-- Messages table policies
-- Allow users to view messages they're involved in
CREATE POLICY "Users can view involved messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Allow users to send messages
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

-- Mark migration as applied
INSERT INTO public.migration_status (id, version, name, checksum, execution_time_ms)
VALUES ('010_add_rls_policies', 10, 'Add RLS policies for proper data access', 'sha256:def456...', 200);
