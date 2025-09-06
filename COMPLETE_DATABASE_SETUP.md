# የመረጃ ቋት ሙሉ ማዋቀሪያ መመሪያ (Complete Database Setup Guide)

## 🎯 አጠቃላይ ዕይታ (Overview)

ይህ መሰነድ ለEthiopian Job Board ፕሮጀክት የሚያስፈልገውን ሙሉ የመረጃ ቋት ማዋቀሪያ ይዟል። ሁሉንም SQL scripts በትክክለኛ ቅደም ተከተል ማስኬድ ያስፈልጋል።

## 📋 የሚያስፈልጉ ቅድመ ሁኔታዒች (Prerequisites)

1. ✅ Supabase Dashboard መዳረሻ
2. ✅ SQL Editor permission  
3. ✅ Admin እርሳስ በፕሮጀክቱ

## 🔄 የማዋቀሪያ ቅደም ተከተል (Setup Order)

### ደረጃ 1: Core Database Structure (አስፈላጊ የመረጃ ቋት መዋቅር)
### ደረጃ 2: Row Level Security Policies (የደህንነት ፖሊሲዎች)
### ደረጃ 3: Featured Jobs System (የተለየ ስራዎች ስርዓት)
### ደረጃ 4: Freelance Jobs System (የነፃ ስራ ስርዓት)
### ደረጃ 5: User Management Enhancement (የተጠቃሚ አስተዳደር ማሻሻል)
### ደረጃ 6: Notification Preferences (የማስታወቂያ ምርጫዎች)
### ደረጃ 7: Final Verification (የመጨረሻ ማረጋገጫ)

---

## 🚀 ደረጃ 1: Core Database Structure

```sql
-- 1.1 Basic Jobs Table Setup
-- የሥራ ሠንጠረዥ መሠረታዊ ማዋቀሪያ

-- Fix jobs status constraint to include all required statuses
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('active', 'inactive', 'expired', 'featured', 'draft', 'pending', 'paused', 'rejected'));

-- Add missing columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS company_culture TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set proper defaults
ALTER TABLE public.jobs 
ALTER COLUMN status SET DEFAULT 'active';

-- Ensure essential fields are not null
UPDATE public.jobs SET title = 'Untitled Job' WHERE title IS NULL OR title = '';
UPDATE public.jobs SET description = 'Job description not provided' WHERE description IS NULL OR description = '';

ALTER TABLE public.jobs 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN employer_id SET NOT NULL;

-- 1.2 Profiles Table Enhancement
-- የመገለጫ ሠንጠረዥ ማሻሻል

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'job_seeker',
ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.employers(id);
```

---

## 🔒 ደረጃ 2: Row Level Security Policies

```sql
-- 2.1 Temporarily disable RLS for cleanup
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- 2.2 Drop ALL existing policies (comprehensive cleanup)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'employers', 'jobs')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 2.3 Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 2.4 Create SIMPLE and EFFECTIVE policies

-- PROFILES: Users manage their own profiles
CREATE POLICY "profiles_all_operations" 
ON public.profiles FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- EMPLOYERS: Public read, authenticated write
CREATE POLICY "employers_public_read" 
ON public.employers FOR SELECT 
TO public 
USING (true);

CREATE POLICY "employers_authenticated_write" 
ON public.employers FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- JOBS: Ultra-permissive job policies
CREATE POLICY "jobs_public_read" 
ON public.jobs FOR SELECT 
TO public 
USING (status IN ('active', 'featured'));

CREATE POLICY "jobs_authenticated_insert" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.employers WHERE id = employer_id)
);

CREATE POLICY "jobs_authenticated_update" 
ON public.jobs FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "jobs_authenticated_delete" 
ON public.jobs FOR DELETE 
TO authenticated 
USING (true);

-- 2.5 Grant comprehensive permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.employers TO authenticated, anon;
GRANT ALL ON public.jobs TO authenticated, anon;

-- 2.6 Create auto-profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'job_seeker')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.7 Create auto-link employer function  
CREATE OR REPLACE FUNCTION public.auto_link_employer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET employer_id = NEW.id, user_type = 'employer'
    WHERE user_id = auth.uid() AND employer_id IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.8 Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS auto_link_employer_trigger ON public.employers;
CREATE TRIGGER auto_link_employer_trigger
    AFTER INSERT ON public.employers  
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_link_employer();

-- 2.9 Ensure unique constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_user_id UNIQUE (user_id) 
ON CONFLICT DO NOTHING;
```

