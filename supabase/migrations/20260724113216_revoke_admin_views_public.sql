-- Revoga acesso público/autenticado às views administrativas do LMS.
--
-- admin_engagement_summary, admin_popular_courses e admin_weekly_active_students
-- são views agregadas de analytics pensadas para consumo só por staff/admin
-- através de rotas server-side com service_role. Elas herdavam o GRANT SELECT
-- padrão para PUBLIC/anon/authenticated criado junto com a view, o que
-- permitia leitura direta via PostgREST (/rest/v1/admin_*) por qualquer
-- usuário autenticado (ou não autenticado). Revogamos esse acesso; o acesso
-- legítimo continua via service_role (usado pelo backend) e postgres.
--
-- REVOKE é idempotente (reaplicar não falha nem duplica).

revoke all on public.admin_engagement_summary from public, anon, authenticated;
revoke all on public.admin_popular_courses from public, anon, authenticated;
revoke all on public.admin_weekly_active_students from public, anon, authenticated;
