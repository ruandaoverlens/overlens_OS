-- Hardening de segurança (lote 1, seguro/não-destrutivo).
--
-- Fixa o search_path de funções SECURITY DEFINER que ainda estavam com
-- search_path mutável (linter "function_search_path_mutable" do Supabase).
-- Sem search_path fixo, uma função SECURITY DEFINER pode ser manipulada por
-- um atacante que crie objetos com o mesmo nome em outro schema priorizado
-- pela search_path da sessão.
--
-- Funções cobertas:
--   - auto_confirm_email               (trigger em auth.users)
--   - check_ai_rate_limit               (RPC do assistente de IA do LMS)
--   - get_or_create_lesson_ai_session   (RPC do assistente de IA do LMS)
--   - lms_course_progress               (RPC de progresso do curso)
--   - rls_auto_enable                   (event trigger DDL)
--
-- ALTER FUNCTION ... SET search_path é idempotente por natureza (reaplicar
-- não tem efeito colateral).

alter function public.auto_confirm_email()
  set search_path to 'public', 'pg_temp';

alter function public.check_ai_rate_limit(p_user_id uuid, p_max_requests integer)
  set search_path to 'public', 'pg_temp';

alter function public.get_or_create_lesson_ai_session(p_user_id uuid, p_lesson_id uuid)
  set search_path to 'public', 'pg_temp';

alter function public.lms_course_progress(p_user_id uuid, p_course_id uuid)
  set search_path to 'public', 'pg_temp';

alter function public.rls_auto_enable()
  set search_path to 'pg_catalog';
