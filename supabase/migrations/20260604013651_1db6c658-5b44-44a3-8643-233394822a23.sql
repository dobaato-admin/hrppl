
-- user_roles writes -> super_admin only
CREATE POLICY "super admin manages user roles insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "super admin manages user roles update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "super admin manages user roles delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- role_scope writes -> super_admin only
CREATE POLICY "super admin manages role scope insert"
  ON public.role_scope FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "super admin manages role scope update"
  ON public.role_scope FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "super admin manages role scope delete"
  ON public.role_scope FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- profiles: prevent privilege/tenant tampering via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Changing profile id is not allowed';
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     AND NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Changing tenant_id is not allowed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prevent_profile_privileged_changes_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privileged_changes_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privileged_changes();

-- audit_log: only service_role / SECURITY DEFINER may insert
DROP POLICY IF EXISTS "authenticated inserts own audit" ON public.audit_log;

-- Lock down SECURITY DEFINER helpers (keep has_role / user_tenant_id / has_country_scope callable - used in RLS)
REVOKE EXECUTE ON FUNCTION public.clone_payslip_template(_template_id uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_payslip_template(_template_id uuid, _effective_from date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.active_payslip_template(_country_code text, _on_date date) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(queue_name text, payload jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(queue_name text, message_id bigint) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privileged_changes() FROM anon, authenticated;
