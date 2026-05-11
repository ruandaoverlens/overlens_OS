-- public.ads — Banco de Anúncios
-- Diferente de asset_metadata: ad é uma entidade própria que pode agrupar
-- N arquivos de mídia (carrossel) e carrega métricas de performance editáveis.

create extension if not exists "uuid-ossp";

create table if not exists public.ads (
  id                 uuid primary key default uuid_generate_v4(),
  type               text not null check (type in ('image','video','carousel')),
  title              text not null,
  platform           text,
  -- Métricas (todas opcionais, percentuais armazenados como numeric com 2 casas)
  ctr                numeric(6,3),
  retention_seconds  numeric(6,1),
  retention_percent  numeric(5,2),
  conversion         numeric(6,3),
  notes              text,
  tags               text[] not null default '{}'::text[],
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references auth.users(id) on delete set null
);

create index if not exists ads_created_at_idx on public.ads (created_at desc);
create index if not exists ads_platform_idx on public.ads (platform);
create index if not exists ads_type_idx on public.ads (type);

create table if not exists public.ad_media (
  id            uuid primary key default uuid_generate_v4(),
  ad_id         uuid not null references public.ads(id) on delete cascade,
  sort_order    int  not null default 0,
  storage_path  text not null,
  preview_path  text,
  mime_type     text,
  filename      text,
  created_at    timestamptz not null default now()
);

create index if not exists ad_media_ad_id_idx on public.ad_media (ad_id, sort_order);

create or replace function public.tg_ads_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ads_set_updated_at on public.ads;
create trigger ads_set_updated_at
  before update on public.ads
  for each row execute function public.tg_ads_set_updated_at();

-- RLS
alter table public.ads enable row level security;
alter table public.ad_media enable row level security;

-- ads: select para qualquer authenticated; insert/update/delete para staff e admin
drop policy if exists ads_select_authenticated on public.ads;
create policy ads_select_authenticated
  on public.ads for select
  to authenticated
  using (true);

drop policy if exists ads_staff_insert on public.ads;
create policy ads_staff_insert
  on public.ads for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

drop policy if exists ads_staff_update on public.ads;
create policy ads_staff_update
  on public.ads for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

drop policy if exists ads_staff_delete on public.ads;
create policy ads_staff_delete
  on public.ads for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

-- ad_media: mesmas regras de ads
drop policy if exists ad_media_select_authenticated on public.ad_media;
create policy ad_media_select_authenticated
  on public.ad_media for select
  to authenticated
  using (true);

drop policy if exists ad_media_staff_insert on public.ad_media;
create policy ad_media_staff_insert
  on public.ad_media for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

drop policy if exists ad_media_staff_update on public.ad_media;
create policy ad_media_staff_update
  on public.ad_media for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

drop policy if exists ad_media_staff_delete on public.ad_media;
create policy ad_media_staff_delete
  on public.ad_media for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );
