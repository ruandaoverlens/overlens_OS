-- Hardening de segurança (lote 1, parte 2): remove a execução implícita de
-- PUBLIC/anon nas funções SECURITY DEFINER endurecidas na migration anterior
-- e concede EXECUTE explicitamente só para quem realmente precisa chamá-las.
--
-- Toda função nova no Postgres recebe GRANT EXECUTE TO PUBLIC por padrão.
-- Para SECURITY DEFINER isso significa que qualquer role (inclusive `anon`,
-- não autenticado) pode invocar a função via PostgREST em
-- /rest/v1/rpc/<nome>. Revogamos esse acesso implícito e, nas funções que
-- são de fato RPCs legítimas do app (chamadas pelo client autenticado),
-- devolvemos o EXECUTE apenas para `authenticated`.
--
-- - auto_confirm_email / rls_auto_enable: são funções internas (trigger /
--   event trigger), nunca chamadas via RPC — só revoke, sem grant de volta.
-- - check_ai_rate_limit, get_or_create_lesson_ai_session, lms_course_progress:
--   são RPCs legítimas usadas pelo client autenticado — revoke de
--   PUBLIC/anon e grant explícito para authenticated.
--
-- REVOKE/GRANT são idempotentes (reaplicar não falha nem duplica).

revoke all on function public.auto_confirm_email() from public, anon, authenticated;

revoke all on function public.check_ai_rate_limit(p_user_id uuid, p_max_requests integer) from public, anon, authenticated;
grant execute on function public.check_ai_rate_limit(p_user_id uuid, p_max_requests integer) to authenticated;

revoke all on function public.get_or_create_lesson_ai_session(p_user_id uuid, p_lesson_id uuid) from public, anon, authenticated;
grant execute on function public.get_or_create_lesson_ai_session(p_user_id uuid, p_lesson_id uuid) to authenticated;

revoke all on function public.lms_course_progress(p_user_id uuid, p_course_id uuid) from public, anon, authenticated;
grant execute on function public.lms_course_progress(p_user_id uuid, p_course_id uuid) to authenticated;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
