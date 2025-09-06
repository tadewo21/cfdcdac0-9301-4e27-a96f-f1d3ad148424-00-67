BEGIN;

-- 1) Normalize all employer emails to lowercase for consistent matching
UPDATE public.employers SET email = lower(email);

-- 2) Remove duplicate employers per email, keeping the most recently updated row
DELETE FROM public.employers e
USING (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY email
             ORDER BY updated_at DESC NULLS LAST, created_at DESC
           ) AS rn
    FROM public.employers
  ) t
  WHERE t.rn > 1
) d
WHERE e.id = d.id;

-- 3) Enforce a single employer per email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'employers_email_unique'
  ) THEN
    ALTER TABLE public.employers
    ADD CONSTRAINT employers_email_unique UNIQUE (email);
  END IF;
END $$;

-- 4) Ensure updated_at is maintained on updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_employers_updated_at'
  ) THEN
    CREATE TRIGGER update_employers_updated_at
    BEFORE UPDATE ON public.employers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

COMMIT;