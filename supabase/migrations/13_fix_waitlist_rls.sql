-- Run this in your Supabase SQL Editor to fix the "new row violates row-level security policy" error

-- 1. Enable RLS (if not already enabled)
alter table public.waitlist enable row level security;

-- 2. Create a policy to allow anonymous users (anyone visiting the site) to insert their email
-- We use "if not exists" logic by dropping first to avoid errors if you run it multiple times
drop policy if exists "Enable insert for anon users only" on public.waitlist;

create policy "Enable insert for anon users only"
on public.waitlist
for insert
to anon
with check (true);

-- 3. Grant usage on the sequence if needed (usually handled automatically, but good to be safe)
grant usage, select on sequence waitlist_id_seq to anon;
