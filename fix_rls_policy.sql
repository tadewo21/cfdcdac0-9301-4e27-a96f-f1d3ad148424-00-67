-- Fix RLS policy for job posting
-- Run this SQL in your Supabase SQL Editor

-- Add missing columns to jobs table that are being used in the application
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS company_culture TEXT;

-- Update the job insertion RLS policy to be more permissive for authenticated users
-- The current policy is too restrictive and causes timing issues
DROP POLICY IF EXISTS "Employers can insert jobs" ON public.jobs;

-- Create a new, more flexible policy for job insertion
CREATE POLICY "Authenticated users can insert jobs with valid employer_id" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Allow if the employer_id exists and the user is authenticated
  EXISTS (
    SELECT 1 FROM public.employers 
    WHERE employers.id = jobs.employer_id
  )
  -- Additional check: ensure the user either owns the employer record or is creating a new one
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
    OR 
    -- Allow if user is creating employer profile simultaneously
    EXISTS (
      SELECT 1 FROM public.employers e
      WHERE e.id = jobs.employer_id 
      AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);