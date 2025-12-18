-- ================================
-- USER PROFILE TABLE (1:1 with auth.users)
-- ================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- Sync email from auth.users → profiles
-- ================================

CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email,
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'sync_email_trigger'
  ) THEN
    CREATE TRIGGER sync_email_trigger
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_email();
  END IF;
END $$;

-- ================================
-- Create profile automatically on signup
-- ================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles(id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.credits(user_id, balance)
  VALUES (NEW.id, 10000)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ================================
-- Row Level Security
-- ================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'User can view own profile'
  ) THEN
    CREATE POLICY "User can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'User can update own profile'
  ) THEN
    CREATE POLICY "User can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;
