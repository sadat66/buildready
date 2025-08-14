/**
 * Migration: 005_complete_user_schema
 * Version: 5
 * Description: Complete user schema with all fields from User schema image
 * Applied: 2024-12-19
 */

import { Migration, DatabaseClient } from '../migrations'

export const migration_005_complete_user_schema: Migration = {
  id: '005_complete_user_schema',
  version: 5,
  name: 'Complete user schema with all fields from User schema image',
  up: async (db: DatabaseClient) => {
    // Add all new fields to users table
    await db.execute(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('homeowner', 'contractor', 'admin')),
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT,
      ADD COLUMN IF NOT EXISTS phone_number TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS profile_photo TEXT,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS is_verified_contractor BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_verified_homeowner BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_verified_phone BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS user_agreed_to_terms BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS contractor_profile UUID;
    `)

    // Update existing users to populate new fields from existing data
    await db.execute(`
      UPDATE public.users 
      SET 
        role = role,
        first_name = SPLIT_PART(full_name, ' ', 1),
        last_name = CASE 
          WHEN POSITION(' ' IN full_name) > 0 
          THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
          ELSE ''
        END,
        phone_number = phone,
        address = location,
        is_active = true,
        user_agreed_to_terms = true
      WHERE role IS NULL;
    `)

    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
    `)
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_verification_status 
      ON public.users(is_verified_email, is_verified_contractor, is_verified_homeowner, is_verified_phone);
    `)
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_active_status ON public.users(is_active);
    `)
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_contractor_profile ON public.users(contractor_profile);
    `)

    // Add comments to document the fields
    await db.execute(`
      COMMENT ON COLUMN public.users.role IS 'Defines the user role on the platform (Homeowner, Contractor, Inspector, Notary)';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.first_name IS 'The user''s given name';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.last_name IS 'The user''s family name or surname';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.phone_number IS 'The user''s primary contact phone number';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.address IS 'Geographic address for matching, jurisdiction, or correspondence';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.profile_photo IS 'Optional image for user''s profile or dashboard';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.is_active IS 'Indicates if user account is enabled, disabled, or soft-deleted';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.is_verified_contractor IS 'Indicates if contractor has submitted valid ContractorProfile company identity verification';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.is_verified_homeowner IS 'Indicates if homeowner has submitted valid identity verification';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.is_verified_phone IS 'Indicates if user has verified phone number via SMS or call';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.user_agreed_to_terms IS 'Indicates if user has agreed to platform''s Terms of Service';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.last_login IS 'Timestamp of most recent login time';
    `)
    
    await db.execute(`
      COMMENT ON COLUMN public.users.contractor_profile IS 'Link to ContractorProfile if user is contractor';
    `)
  },
  down: async (db: DatabaseClient) => {
    // Remove the new fields (be careful with this in production!)
    await db.execute(`
      ALTER TABLE public.users 
      DROP COLUMN IF EXISTS role,
      DROP COLUMN IF EXISTS first_name,
      DROP COLUMN IF EXISTS last_name,
      DROP COLUMN IF EXISTS phone_number,
      DROP COLUMN IF EXISTS address,
      DROP COLUMN IF EXISTS profile_photo,
      DROP COLUMN IF EXISTS is_active,
      DROP COLUMN IF EXISTS is_verified_contractor,
      DROP COLUMN IF EXISTS is_verified_homeowner,
      DROP COLUMN IF EXISTS is_verified_phone,
      DROP COLUMN IF EXISTS user_agreed_to_terms,
      DROP COLUMN IF EXISTS last_login,
      DROP COLUMN IF EXISTS contractor_profile;
    `)
    
    // Drop indexes
    await db.execute(`DROP INDEX IF EXISTS idx_users_role;`)
    await db.execute(`DROP INDEX IF EXISTS idx_users_verification_status;`)
    await db.execute(`DROP INDEX IF EXISTS idx_users_active_status;`)
    await db.execute(`DROP INDEX IF EXISTS idx_users_contractor_profile;`)
  }
}