-- Update handle_new_user to include waitlist credits and set a realistic default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  waitlist_credits INTEGER := 0;
BEGIN
  INSERT INTO public.profiles(id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Check for pre-purchased credits from waitlist
  SELECT credits INTO waitlist_credits 
  FROM public.waitlist 
  WHERE email = NEW.email AND status = 'paid';

  -- Give default 50 credits + any purchased credits
  -- Default reduced from 10000 to 50 to make paid plans valuable
  INSERT INTO public.credits(user_id, balance)
  VALUES (NEW.id, 50 + COALESCE(waitlist_credits, 0))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
