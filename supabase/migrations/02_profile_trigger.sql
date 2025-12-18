-- ================================
-- PROFILE UPDATE TIMESTAMP
-- ================================

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_profile_updated_at'
  ) THEN
    CREATE TRIGGER set_profile_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_profile_updated_at();
  END IF;
END $$;