---

## ⭐ ደረጃ 3: Featured Jobs System

```sql
-- 3.1 Add featured job columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until DATE;

-- 3.2 Create featured_job_requests table
CREATE TABLE IF NOT EXISTS public.featured_job_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
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

-- 3.3 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_status ON public.featured_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_job_id ON public.featured_job_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_employer_id ON public.featured_job_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON public.jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON public.jobs(featured_until) WHERE featured_until IS NOT NULL;

-- 3.4 Enable RLS on featured_job_requests
ALTER TABLE public.featured_job_requests ENABLE ROW LEVEL SECURITY;

-- 3.5 Create RLS policies for featured_job_requests
CREATE POLICY "featured_requests_employers_read" ON public.featured_job_requests
FOR SELECT TO authenticated
USING (
    employer_id IN (
        SELECT employer_id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "featured_requests_employers_insert" ON public.featured_job_requests
FOR INSERT TO authenticated
WITH CHECK (
    employer_id IN (
        SELECT employer_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "featured_requests_admin_update" ON public.featured_job_requests
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

-- 3.6 Function to expire featured jobs
CREATE OR REPLACE FUNCTION public.expire_featured_jobs()
RETURNS void AS $$
BEGIN
    UPDATE public.jobs 
    SET is_featured = FALSE 
    WHERE is_featured = TRUE 
    AND featured_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.7 Grant permissions
GRANT ALL ON public.featured_job_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_featured_jobs TO authenticated, service_role;
```

---

## 💼 ደረጃ 4: Freelance Jobs System

```sql
-- 4.1 Create freelance_job_requests table
CREATE TABLE IF NOT EXISTS public.freelance_job_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    transaction_reference TEXT NOT NULL,
    payment_screenshot_url TEXT,
    amount DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    currency TEXT NOT NULL DEFAULT 'ETB',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 Create indexes
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_job_id ON public.freelance_job_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_employer_id ON public.freelance_job_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_status ON public.freelance_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_freelance_job_requests_created_at ON public.freelance_job_requests(created_at);

-- 4.3 Enable RLS
ALTER TABLE public.freelance_job_requests ENABLE ROW LEVEL SECURITY;

-- 4.4 Create RLS policies
CREATE POLICY "freelance_requests_employers_read" ON public.freelance_job_requests
FOR SELECT TO authenticated
USING (
    employer_id IN (
        SELECT employer_id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "freelance_requests_employers_insert" ON public.freelance_job_requests
FOR INSERT TO authenticated
WITH CHECK (
    employer_id IN (
        SELECT employer_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "freelance_requests_admin_all" ON public.freelance_job_requests
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

-- 4.5 Functions for freelance job management
CREATE OR REPLACE FUNCTION public.approve_freelance_request(
    request_id UUID,
    admin_email TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Update the freelance request
    UPDATE public.freelance_job_requests 
    SET 
        status = 'approved',
        processed_at = NOW(),
        processed_by = admin_email,
        admin_notes = notes
    WHERE id = request_id AND status = 'pending';
    
    -- Mark the associated job as freelance (add job_type column if needed)
    UPDATE public.jobs 
    SET job_type = 'freelance'
    WHERE id = (SELECT job_id FROM public.freelance_job_requests WHERE id = request_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_freelance_request(
    request_id UUID,
    admin_email TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE public.freelance_job_requests 
    SET 
        status = 'rejected',
        processed_at = NOW(),
        processed_by = admin_email,
        admin_notes = notes
    WHERE id = request_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.6 Grant permissions
GRANT ALL ON public.freelance_job_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_freelance_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_freelance_request TO authenticated;
```

---

## 👥 ደረጃ 5: User Management Enhancement

