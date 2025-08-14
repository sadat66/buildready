import { Migration } from '../migrations'

export const migration_007_fix_role_field_conflicts: Migration = {
  id: '007_fix_role_field_conflicts',
  version: 7,
  name: 'Fix role field conflicts and ensure full_name field is properly handled',
  
  async up(client) {
    // First, ensure we have the full_name field
    await client.query(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS full_name TEXT;
    `)

    // Update the full_name field for existing users if it's NULL
    await client.query(`
      UPDATE public.users 
      SET full_name = CASE 
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
        THEN first_name || ' ' || last_name
        WHEN first_name IS NOT NULL 
        THEN first_name
        WHEN last_name IS NOT NULL 
        THEN last_name
        ELSE 'Unknown User'
      END
      WHERE full_name IS NULL;
    `)

    // Make full_name NOT NULL after populating it
    await client.query(`
      ALTER TABLE public.users 
      ALTER COLUMN full_name SET NOT NULL;
    `)

    // Drop the old role column if it exists and user_role is populated
    // Only do this if user_role is not NULL for all users
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM public.users 
          WHERE user_role IS NULL
        ) THEN
          RAISE NOTICE 'Some users still have NULL user_role, skipping role column drop';
        ELSE
          ALTER TABLE public.users DROP COLUMN IF EXISTS role;
        END IF;
      END $$;
    `)

    // Ensure user_role is NOT NULL for all users
    await client.query(`
      UPDATE public.users 
      SET user_role = 'homeowner' 
      WHERE user_role IS NULL;
    `)

    await client.query(`
      ALTER TABLE public.users 
      ALTER COLUMN user_role SET NOT NULL;
    `)

    // Create a unique constraint on email if it doesn't exist
    await client.query(`
      ALTER TABLE public.users 
      ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);
    `)

    // Add comment for full_name
    await client.query(`
      COMMENT ON COLUMN public.users.full_name IS 'The user''s full name (first_name + last_name)';
    `)
  },

  async down(client) {
    // Revert changes - this is destructive, so we'll be careful
    
    // Remove the unique constraint on email
    await client.query(`
      ALTER TABLE public.users 
      DROP CONSTRAINT IF EXISTS users_email_unique;
    `)

    // Revert full_name to nullable
    await client.query(`
      ALTER TABLE public.users 
      ALTER COLUMN full_name DROP NOT NULL;
    `)

    // Note: We don't restore the old role column as it would conflict with user_role
    // This migration is designed to be a one-way fix for the field conflicts
  }
}
