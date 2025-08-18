import type { Migration } from '../migrations'

export const migration_016_enable_contractor_profiles_rls: Migration = {
  id: '016_enable_contractor_profiles_rls',
  name: 'Enable RLS on contractor_profiles table and add access policies',
  up: async (db) => {
    // Enable Row Level Security on contractor_profiles table
    await db.execute(`ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;`)

    // Policy: Contractors can view their own profile
    await db.execute(`
      CREATE POLICY "Contractors can view own profile" ON public.contractor_profiles
      FOR SELECT USING (auth.uid() = user_id);
    `)

    // Policy: Contractors can insert their own profile
    await db.execute(`
      CREATE POLICY "Contractors can insert own profile" ON public.contractor_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    `)

    // Policy: Contractors can update their own profile
    await db.execute(`
      CREATE POLICY "Contractors can update own profile" ON public.contractor_profiles
      FOR UPDATE USING (auth.uid() = user_id);
    `)

    // Policy: Contractors can delete their own profile
    await db.execute(`
      CREATE POLICY "Contractors can delete own profile" ON public.contractor_profiles
      FOR DELETE USING (auth.uid() = user_id);
    `)

    // Policy: Public can view contractor profiles (for search/browsing)
    await db.execute(`
      CREATE POLICY "Public can view contractor profiles" ON public.contractor_profiles
      FOR SELECT USING (true);
    `)

    // Add comments
    await db.execute(`
      COMMENT ON POLICY "Contractors can view own profile" ON public.contractor_profiles IS 'Allows contractors to view their own profile data';
    `)
    await db.execute(`
      COMMENT ON POLICY "Contractors can insert own profile" ON public.contractor_profiles IS 'Allows contractors to create their profile';
    `)
    await db.execute(`
      COMMENT ON POLICY "Contractors can update own profile" ON public.contractor_profiles IS 'Allows contractors to update their profile information';
    `)
    await db.execute(`
      COMMENT ON POLICY "Contractors can delete own profile" ON public.contractor_profiles IS 'Allows contractors to delete their profile';
    `)
    await db.execute(`
      COMMENT ON POLICY "Public can view contractor profiles" ON public.contractor_profiles IS 'Allows public access to view contractor profiles for search and browsing';
    `)
  },
  down: async (db) => {
    // Drop all policies
    await db.execute(`DROP POLICY IF EXISTS "Contractors can view own profile" ON public.contractor_profiles;`)
    await db.execute(`DROP POLICY IF EXISTS "Contractors can insert own profile" ON public.contractor_profiles;`)
    await db.execute(`DROP POLICY IF EXISTS "Contractors can update own profile" ON public.contractor_profiles;`)
    await db.execute(`DROP POLICY IF EXISTS "Contractors can delete own profile" ON public.contractor_profiles;`)
    await db.execute(`DROP POLICY IF EXISTS "Public can view contractor profiles" ON public.contractor_profiles;`)

    // Disable RLS
    await db.execute(`ALTER TABLE public.contractor_profiles DISABLE ROW LEVEL SECURITY;`)
  }
}
