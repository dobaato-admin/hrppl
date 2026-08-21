
-- Add carry-over policy + cap to leave_types
ALTER TABLE public.leave_types
  ADD COLUMN IF NOT EXISTS allow_carry_over boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_carry_over_days numeric NOT NULL DEFAULT 0;

-- Idempotency table for accrual + carry-over runs (one row per employee/type/period)
CREATE TABLE IF NOT EXISTS public.leave_accrual_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('accrual', 'carry_over', 'adjustment')),
  period_key text NOT NULL,
  amount numeric NOT NULL,
  reason text,
  actor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, kind, period_key)
);

GRANT SELECT ON public.leave_accrual_log TO authenticated;
GRANT ALL ON public.leave_accrual_log TO service_role;

ALTER TABLE public.leave_accrual_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org admin reads tenant accrual log" ON public.leave_accrual_log
FOR SELECT TO authenticated
USING (
  (has_role(auth.uid(), 'org_admin'::app_role) AND tenant_id = user_tenant_id(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "manager reads tenant accrual log" ON public.leave_accrual_log
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) AND tenant_id = user_tenant_id(auth.uid()));

CREATE POLICY "employee reads own accrual log" ON public.leave_accrual_log
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.employees e
  WHERE e.id = leave_accrual_log.employee_id AND e.user_id = auth.uid()
));
