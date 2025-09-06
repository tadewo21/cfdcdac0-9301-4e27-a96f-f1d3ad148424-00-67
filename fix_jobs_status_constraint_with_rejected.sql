-- Fix jobs_status_check constraint to include 'rejected' status
-- Run this SQL in your Supabase SQL Editor to resolve job rejection issues

-- 1. Drop the existing constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- 2. Add new constraint that includes 'rejected' status
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused', 'rejected'));

-- 3. Ensure the status column has a proper default value
ALTER TABLE public.jobs 
ALTER COLUMN status SET DEFAULT 'active';

-- 4. Update any existing rows that might have invalid status values
UPDATE public.jobs 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused', 'rejected');

-- 5. Verification query
SELECT 
    'Jobs status constraint updated successfully' as status,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_jobs
FROM public.jobs;

-- 6. Test that all status values are now valid
SELECT 
    'Testing constraint - these should all be valid:' as test_info,
    CASE 
        WHEN 'rejected' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused', 'rejected') THEN '✓ rejected'
        ELSE '✗ rejected'
    END as rejected_test,
    CASE 
        WHEN 'active' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused', 'rejected') THEN '✓ active'
        ELSE '✗ active'
    END as active_test;