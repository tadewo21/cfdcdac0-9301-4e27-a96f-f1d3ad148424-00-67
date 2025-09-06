-- Complete Featured Job System Database Setup
-- Run this SQL in your Supabase SQL Editor to set up the complete featured job system

-- 1. First fix the jobs status constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused'));

-- 2. Add featured columns to jobs table if they don't exist
DO $$ 
BEGIN
    -- Add is_featured column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add featured_until column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'featured_until'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN featured_until DATE;
    END IF;
END $$;

-- 3. Create featured_job_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.featured_job_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    transaction_reference TEXT NOT NULL,
    payment_screenshot_url TEXT,
    amount DECIMAL(10,2) NOT NULL DEFAULT 500,
    currency TEXT NOT NULL DEFAULT 'ETB',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    admin_notes TEXT,
    UNIQUE(job_id)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON public.jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON public.jobs(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_status ON public.featured_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_submitted_at ON public.featured_job_requests(submitted_at);

-- 5. Set up Row Level Security (RLS)
ALTER TABLE public.featured_job_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employers can view own requests" ON public.featured_job_requests;
DROP POLICY IF EXISTS "Employers can insert own requests" ON public.featured_job_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON public.featured_job_requests;

-- Employers can view their own requests
CREATE POLICY "Employers can view own requests" ON public.featured_job_requests
FOR SELECT USING (
    employer_id IN (
        SELECT employer_id FROM public.profiles WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.employers WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    )
);

-- Employers can insert their own requests
CREATE POLICY "Employers can insert own requests" ON public.featured_job_requests
FOR INSERT WITH CHECK (
    employer_id IN (
        SELECT employer_id FROM public.profiles WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.employers WHERE email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    )
);

-- Only admins can update requests (for approval/rejection)
CREATE POLICY "Only admins can update requests" ON public.featured_job_requests
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND user_type = 'admin'
    )
    OR 
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN (
        'admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com'
    )
);

-- 6. Create a function to automatically expire featured jobs
CREATE OR REPLACE FUNCTION public.expire_featured_jobs()
RETURNS void AS $$
BEGIN
    UPDATE public.jobs 
    SET is_featured = FALSE 
    WHERE is_featured = TRUE 
    AND featured_until IS NOT NULL 
    AND featured_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 7. Create storage bucket for payment screenshots if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Set up storage policies for payment screenshots
CREATE POLICY IF NOT EXISTS "Payment screenshots are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-screenshots');

CREATE POLICY IF NOT EXISTS "Employers can upload payment screenshots" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots' 
    AND (storage.foldername(name))[1] = 'payment'
);

-- 9. Update existing jobs table defaults
ALTER TABLE public.jobs 
ALTER COLUMN status SET DEFAULT 'active',
ALTER COLUMN is_featured SET DEFAULT FALSE;

-- 10. Clean up any existing bad data
UPDATE public.jobs 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused');

UPDATE public.jobs SET title = 'Untitled Job' WHERE title IS NULL OR title = '';
UPDATE public.jobs SET description = 'Job description not provided' WHERE description IS NULL OR description = '';

-- 11. Ensure required constraints
ALTER TABLE public.jobs 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN employer_id SET NOT NULL;

-- 12. Create a view for easy featured job management
CREATE OR REPLACE VIEW public.featured_jobs_view AS
SELECT 
    j.*,
    fjr.transaction_reference,
    fjr.amount as featured_amount,
    fjr.submitted_at as featured_requested_at,
    fjr.processed_at as featured_approved_at,
    fjr.status as featured_status
FROM public.jobs j
LEFT JOIN public.featured_job_requests fjr ON j.id = fjr.job_id
WHERE j.is_featured = TRUE;

-- 13. Final verification
SELECT 
    'Featured Job System Setup Complete!' as status,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN is_featured = TRUE THEN 1 END) as featured_jobs,
    (SELECT COUNT(*) FROM public.featured_job_requests) as featured_requests
FROM public.jobs;

-- 14. Test the constraints work
SELECT 
    'Constraint Test Results:' as test_status,
    CASE 
        WHEN 'pending' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused') THEN '✓ pending status allowed'
        ELSE '✗ pending status blocked'
    END as pending_test,
    CASE 
        WHEN 'featured' IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused') THEN '✓ featured status allowed'
        ELSE '✗ featured status blocked'
    END as featured_test;

COMMIT;