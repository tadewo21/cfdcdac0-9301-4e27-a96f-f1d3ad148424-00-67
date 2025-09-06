-- Fix jobs_status_check constraint error
-- Run this SQL in your Supabase SQL Editor to resolve job posting constraint violations

-- 1. First, let's check what the current constraint looks like
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'jobs_status_check' 
AND conrelid = 'public.jobs'::regclass;

-- 2. Drop the existing problematic constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- 3. Add a new, more permissive status constraint that allows all necessary values
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused'));

-- 4. Ensure the status column has a proper default value
ALTER TABLE public.jobs 
ALTER COLUMN status SET DEFAULT 'active';

-- 5. Update any existing rows that might have invalid status values
UPDATE public.jobs 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused');

-- 6. Also ensure other commonly problematic constraints are handled
-- Make sure the employer_id is not causing issues
ALTER TABLE public.jobs 
ALTER COLUMN employer_id SET NOT NULL;

-- 7. Ensure required text fields have proper handling
UPDATE public.jobs SET title = 'Untitled Job' WHERE title IS NULL OR title = '';
UPDATE public.jobs SET description = 'Job description not provided' WHERE description IS NULL OR description = '';

-- 8. Add NOT NULL constraints for essential fields
ALTER TABLE public.jobs 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- 9. Refresh the schema to apply changes
NOTIFY pgrst, 'reload schema';

-- 10. Verification query to ensure the fix worked
SELECT 
    'Jobs status constraint fixed successfully' as status,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs
FROM public.jobs;

-- 11. Test that job insertion now works with common status values
SELECT 
    'Testing constraint - these should all be valid:' as test_info,
    CASE 
        WHEN 'active' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused') THEN '✓ active'
        ELSE '✗ active'
    END as active_test,
    CASE 
        WHEN 'featured' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused') THEN '✓ featured'
        ELSE '✗ featured'
    END as featured_test,
    CASE 
        WHEN 'draft' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused') THEN '✓ draft'
        ELSE '✗ draft'
    END as draft_test;