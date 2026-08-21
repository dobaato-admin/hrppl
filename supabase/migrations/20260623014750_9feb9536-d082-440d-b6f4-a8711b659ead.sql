
CREATE OR REPLACE FUNCTION public.run_audit_retention_for_tenant(_tenant_id uuid)
RETURNS TABLE(table_name text, archived integer, deleted integer, status text, error_message text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  r RECORD; v_arch int; v_del int; v_err text;
BEGIN
  FOR r IN SELECT * FROM public.audit_retention_policies WHERE is_active AND tenant_id = _tenant_id LOOP
    v_arch := 0; v_del := 0; v_err := NULL;
    BEGIN
      IF r.table_name = 'onboarding_control_room_audit' THEN
        WITH moved AS (
          DELETE FROM public.onboarding_control_room_audit a
          WHERE a.tenant_id = r.tenant_id
            AND a.created_at < (now() - (r.archive_after_days || ' days')::interval)
          RETURNING *
        ) INSERT INTO public.onboarding_control_room_audit_archive SELECT * FROM moved;
        GET DIAGNOSTICS v_arch = ROW_COUNT;
        EXECUTE 'DELETE FROM public.onboarding_control_room_audit_archive WHERE tenant_id = $1 AND created_at < (now() - ($2 || '' days'')::interval)'
          USING r.tenant_id, r.delete_after_days;
        GET DIAGNOSTICS v_del = ROW_COUNT;
      ELSIF r.table_name = 'offboarding_comms_removal_audit' THEN
        WITH moved AS (
          DELETE FROM public.offboarding_comms_removal_audit a
          WHERE a.tenant_id = r.tenant_id
            AND a.created_at < (now() - (r.archive_after_days || ' days')::interval)
          RETURNING *
        ) INSERT INTO public.offboarding_comms_removal_audit_archive SELECT * FROM moved;
        GET DIAGNOSTICS v_arch = ROW_COUNT;
        EXECUTE 'DELETE FROM public.offboarding_comms_removal_audit_archive WHERE tenant_id = $1 AND created_at < (now() - ($2 || '' days'')::interval)'
          USING r.tenant_id, r.delete_after_days;
        GET DIAGNOSTICS v_del = ROW_COUNT;
      END IF;
      UPDATE public.audit_retention_policies SET
        last_run_status = 'succeeded', last_run_at = now(), last_run_error = NULL,
        last_archived_at = now(), last_deleted_at = now(),
        last_archived_count = v_arch, last_deleted_count = v_del
      WHERE id = r.id;
      status := 'succeeded';
    EXCEPTION WHEN OTHERS THEN
      v_err := SQLERRM;
      UPDATE public.audit_retention_policies SET
        last_run_status = 'failed', last_run_at = now(), last_run_error = v_err
      WHERE id = r.id;
      status := 'failed';
    END;
    table_name := r.table_name; archived := v_arch; deleted := v_del; error_message := v_err;
    RETURN NEXT;
  END LOOP;
END $function$;

REVOKE EXECUTE ON FUNCTION public.run_audit_retention_for_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.run_audit_retention_for_tenant(uuid) TO authenticated, service_role;
