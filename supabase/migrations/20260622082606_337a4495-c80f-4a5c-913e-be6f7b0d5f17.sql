
-- =========================================
-- Onboarding control room audit
-- =========================================
CREATE TABLE public.onboarding_control_room_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.onboarding_assignments(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.onboarding_control_room_tasks(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  actor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ocra_assignment ON public.onboarding_control_room_audit(assignment_id, created_at DESC);

GRANT SELECT, INSERT ON public.onboarding_control_room_audit TO authenticated;
GRANT ALL ON public.onboarding_control_room_audit TO service_role;

ALTER TABLE public.onboarding_control_room_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view onboarding audit"
ON public.onboarding_control_room_audit FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.onboarding_assignments oa
    JOIN public.employees e ON e.id = oa.employee_id
    WHERE oa.id = onboarding_control_room_audit.assignment_id
      AND e.tenant_id = public.user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Authenticated can insert onboarding audit"
ON public.onboarding_control_room_audit FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- =========================================
-- Employment variation audit
-- =========================================
CREATE TABLE public.employment_variation_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variation_id uuid NOT NULL REFERENCES public.employment_variations(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  actor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_eva_variation ON public.employment_variation_audit(variation_id, created_at DESC);

GRANT SELECT, INSERT ON public.employment_variation_audit TO authenticated;
GRANT ALL ON public.employment_variation_audit TO service_role;

ALTER TABLE public.employment_variation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view variation audit"
ON public.employment_variation_audit FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employment_variations v
    WHERE v.id = employment_variation_audit.variation_id
      AND v.tenant_id = public.user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Authenticated can insert variation audit"
ON public.employment_variation_audit FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- =========================================
-- Careers analytics events
-- =========================================
CREATE TABLE public.careers_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.recruitment_jobs(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('site_view','job_view','apply_start','apply_submit')),
  session_id text,
  referrer text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cae_tenant_date ON public.careers_analytics_events(tenant_id, created_at DESC);
CREATE INDEX idx_cae_job ON public.careers_analytics_events(job_id, created_at DESC);

GRANT INSERT ON public.careers_analytics_events TO anon, authenticated;
GRANT SELECT ON public.careers_analytics_events TO authenticated;
GRANT ALL ON public.careers_analytics_events TO service_role;

ALTER TABLE public.careers_analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) may insert events for a published tenant/job
CREATE POLICY "Public can insert careers events"
ON public.careers_analytics_events FOR INSERT TO anon, authenticated
WITH CHECK (
  tenant_id IS NULL OR EXISTS (
    SELECT 1 FROM public.tenant_careers_settings s
    WHERE s.tenant_id = careers_analytics_events.tenant_id
      AND s.is_enabled = true
  )
);

-- Tenant admins/HR can read their own analytics
CREATE POLICY "Tenant admins can read careers analytics"
ON public.careers_analytics_events FOR SELECT TO authenticated
USING (
  tenant_id = public.user_tenant_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'hr'::app_role)
    OR public.has_role(auth.uid(), 'org_admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
);
