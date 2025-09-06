-- Add notification preferences to profiles table
-- This allows users to specify which job categories, locations, and keywords they want to be notified about

-- 1. Add notification preference columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_categories TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_locations TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_keywords TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_job_types TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_experience_levels TEXT[] DEFAULT '{}';

-- 2. Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_profiles_notification_enabled ON public.profiles(notification_enabled) WHERE notification_enabled = true;
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- 3. Create a function to check if a job matches user preferences
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
    
    -- Check if job matches any of the user's preferences
    -- Category match
    IF array_length(user_categories, 1) > 0 AND NOT (job_category = ANY(user_categories)) THEN
        RETURN false;
    END IF;
    
    -- Location match (case-insensitive)
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
    
    -- Job type match
    IF array_length(user_job_types, 1) > 0 AND job_type IS NOT NULL AND NOT (job_type = ANY(user_job_types)) THEN
        RETURN false;
    END IF;
    
    -- Experience level match
    IF array_length(user_experience_levels, 1) > 0 AND job_experience_level IS NOT NULL AND NOT (job_experience_level = ANY(user_experience_levels)) THEN
        RETURN false;
    END IF;
    
    -- Keyword match in title or description
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

-- 4. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.job_matches_user_preferences TO authenticated, anon, service_role;

-- 5. Update RLS policies for profiles to allow users to update their notification preferences
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 6. Create sample notification preferences for testing (optional)
-- This can help users understand how to set preferences
COMMENT ON COLUMN public.profiles.notification_categories IS 'Job categories the user wants to be notified about (e.g. Technology, Finance, Healthcare)';
COMMENT ON COLUMN public.profiles.notification_locations IS 'Locations/cities the user wants job notifications for (e.g. Addis Ababa, Hawassa)';
COMMENT ON COLUMN public.profiles.notification_keywords IS 'Keywords to match in job title or description (e.g. React, Manager, Remote)';
COMMENT ON COLUMN public.profiles.notification_enabled IS 'Whether the user wants to receive any notifications at all';
COMMENT ON COLUMN public.profiles.email_notifications IS 'Whether the user wants to receive email notifications';
COMMENT ON COLUMN public.profiles.telegram_notifications IS 'Whether the user wants to receive Telegram notifications';
COMMENT ON COLUMN public.profiles.notification_job_types IS 'Job types the user is interested in (e.g. Full-time, Part-time, Contract)';
COMMENT ON COLUMN public.profiles.notification_experience_levels IS 'Experience levels the user is interested in (e.g. Entry Level, Mid Level, Senior)';

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';