-- Fix for project deletion issue
-- Add missing DELETE policy for projects table

-- Add DELETE policy to allow homeowners to delete their own projects
CREATE POLICY "Homeowners can delete their own projects" ON public.projects
    FOR DELETE USING (homeowner_id = auth.uid());

-- Verify the policy was created
-- You can run this query to check:
-- SELECT * FROM pg_policies WHERE tablename = 'projects' AND cmd = 'DELETE';