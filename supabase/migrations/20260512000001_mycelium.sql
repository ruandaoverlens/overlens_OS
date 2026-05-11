-- public.mycelium_references / public.mycelium_attachments
-- Banco de referências da marca Overlens (Mycelium).
-- Espelha a estrutura de permissões de /assets:
--   - leitura: qualquer usuário autenticado
--   - insert/update: staff ou admin
--   - delete: apenas admin
-- Anexos (mycelium_attachments) seguem a mesma regra das references —
-- escrita restrita a staff/admin, delete restrito a admin.

create table if not exists public.mycelium_references (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'artigo','video','imagem','audio','pdf','skill','post','site'
  )),
  title text not null,
  description text,
  url text,                    -- link primário (opcional)
  cover_path text,             -- thumbnail/capa em mycelium-previews
  tags text[] not null default '{}'::text[],
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mycelium_references_type_idx
  on public.mycelium_references (type, created_at desc);

create index if not exists mycelium_references_created_idx
  on public.mycelium_references (created_at desc);

create index if not exists mycelium_references_tags_idx
  on public.mycelium_references using gin (tags);

create table if not exists public.mycelium_attachments (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.mycelium_references(id) on delete cascade,
  storage_path text not null,        -- bucket: mycelium-attachments
  preview_path text,                 -- bucket: mycelium-previews
  kind text not null check (kind in ('image','video','audio','file')),
  mime_type text,
  size_bytes bigint,
  sort_order int not null default 0
);

create index if not exists mycelium_attachments_ref_idx
  on public.mycelium_attachments (reference_id, sort_order);

-- Trigger genérico para updated_at (criado com or replace para conviver
-- com outras migrations que possam declarar a mesma função).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mycelium_references_set_updated_at on public.mycelium_references;
create trigger mycelium_references_set_updated_at
  before update on public.mycelium_references
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS — mycelium_references
-- ============================================================
alter table public.mycelium_references enable row level security;

drop policy if exists mycelium_references_select_authenticated on public.mycelium_references;
create policy mycelium_references_select_authenticated
  on public.mycelium_references for select
  to authenticated
  using (auth.role() = 'authenticated');

drop policy if exists mycelium_references_staff_insert on public.mycelium_references;
create policy mycelium_references_staff_insert
  on public.mycelium_references for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists mycelium_references_staff_update on public.mycelium_references;
create policy mycelium_references_staff_update
  on public.mycelium_references for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists mycelium_references_admin_delete on public.mycelium_references;
create policy mycelium_references_admin_delete
  on public.mycelium_references for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- RLS — mycelium_attachments
-- ============================================================
alter table public.mycelium_attachments enable row level security;

drop policy if exists mycelium_attachments_select_authenticated on public.mycelium_attachments;
create policy mycelium_attachments_select_authenticated
  on public.mycelium_attachments for select
  to authenticated
  using (auth.role() = 'authenticated');

drop policy if exists mycelium_attachments_staff_insert on public.mycelium_attachments;
create policy mycelium_attachments_staff_insert
  on public.mycelium_attachments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists mycelium_attachments_staff_update on public.mycelium_attachments;
create policy mycelium_attachments_staff_update
  on public.mycelium_attachments for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('staff','admin')
    )
  );

drop policy if exists mycelium_attachments_admin_delete on public.mycelium_attachments;
create policy mycelium_attachments_admin_delete
  on public.mycelium_attachments for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Buckets de Storage (criar manualmente — não via migration)
-- ============================================================
-- A criação de buckets fica fora desta migration e deve ser feita via
-- Supabase Dashboard (Storage) ou MCP tool. Passos:
--
-- 1) Bucket: mycelium-attachments
--    - Public: false (privado — acesso via signed URL)
--    - File size limit: ~50MB (alinhar com vídeos curtos)
--    - Allowed MIME types: image/*, video/*, audio/*, application/pdf
--    - Policies: leitura para authenticated; insert/update para staff/admin;
--      delete para admin (espelhar policies das tabelas acima).
--
-- 2) Bucket: mycelium-previews
--    - Public: true (thumbs/capas servidas diretamente)
--    - File size limit: ~5MB
--    - Allowed MIME types: image/*
--    - Policies: leitura pública; insert/update para staff/admin;
--      delete para admin.
--
-- Após criar os buckets, conferir que o cliente Supabase consegue listar e
-- fazer upload com o role correto antes de habilitar a UI.
