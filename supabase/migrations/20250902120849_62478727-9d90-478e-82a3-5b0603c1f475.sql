-- EMERGENCY FIX FOR INFINITE RECURSION IN RLS POLICIES
-- This completely rebuilds all policies to be simple and non-recursive

-- 1. Disable RLS temporarily 
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage company verifications" ON public.employers;
DROP POLICY IF EXISTS "employers_public_read" ON public.employers;
DROP POLICY IF EXISTS "employers_ultra_permissive" ON public.employers;
DROP POLICY IF EXISTS "jobs_auth_delete_safe" ON public.jobs;
DROP POLICY IF EXISTS "jobs_auth_insert_maximum_permissive" ON public.jobs;
DROP POLICY IF EXISTS "jobs_auth_update_safe" ON public.jobs;
DROP POLICY IF EXISTS "jobs_public_read_all_statuses" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage user suspensions" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;

-- 3. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 4. Create SIMPLE, NON-RECURSIVE policies

-- PROFILES: Simple own access only
CREATE POLICY "profiles_simple_own" 
ON public.profiles FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- EMPLOYERS: Public read, authenticated write (no profile checks)
CREATE POLICY "employers_public_select" 
ON public.employers FOR SELECT 
TO public 
USING (true);

CREATE POLICY "employers_auth_write" 
ON public.employers FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- JOBS: Simple policies without nested profile queries
CREATE POLICY "jobs_public_select" 
ON public.jobs FOR SELECT 
TO public 
USING (true);

CREATE POLICY "jobs_auth_insert_simple" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "jobs_auth_update_simple" 
ON public.jobs FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "jobs_auth_delete_simple" 
ON public.jobs FOR DELETE 
TO authenticated 
USING (true);

-- 5. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.employers TO authenticated, anon;
GRANT ALL ON public.jobs TO authenticated, anon;

-- 6. Refresh schema
NOTIFY pgrst, 'reload schema';