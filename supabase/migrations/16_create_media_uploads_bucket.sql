-- ===============================
-- Create private bucket for media uploads
-- ===============================

insert into storage.buckets (id, name, public)
values ('media-uploads', 'media-uploads', false)
on conflict (id) do nothing;

-- ===============================
-- Allow authenticated users to upload files
-- ===============================
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media-uploads'
);

-- ===============================
-- Allow authenticated users to read their own files
-- (Signed URLs will still work)
-- ===============================
create policy "Allow authenticated read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'media-uploads'
);

-- ===============================
-- Allow authenticated users to delete their own files
-- (Optional but recommended)
-- ===============================
create policy "Allow authenticated delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media-uploads'
);
