-- A4: link payslip_line_items.component_id → payroll_components.id (nullable)
ALTER TABLE public.payslip_line_items
  DROP CONSTRAINT IF EXISTS payslip_line_items_component_id_fkey;

ALTER TABLE public.payslip_line_items
  ADD CONSTRAINT payslip_line_items_component_id_fkey
  FOREIGN KEY (component_id) REFERENCES public.payroll_components(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payslip_line_items_component_id
  ON public.payslip_line_items(component_id);

-- A6: prevent duplicate leave balance rows per employee/type/year
CREATE UNIQUE INDEX IF NOT EXISTS uq_leave_balances_emp_type_year
  ON public.leave_balances(employee_id, leave_type_id, year);