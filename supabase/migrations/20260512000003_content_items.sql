-- public.content_items
-- Banco de Conteúdo: Templates, Documentação, Objetos 3D.
-- Diferente de asset_metadata (overrides de mídia com colunas fixas),
-- aqui cada linha é uma entidade própria com metadata arbitrário em JSON.
-- Aceita tanto arquivos quanto links externos (kind = 'file' | 'link').

create table if not exists public.content_items (
  storage_path text primary key,
  asset_type   text not null,
  kind         text not null check (kind in ('file', 'link')),
  metadata     jsonb not null default '{}'::jsonb,
  uploaded_by  uuid references auth.users(id) on delete set null,
  uploaded_at  timestamptz not null default now()
);

create index if not exists content_items_asset_type_idx
  on public.content_items (asset_type, uploaded_at desc);

alter table public.content_items enable row level security;

-- Leitura: qualquer usuário autenticado
drop policy if exists content_items_select_authenticated on public.content_items;
create policy content_items_select_authenticated
  on public.content_items for select
  to authenticated
  using (true);

-- Escrita: staff + admin (mesmo critério dos uploads de mídia)
drop policy if exists content_items_staff_insert on public.content_items;
create policy content_items_staff_insert
  on public.content_items for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

drop policy if exists content_items_staff_update on public.content_items;
create policy content_items_staff_update
  on public.content_items for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

drop policy if exists content_items_staff_delete on public.content_items;
create policy content_items_staff_delete
  on public.content_items for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );
