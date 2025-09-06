-- Add freelance functionality to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS is_freelance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS freelance_until TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_freelance ON public.jobs(is_freelance);
CREATE INDEX IF NOT EXISTS idx_jobs_freelance_until ON public.jobs(freelance_until);

-- Function to expire freelance jobs
CREATE OR REPLACE FUNCTION public.expire_freelance_jobs()
RETURNS void AS $$
BEGIN
  UPDATE public.jobs
  SET 
    is_freelance = false,
    freelance_until = NULL
  WHERE 
    is_freelance = true 
    AND freelance_until < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set some sample jobs as freelance for testing (using a subquery instead of LIMIT)
UPDATE public.jobs 
SET 
  is_freelance = true,
  freelance_until = now() + interval '30 days'
WHERE 
  id IN (
    SELECT id 
    FROM public.jobs 
    WHERE category IN ('Technology', 'Marketing', 'Design') 
    AND status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 3
  );