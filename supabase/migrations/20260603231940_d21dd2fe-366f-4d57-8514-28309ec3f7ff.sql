
-- 1. Add new status value
ALTER TYPE public.payroll_run_status ADD VALUE IF NOT EXISTS 'pending_approval' BEFORE 'approved';

-- 2. Add submission tracking columns
ALTER TABLE public.payroll_runs
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS submitted_by uuid;

-- 3. Restrict employee payslip visibility to approved runs only
DROP POLICY IF EXISTS "employee reads own payslip" ON public.payroll_payslips;
CREATE POLICY "employee reads own approved payslip"
  ON public.payroll_payslips FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM employees e WHERE e.id = payroll_payslips.employee_id AND e.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM payroll_runs r WHERE r.id = payroll_payslips.run_id AND r.status = 'approved')
  );
