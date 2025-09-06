-- Add missing foreign key constraints and RLS policies without dropping existing functions

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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'employers' 
        AND policyname = 'Authenticated users can create employer profiles'
    ) THEN
        CREATE POLICY "Authenticated users can create employer profiles" 
        ON public.employers 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Add policy for users to view employer data when creating jobs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'employers' 
        AND policyname = 'Authenticated users can view employer data for job creation'
    ) THEN
        CREATE POLICY "Authenticated users can view employer data for job creation" 
        ON public.employers 
        FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;
END $$;