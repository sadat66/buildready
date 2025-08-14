/**
 * Migration: 004_add_email_verification_field
 * Version: 4
 * Description: Add email verification field to users table
 * Applied: 2024-12-19
 */

import { Migration, DatabaseClient } from '../migrations'

export const migration_004_add_email_verification_field: Migration = {
  id: '004_add_email_verification_field',
  version: 4,
  name: 'Add email verification field to users table',
  up: async (db: DatabaseClient) => {
    // Add is_verified_email field to users table
    await db.execute(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS is_verified_email BOOLEAN DEFAULT false;
    `)

    // Update existing users to have is_verified_email = true if they have confirmed emails
    await db.execute(`
      UPDATE public.users 
      SET is_verified_email = true 
      WHERE id IN (
          SELECT id FROM auth.users 
          WHERE email_confirmed_at IS NOT NULL
      );
    `)

    // Create index for better performance on email verification queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_email_verification 
      ON public.users(is_verified_email);
    `)

    // Add comment to document the field
    await db.execute(`
      COMMENT ON COLUMN public.users.is_verified_email 
      IS 'Indicates whether the user has verified their email address';
    `)
  },
  down: async (db: DatabaseClient) => {
    // Remove the index
    await db.execute(`
      DROP INDEX IF EXISTS idx_users_email_verification;
    `)

    // Remove the column
    await db.execute(`
      ALTER TABLE public.users 
      DROP COLUMN IF EXISTS is_verified_email;
    `)
  }
}