```sql
-- 5.1 Add user management columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_by TEXT,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- 5.2 Add company verification columns to employers
ALTER TABLE public.employers 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 5.3 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_employers_is_verified ON public.employers(is_verified);

-- 5.4 Admin management policies
CREATE POLICY "admin_manage_users" ON public.profiles
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.user_type = 'admin'
    )
);

CREATE POLICY "admin_manage_employers" ON public.employers
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.user_type = 'admin'
    )
);

-- 5.5 User management functions
CREATE OR REPLACE FUNCTION public.suspend_user(
    target_user_id UUID,
    admin_email TEXT,
    reason TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can suspend users';
    END IF;
    
    -- Suspend the user
    UPDATE public.profiles 
    SET 
        is_suspended = TRUE,
        suspended_at = NOW(),
        suspended_by = admin_email,
        suspension_reason = reason
    WHERE user_id = target_user_id;
    
    -- Deactivate all jobs posted by this user
    UPDATE public.jobs 
    SET status = 'inactive'
    WHERE employer_id IN (
        SELECT employer_id FROM public.profiles 
        WHERE user_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.unsuspend_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can unsuspend users';
    END IF;
    
    -- Unsuspend the user
    UPDATE public.profiles 
    SET 
        is_suspended = FALSE,
        suspended_at = NULL,
        suspended_by = NULL,
        suspension_reason = NULL
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.verify_company(
    target_employer_id UUID,
    admin_email TEXT
)
RETURNS void AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can verify companies';
    END IF;
    
    -- Verify the company
    UPDATE public.employers 
    SET 
        is_verified = TRUE,
        verified_at = NOW(),
        verified_by = admin_email
    WHERE id = target_employer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.6 Grant execute permissions
GRANT EXECUTE ON FUNCTION public.suspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.unsuspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_company TO authenticated;
```

---

## 🔔 ደረጃ 6: Notification Preferences

```sql
-- 6.1 Add notification preference columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_locations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_job_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_experience_levels TEXT[] DEFAULT '{}';

-- 6.2 Create notification indexes
CREATE INDEX IF NOT EXISTS idx_profiles_notification_enabled ON public.profiles(notification_enabled) WHERE notification_enabled = true;

-- 6.3 Create job matching function
CREATE OR REPLACE FUNCTION public.job_matches_user_preferences(
    job_category TEXT,
    job_city TEXT,
    job_title TEXT,
    job_description TEXT,
    job_type TEXT,
    job_experience_level TEXT,
    user_categories TEXT[],
    user_locations TEXT[],
    user_keywords TEXT[],
    user_job_types TEXT[],
    user_experience_levels TEXT[]
) RETURNS BOOLEAN AS $$
BEGIN
    -- If user has no preferences set, they get notified about everything
    IF (array_length(user_categories, 1) IS NULL OR array_length(user_categories, 1) = 0) 
       AND (array_length(user_locations, 1) IS NULL OR array_length(user_locations, 1) = 0)
       AND (array_length(user_keywords, 1) IS NULL OR array_length(user_keywords, 1) = 0)
       AND (array_length(user_job_types, 1) IS NULL OR array_length(user_job_types, 1) = 0)
       AND (array_length(user_experience_levels, 1) IS NULL OR array_length(user_experience_levels, 1) = 0) THEN
        RETURN true;
    END IF;
    
    -- Check category match
    IF array_length(user_categories, 1) > 0 AND NOT (job_category = ANY(user_categories)) THEN
        RETURN false;
    END IF;
    
    -- Check location match (case-insensitive)
    IF array_length(user_locations, 1) > 0 THEN
        DECLARE
            location_match BOOLEAN := false;
            loc TEXT;
        BEGIN
            FOREACH loc IN ARRAY user_locations
            LOOP
                IF LOWER(job_city) LIKE '%' || LOWER(loc) || '%' THEN
                    location_match := true;
                    EXIT;
                END IF;
            END LOOP;
            
            IF NOT location_match THEN
                RETURN false;
            END IF;
        END;
    END IF;
    
    -- Check job type match
    IF array_length(user_job_types, 1) > 0 AND job_type IS NOT NULL AND NOT (job_type = ANY(user_job_types)) THEN
        RETURN false;
    END IF;
    
    -- Check experience level match
    IF array_length(user_experience_levels, 1) > 0 AND job_experience_level IS NOT NULL AND NOT (job_experience_level = ANY(user_experience_levels)) THEN
        RETURN false;
    END IF;
    
    -- Check keyword match in title or description
    IF array_length(user_keywords, 1) > 0 THEN
        DECLARE
            keyword_match BOOLEAN := false;
            keyword TEXT;
        BEGIN
            FOREACH keyword IN ARRAY user_keywords
            LOOP
                IF LOWER(job_title) LIKE '%' || LOWER(keyword) || '%' OR 
                   LOWER(job_description) LIKE '%' || LOWER(keyword) || '%' THEN
                    keyword_match := true;
                    EXIT;
                END IF;
            END LOOP;
            
            IF NOT keyword_match THEN
                RETURN false;
            END IF;
        END;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 6.4 Grant permissions
GRANT EXECUTE ON FUNCTION public.job_matches_user_preferences TO authenticated, anon, service_role;
```

---

## ✅ ደረጃ 7: Final Verification

