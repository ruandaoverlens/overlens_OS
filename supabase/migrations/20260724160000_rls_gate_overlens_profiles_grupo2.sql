-- Fecha a exposição de leitura ampla da tabela public.profiles.
-- Antes: profiles_select_authenticated permitia que QUALQUER usuário autenticado
-- lesse TODAS as linhas de profiles (email, name, phone, bio, deletion_reason
-- de 1.426 usuários), bastando estar logado (qual = auth.role() = 'authenticated').
--
-- Depois: cada usuário sempre pode ler o PRÓPRIO perfil (auth.uid() = id),
-- e a leitura de OUTROS perfis só é permitida para staff/admin ou emails
-- @overlens.com.br, via public.is_overlens_or_staff() (criada em hardening anterior).
--
-- As policies de own-read pré-existentes ("Aluno lê próprio perfil",
-- profiles_select_own) são preservadas como rede de segurança adicional
-- (policies do mesmo cmd são combinadas com OR pelo Postgres).
--
-- Validado com simulação de RLS via request.jwt.claims antes de aplicar em produção:
--   - usuário gratuito: enxerga 1 linha (a própria)
--   - staff/admin: enxerga todas as 1426 linhas
--   - email @overlens.com.br (mesmo sem ser staff): enxerga todas as 1426 linhas

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_overlens" on public.profiles
  for select to authenticated
  using ( auth.uid() = id or public.is_overlens_or_staff() );
