-- Add missing columns to profiles table for user management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Add company verification columns to employers table
ALTER TABLE employers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_employers_is_verified ON employers(is_verified);

-- Create RLS policies for admin access to suspension data
CREATE POLICY "Admins can manage user suspension" ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.user_type = 'admin'
    )
  );

-- Create RLS policy for company verification
CREATE POLICY "Admins can manage company verification" ON employers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.user_type = 'admin'
    )
  );

-- Function to suspend user and deactivate their content
CREATE OR REPLACE FUNCTION suspend_user(
  target_user_id UUID,
  admin_email TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID from email
  SELECT user_id INTO admin_user_id
  FROM profiles WHERE email = admin_email AND user_type = 'admin'
  LIMIT 1;

  -- Update user profile
  UPDATE profiles SET 
    is_suspended = TRUE,
    suspended_at = NOW(),
    suspended_by = admin_user_id,
    suspension_reason = reason
  WHERE user_id = target_user_id;
  
  -- Deactivate employer's jobs if they are an employer
  UPDATE jobs SET status = 'inactive'
  WHERE employer_id IN (
    SELECT e.id FROM employers e
    JOIN profiles p ON e.id = p.employer_id
    WHERE p.user_id = target_user_id
  )
  AND status IN ('active', 'pending');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unsuspend user
CREATE OR REPLACE FUNCTION unsuspend_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles SET 
    is_suspended = FALSE,
    suspended_at = NULL,
    suspended_by = NULL,
    suspension_reason = NULL
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify company
CREATE OR REPLACE FUNCTION verify_company(
  target_employer_id UUID,
  admin_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID from email
  SELECT user_id INTO admin_user_id
  FROM profiles WHERE email = admin_email AND user_type = 'admin'
  LIMIT 1;

  UPDATE employers SET 
    is_verified = TRUE,
    verified_at = NOW(),
    verified_by = admin_user_id
  WHERE id = target_employer_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unverify company
CREATE OR REPLACE FUNCTION unverify_company(target_employer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE employers SET 
    is_verified = FALSE,
    verified_at = NULL,
    verified_by = NULL
  WHERE id = target_employer_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset user password (admin only)
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  target_user_id UUID,
  admin_email TEXT,
  new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Verify admin permissions
  SELECT user_id INTO admin_user_id
  FROM profiles WHERE email = admin_email AND user_type = 'admin'
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset passwords';
  END IF;

  -- Note: This function would typically interface with Supabase Auth
  -- For now, it serves as a placeholder for the password reset functionality
  -- In production, this would need to be implemented through Supabase Auth API
  
  -- Log the password reset attempt
  INSERT INTO notifications (user_id, title, message, is_read, created_at)
  VALUES (
    target_user_id,
    'Password Reset by Admin',
    'Your password has been reset by an administrator. Please check your email for new login instructions.',
    FALSE,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;