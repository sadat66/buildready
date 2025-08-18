-- Enable RLS on contractor_profiles table
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contractor_profiles';
