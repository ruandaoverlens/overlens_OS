-- Chat: tabelas de conversas e mensagens (OpenRouter integration). See CONTRACTS.md §3.

-- ============================================================
-- EXTENSIONS
-- gen_random_uuid() depends on pgcrypto.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- TABLE: chat_conversations
-- One row per chat thread. Owned by an auth.users entry.
-- ============================================================

-- chat_conversations
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa',
  model text not null,
  plan_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index supporting "list my conversations, most recent first"
create index chat_conversations_user_updated_idx
  on public.chat_conversations (user_id, updated_at desc);

-- ============================================================
-- TABLE: chat_messages
-- Append-only messages within a conversation. Cascade on delete.
-- ============================================================

-- chat_messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  cited_segments text[],          -- segmentos do markdown citados manualmente pelo usuário
  routed_doc_ids text[],          -- IDs dos docs que o roteador puxou pra esta resposta
  tokens_in int,
  tokens_out int,
  feedback smallint check (feedback in (-1, 0, 1)),  -- thumbs down / neutro / up
  created_at timestamptz not null default now()
);

-- Index supporting "fetch messages of a conversation in order"
create index chat_messages_conversation_idx
  on public.chat_messages (conversation_id, created_at);

-- ============================================================
-- TRIGGER: touch_chat_conversation
-- Bumps the parent conversation's updated_at on every new message,
-- keeping the conversation list ordered by latest activity.
-- ============================================================

-- updated_at trigger pra conversations
create or replace function public.touch_chat_conversation()
returns trigger language plpgsql as $$
begin
  update public.chat_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger chat_messages_touch_conversation
after insert on public.chat_messages
for each row execute function public.touch_chat_conversation();

-- ============================================================
-- RLS: Row Level Security
-- Users can only see/mutate their own conversations and the
-- messages that belong to them. RLS is the second line of defense
-- after server-side auth checks.
-- ============================================================

-- RLS
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "users select own conversations"
  on public.chat_conversations for select
  using (auth.uid() = user_id);

create policy "users insert own conversations"
  on public.chat_conversations for insert
  with check (auth.uid() = user_id);

create policy "users update own conversations"
  on public.chat_conversations for update
  using (auth.uid() = user_id);

create policy "users delete own conversations"
  on public.chat_conversations for delete
  using (auth.uid() = user_id);

create policy "users select messages from own conversations"
  on public.chat_messages for select
  using (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  ));

create policy "users insert messages in own conversations"
  on public.chat_messages for insert
  with check (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  ));

create policy "users update own messages"
  on public.chat_messages for update
  using (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  ));
