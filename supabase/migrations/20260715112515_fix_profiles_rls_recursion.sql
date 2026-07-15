-- "Admin vê todos os perfis" (criada pelas migrations do LMS em 2026-07-02)
-- consulta a própria tabela profiles dentro da expressão USING, causando
-- "infinite recursion detected in policy" (42P17) em TODO SELECT na tabela.
-- Com isso, o fetchProfile do app falhava e todo usuário caía no fallback
-- "gratuito". A policy é redundante: profiles_select_authenticated já
-- permite leitura a qualquer usuário autenticado.
drop policy if exists "Admin vê todos os perfis" on public.profiles;
