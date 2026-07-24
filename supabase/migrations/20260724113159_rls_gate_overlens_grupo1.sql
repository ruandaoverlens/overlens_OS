-- RLS gate "Overlens ou staff" (grupo 1).
--
-- Cria a função helper is_overlens_or_staff(), que autoriza leitura para:
--   - qualquer usuário autenticado com e-mail @overlens.com.br (equipe interna); ou
--   - qualquer usuário cujo profiles.role seja 'staff' ou 'admin'.
--
-- E aplica essa regra como policy de SELECT em um primeiro grupo de tabelas
-- internas/administrativas que hoje só devem ser lidas por gente da Overlens
-- ou staff/admin — nunca por usuários comuns (alunos/clientes):
--   ads, ad_media, asset_metadata, content_items, hidden_assets,
--   mycelium_references, mycelium_attachments, e o bucket `platform-assets`
--   em storage.objects.
--
-- SECURITY DEFINER com search_path fixo (public) para evitar manipulação de
-- search_path; STABLE porque não altera dados. Usada em RLS, portanto
-- mantém EXECUTE para anon/authenticated (função só decide true/false, não
-- expõe dados por si só).

create or replace function public.is_overlens_or_staff()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((auth.jwt() ->> 'email') like '%@overlens.com.br', false)
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'));
$$;

-- ============================================================
-- public.ads
-- ============================================================
drop policy if exists "ads_select_overlens" on public.ads;
create policy "ads_select_overlens"
  on public.ads for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- public.ad_media
-- ============================================================
drop policy if exists "ad_media_select_overlens" on public.ad_media;
create policy "ad_media_select_overlens"
  on public.ad_media for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- public.asset_metadata
-- ============================================================
drop policy if exists "asset_metadata_select_overlens" on public.asset_metadata;
create policy "asset_metadata_select_overlens"
  on public.asset_metadata for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- public.content_items
-- ============================================================
drop policy if exists "content_items_select_overlens" on public.content_items;
create policy "content_items_select_overlens"
  on public.content_items for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- public.hidden_assets
-- ============================================================
drop policy if exists "hidden_assets: overlens read" on public.hidden_assets;
create policy "hidden_assets: overlens read"
  on public.hidden_assets for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- public.mycelium_references
-- ============================================================
drop policy if exists "mycelium_references_select_overlens" on public.mycelium_references;
create policy "mycelium_references_select_overlens"
  on public.mycelium_references for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- public.mycelium_attachments
-- ============================================================
drop policy if exists "mycelium_attachments_select_overlens" on public.mycelium_attachments;
create policy "mycelium_attachments_select_overlens"
  on public.mycelium_attachments for select
  to authenticated
  using (public.is_overlens_or_staff());

-- ============================================================
-- storage.objects: bucket platform-assets
-- ============================================================
drop policy if exists "platform-assets: overlens read" on storage.objects;
create policy "platform-assets: overlens read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'platform-assets' and public.is_overlens_or_staff());
