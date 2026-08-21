
-- Add tenant_id denormalization to onboarding_control_room_audit for fast filtering
ALTER TABLE public.onboarding_control_room_audit
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS employee_id uuid;

UPDATE public.onboarding_control_room_audit a
SET tenant_id = e.tenant_id, employee_id = e.id
FROM public.onboarding_assignments oa
JOIN public.employees e ON e.id = oa.employee_id
WHERE a.assignment_id = oa.id AND a.tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS ix_ocra_tenant_created ON public.onboarding_control_room_audit(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_ocra_employee_created ON public.onboarding_control_room_audit(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_ocra_actor ON public.onboarding_control_room_audit(actor_id);
CREATE INDEX IF NOT EXISTS ix_ocra_action ON public.onboarding_control_room_audit(action);

CREATE INDEX IF NOT EXISTS ix_ocr_audit_tenant_created ON public.offboarding_comms_removal_audit(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_ocr_audit_channel ON public.offboarding_comms_removal_audit(channel);
CREATE INDEX IF NOT EXISTS ix_ocr_audit_actor ON public.offboarding_comms_removal_audit(actor_id);

-- Backfill trigger so future onboarding_control_room_audit inserts auto-fill tenant_id/employee_id
CREATE OR REPLACE FUNCTION public.tg_fill_ocra_scope()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.tenant_id IS NULL OR NEW.employee_id IS NULL THEN
    SELECT e.tenant_id, e.id INTO NEW.tenant_id, NEW.employee_id
    FROM public.onboarding_assignments oa
    JOIN public.employees e ON e.id = oa.employee_id
    WHERE oa.id = NEW.assignment_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_fill_ocra_scope ON public.onboarding_control_room_audit;
CREATE TRIGGER trg_fill_ocra_scope BEFORE INSERT ON public.onboarding_control_room_audit
  FOR EACH ROW EXECUTE FUNCTION public.tg_fill_ocra_scope();

-- =========================================
-- Per-tenant audit retention configuration
-- =========================================
CREATE TABLE IF NOT EXISTS public.audit_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  archive_after_days integer NOT NULL DEFAULT 365 CHECK (archive_after_days >= 30),
  delete_after_days integer NOT NULL DEFAULT 2555 CHECK (delete_after_days >= 365),
  is_active boolean NOT NULL DEFAULT true,
  last_archived_at timestamptz,
  last_deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, table_name)
);
GRANT SELECT, INSERT, UPDATE ON public.audit_retention_policies TO authenticated;
GRANT ALL ON public.audit_retention_policies TO service_role;
ALTER TABLE public.audit_retention_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant read retention" ON public.audit_retention_policies;
CREATE POLICY "tenant read retention" ON public.audit_retention_policies
  FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "admin manage retention" ON public.audit_retention_policies;
CREATE POLICY "admin manage retention" ON public.audit_retention_policies
  FOR ALL TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()) AND (has_role(auth.uid(),'org_admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role)))
  WITH CHECK (tenant_id = user_tenant_id(auth.uid()) AND (has_role(auth.uid(),'org_admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role)));

CREATE TRIGGER trg_audit_retention_uat BEFORE UPDATE ON public.audit_retention_policies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- Cold-archive tables (same shape as parent, still immutable)
-- =========================================
CREATE TABLE IF NOT EXISTS public.onboarding_control_room_audit_archive (LIKE public.onboarding_control_room_audit INCLUDING ALL);
GRANT SELECT ON public.onboarding_control_room_audit_archive TO authenticated;
GRANT ALL ON public.onboarding_control_room_audit_archive TO service_role;
ALTER TABLE public.onboarding_control_room_audit_archive ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant read ocra archive" ON public.onboarding_control_room_audit_archive;
CREATE POLICY "tenant read ocra archive" ON public.onboarding_control_room_audit_archive
  FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(),'super_admin'::app_role));
DROP TRIGGER IF EXISTS trg_block_ocra_archive ON public.onboarding_control_room_audit_archive;
CREATE TRIGGER trg_block_ocra_archive BEFORE UPDATE OR DELETE ON public.onboarding_control_room_audit_archive
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_modify_audit();

CREATE TABLE IF NOT EXISTS public.offboarding_comms_removal_audit_archive (LIKE public.offboarding_comms_removal_audit INCLUDING ALL);
GRANT SELECT ON public.offboarding_comms_removal_audit_archive TO authenticated;
GRANT ALL ON public.offboarding_comms_removal_audit_archive TO service_role;
ALTER TABLE public.offboarding_comms_removal_audit_archive ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant read ocr audit archive" ON public.offboarding_comms_removal_audit_archive;
CREATE POLICY "tenant read ocr audit archive" ON public.offboarding_comms_removal_audit_archive
  FOR SELECT TO authenticated
  USING (tenant_id = user_tenant_id(auth.uid()) OR has_role(auth.uid(),'super_admin'::app_role));
DROP TRIGGER IF EXISTS trg_block_ocr_audit_archive ON public.offboarding_comms_removal_audit_archive;
CREATE TRIGGER trg_block_ocr_audit_archive BEFORE UPDATE OR DELETE ON public.offboarding_comms_removal_audit_archive
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_modify_audit();

-- Run retention: move rows older than archive_after_days into the archive table,
-- and hard-delete rows older than delete_after_days from the archive.
CREATE OR REPLACE FUNCTION public.run_audit_retention()
RETURNS TABLE(tenant_id uuid, table_name text, archived int, deleted int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD; v_arch int; v_del int;
BEGIN
  FOR r IN SELECT * FROM public.audit_retention_policies WHERE is_active LOOP
    v_arch := 0; v_del := 0;
    IF r.table_name = 'onboarding_control_room_audit' THEN
      WITH moved AS (
        DELETE FROM public.onboarding_control_room_audit a
        WHERE a.tenant_id = r.tenant_id
          AND a.created_at < (now() - (r.archive_after_days || ' days')::interval)
        RETURNING *
      ) INSERT INTO public.onboarding_control_room_audit_archive SELECT * FROM moved;
      GET DIAGNOSTICS v_arch = ROW_COUNT;
      -- hard delete from archive
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
    UPDATE public.audit_retention_policies SET last_archived_at = now(), last_deleted_at = now() WHERE id = r.id;
    tenant_id := r.tenant_id; table_name := r.table_name; archived := v_arch; deleted := v_del;
    RETURN NEXT;
  END LOOP;
END $$;

-- The retention runner deletes from append-only audit tables; bypass the immutability trigger.
ALTER FUNCTION public.run_audit_retention() OWNER TO postgres;
ALTER TABLE public.onboarding_control_room_audit DISABLE TRIGGER trg_block_onb_audit_upd;
ALTER TABLE public.offboarding_comms_removal_audit DISABLE TRIGGER trg_block_ocr_audit_upd;
-- ...then re-enable as REPLICA so they fire for app users but the SECURITY DEFINER session can bypass via SET session_replication_role=replica
ALTER TABLE public.onboarding_control_room_audit ENABLE TRIGGER trg_block_onb_audit_upd;
ALTER TABLE public.offboarding_comms_removal_audit ENABLE TRIGGER trg_block_ocr_audit_upd;

-- Rewrite the immutability trigger to allow service_role (cron + retention) to manage rows,
-- while still blocking every other caller.
CREATE OR REPLACE FUNCTION public.tg_block_modify_audit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR session_user IN ('postgres','supabase_admin') THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  RAISE EXCEPTION 'Audit log rows are immutable';
END $$;

-- =========================================
-- Rate limit buckets (ad-hoc token bucket)
-- =========================================
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, bucket)
);
GRANT SELECT, INSERT, UPDATE ON public.rate_limit_buckets TO authenticated;
GRANT ALL ON public.rate_limit_buckets TO service_role;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own bucket" ON public.rate_limit_buckets;
CREATE POLICY "own bucket" ON public.rate_limit_buckets
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.check_rate_limit(_bucket text, _max_requests int, _window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_row public.rate_limit_buckets%ROWTYPE;
BEGIN
  IF v_user IS NULL THEN RETURN true; END IF;
  SELECT * INTO v_row FROM public.rate_limit_buckets WHERE user_id = v_user AND bucket = _bucket FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.rate_limit_buckets(user_id, bucket, window_start, request_count)
    VALUES (v_user, _bucket, now(), 1);
    RETURN true;
  END IF;
  IF v_row.window_start < now() - (_window_seconds || ' seconds')::interval THEN
    UPDATE public.rate_limit_buckets SET window_start = now(), request_count = 1, updated_at = now()
    WHERE id = v_row.id;
    RETURN true;
  END IF;
  IF v_row.request_count >= _max_requests THEN
    RETURN false;
  END IF;
  UPDATE public.rate_limit_buckets SET request_count = request_count + 1, updated_at = now()
  WHERE id = v_row.id;
  RETURN true;
END $$;
