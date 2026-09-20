-- Edição de textos no banco + redistribuição de permissões staff/admin.
--
-- 1) public.doc_pages: sobrescrita do conteúdo markdown de qualquer página
--    dos systems (Brand System, Content System, etc.). O arquivo .md em
--    website/content continua sendo a base; quando existe uma linha aqui,
--    ela vence. Só admin edita (a escrita passa pela API com service role,
--    então não há policy de INSERT/UPDATE/DELETE para `authenticated`).
-- 2) public.doc_page_revisions: histórico simples de cada salvamento.
-- 3) Policies que eram exclusivas de admin passam a valer para staff também
--    (staff tem todas as permissões, exceto apagar membros e editar textos —
--    essas duas continuam sendo aplicadas nas rotas de API, que exigem admin).
-- 4) Dados: apenas ruanbraz@overlens.com.br permanece admin; os demais admins
--    viram staff.

-- ============================================================
-- Helper: is_staff_or_admin()
-- ============================================================
create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('staff', 'admin')
  );
$$;

-- ============================================================
-- doc_pages
-- ============================================================
create table if not exists public.doc_pages (
  system      text not null,
  path        text not null,
  content     text not null,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now(),
  primary key (system, path)
);

alter table public.doc_pages enable row level security;

drop policy if exists doc_pages_authenticated_select on public.doc_pages;
create policy doc_pages_authenticated_select
  on public.doc_pages for select
  to authenticated
  using (true);

-- ============================================================
-- doc_page_revisions
-- ============================================================
create table if not exists public.doc_page_revisions (
  id          uuid primary key default gen_random_uuid(),
  system      text not null,
  path        text not null,
  content     text not null,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists doc_page_revisions_page_idx
  on public.doc_page_revisions (system, path, created_at desc);

alter table public.doc_page_revisions enable row level security;

drop policy if exists doc_page_revisions_staff_select on public.doc_page_revisions;
create policy doc_page_revisions_staff_select
  on public.doc_page_revisions for select
  to authenticated
  using (public.is_staff_or_admin());

-- ============================================================
-- Policies admin-only → staff ou admin
-- ============================================================

-- asset_metadata
alter policy asset_metadata_admin_insert on public.asset_metadata
  with check (public.is_staff_or_admin());
alter policy asset_metadata_admin_update on public.asset_metadata
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
alter policy asset_metadata_admin_delete on public.asset_metadata
  using (public.is_staff_or_admin());

-- mycelium
alter policy mycelium_references_admin_delete on public.mycelium_references
  using (public.is_staff_or_admin());
alter policy mycelium_attachments_admin_delete on public.mycelium_attachments
  using (public.is_staff_or_admin());
alter policy "mycelium-attachments: admin delete" on storage.objects
  using (bucket_id = 'mycelium-attachments' and public.is_staff_or_admin());
alter policy "mycelium-previews: admin delete" on storage.objects
  using (bucket_id = 'mycelium-previews' and public.is_staff_or_admin());

-- magny (reports / pipeline)
alter policy reports_admin_select_all on public.reports
  using (public.is_staff_or_admin());
alter policy reports_admin_update on public.reports
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
alter policy report_sections_admin_select_all on public.report_sections
  using (public.is_staff_or_admin());
alter policy report_sections_admin_update on public.report_sections
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
alter policy sources_admin_select on public.sources
  using (public.is_staff_or_admin());
alter policy sources_admin_insert on public.sources
  with check (public.is_staff_or_admin());
alter policy sources_admin_update on public.sources
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
alter policy sources_admin_delete on public.sources
  using (public.is_staff_or_admin());
alter policy pipeline_runs_admin_select on public.pipeline_runs
  using (public.is_staff_or_admin());
alter policy pipeline_steps_admin_select on public.pipeline_steps
  using (public.is_staff_or_admin());
alter policy news_items_admin_select on public.news_items
  using (public.is_staff_or_admin());
alter policy news_sources_admin_select on public.news_sources
  using (public.is_staff_or_admin());
alter policy report_views_admin_select on public.report_views
  using (public.is_staff_or_admin());
alter policy refiner_feedback_admin_all on public.refiner_feedback
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- ============================================================
-- Dados: um único admin
-- ============================================================
update public.profiles
   set role = 'staff'
 where role = 'admin'
   and lower(email) <> 'ruanbraz@overlens.com.br';
