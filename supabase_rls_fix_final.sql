-- Final comprehensive fix for RLS policies
-- Run this SQL in your Supabase SQL Editor to fix job posting issues

-- 1. First, ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    user_type TEXT DEFAULT 'job_seeker',
    employer_id UUID REFERENCES public.employers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    company_logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    city TEXT,
    category TEXT,
    job_type TEXT,
    salary_range TEXT,
    education_level TEXT,
    benefits TEXT,
    company_culture TEXT,
    application_email TEXT,
    deadline TEXT,
    employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Public can read employers" ON public.employers;
DROP POLICY IF EXISTS "Authenticated users can create employers" ON public.employers;
DROP POLICY IF EXISTS "Users can update employer records they created" ON public.employers;
DROP POLICY IF EXISTS "Public read access for employers" ON public.employers;
DROP POLICY IF EXISTS "Employers can update their own data" ON public.employers;
DROP POLICY IF EXISTS "Users can create employer profiles" ON public.employers;

DROP POLICY IF EXISTS "Enhanced job posting policy" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can post jobs" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are publicly viewable" ON public.jobs;
DROP POLICY IF EXISTS "Job owners can update their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Employers can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs with valid employer_id" ON public.jobs;

-- 4. Create comprehensive policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. Create permissive policies for employers
CREATE POLICY "employers_select_all" ON public.employers
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "employers_insert_authenticated" ON public.employers
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "employers_update_own" ON public.employers
    FOR UPDATE TO authenticated
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND employer_id = employers.id
        )
    )
    WITH CHECK (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND employer_id = employers.id
        )
    );

-- 6. Create comprehensive job policies
CREATE POLICY "jobs_select_all" ON public.jobs
    FOR SELECT TO authenticated, anon
    USING (status IN ('active', 'featured'));

CREATE POLICY "jobs_insert_authenticated" ON public.jobs
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Check 1: Employer must exist
        EXISTS (
            SELECT 1 FROM public.employers 
            WHERE id = employer_id
        )
        AND
        -- Check 2: User has permission (any of these conditions)
        (
            -- Admin users
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
            )
            OR
            -- User owns the employer record
            EXISTS (
                SELECT 1 FROM public.employers e
                WHERE e.id = employer_id 
                AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
            OR
            -- User profile is linked to the employer
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.user_id = auth.uid() 
                AND p.employer_id = jobs.employer_id
            )
        )
    );

CREATE POLICY "jobs_update_authorized" ON public.jobs
    FOR UPDATE TO authenticated
    USING (
        -- Admin users
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
        )
        OR
        -- User owns the employer record
        EXISTS (
            SELECT 1 FROM public.employers e
            WHERE e.id = employer_id 
            AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR
        -- User profile is linked to the employer
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() 
            AND p.employer_id = jobs.employer_id
        )
    )
    WITH CHECK (
        -- Same conditions for WITH CHECK
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.employers e
            WHERE e.id = employer_id 
            AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() 
            AND p.employer_id = jobs.employer_id
        )
    );

-- 7. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.employers TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT SELECT ON public.employers TO anon;
GRANT SELECT ON public.jobs TO anon;

-- 8. Create function to auto-link profiles to employers
CREATE OR REPLACE FUNCTION public.auto_link_profile_to_employer()
RETURNS TRIGGER AS $$
BEGIN
    -- Link the user's profile to the newly created employer
    UPDATE public.profiles 
    SET employer_id = NEW.id
    WHERE user_id = auth.uid() 
    AND employer_id IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for auto-linking
DROP TRIGGER IF EXISTS auto_link_profile_trigger ON public.employers;
CREATE TRIGGER auto_link_profile_trigger
    AFTER INSERT ON public.employers
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_link_profile_to_employer();

-- 10. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_employer_id UUID;
BEGIN
    -- Create profile for the new user
    INSERT INTO public.profiles (user_id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'job_seeker')
    );
    
    -- If user is employer and has company_name, create employer record and link it
    IF NEW.raw_user_meta_data->>'user_type' = 'employer' AND 
       NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
        
        INSERT INTO public.employers (company_name, email)
        VALUES (
            NEW.raw_user_meta_data->>'company_name',
            NEW.email
        )
        RETURNING id INTO new_employer_id;
        
        -- Link the profile to the employer
        UPDATE public.profiles 
        SET employer_id = new_employer_id
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger for new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 12. Refresh schema cache
NOTIFY pgrst, 'reload schema';