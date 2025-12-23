create table influencers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  status text default 'pending',
  commission_percent int,
  created_at timestamp default now()
);
