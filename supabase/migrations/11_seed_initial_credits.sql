-- ================================
-- SEED INITIAL CREDITS FOR EXISTING USERS
-- ================================

INSERT INTO public.credits (user_id, balance)
SELECT id, 10000
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
