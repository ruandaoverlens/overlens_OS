-- Módulo "Ativos Registrados" (gestão de propriedade intelectual).
--
-- Cria a função helper is_admin() (mesmo padrão de is_overlens_or_staff()),
-- e as tabelas do módulo: marcas registradas, processos junto ao INPI,
-- timeline de eventos, documentos, alertas e execuções do radar de
-- monitoramento de publicações da RPI.
--
-- Todas as tabelas nascem com RLS habilitado e policies restritas a
-- public.is_admin() — módulo é de uso exclusivo da administração.

-- ============================================================
-- Função helper: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- ============================================================
-- registro_marcas
-- ============================================================
create table if not exists public.registro_marcas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apresentacao text not null default 'mista',
  titular text not null,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registro_marcas enable row level security;

drop policy if exists "Admin gerencia marcas registradas select" on public.registro_marcas;
create policy "Admin gerencia marcas registradas select"
  on public.registro_marcas for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia marcas registradas insert" on public.registro_marcas;
create policy "Admin gerencia marcas registradas insert"
  on public.registro_marcas for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia marcas registradas update" on public.registro_marcas;
create policy "Admin gerencia marcas registradas update"
  on public.registro_marcas for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia marcas registradas delete" on public.registro_marcas;
create policy "Admin gerencia marcas registradas delete"
  on public.registro_marcas for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- registro_processos
