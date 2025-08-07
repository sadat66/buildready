-- BuildConnect Database Schema
-- This file contains all the necessary tables and relationships for the platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('homeowner', 'contractor', 'admin')),
    full_name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    homeowner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL(10,2) NOT NULL,
    budget_max DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'awarded', 'completed', 'cancelled')),
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    contractor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    timeline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, contractor_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reviewed_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_id, project_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_homeowner_id ON public.projects(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON public.proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_contractor_id ON public.proposals(contractor_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can view open projects" ON public.projects
    FOR SELECT USING (status = 'open');

CREATE POLICY "Homeowners can view their own projects" ON public.projects
    FOR SELECT USING (homeowner_id = auth.uid());

CREATE POLICY "Homeowners can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (homeowner_id = auth.uid());

CREATE POLICY "Homeowners can update their own projects" ON public.projects
    FOR UPDATE USING (homeowner_id = auth.uid());

-- Proposals policies
CREATE POLICY "Contractors can view proposals for projects they bid on" ON public.proposals
    FOR SELECT USING (contractor_id = auth.uid());

CREATE POLICY "Homeowners can view proposals for their projects" ON public.proposals
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE homeowner_id = auth.uid()
        )
    );

CREATE POLICY "Contractors can insert their own proposals" ON public.proposals
    FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Homeowners can update proposals for their projects" ON public.proposals
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE homeowner_id = auth.uid()
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert reviews they wrote" ON public.reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (reviewer_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert messages they send" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user rating when a review is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the reviewed user's rating and review count
    UPDATE public.users 
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM public.reviews 
            WHERE reviewed_id = NEW.reviewed_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews 
            WHERE reviewed_id = NEW.reviewed_id
        )
    WHERE id = NEW.reviewed_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update user rating when a review is added
CREATE TRIGGER update_user_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Function to update project status when a proposal is accepted
CREATE OR REPLACE FUNCTION update_project_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If a proposal is accepted, update the project status to 'awarded'
    IF NEW.status = 'accepted' THEN
        UPDATE public.projects 
        SET status = 'awarded'
        WHERE id = NEW.project_id;
        
        -- Reject all other proposals for this project
        UPDATE public.proposals 
        SET status = 'rejected'
        WHERE project_id = NEW.project_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update project status when a proposal is accepted
CREATE TRIGGER update_project_status_trigger 
    AFTER UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION update_project_status();

-- Insert some sample data for testing
-- First insert into auth.users (this would normally be handled by Supabase Auth)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'sarah@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'mike@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'lisa@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Then insert into public.users
INSERT INTO public.users (id, email, role, full_name, location, bio, rating, review_count) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'homeowner', 'John Smith', 'Seattle, WA', 'Looking for quality contractors for home improvement projects.', 0.00, 0),
    ('550e8400-e29b-41d4-a716-446655440002', 'sarah@example.com', 'homeowner', 'Sarah Johnson', 'Portland, OR', 'Homeowner seeking reliable contractors.', 0.00, 0),
    ('550e8400-e29b-41d4-a716-446655440003', 'mike@example.com', 'contractor', 'Mike Wilson', 'Seattle, WA', 'Experienced contractor specializing in kitchen and bathroom remodels.', 4.8, 12),
    ('550e8400-e29b-41d4-a716-446655440004', 'lisa@example.com', 'contractor', 'Lisa Brown', 'Portland, OR', 'Professional contractor with 10+ years of experience in residential construction.', 4.9, 8);

-- Insert sample projects
INSERT INTO public.projects (id, homeowner_id, title, description, budget_min, budget_max, location, category, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Kitchen Renovation', 'Complete kitchen remodel including new cabinets, countertops, and appliances. Looking for experienced contractor.', 15000.00, 25000.00, 'Seattle, WA', 'kitchen', 'open'),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Bathroom Remodel', 'Master bathroom renovation with new tile, fixtures, and plumbing. Need professional contractor.', 8000.00, 15000.00, 'Portland, OR', 'bathroom', 'open'),
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Deck Construction', 'Build a new wooden deck in the backyard. Approximately 200 sq ft.', 5000.00, 8000.00, 'Seattle, WA', 'deck', 'open');

-- Insert sample proposals
INSERT INTO public.proposals (project_id, contractor_id, bid_amount, description, timeline, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 22000.00, 'I can complete this kitchen renovation in 4-6 weeks. Includes all materials and labor.', '4-6 weeks', 'pending'),
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 24000.00, 'Professional kitchen renovation with premium materials. 5-7 week timeline.', '5-7 weeks', 'pending'),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 12000.00, 'Complete bathroom remodel with modern fixtures and tile work.', '3-4 weeks', 'pending'),
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 6500.00, 'Quality deck construction with premium materials and professional installation.', '2-3 weeks', 'pending');

-- Insert sample messages
INSERT INTO public.messages (sender_id, receiver_id, project_id, content) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Hi Mike, I saw your proposal for the kitchen renovation. Can we discuss the timeline?'),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Absolutely! I can start next week and complete the project within 6 weeks.'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 'Hi Lisa, I''m interested in your bathroom remodel proposal. Do you have any references?'),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'Hi Mike, I saw your proposal for the deck construction. When could you start?');