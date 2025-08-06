# Database Setup Instructions

To fix the authentication errors, you need to apply the database trigger and updated RLS policies to your Supabase project.

## Steps to Apply Database Changes

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project dashboard

2. **Access the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply the Trigger and Policies**
   - Copy the contents of `supabase-user-trigger.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the SQL

4. **Verify the Setup**
   - The trigger will automatically create user profiles when users sign up
   - The updated RLS policies will allow proper access to user data

## What This Fixes

- **400 Bad Request on signup**: The trigger creates user profiles automatically
- **404 Not Found on user queries**: Updated RLS policies allow proper data access
- **Authentication flow**: Users can now sign up and sign in without manual profile creation

## Alternative: Manual Application

If you prefer to apply the changes manually:

```sql
-- Copy and paste the contents of supabase-user-trigger.sql
-- into your Supabase SQL Editor and run it
```

After applying these changes, the authentication errors should be resolved and users should be able to sign up and sign in successfully.