-- Create missing foreign key relationships and improve RLS policies

-- Add proper foreign key constraints that were missing
DO $$ 
BEGIN 
    -- Add foreign key for jobs.employer_id -> employers.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'jobs_employer_id_fkey' 
        AND table_name = 'jobs'
    ) THEN
        ALTER TABLE public.jobs 
        ADD CONSTRAINT jobs_employer_id_fkey 
        FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for profiles.employer_id -> employers.id  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_employer_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_employer_id_fkey 
        FOREIGN KEY (employer_id) REFERENCES public.employers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add missing RLS policy for employers insertion
CREATE POLICY "Authenticated users can create employer profiles" 
ON public.employers 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add policy for users to view employer data when creating jobs
CREATE POLICY "Authenticated users can view employer data for job creation" 
ON public.employers 
FOR SELECT 
TO authenticated 
USING (true);

-- Improve the search path for existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'job_seeker')
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix the update_updated_at_column function as well
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;