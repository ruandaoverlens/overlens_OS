-- Storage bucket do módulo "Ativos Registrados": registro-docs.
--
-- Bucket privado para certificados, protocolos, despachos e demais
-- documentos ligados aos processos de registro de marca junto ao INPI.
-- Acesso restrito a administradores (public.is_admin()).

insert into storage.buckets (id, name, public)
values ('registro-docs', 'registro-docs', false)
on conflict (id) do nothing;

-- ============================================================
-- registro-docs (privado)
-- ============================================================
drop policy if exists "registro-docs: admin select" on storage.objects;
create policy "registro-docs: admin select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'registro-docs' and public.is_admin());

drop policy if exists "registro-docs: admin insert" on storage.objects;
create policy "registro-docs: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'registro-docs' and public.is_admin());

drop policy if exists "registro-docs: admin update" on storage.objects;
create policy "registro-docs: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'registro-docs' and public.is_admin());

drop policy if exists "registro-docs: admin delete" on storage.objects;
create policy "registro-docs: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'registro-docs' and public.is_admin());
