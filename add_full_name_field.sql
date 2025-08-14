-- Add full_name field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update existing users to populate full_name from first_name and last_name
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

-- Make full_name NOT NULL after populating it
ALTER TABLE public.users 
ALTER COLUMN full_name SET NOT NULL;

-- Add comment for full_name
COMMENT ON COLUMN public.users.full_name IS 'The user''s full name (first_name + last_name)';
