-- Remove a policy de listagem pública do bucket de storage `mycelium-previews`.
--
-- A policy "mycelium-previews: public read" (criada em
-- 20260512000002_mycelium_storage_buckets.sql) permitia SELECT irrestrito em
-- storage.objects para bucket_id = 'mycelium-previews', o que no Supabase
-- Storage também habilita LISTAGEM de todos os arquivos do bucket via API
-- (não só leitura de um objeto conhecido por path/URL) — sinalizado pelo
-- linter de segurança "public_bucket_allows_listing". Como o bucket é
-- público, o acesso a um objeto individual continua funcionando normalmente
-- por URL direta (servida pelo CDN de storage, que não depende de RLS);
-- o que se remove aqui é a capacidade de enumerar todo o conteúdo do bucket
-- via SELECT amplo.
--
-- drop policy if exists é idempotente.

drop policy if exists "mycelium-previews: public read" on storage.objects;
