-- Fix security warning: Function Search Path Mutable
-- Update the handle_new_user function to have proper search_path

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile with better error handling
    INSERT INTO public.profiles (user_id, full_name, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'job_seeker')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        user_type = COALESCE(public.profiles.user_type, EXCLUDED.user_type);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;