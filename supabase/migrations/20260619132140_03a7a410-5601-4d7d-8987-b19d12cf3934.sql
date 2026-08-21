
-- 1) Extra columns on sign_geofences
ALTER TABLE public.sign_geofences
  ADD COLUMN IF NOT EXISTS background_tracking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_accuracy_meters integer NOT NULL DEFAULT 100;

-- 2) Audit log table
CREATE TABLE IF NOT EXISTS public.geofence_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  geofence_id uuid REFERENCES public.sign_geofences(id) ON DELETE SET NULL,
  actor_user_id uuid,
  action text NOT NULL,
  source text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  accuracy_m numeric(8,2),
  is_suspicious boolean NOT NULL DEFAULT false,
  suspicious_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geofence_audit_tenant_created
  ON public.geofence_audit_log (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_geofence_audit_geofence
  ON public.geofence_audit_log (geofence_id, created_at DESC);

GRANT SELECT, INSERT ON public.geofence_audit_log TO authenticated;
GRANT ALL ON public.geofence_audit_log TO service_role;

ALTER TABLE public.geofence_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "geofence_audit admin read" ON public.geofence_audit_log;
CREATE POLICY "geofence_audit admin read"
  ON public.geofence_audit_log FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'org_admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'hr'::app_role)
    )
  );

DROP POLICY IF EXISTS "geofence_audit tenant insert" ON public.geofence_audit_log;
CREATE POLICY "geofence_audit tenant insert"
  ON public.geofence_audit_log FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND actor_user_id = auth.uid()
  );
