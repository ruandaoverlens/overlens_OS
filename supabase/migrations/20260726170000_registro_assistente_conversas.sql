-- Conversas persistidas do Assistente do módulo "Ativos Registrados".
--
-- Mesmo padrão de chat_conversations/chat_messages (20260503000001_chat.sql),
-- mas restrito ao módulo: RLS exige public.is_overlens() E dono da conversa.
-- Permite listar o histórico de conversas na sidebar do módulo e retomar
-- qualquer conversa em /registros/assistente/[id].

-- ============================================================
-- registro_assistente_conversas
-- ============================================================
create table if not exists public.registro_assistente_conversas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null default 'Nova conversa',
  -- Foco da conversa (null = portfólio inteiro). Se a marca for removida,
  -- a conversa sobrevive com foco resetado.
  marca_id uuid references public.registro_marcas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registro_assistente_conversas_user_updated_idx
  on public.registro_assistente_conversas (user_id, updated_at desc);

alter table public.registro_assistente_conversas enable row level security;

drop policy if exists "Admin gerencia conversas assistente select" on public.registro_assistente_conversas;
create policy "Admin gerencia conversas assistente select"
  on public.registro_assistente_conversas for select
  to authenticated
  using (public.is_overlens() and user_id = auth.uid());

drop policy if exists "Admin gerencia conversas assistente insert" on public.registro_assistente_conversas;
create policy "Admin gerencia conversas assistente insert"
  on public.registro_assistente_conversas for insert
  to authenticated
  with check (public.is_overlens() and user_id = auth.uid());

drop policy if exists "Admin gerencia conversas assistente update" on public.registro_assistente_conversas;
create policy "Admin gerencia conversas assistente update"
  on public.registro_assistente_conversas for update
  to authenticated
  using (public.is_overlens() and user_id = auth.uid())
  with check (public.is_overlens() and user_id = auth.uid());

drop policy if exists "Admin gerencia conversas assistente delete" on public.registro_assistente_conversas;
create policy "Admin gerencia conversas assistente delete"
  on public.registro_assistente_conversas for delete
  to authenticated
  using (public.is_overlens() and user_id = auth.uid());

-- ============================================================
-- registro_assistente_mensagens
-- ============================================================
create table if not exists public.registro_assistente_mensagens (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references public.registro_assistente_conversas(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists registro_assistente_mensagens_conversa_idx
  on public.registro_assistente_mensagens (conversa_id, created_at);

alter table public.registro_assistente_mensagens enable row level security;

drop policy if exists "Admin gerencia mensagens assistente select" on public.registro_assistente_mensagens;
create policy "Admin gerencia mensagens assistente select"
  on public.registro_assistente_mensagens for select
  to authenticated
  using (public.is_overlens() and exists (
    select 1 from public.registro_assistente_conversas c
    where c.id = conversa_id and c.user_id = auth.uid()
  ));

drop policy if exists "Admin gerencia mensagens assistente insert" on public.registro_assistente_mensagens;
create policy "Admin gerencia mensagens assistente insert"
  on public.registro_assistente_mensagens for insert
  to authenticated
  with check (public.is_overlens() and exists (
    select 1 from public.registro_assistente_conversas c
    where c.id = conversa_id and c.user_id = auth.uid()
  ));

drop policy if exists "Admin gerencia mensagens assistente delete" on public.registro_assistente_mensagens;
create policy "Admin gerencia mensagens assistente delete"
  on public.registro_assistente_mensagens for delete
  to authenticated
  using (public.is_overlens() and exists (
    select 1 from public.registro_assistente_conversas c
    where c.id = conversa_id and c.user_id = auth.uid()
  ));

-- ============================================================
-- Trigger: bump updated_at da conversa a cada mensagem nova
-- ============================================================
create or replace function public.touch_registro_assistente_conversa()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.registro_assistente_conversas
  set updated_at = now()
  where id = new.conversa_id;
  return new;
end;
$$;

drop trigger if exists registro_assistente_mensagens_touch on public.registro_assistente_mensagens;
create trigger registro_assistente_mensagens_touch
after insert on public.registro_assistente_mensagens
for each row execute function public.touch_registro_assistente_conversa();
