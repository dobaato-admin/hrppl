-- Fix Security Definer view: set security_invoker=on so it uses caller permissions
ALTER VIEW public.training_quiz_questions_public SET (security_invoker = on);

-- Revoke EXECUTE on RLS-helper SECURITY DEFINER functions from anon/public.
-- They're only used by RLS policies evaluated for authenticated users, so anon
-- must not be able to call them directly via PostgREST.
REVOKE EXECUTE ON FUNCTION public.can_see_confidential(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_branch_access(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_branch_admin(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_finance(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_hr(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_manager_of(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_org_admin(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.my_employee_id(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.can_see_confidential(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_branch_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_branch_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_finance(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_hr(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_of(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_employee_id(uuid) TO authenticated;