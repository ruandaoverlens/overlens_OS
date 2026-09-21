-- ============================================================
-- Título editável de páginas
-- ============================================================
-- `doc_pages` já guarda a sobrescrita do markdown de uma página. O título,
-- porém, vinha só do nome do arquivo em `website/content`, o que impedia
-- renomear uma página pela interface. A coluna abaixo guarda o título
-- sobrescrito; `null` significa "usar o título do arquivo".

alter table public.doc_pages
  add column if not exists title text;

comment on column public.doc_pages.title is
  'Título sobrescrito da página. Null mantém o título derivado do arquivo em website/content.';
