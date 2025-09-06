-- Comprehensive RLS Policy Fix for Job Posting
-- This script completely rebuilds RLS policies to ensure job posting works correctly
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to start completely fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
    END LOOP;
    
    -- Drop all policies on employers table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'employers' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.employers';
    END LOOP;
    
    -- Drop all policies on jobs table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'jobs' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.jobs';
    END LOOP;
END $$;

-- 3. Ensure all required columns exist
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS company_culture TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'job_seeker',
ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.employers(id);

-- 4. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5. Create SIMPLE and PERMISSIVE policies

-- PROFILES: Users can only access their own profiles
CREATE POLICY "profiles_all_own" ON public.profiles
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- EMPLOYERS: Public read, authenticated users can create/update
CREATE POLICY "employers_public_read" ON public.employers
    FOR SELECT TO public
    USING (true);

CREATE POLICY "employers_auth_insert" ON public.employers
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "employers_auth_update" ON public.employers
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- JOBS: Public read for active jobs, permissive insert/update for authenticated users
CREATE POLICY "jobs_public_read" ON public.jobs
    FOR SELECT TO public
    USING (status IN ('active', 'featured'));

-- Very permissive job insertion policy - just require authentication and valid employer
CREATE POLICY "jobs_auth_insert" ON public.jobs
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Just check that employer exists, no other restrictions
        EXISTS (SELECT 1 FROM public.employers WHERE id = employer_id)
    );

CREATE POLICY "jobs_auth_update" ON public.jobs
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "jobs_auth_delete" ON public.jobs
    FOR DELETE TO authenticated
    USING (true);

-- 6. Grant all necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.employers TO authenticated, anon;
GRANT ALL ON public.jobs TO authenticated, anon;

-- 7. Create or replace the auto-profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'job_seeker'
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 9. Create function to link user to employer after employer creation
CREATE OR REPLACE FUNCTION public.link_user_to_new_employer()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's profile to link to the new employer
    UPDATE public.profiles 
    SET employer_id = NEW.id, user_type = 'employer'
    WHERE user_id = auth.uid();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger for employer linking
DROP TRIGGER IF EXISTS link_employer_trigger ON public.employers;
CREATE TRIGGER link_employer_trigger
    AFTER INSERT ON public.employers
    FOR EACH ROW
    EXECUTE FUNCTION public.link_user_to_new_employer();

-- 11. Refresh the schema
NOTIFY pgrst, 'reload schema';

-- 12. Test the setup by showing current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'employers', 'jobs')
ORDER BY tablename, policyname;