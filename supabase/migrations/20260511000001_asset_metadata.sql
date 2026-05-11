-- public.asset_metadata
-- Overrides admin-editáveis para metadados de assets (image/video/audio),
-- chaveados por (asset_type, asset_key) onde asset_key é o filename canônico.
-- Não duplica dados estáticos (defaults em código continuam); apenas grava o que foi editado.

create table if not exists public.asset_metadata (
  asset_type text not null,
  asset_key  text not null,
  title      text,
  caption    text,
  author     text,
  year       text,
  source_url text,
  tags       text[] not null default '{}'::text[],
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (asset_type, asset_key)
);

create index if not exists asset_metadata_type_idx
  on public.asset_metadata (asset_type);

create or replace function public.tg_asset_metadata_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists asset_metadata_set_updated_at on public.asset_metadata;
create trigger asset_metadata_set_updated_at
  before update on public.asset_metadata
  for each row execute function public.tg_asset_metadata_set_updated_at();

alter table public.asset_metadata enable row level security;

drop policy if exists asset_metadata_select_authenticated on public.asset_metadata;
create policy asset_metadata_select_authenticated
  on public.asset_metadata for select
  to authenticated
  using (true);

drop policy if exists asset_metadata_admin_insert on public.asset_metadata;
create policy asset_metadata_admin_insert
  on public.asset_metadata for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists asset_metadata_admin_update on public.asset_metadata;
create policy asset_metadata_admin_update
  on public.asset_metadata for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists asset_metadata_admin_delete on public.asset_metadata;
create policy asset_metadata_admin_delete
  on public.asset_metadata for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
