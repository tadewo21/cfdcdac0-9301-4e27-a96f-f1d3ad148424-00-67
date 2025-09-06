-- Fix RLS policies that reference auth.users table directly
-- This fixes the "permission denied for table users" error

-- Drop problematic policies that reference auth.users
DROP POLICY IF EXISTS "jobs_auth_update_permissive" ON public.jobs;
DROP POLICY IF EXISTS "jobs_auth_delete_permissive" ON public.jobs;

-- Create a security definer function to get current user's email safely
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new update policy without direct auth.users reference
CREATE POLICY "jobs_auth_update_safe" ON public.jobs
FOR UPDATE TO authenticated
USING (
  -- Allow if user has a profile (authenticated users)
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
  OR
  -- Allow if user owns the employer record (check via email)
  EXISTS (
    SELECT 1 FROM public.employers e
    WHERE e.id = jobs.employer_id 
    AND e.email = public.get_current_user_email()
  )
  OR
  -- Allow if user's profile is linked to the employer
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employer_id = jobs.employer_id
  )
)
WITH CHECK (
  -- Same conditions for WITH CHECK
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.employers e
    WHERE e.id = jobs.employer_id 
    AND e.email = public.get_current_user_email()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employer_id = jobs.employer_id
  )
);

-- Create new delete policy without direct auth.users reference
CREATE POLICY "jobs_auth_delete_safe" ON public.jobs
FOR DELETE TO authenticated
USING (
  -- Allow if user has a profile (authenticated users)
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
  OR
  -- Allow if user owns the employer record (check via email)
  EXISTS (
    SELECT 1 FROM public.employers e
    WHERE e.id = jobs.employer_id 
    AND e.email = public.get_current_user_email()
  )
  OR
  -- Allow if user's profile is linked to the employer
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employer_id = jobs.employer_id
  )
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO authenticated;

-- Refresh schema
NOTIFY pgrst, 'reload schema';