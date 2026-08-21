
-- Leave approval routing rules: ordered approver tiers per tenant (optionally per leave type)
-- with escalation timeouts. Lets admins encode manager → HR → org admin chains
-- with auto-escalation when an approver does not act within X hours.

CREATE TABLE IF NOT EXISTS public.leave_approval_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  leave_type_id uuid NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  tier int NOT NULL CHECK (tier >= 1 AND tier <= 10),
  approver_role text NULL,
  approver_user_id uuid NULL,
  escalate_after_hours int NOT NULL DEFAULT 48 CHECK (escalate_after_hours >= 0 AND escalate_after_hours <= 720),
  is_active boolean NOT NULL DEFAULT true,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_approval_routes_target_chk CHECK (
    approver_role IS NOT NULL OR approver_user_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS leave_approval_routes_tenant_idx
  ON public.leave_approval_routes (tenant_id, leave_type_id, tier);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_approval_routes TO authenticated;
GRANT ALL ON public.leave_approval_routes TO service_role;

ALTER TABLE public.leave_approval_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant leave approval routes"
  ON public.leave_approval_routes FOR SELECT
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "org admin manages tenant leave approval routes"
  ON public.leave_approval_routes FOR ALL
  USING (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'org_admin') AND tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all leave approval routes"
  ON public.leave_approval_routes FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER touch_leave_approval_routes_updated
  BEFORE UPDATE ON public.leave_approval_routes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
