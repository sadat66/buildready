-- Migration: 016_enable_contractor_profiles_rls.sql
-- Version: 16
-- Description: Enable RLS on contractor_profiles table and add access policies
-- Applied: 2024-12-19

-- Enable Row Level Security on contractor_profiles table
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Contractors can view their own profile
CREATE POLICY "Contractors can view own profile" ON public.contractor_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Contractors can insert their own profile
CREATE POLICY "Contractors can insert own profile" ON public.contractor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Contractors can update their own profile
CREATE POLICY "Contractors can update own profile" ON public.contractor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Contractors can delete their own profile
CREATE POLICY "Contractors can delete own profile" ON public.contractor_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Public can view contractor profiles (for search/browsing)
CREATE POLICY "Public can view contractor profiles" ON public.contractor_profiles
    FOR SELECT USING (true);

-- Add comments
COMMENT ON POLICY "Contractors can view own profile" ON public.contractor_profiles IS 'Allows contractors to view their own profile data';
COMMENT ON POLICY "Contractors can insert own profile" ON public.contractor_profiles IS 'Allows contractors to create their profile';
COMMENT ON POLICY "Contractors can update own profile" ON public.contractor_profiles IS 'Allows contractors to update their profile information';
COMMENT ON POLICY "Contractors can delete own profile" ON public.contractor_profiles IS 'Allows contractors to delete their profile';
COMMENT ON POLICY "Public can view contractor profiles" ON public.contractor_profiles IS 'Allows public access to view contractor profiles for search and browsing';
