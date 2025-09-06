-- Freelance Jobs Database Setup
-- This script ensures the database fully supports freelance job functionality

-- 1. Add freelance columns to jobs table if they don't exist
DO $$ 
BEGIN
    -- Add is_freelance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'is_freelance') THEN
        ALTER TABLE jobs ADD COLUMN is_freelance BOOLEAN DEFAULT false;
    END IF;
    
    -- Add freelance_until column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'freelance_until') THEN
        ALTER TABLE jobs ADD COLUMN freelance_until TIMESTAMPTZ;
    END IF;
    
    RAISE NOTICE 'Freelance columns added/verified successfully';
END $$;

-- 2. Create index for better performance on freelance queries
CREATE INDEX IF NOT EXISTS idx_jobs_freelance 
ON jobs (is_freelance) WHERE is_freelance = true;

CREATE INDEX IF NOT EXISTS idx_jobs_freelance_until 
ON jobs (freelance_until) WHERE freelance_until IS NOT NULL;

-- 3. Update RLS policies to support freelance jobs
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users on active jobs" ON jobs;
DROP POLICY IF EXISTS "Enable insert for employers" ON jobs;
DROP POLICY IF EXISTS "Enable update for job owners" ON jobs;
DROP POLICY IF EXISTS "Enable delete for job owners and admins" ON jobs;

-- Create comprehensive RLS policies
-- Policy for reading jobs (includes freelance jobs)
CREATE POLICY "Enable read access for all users on jobs"
ON jobs FOR SELECT
USING (
  status IN ('active', 'featured') 
  AND deadline >= NOW()::date
);

-- Policy for inserting jobs (allows freelance jobs)
CREATE POLICY "Enable insert for authenticated employers"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be linked to an employer OR be admin
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
  ) OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  )
);

-- Policy for updating jobs (includes freelance status)
CREATE POLICY "Enable update for job owners and admins"
ON jobs FOR UPDATE
TO authenticated
USING (
  -- Job owner can update
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
  ) OR (
    -- Admin can update any job
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  )
)
WITH CHECK (
  -- Same conditions for the updated data
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
  ) OR (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  )
);

-- Policy for deleting jobs
CREATE POLICY "Enable delete for job owners and admins"
ON jobs FOR DELETE
TO authenticated
USING (
  -- Job owner can delete
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.employer_id = jobs.employer_id
    )
  ) OR (
    -- Admin can delete any job
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  )
);

-- 4. Create function to automatically expire freelance jobs
CREATE OR REPLACE FUNCTION expire_freelance_jobs()
RETURNS void AS $$
BEGIN
  UPDATE jobs 
  SET is_freelance = false, 
      freelance_until = NULL,
      status = 'active'
  WHERE is_freelance = true 
    AND freelance_until IS NOT NULL 
    AND freelance_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to extend freelance period (for admin use)
CREATE OR REPLACE FUNCTION extend_freelance_period(job_id UUID, days INTEGER DEFAULT 30)
RETURNS void AS $$
BEGIN
  UPDATE jobs 
  SET freelance_until = CASE 
    WHEN freelance_until IS NULL OR freelance_until < NOW() 
    THEN NOW() + (days || ' days')::INTERVAL
    ELSE freelance_until + (days || ' days')::INTERVAL
  END,
  is_freelance = true
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION expire_freelance_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION extend_freelance_period(UUID, INTEGER) TO authenticated;

-- 7. Create a view for active freelance jobs (for easy querying)
CREATE OR REPLACE VIEW active_freelance_jobs AS
SELECT j.*, e.company_name, e.company_logo_url, e.email as company_email
FROM jobs j
LEFT JOIN employers e ON j.employer_id = e.id
WHERE j.is_freelance = true 
  AND j.status = 'active'
  AND j.deadline >= NOW()::date
  AND (j.freelance_until IS NULL OR j.freelance_until >= NOW())
ORDER BY j.created_at DESC;

-- 8. Grant permissions on the view
GRANT SELECT ON active_freelance_jobs TO authenticated;
GRANT SELECT ON active_freelance_jobs TO anon;

-- 9. Update any existing jobs that should be freelance based on job_type
UPDATE jobs 
SET is_freelance = true 
WHERE job_type = 'freelance' AND is_freelance IS NOT true;

-- 10. Create notification function for freelance job expiration (optional)
CREATE OR REPLACE FUNCTION notify_freelance_expiration()
RETURNS void AS $$
DECLARE
  job_record RECORD;
BEGIN
  -- Find freelance jobs expiring in 3 days
  FOR job_record IN
    SELECT j.id, j.title, e.email, e.company_name
    FROM jobs j
    JOIN employers e ON j.employer_id = e.id
    WHERE j.is_freelance = true 
      AND j.freelance_until IS NOT NULL
      AND j.freelance_until BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      AND j.status = 'active'
  LOOP
    -- Here you could send notifications or create notification records
    -- For now, we'll just insert into a notifications table if it exists
    INSERT INTO notifications (user_id, title, message, created_at)
    SELECT p.user_id, 
           'Freelance Job Expiring Soon',
           'Your freelance job "' || job_record.title || '" will expire in 3 days.',
           NOW()
    FROM profiles p
    WHERE p.employer_id = (
      SELECT employer_id FROM jobs WHERE id = job_record.id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Final verification and status report
DO $$
DECLARE
    freelance_count INTEGER;
    total_jobs INTEGER;
BEGIN
    SELECT COUNT(*) INTO freelance_count FROM jobs WHERE is_freelance = true;
    SELECT COUNT(*) INTO total_jobs FROM jobs;
    
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Total jobs: %, Freelance jobs: %', total_jobs, freelance_count;
    RAISE NOTICE 'Freelance job functionality is now fully supported.';
END $$;

-- Success message
SELECT 'Freelance jobs database setup completed successfully! ✅' as status;