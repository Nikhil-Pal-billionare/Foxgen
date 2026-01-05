create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  discount_type text, -- percent | flat
  discount_value int,
  max_uses int,
  influencer_id uuid references influencers(id),
  active boolean default true,
  expires_at timestamp,
  created_at timestamp default now()
);
