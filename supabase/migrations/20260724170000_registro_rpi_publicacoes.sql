-- Módulo "Ativos Registrados" — cache local de publicações da RPI.
--
-- Persiste TODAS as publicações de marca das revistas (RPI) ingeridas pelo
-- radar, para servir a "consulta de disponibilidade de marcas" (ADR-0003) sem
-- depender de chamada externa a cada busca. A busca combina este cache local
-- (pré-filtro por similaridade trigram / fonética) com a consulta ao vivo da
-- Infosimples.
--
-- Segue o padrão da migration 20260724150000: RLS habilitado e policies
-- restritas a public.is_admin() (módulo é de uso exclusivo da administração).

-- Extensão para índice trigram (similaridade de texto no pré-filtro local).
create extension if not exists pg_trgm;

-- ============================================================
-- registro_rpi_publicacoes
-- ============================================================
create table if not exists public.registro_rpi_publicacoes (
  id uuid primary key default gen_random_uuid(),
  rpi_numero text not null,
  processo_numero text not null,
  marca_nome text not null,
  marca_normalizada text not null,
  marca_fonetica text,
  apresentacao text,
  classes text[] not null default '{}',
  titular text,
  despachos jsonb not null default '[]'::jsonb,
  data_publicacao date,
  created_at timestamptz not null default now(),
  unique (rpi_numero, processo_numero)
);

-- Índice trigram para pré-filtro por similaridade sobre a marca normalizada.
create index if not exists registro_rpi_publicacoes_marca_normalizada_trgm_idx
  on public.registro_rpi_publicacoes using gin (marca_normalizada gin_trgm_ops);

-- Índice fonético (igualdade exata do código fonético).
create index if not exists registro_rpi_publicacoes_marca_fonetica_idx
  on public.registro_rpi_publicacoes(marca_fonetica);

-- Índice por número de processo (dedup/lookup).
create index if not exists registro_rpi_publicacoes_processo_numero_idx
  on public.registro_rpi_publicacoes(processo_numero);

alter table public.registro_rpi_publicacoes enable row level security;

drop policy if exists "Admin gerencia rpi publicacoes select" on public.registro_rpi_publicacoes;
create policy "Admin gerencia rpi publicacoes select"
  on public.registro_rpi_publicacoes for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia rpi publicacoes insert" on public.registro_rpi_publicacoes;
create policy "Admin gerencia rpi publicacoes insert"
  on public.registro_rpi_publicacoes for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia rpi publicacoes update" on public.registro_rpi_publicacoes;
create policy "Admin gerencia rpi publicacoes update"
  on public.registro_rpi_publicacoes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia rpi publicacoes delete" on public.registro_rpi_publicacoes;
create policy "Admin gerencia rpi publicacoes delete"
  on public.registro_rpi_publicacoes for delete
  to authenticated
  using (public.is_admin());
