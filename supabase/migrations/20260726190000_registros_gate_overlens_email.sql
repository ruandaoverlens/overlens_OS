-- Módulo "Ativos Registrados": gate por domínio de e-mail (@overlens.com.br).
--
-- O módulo deixa de ser exclusivo do role 'admin' e passa a ser acessível a
-- toda a equipe interna (qualquer e-mail @overlens.com.br). A função
-- public.is_admin() era usada apenas pelas policies das tabelas registro_*,
-- registro_assistente_* e do bucket registro-docs — nenhum outro lugar.
--
-- Renomeamos para public.is_overlens() (as policies referenciam a função por
-- OID, então continuam válidas após o rename) e trocamos o corpo pela checagem
-- de domínio de e-mail, mesmo padrão de is_overlens_or_staff().

alter function public.is_admin() rename to is_overlens;

create or replace function public.is_overlens()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((auth.jwt() ->> 'email') like '%@overlens.com.br', false);
$$;
