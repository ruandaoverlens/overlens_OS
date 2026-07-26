-- Módulo "Registros": tabela de domínios de internet da Overlens.
--
-- Inventário dos domínios próprios (registrador, expiração, renovação
-- automática). Mesmo padrão de RLS do restante do módulo: acesso
-- exclusivo de public.is_overlens().

create table if not exists public.registro_dominios (
  id uuid primary key default gen_random_uuid(),
  dominio text not null unique,
  registrador text,
  titular text,
  data_expiracao date,
  renovacao_automatica boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registro_dominios enable row level security;

drop policy if exists "Admin gerencia dominios select" on public.registro_dominios;
create policy "Admin gerencia dominios select"
  on public.registro_dominios for select
  to authenticated
  using (public.is_overlens());

drop policy if exists "Admin gerencia dominios insert" on public.registro_dominios;
create policy "Admin gerencia dominios insert"
  on public.registro_dominios for insert
  to authenticated
  with check (public.is_overlens());

drop policy if exists "Admin gerencia dominios update" on public.registro_dominios;
create policy "Admin gerencia dominios update"
  on public.registro_dominios for update
  to authenticated
  using (public.is_overlens())
  with check (public.is_overlens());

drop policy if exists "Admin gerencia dominios delete" on public.registro_dominios;
create policy "Admin gerencia dominios delete"
  on public.registro_dominios for delete
  to authenticated
  using (public.is_overlens());
