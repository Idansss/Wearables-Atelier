-- ============================================================
--  PART 2: Storage bucket + policies
--  Run this AFTER Part 1 succeeds
-- ============================================================

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "uploads_public_read" on storage.objects;
drop policy if exists "uploads_admin_insert" on storage.objects;
drop policy if exists "uploads_admin_delete" on storage.objects;

create policy "uploads_public_read" on storage.objects
  for select using (bucket_id = 'uploads');

create policy "uploads_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'uploads'
    and exists (
      select 1 from admins
      where email = (select email from auth.users where id = auth.uid())
      and is_active = true
    )
  );

create policy "uploads_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'uploads'
    and exists (
      select 1 from admins
      where email = (select email from auth.users where id = auth.uid())
      and is_active = true
    )
  );
