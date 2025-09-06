-- Improved RLS policies for job posting
-- Run this SQL in your Supabase SQL Editor after the previous fix

-- Drop the current job insertion policy and create a more robust one
DROP POLICY IF EXISTS "Authenticated users can post jobs" ON public.jobs;

-- Create a more comprehensive job posting policy
CREATE POLICY "Enhanced job posting policy" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (
  -- First check: employer exists
  EXISTS (
    SELECT 1 FROM public.employers 
    WHERE employers.id = jobs.employer_id
  )
  AND
  -- Second check: User has permission (either through profile link OR direct email match OR admin)
  (
    -- Option 1: User profile is linked to this employer
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
    OR 
    -- Option 2: User email matches employer email (direct ownership)
    EXISTS (
      SELECT 1 FROM public.employers e
      JOIN auth.users u ON u.id = auth.uid()
      WHERE e.id = jobs.employer_id 
      AND e.email = u.email
    )
    OR
    -- Option 3: Admin users (specific emails)
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
    )
  )
);

-- Also ensure we have a policy for reading jobs
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs are publicly viewable" 
ON public.jobs FOR SELECT 
TO authenticated, anon 
USING (status = 'active' OR status = 'featured');

-- Allow job owners to update their jobs
DROP POLICY IF EXISTS "Job owners can update jobs" ON public.jobs;
CREATE POLICY "Job owners can update their jobs" 
ON public.jobs FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.employers e
    JOIN auth.users u ON u.id = auth.uid()
    WHERE e.id = jobs.employer_id 
    AND e.email = u.email
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employer_id = jobs.employer_id
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employers e
    JOIN auth.users u ON u.id = auth.uid()
    WHERE e.id = jobs.employer_id 
    AND e.email = u.email
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.employer_id = jobs.employer_id
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
  )
);

-- Create trigger to automatically link profile when employer is created
CREATE OR REPLACE FUNCTION link_profile_to_employer()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile of the user who created this employer
  UPDATE public.profiles 
  SET employer_id = NEW.id
  WHERE user_id = auth.uid() 
  AND employer_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_link_profile_to_employer ON public.employers;

-- Create trigger that fires after employer insert
CREATE TRIGGER trigger_link_profile_to_employer
  AFTER INSERT ON public.employers
  FOR EACH ROW
  EXECUTE FUNCTION link_profile_to_employer();

-- Refresh the database metadata
NOTIFY pgrst, 'reload schema';