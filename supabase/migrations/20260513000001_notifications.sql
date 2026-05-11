-- public.notifications
-- Persisted notifications per user. Toast/sonner é efêmero; o sino lê desta tabela.
-- RLS estrita: cada usuário só vê, atualiza e deleta as suas. Inserts são feitos via service role
-- (API routes usam admin client) — não há policy de insert para 'authenticated'.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  variant     text not null check (variant in ('follow','comment','post','like','mention','achievement','system')),
  category    text not null check (category in ('asset','reference','mycelium','system','social')),
  title       text not null,
  description text,
  cover_url   text,
  action_url  text,
  entity_type text,
  entity_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own
  on public.notifications for delete
  to authenticated
  using (auth.uid() = user_id);

-- Realtime: usuários assinam por filtro user_id=eq.{uid} no client
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
