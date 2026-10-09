begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('vehicle-photos', 'vehicle-photos', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('review-photos', 'review-photos', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('message-attachments', 'message-attachments', false, 20971520, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy public_media_read
on storage.objects for select
to anon, authenticated
using (bucket_id in ('avatars','vehicle-photos','review-photos'));

create policy users_upload_own_media
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('avatars','vehicle-photos','review-photos','message-attachments')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy users_update_own_media
on storage.objects for update
to authenticated
using (owner_id = (select auth.uid())::text)
with check (owner_id = (select auth.uid())::text);

create policy users_delete_own_media
on storage.objects for delete
to authenticated
using (owner_id = (select auth.uid())::text);

create policy users_read_own_private_attachments
on storage.objects for select
to authenticated
using (
  bucket_id = 'message-attachments'
  and owner_id = (select auth.uid())::text
);

commit;
