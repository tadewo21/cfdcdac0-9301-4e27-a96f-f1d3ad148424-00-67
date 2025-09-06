-- Fix RLS policies for better job posting support
-- Run this SQL in your Supabase SQL Editor

-- First, ensure all necessary columns exist in the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Drop existing restrictive policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create more flexible profile policies
CREATE POLICY "Users can manage their own profile" 
ON public.profiles FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Drop existing employer policies that might be too restrictive
DROP POLICY IF EXISTS "Public read access for employers" ON public.employers;
DROP POLICY IF EXISTS "Employers can update their own data" ON public.employers;
DROP POLICY IF EXISTS "Users can create employer profiles" ON public.employers;

-- Create comprehensive employer policies
CREATE POLICY "Public can read employers" 
ON public.employers FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Authenticated users can create employers" 
ON public.employers FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update employer records they created" 
ON public.employers FOR UPDATE 
TO authenticated 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update job posting policy to be more permissive
DROP POLICY IF EXISTS "Authenticated users can insert jobs with valid employer_id" ON public.jobs;

CREATE POLICY "Authenticated users can post jobs" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Allow if the employer_id exists
  EXISTS (
    SELECT 1 FROM public.employers 
    WHERE employers.id = jobs.employer_id
  )
  AND
  -- Allow if user has a profile linked to this employer OR user created the employer
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.id = jobs.employer_id 
      AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.employers TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT SELECT ON public.employers TO anon;
GRANT SELECT ON public.jobs TO anon;