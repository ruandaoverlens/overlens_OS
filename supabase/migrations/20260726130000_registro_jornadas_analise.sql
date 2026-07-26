-- Persistência das análises de IA da jornada (termos de pesquisa e sugestão
-- de classes), para que fiquem sempre disponíveis sem regenerar a cada visita.
-- Formato: {"termos": {...}, "classes": {...}} — ver lib/registros/jornada.ts.

alter table public.registro_jornadas
  add column if not exists analise jsonb not null default '{}'::jsonb;
