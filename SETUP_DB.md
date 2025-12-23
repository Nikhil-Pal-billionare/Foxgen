# Database Setup Required

The application requires the `waitlist` table to be created in your Supabase database.
Since the migration could not be applied automatically, please follow these steps:

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Go to the **SQL Editor** (icon on the left sidebar).
4.  Click **"New Query"**.
5.  Copy and paste the following SQL code:

```sql
-- Create the waitlist table
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  whatsapp text,
  role text check (role in ('creator','editor','agency') or role is null),
  joined_at timestamptz not null default now(),
  status text not null check (status in ('waitlisted','invited','paid')) default 'waitlisted'
);

-- Create indexes
create index if not exists waitlist_status_idx on public.waitlist(status);
create index if not exists waitlist_joined_at_idx on public.waitlist(joined_at desc);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Allow anonymous inserts (for the landing page)
create policy "Enable insert for everyone" on public.waitlist
  for insert
  to anon
  with check (true);

-- Allow service role full access
create policy "Enable full access for service role" on public.waitlist
  for all
  to service_role
  using (true)
  with check (true);
```

6.  Click **"Run"**.
7.  After the query runs successfully, go to **Project Settings > API** and click **"Reload Schema Cache"** (if available) or just restart your Next.js server.