-- ============================================================
create table if not exists public.registro_processos (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid not null references public.registro_marcas(id) on delete cascade,
  numero text not null unique,
  classe text not null,
  edicao_ncl text,
  classe_descricao text,
  status text not null default 'requerida',
  situacao text,
  data_deposito date,
  data_concessao date,
  proxima_renovacao date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registro_processos_marca_id_idx on public.registro_processos(marca_id);

alter table public.registro_processos enable row level security;

drop policy if exists "Admin gerencia processos registrados select" on public.registro_processos;
create policy "Admin gerencia processos registrados select"
  on public.registro_processos for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia processos registrados insert" on public.registro_processos;
create policy "Admin gerencia processos registrados insert"
  on public.registro_processos for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia processos registrados update" on public.registro_processos;
create policy "Admin gerencia processos registrados update"
  on public.registro_processos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia processos registrados delete" on public.registro_processos;
create policy "Admin gerencia processos registrados delete"
  on public.registro_processos for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- registro_eventos (timeline)
-- ============================================================
create table if not exists public.registro_eventos (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.registro_processos(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descricao text,
  data date not null,
  rpi_numero text,
  created_at timestamptz not null default now()
);

create index if not exists registro_eventos_processo_id_idx on public.registro_eventos(processo_id);

alter table public.registro_eventos enable row level security;

drop policy if exists "Admin gerencia eventos registrados select" on public.registro_eventos;
create policy "Admin gerencia eventos registrados select"
  on public.registro_eventos for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia eventos registrados insert" on public.registro_eventos;
create policy "Admin gerencia eventos registrados insert"
  on public.registro_eventos for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia eventos registrados update" on public.registro_eventos;
create policy "Admin gerencia eventos registrados update"
  on public.registro_eventos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia eventos registrados delete" on public.registro_eventos;
create policy "Admin gerencia eventos registrados delete"
  on public.registro_eventos for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- registro_documentos
-- ============================================================
create table if not exists public.registro_documentos (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid references public.registro_marcas(id) on delete cascade,
  processo_id uuid references public.registro_processos(id) on delete set null,
  tipo text not null,
  titulo text not null,
  storage_path text not null,
  mime_type text,
  tamanho bigint,
  sensivel boolean not null default true,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists registro_documentos_marca_id_idx on public.registro_documentos(marca_id);
create index if not exists registro_documentos_processo_id_idx on public.registro_documentos(processo_id);

alter table public.registro_documentos enable row level security;

drop policy if exists "Admin gerencia documentos registrados select" on public.registro_documentos;
create policy "Admin gerencia documentos registrados select"
  on public.registro_documentos for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia documentos registrados insert" on public.registro_documentos;
create policy "Admin gerencia documentos registrados insert"
  on public.registro_documentos for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia documentos registrados update" on public.registro_documentos;
create policy "Admin gerencia documentos registrados update"
  on public.registro_documentos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia documentos registrados delete" on public.registro_documentos;
create policy "Admin gerencia documentos registrados delete"
  on public.registro_documentos for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- registro_alertas
-- ============================================================
create table if not exists public.registro_alertas (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid references public.registro_processos(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descricao text,
  data_limite date,
  status text not null default 'pendente',
  origem text not null default 'sistema',
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists registro_alertas_processo_id_idx on public.registro_alertas(processo_id);

-- Evita alertas duplicados gerados automaticamente pelo sistema para o
-- mesmo processo/tipo/data-limite enquanto ainda estiverem pendentes.
create unique index if not exists registro_alertas_sistema_unico_idx
  on public.registro_alertas (processo_id, tipo, data_limite)
  where origem = 'sistema' and status = 'pendente';

alter table public.registro_alertas enable row level security;

drop policy if exists "Admin gerencia alertas registrados select" on public.registro_alertas;
create policy "Admin gerencia alertas registrados select"
  on public.registro_alertas for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia alertas registrados insert" on public.registro_alertas;
create policy "Admin gerencia alertas registrados insert"
  on public.registro_alertas for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia alertas registrados update" on public.registro_alertas;
create policy "Admin gerencia alertas registrados update"
  on public.registro_alertas for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia alertas registrados delete" on public.registro_alertas;
create policy "Admin gerencia alertas registrados delete"
  on public.registro_alertas for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- registro_radar_execucoes
-- ============================================================
create table if not exists public.registro_radar_execucoes (
  id uuid primary key default gen_random_uuid(),
  rpi_numero text,
  executado_em timestamptz not null default now(),
  status text not null default 'ok',
  total_publicacoes integer not null default 0,
  total_candidatos integer not null default 0,
  erro text,
  created_at timestamptz not null default now()
);

alter table public.registro_radar_execucoes enable row level security;

drop policy if exists "Admin gerencia radar execucoes select" on public.registro_radar_execucoes;
create policy "Admin gerencia radar execucoes select"
  on public.registro_radar_execucoes for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia radar execucoes insert" on public.registro_radar_execucoes;
create policy "Admin gerencia radar execucoes insert"
  on public.registro_radar_execucoes for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia radar execucoes update" on public.registro_radar_execucoes;
create policy "Admin gerencia radar execucoes update"
  on public.registro_radar_execucoes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia radar execucoes delete" on public.registro_radar_execucoes;
create policy "Admin gerencia radar execucoes delete"
  on public.registro_radar_execucoes for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- registro_radar_candidatos
-- ============================================================
create table if not exists public.registro_radar_candidatos (
  id uuid primary key default gen_random_uuid(),
  execucao_id uuid references public.registro_radar_execucoes(id) on delete cascade,
  marca_id uuid references public.registro_marcas(id) on delete cascade,
  processo_numero text,
  marca_texto text not null,
  classe text,
  titular text,
  tipo_match text not null,
  score numeric,
  status text not null default 'pendente',
  resumo_ia text,
  created_at timestamptz not null default now()
);

create index if not exists registro_radar_candidatos_execucao_id_idx on public.registro_radar_candidatos(execucao_id);
create index if not exists registro_radar_candidatos_marca_id_idx on public.registro_radar_candidatos(marca_id);

alter table public.registro_radar_candidatos enable row level security;

drop policy if exists "Admin gerencia radar candidatos select" on public.registro_radar_candidatos;
create policy "Admin gerencia radar candidatos select"
  on public.registro_radar_candidatos for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin gerencia radar candidatos insert" on public.registro_radar_candidatos;
create policy "Admin gerencia radar candidatos insert"
  on public.registro_radar_candidatos for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin gerencia radar candidatos update" on public.registro_radar_candidatos;
create policy "Admin gerencia radar candidatos update"
  on public.registro_radar_candidatos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin gerencia radar candidatos delete" on public.registro_radar_candidatos;
create policy "Admin gerencia radar candidatos delete"
  on public.registro_radar_candidatos for delete
  to authenticated
  using (public.is_admin());
