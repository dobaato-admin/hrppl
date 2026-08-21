
-- Reconciliation queue for geofence events vs attendance punches
CREATE TABLE public.geofence_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  geofence_id UUID REFERENCES public.sign_geofences(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  actor_user_id UUID,
  event_time TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('enter','exit','capture')),
  audit_log_id UUID REFERENCES public.geofence_audit_log(id) ON DELETE SET NULL,
  attendance_entry_id UUID,
  mismatch_type TEXT NOT NULL CHECK (mismatch_type IN (
    'no_attendance_for_enter','no_geofence_for_punch','outside_window','accuracy_low','permission_anomaly'
  )),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved','dismissed')),
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofence_reconciliation TO authenticated;
GRANT ALL ON public.geofence_reconciliation TO service_role;

ALTER TABLE public.geofence_reconciliation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/HR view reconciliation"
  ON public.geofence_reconciliation FOR SELECT TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'super_admin'::app_role)
      OR public.is_org_admin(auth.uid(), tenant_id)
      OR public.is_hr(auth.uid(), tenant_id)
    )
  );

CREATE POLICY "Admins/HR update reconciliation"
  ON public.geofence_reconciliation FOR UPDATE TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'super_admin'::app_role)
      OR public.is_org_admin(auth.uid(), tenant_id)
      OR public.is_hr(auth.uid(), tenant_id)
    )
  );

CREATE INDEX idx_geofence_recon_tenant_status ON public.geofence_reconciliation(tenant_id, status, event_time DESC);

CREATE TRIGGER trg_geofence_recon_updated
  BEFORE UPDATE ON public.geofence_reconciliation
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Simulation traces (stored fake/recorded location paths)
CREATE TABLE public.geofence_sim_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{lat,lng,accuracy_m,t_offset_ms}]
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofence_sim_traces TO authenticated;
GRANT ALL ON public.geofence_sim_traces TO service_role;

ALTER TABLE public.geofence_sim_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant admins manage sim traces"
  ON public.geofence_sim_traces FOR ALL TO authenticated
  USING (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'super_admin'::app_role)
      OR public.is_org_admin(auth.uid(), tenant_id)
      OR public.is_hr(auth.uid(), tenant_id)
    )
  )
  WITH CHECK (
    tenant_id = public.user_tenant_id(auth.uid())
    AND (
      public.has_role(auth.uid(),'super_admin'::app_role)
      OR public.is_org_admin(auth.uid(), tenant_id)
      OR public.is_hr(auth.uid(), tenant_id)
    )
  );

CREATE TRIGGER trg_geofence_sim_updated
  BEFORE UPDATE ON public.geofence_sim_traces
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
