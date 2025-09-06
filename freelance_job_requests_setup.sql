-- Freelance Job Requests Table Setup
-- This script creates a table to handle freelance job payment requests similar to featured jobs

-- Create freelance_job_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS freelance_job_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  transaction_reference TEXT NOT NULL,
  payment_screenshot_url TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 300.00,
  currency TEXT NOT NULL DEFAULT 'ETB',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_job_id ON freelance_job_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_employer_id ON freelance_job_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_status ON freelance_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_created_at ON freelance_job_requests(created_at);

-- Enable RLS
ALTER TABLE freelance_job_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for freelance_job_requests
-- Employers can view their own requests
CREATE POLICY "Employers can view own freelance requests"
ON freelance_job_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.employer_id = freelance_job_requests.employer_id
  )
);

-- Employers can insert their own requests
CREATE POLICY "Employers can create freelance requests"
ON freelance_job_requests FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.employer_id = freelance_job_requests.employer_id
  )
);

-- Admins can view all requests
CREATE POLICY "Admins can view all freelance requests"
ON freelance_job_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Admins can update all requests
CREATE POLICY "Admins can update freelance requests"
ON freelance_job_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Create function to automatically approve freelance requests and update jobs
CREATE OR REPLACE FUNCTION approve_freelance_request(request_id UUID)
RETURNS void AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the request details
  SELECT * INTO request_record
  FROM freelance_job_requests
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Freelance request not found or already processed';
  END IF;
  
  -- Update the request status
  UPDATE freelance_job_requests
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Update the job to be freelance
  UPDATE jobs
  SET 
    is_freelance = true,
    freelance_until = NOW() + INTERVAL '30 days',
    status = 'active',
    updated_at = NOW()
  WHERE id = request_record.job_id;
  
  -- Log the approval
  RAISE NOTICE 'Freelance request % approved for job %', request_id, request_record.job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject freelance requests
CREATE OR REPLACE FUNCTION reject_freelance_request(request_id UUID, notes TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Update the request status
  UPDATE freelance_job_requests
  SET 
    status = 'rejected',
    admin_notes = notes,
    updated_at = NOW()
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Freelance request not found or already processed';
  END IF;
  
  -- Keep the job as regular job
  RAISE NOTICE 'Freelance request % rejected', request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to suspend freelance jobs
CREATE OR REPLACE FUNCTION suspend_freelance_job(job_id UUID, notes TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Update job to remove freelance status
  UPDATE jobs
  SET 
    is_freelance = false,
    freelance_until = NULL,
    status = 'inactive',
    updated_at = NOW()
  WHERE id = job_id;
  
  -- Update any pending requests for this job
  UPDATE freelance_job_requests
  SET 
    status = 'suspended',
    admin_notes = notes,
    updated_at = NOW()
  WHERE job_id = job_id AND status IN ('pending', 'approved');
  
  RAISE NOTICE 'Freelance job % suspended', job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION approve_freelance_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_freelance_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION suspend_freelance_job(UUID, TEXT) TO authenticated;

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW freelance_requests_dashboard AS
SELECT 
  fr.id,
  fr.job_id,
  fr.employer_id,
  fr.transaction_reference,
  fr.payment_screenshot_url,
  fr.amount,
  fr.currency,
  fr.status,
  fr.admin_notes,
  fr.created_at,
  fr.updated_at,
  fr.approved_at,
  j.title as job_title,
  j.city as job_city,
  j.category as job_category,
  e.company_name,
  e.email as employer_email,
  p.full_name as employer_name
FROM freelance_job_requests fr
JOIN jobs j ON fr.job_id = j.id
JOIN employers e ON fr.employer_id = e.id
LEFT JOIN profiles p ON e.id = p.employer_id
ORDER BY fr.created_at DESC;

-- Grant access to the view
GRANT SELECT ON freelance_requests_dashboard TO authenticated;

-- Success message
SELECT 'Freelance job requests system setup completed successfully! ✅' as status;