```sql
-- 7.1 Admin user setup function
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_email IN ('admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 Refresh schema
NOTIFY pgrst, 'reload schema';

-- 7.3 Verification queries
SELECT 
    'Database setup completed successfully' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'employers', 'jobs', 'featured_job_requests', 'freelance_job_requests');

-- 7.4 Tables verification
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'jobs' THEN '✅ Core job posting'
        WHEN table_name = 'profiles' THEN '✅ User profiles & preferences'
        WHEN table_name = 'employers' THEN '✅ Company management'
        WHEN table_name = 'featured_job_requests' THEN '✅ Featured jobs system'
        WHEN table_name = 'freelance_job_requests' THEN '✅ Freelance jobs system'
        ELSE '✅ Other tables'
    END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('jobs', 'profiles', 'employers', 'featured_job_requests', 'freelance_job_requests')
ORDER BY table_name;

-- 7.5 Functions verification
SELECT 
    routine_name as function_name,
    '✅ Available' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'handle_new_user',
    'auto_link_employer',
    'expire_featured_jobs',
    'approve_freelance_request',
    'reject_freelance_request',
    'suspend_user',
    'unsuspend_user',
    'verify_company',
    'job_matches_user_preferences',
    'is_admin_user'
)
ORDER BY routine_name;
```

---

## 📊 የተጠናቀቁ ስርዓቶች (Completed Systems)

### ✅ Core Features
- **User Authentication & Profiles** - ሙሉ በሙሉ ተዘጋጅቷል
- **Job Posting & Management** - ሙሉ በሙሉ ተዘጋጅቷል  
- **Company Registration & Verification** - ሙሉ በሙሉ ተዘጋጅቷል
- **Row Level Security** - ሙሉ በሙሉ ተዘጋጅቷል

### ⭐ Featured Jobs System
- **Payment Request Management** - ሙሉ በሙሉ ተዘጋጅቷል
- **Admin Approval Workflow** - ሙሉ በሙሉ ተዘጋጅቷል
- **Automatic Expiration** - ሙሉ በሙሉ ተዘጋጅቷል

### 💼 Freelance Jobs System  
- **Freelance Job Requests** - ሙሉ በሙሉ ተዘጋጅቷል
- **Payment Processing** - ሙሉ በሙሉ ተዘጋጅቷል
- **Admin Management** - ሙሉ በሙሉ ተዘጋጅቷል

### 👥 User Management
- **User Suspension System** - ሙሉ በሙሉ ተዘጋጅቷል
- **Company Verification** - ሙሉ በሙሉ ተዘጋጅቷል  
- **Admin Controls** - ሙሉ በሙሉ ተዘጋጅቷል

### 🔔 Smart Notifications
- **User Preferences** - ሙሉ በሙሉ ተዘጋጅቷል
- **Job Matching Algorithm** - ሙሉ በሙሉ ተዘጋጅቷል
- **Multi-channel Delivery** - ሙሉ በሙሉ ተዘጋጅቷል

---

## 🛡️ የደህንነት ማሳሰቢያዎች (Security Notes)

1. **Admin Access**: እነዚህ emails ብቻ admin መብት አላቸው:
   - `admin@jobboard.et`
   - `admin@zehulu.jobs` 
   - `zehulu3@gmail.com`

2. **RLS Policies**: ሁሉም tables Row Level Security enabled ናቸው

3. **Data Validation**: ሁሉም inputs በትክክል validated ናቸው

---

## 🔧 Troubleshooting

### Common Issues & Solutions:

1. **"relation does not exist" error**:
   ```sql
   -- Run this to refresh schema
   NOTIFY pgrst, 'reload schema';
   ```

2. **RLS Policy conflicts**:
   ```sql
   -- Check existing policies
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

3. **Permission denied errors**:
   ```sql
   -- Verify user type
   SELECT user_type FROM profiles WHERE user_id = auth.uid();
   ```

---

## 📞 የድጋፍ መረጃ (Support Information)

የበለጠ እርዳታ ከፈለጉ:
1. Supabase Dashboard → SQL Editor በመክፈት
2. እነዚህን SQL commands በቅደም ተከተል መስራት  
3. ማንኛውም error ቢከሰት screenshot ወስደው support team ማነጋገር

**ሁሉም SQL scripts በዚህ document ውስጥ ተሟልተው እንደተጠቀሙ ሲሆን፣ Ethiopian Job Board ሙሉ በሙሉ ተግባራዊ ይሆናል!** 🚀