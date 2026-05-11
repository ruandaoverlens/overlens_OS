-- Storage buckets do Mycelium + RLS policies espelhando o padrão de
-- platform-assets (privado) e asset-previews (público).
--
--   - mycelium-attachments: privado, originais (image/video/audio/pdf)
--   - mycelium-previews:    público, thumbs e capas (image/*)
--
-- Permissões:
--   - leitura: authenticated (attachments) / pública (previews)
--   - insert/update: staff ou admin
--   - delete: apenas admin

insert into storage.buckets (id, name, public)
values ('mycelium-attachments', 'mycelium-attachments', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mycelium-previews', 'mycelium-previews', true)
on conflict (id) do nothing;

-- ============================================================
-- mycelium-attachments (privado)
-- ============================================================
drop policy if exists "mycelium-attachments: authenticated read" on storage.objects;
create policy "mycelium-attachments: authenticated read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'mycelium-attachments');

drop policy if exists "mycelium-attachments: staff/admin insert" on storage.objects;
create policy "mycelium-attachments: staff/admin insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'mycelium-attachments'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists "mycelium-attachments: staff/admin update" on storage.objects;
create policy "mycelium-attachments: staff/admin update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'mycelium-attachments'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists "mycelium-attachments: admin delete" on storage.objects;
create policy "mycelium-attachments: admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'mycelium-attachments'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- mycelium-previews (público)
-- ============================================================
drop policy if exists "mycelium-previews: public read" on storage.objects;
create policy "mycelium-previews: public read"
  on storage.objects for select
  using (bucket_id = 'mycelium-previews');

drop policy if exists "mycelium-previews: staff/admin insert" on storage.objects;
create policy "mycelium-previews: staff/admin insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'mycelium-previews'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists "mycelium-previews: staff/admin update" on storage.objects;
create policy "mycelium-previews: staff/admin update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'mycelium-previews'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists "mycelium-previews: admin delete" on storage.objects;
create policy "mycelium-previews: admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'mycelium-previews'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
