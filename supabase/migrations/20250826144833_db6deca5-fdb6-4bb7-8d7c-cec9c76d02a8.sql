-- Add featured columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until DATE;

-- Create featured_job_requests table
CREATE TABLE IF NOT EXISTS featured_job_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  transaction_reference TEXT NOT NULL,
  payment_screenshot_url TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_status ON featured_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_submitted_at ON featured_job_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON jobs(featured_until) WHERE featured_until IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE featured_job_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Employers can view own requests" ON featured_job_requests
FOR SELECT USING (employer_id IN (
  SELECT employer_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Employers can insert own requests" ON featured_job_requests
FOR INSERT WITH CHECK (employer_id IN (
  SELECT employer_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Only admins can update requests" ON featured_job_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);