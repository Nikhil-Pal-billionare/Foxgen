-- Enable RLS on credits table (if not already enabled)
alter table credits enable row level security;

-- Allow users to READ their own credits
create policy "read own credits"
on credits
for select
using (auth.uid() = user_id);
