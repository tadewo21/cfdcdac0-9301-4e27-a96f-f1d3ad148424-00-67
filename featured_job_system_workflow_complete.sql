-- Complete Featured Job System Workflow Setup
-- This SQL script sets up the entire featured job system workflow
-- Run this in your Supabase SQL Editor

-- 1. First, ensure the jobs table has the correct status constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused'));

-- 2. Add featured job columns to jobs table if they don't exist
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

-- 3. Create featured_job_requests table for payment workflow
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

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON public.jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON public.jobs(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_status_featured ON public.jobs(status) WHERE status IN ('active', 'featured');
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_status ON public.featured_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_submitted_at ON public.featured_job_requests(submitted_at);

-- 5. Set up Row Level Security
ALTER TABLE public.featured_job_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Employers can view own requests" ON public.featured_job_requests;
DROP POLICY IF EXISTS "Employers can insert own requests" ON public.featured_job_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON public.featured_job_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.featured_job_requests;

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

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" ON public.featured_job_requests
FOR SELECT USING (
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

-- 6. Create function to handle featured job approval
CREATE OR REPLACE FUNCTION public.approve_featured_job(
    request_id UUID,
    admin_user_id UUID DEFAULT auth.uid()
)
RETURNS void AS $$
BEGIN
    -- Update the featured job request status
    UPDATE public.featured_job_requests 
    SET 
        status = 'approved',
        processed_at = NOW(),
        processed_by = admin_user_id
    WHERE id = request_id;
    
    -- Update the job to be featured
    UPDATE public.jobs 
    SET 
        is_featured = TRUE,
        featured_until = CURRENT_DATE + INTERVAL '30 days',
        status = 'active'
    WHERE id = (
        SELECT job_id FROM public.featured_job_requests WHERE id = request_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to handle featured job rejection
CREATE OR REPLACE FUNCTION public.reject_featured_job(
    request_id UUID,
    rejection_reason TEXT DEFAULT NULL,
    admin_user_id UUID DEFAULT auth.uid()
)
RETURNS void AS $$
BEGIN
    -- Update the featured job request status
    UPDATE public.featured_job_requests 
    SET 
        status = 'rejected',
        processed_at = NOW(),
        processed_by = admin_user_id,
        admin_notes = rejection_reason
    WHERE id = request_id;
    
    -- Keep the job as regular active job
    UPDATE public.jobs 
    SET 
        status = 'active',
        is_featured = FALSE,
        featured_until = NULL
    WHERE id = (
        SELECT job_id FROM public.featured_job_requests WHERE id = request_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to automatically expire featured jobs
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

-- 9. Create a trigger to run expiration daily
CREATE OR REPLACE FUNCTION public.run_daily_featured_expiry()
RETURNS void AS $$
BEGIN
    PERFORM public.expire_featured_jobs();
END;
$$ LANGUAGE plpgsql;

-- 10. Set up storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Set up storage policies
DROP POLICY IF EXISTS "Payment screenshots are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Employers can upload payment screenshots" ON storage.objects;

CREATE POLICY "Payment screenshots are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Employers can upload payment screenshots" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots' 
    AND auth.uid() IS NOT NULL
);

-- 12. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.approve_featured_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_featured_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_featured_jobs TO authenticated;

-- 13. Create view for admin dashboard
CREATE OR REPLACE VIEW public.featured_jobs_admin_view AS
SELECT 
    fjr.*,
    j.title as job_title,
    j.city as job_city,
    j.category as job_category,
    j.created_at as job_created_at,
    e.company_name,
    e.email as employer_email,
    e.phone_number as employer_phone
FROM public.featured_job_requests fjr
JOIN public.jobs j ON fjr.job_id = j.id
JOIN public.employers e ON fjr.employer_id = e.id
ORDER BY fjr.submitted_at DESC;

-- 14. Update existing jobs defaults
ALTER TABLE public.jobs 
ALTER COLUMN is_featured SET DEFAULT FALSE;

-- 15. Ensure proper job statuses
UPDATE public.jobs 
SET status = 'active' 
WHERE status NOT IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused');

-- 16. Final verification query
SELECT 
    'Featured Job System Setup Complete!' as status,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN is_featured = TRUE THEN 1 END) as featured_jobs,
    (SELECT COUNT(*) FROM public.featured_job_requests) as featured_requests,
    (SELECT COUNT(*) FROM public.featured_job_requests WHERE status = 'pending') as pending_requests
FROM public.jobs;

COMMIT;