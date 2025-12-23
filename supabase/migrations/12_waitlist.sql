-- Waitlist table for launch phase
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  whatsapp text,
  role text check (role in ('creator','editor','agency') or role is null),
  joined_at timestamptz not null default now(),
  status text not null check (status in ('waitlisted','invited','paid')) default 'waitlisted'
);

-- Helpful indexes
create index if not exists waitlist_status_idx on public.waitlist(status);
create index if not exists waitlist_joined_at_idx on public.waitlist(joined_at desc);

-- Optional: basic RLS (adjust as needed)
alter table public.waitlist enable row level security;

-- Allow service role full access; anonymous only insert
create policy waitlist_insert on public.waitlist
  for insert
  to anon
  with check (true);

-- Admin/service select and update
create policy waitlist_read_update on public.waitlist
  for all
  to service_role
  using (true)
  with check (true);
