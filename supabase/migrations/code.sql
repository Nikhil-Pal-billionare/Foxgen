create table code_usages (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references discount_codes(id),
  user_id uuid,
  discount_amount int,
  created_at timestamp default now()
);
