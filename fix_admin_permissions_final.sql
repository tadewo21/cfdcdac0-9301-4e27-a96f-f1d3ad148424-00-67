-- FINAL ADMIN PERMISSIONS FIX - Complete solution for admin access
-- Run this SQL in your Supabase SQL Editor to fix admin permissions completely
-- This ensures admin users have full control over all operations

-- 1. Temporarily disable RLS to clean up policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_job_requests DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'employers', 'jobs', 'featured_job_requests', 'favorites', 'notifications')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 3. Ensure all required tables and columns exist
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS company_culture TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS application_email TEXT,
ADD COLUMN IF NOT EXISTS deadline TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'job_seeker',
ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.employers(id);

-- Create featured_job_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.featured_job_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_amount DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    featured_duration INTEGER DEFAULT 30
);

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ) IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create COMPREHENSIVE policies with admin override

-- PROFILES: Admin can access all, users can access their own
CREATE POLICY "profiles_admin_all_access" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.is_admin_user() OR user_id = auth.uid())
WITH CHECK (public.is_admin_user() OR user_id = auth.uid());

-- EMPLOYERS: Public read, admin full access, users can create/update their own
CREATE POLICY "employers_public_read" 
ON public.employers FOR SELECT 
TO public 
USING (true);

CREATE POLICY "employers_admin_all_access" 
ON public.employers FOR ALL 
TO authenticated 
USING (public.is_admin_user() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (public.is_admin_user() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- JOBS: Public read for active jobs, admin full control, employers can manage their jobs
CREATE POLICY "jobs_public_read" 
ON public.jobs FOR SELECT 
TO public 
USING (status IN ('active', 'featured') OR public.is_admin_user());

CREATE POLICY "jobs_admin_full_control" 
ON public.jobs FOR ALL 
TO authenticated 
USING (
    public.is_admin_user() 
    OR EXISTS (
        SELECT 1 FROM public.employers e
        WHERE e.id = jobs.employer_id 
        AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
)
WITH CHECK (
    public.is_admin_user() 
    OR EXISTS (
        SELECT 1 FROM public.employers e
        WHERE e.id = jobs.employer_id 
        AND e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- FEATURED JOB REQUESTS: Admin full access, users can manage their own
CREATE POLICY "featured_requests_admin_all" 
ON public.featured_job_requests FOR ALL 
TO authenticated 
USING (public.is_admin_user() OR user_id = auth.uid())
WITH CHECK (public.is_admin_user() OR user_id = auth.uid());

-- FAVORITES: Users can manage their own, admin can see all
CREATE POLICY "favorites_user_access" 
ON public.favorites FOR ALL 
TO authenticated 
USING (public.is_admin_user() OR user_id = auth.uid())
WITH CHECK (public.is_admin_user() OR user_id = auth.uid());

-- NOTIFICATIONS: Users can manage their own, admin can see all
CREATE POLICY "notifications_user_access" 
ON public.notifications FOR ALL 
TO authenticated 
USING (public.is_admin_user() OR user_id = auth.uid())
WITH CHECK (public.is_admin_user() OR user_id = auth.uid());

-- 7. Grant maximum permissions to authenticated users and anon
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.employers TO authenticated, anon;
GRANT ALL ON public.jobs TO authenticated, anon;
GRANT ALL ON public.featured_job_requests TO authenticated;
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- 8. Create auto-profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com') THEN 'admin'
            ELSE 'job_seeker'
        END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        user_type = CASE 
            WHEN NEW.email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com') THEN 'admin'
            ELSE public.profiles.user_type
        END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create employer auto-linking function
CREATE OR REPLACE FUNCTION public.auto_link_employer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET employer_id = NEW.id, user_type = 'employer'
    WHERE user_id = auth.uid() AND NOT public.is_admin_user();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Recreate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS auto_link_employer_trigger ON public.employers;
CREATE TRIGGER auto_link_employer_trigger
    AFTER INSERT ON public.employers
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_link_employer();

-- 11. Create function to approve/reject featured job requests (admin only)
CREATE OR REPLACE FUNCTION public.update_featured_job_request(
    request_id UUID,
    new_status TEXT,
    feature_duration INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    job_id_var UUID;
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_user() THEN
        RETURN false;
    END IF;
    
    -- Get the job_id from the request
    SELECT job_id INTO job_id_var 
    FROM public.featured_job_requests 
    WHERE id = request_id;
    
    -- Update the request status
    UPDATE public.featured_job_requests 
    SET status = new_status, updated_at = NOW()
    WHERE id = request_id;
    
    -- If approved, update the job to be featured
    IF new_status = 'approved' THEN
        UPDATE public.jobs 
        SET 
            is_featured = true,
            featured_until = NOW() + (feature_duration || ' days')::interval,
            status = 'featured',
            updated_at = NOW()
        WHERE id = job_id_var;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to manage job status (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_job_status(
    job_id_param UUID,
    new_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_user() THEN
        RETURN false;
    END IF;
    
    -- Update job status
    UPDATE public.jobs 
    SET status = new_status, updated_at = NOW()
    WHERE id = job_id_param;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Ensure admin users exist in profiles table
INSERT INTO public.profiles (user_id, email, full_name, user_type)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Admin User'),
    'admin'
FROM auth.users u
WHERE u.email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET
    user_type = 'admin',
    email = EXCLUDED.email;

-- 14. Refresh schema
NOTIFY pgrst, 'reload schema';

-- 15. Final verification
SELECT 
    'ADMIN PERMISSIONS FIXED SUCCESSFULLY' as status,
    COUNT(*) as total_policies,
    (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'admin') as admin_users,
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
    public.is_admin_user() as is_current_user_admin
FROM pg_policies 
WHERE schemaname = 'public';

-- 16. Test admin functions
SELECT 
    'ADMIN FUNCTION TESTS' as test_section,
    public.is_admin_user() as admin_check,
    CASE 
        WHEN public.is_admin_user() THEN 'ADMIN ACCESS GRANTED - Full control over all operations'
        ELSE 'Regular user access'
    END as access_level;