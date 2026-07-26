-- Jornadas de registro de marca (acompanhamento guiado passo a passo).
--
-- Uma "jornada" acompanha o registro de uma marca junto ao INPI do início
-- ao fim: cada passo do roteiro (busca prévia, GRU, depósito, RPI, exame,
-- concessão, certificado) só avança mediante evidência registrada pelo
-- usuário (nota, número de protocolo e/ou arquivo).
--
-- A definição dos passos (títulos, links, postura recomendada) vive no
-- código (website/src/lib/registros/jornada.ts); o banco guarda apenas o
-- progresso e as evidências. Mesmo padrão de RLS do módulo: is_overlens().

-- ============================================================
-- registro_jornadas
-- ============================================================
create table if not exists public.registro_jornadas (
  id uuid primary key default gen_random_uuid(),
  nome_marca text not null,
  titular text not null,
  classes text,
  marca_id uuid references public.registro_marcas(id) on delete set null,
  processo_numero text,
  passo_atual integer not null default 1,
  status text not null default 'em_andamento',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registro_jornadas enable row level security;

drop policy if exists "Admin gerencia jornadas select" on public.registro_jornadas;
create policy "Admin gerencia jornadas select"
  on public.registro_jornadas for select
  to authenticated
  using (public.is_overlens());

drop policy if exists "Admin gerencia jornadas insert" on public.registro_jornadas;
create policy "Admin gerencia jornadas insert"
  on public.registro_jornadas for insert
  to authenticated
  with check (public.is_overlens());

drop policy if exists "Admin gerencia jornadas update" on public.registro_jornadas;
create policy "Admin gerencia jornadas update"
  on public.registro_jornadas for update
  to authenticated
  using (public.is_overlens())
  with check (public.is_overlens());

drop policy if exists "Admin gerencia jornadas delete" on public.registro_jornadas;
create policy "Admin gerencia jornadas delete"
  on public.registro_jornadas for delete
  to authenticated
  using (public.is_overlens());

-- ============================================================
-- registro_jornada_evidencias
-- ============================================================
create table if not exists public.registro_jornada_evidencias (
  id uuid primary key default gen_random_uuid(),
  jornada_id uuid not null references public.registro_jornadas(id) on delete cascade,
  passo integer not null,
  nota text,
  storage_path text,
  arquivo_nome text,
  mime_type text,
  tamanho bigint,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists registro_jornada_evidencias_jornada_id_idx
  on public.registro_jornada_evidencias(jornada_id);

alter table public.registro_jornada_evidencias enable row level security;

drop policy if exists "Admin gerencia jornada evidencias select" on public.registro_jornada_evidencias;
create policy "Admin gerencia jornada evidencias select"
  on public.registro_jornada_evidencias for select
  to authenticated
  using (public.is_overlens());

drop policy if exists "Admin gerencia jornada evidencias insert" on public.registro_jornada_evidencias;
create policy "Admin gerencia jornada evidencias insert"
  on public.registro_jornada_evidencias for insert
  to authenticated
  with check (public.is_overlens());

drop policy if exists "Admin gerencia jornada evidencias update" on public.registro_jornada_evidencias;
create policy "Admin gerencia jornada evidencias update"
  on public.registro_jornada_evidencias for update
  to authenticated
  using (public.is_overlens())
  with check (public.is_overlens());

drop policy if exists "Admin gerencia jornada evidencias delete" on public.registro_jornada_evidencias;
create policy "Admin gerencia jornada evidencias delete"
  on public.registro_jornada_evidencias for delete
  to authenticated
  using (public.is_overlens());
