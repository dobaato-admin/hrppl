
-- Add due date, version tracking, and reminder fields to review_instances
ALTER TABLE public.review_instances
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMPTZ;

-- default due_date to scheduled_for for existing rows
UPDATE public.review_instances SET due_date = scheduled_for WHERE due_date IS NULL;

-- Version history table: snapshots taken on every resubmit
CREATE TABLE IF NOT EXISTS public.review_instance_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  instance_id UUID NOT NULL REFERENCES public.review_instances(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status TEXT NOT NULL,
  score JSONB,
  evidence JSONB DEFAULT '[]'::jsonb,
  reviewer_comments TEXT,
  employee_comments TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  snapshot_reason TEXT,
  actor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instance_id, version)
);

GRANT SELECT, INSERT ON public.review_instance_versions TO authenticated;
GRANT ALL ON public.review_instance_versions TO service_role;
ALTER TABLE public.review_instance_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee/admin read versions"
  ON public.review_instance_versions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.review_instances ri
            JOIN public.employees e ON e.id = ri.employee_id
            WHERE ri.id = review_instance_versions.instance_id
              AND (e.user_id = auth.uid()
                   OR public.has_role(auth.uid(),'org_admin')
                   OR public.has_role(auth.uid(),'super_admin')
                   OR public.has_role(auth.uid(),'manager')))
  );

CREATE POLICY "system inserts versions"
  ON public.review_instance_versions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.tenant_id = review_instance_versions.tenant_id)
  );

CREATE INDEX IF NOT EXISTS ix_riv_instance ON public.review_instance_versions (instance_id, version DESC);
CREATE INDEX IF NOT EXISTS ix_ri_due_status ON public.review_instances (status, due_date);
