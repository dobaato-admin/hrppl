
-- A5: pay-rate current pointer
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS current_pay_change_id uuid
  REFERENCES public.pay_rate_changes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_employees_current_pay_change_id
  ON public.employees(current_pay_change_id);

CREATE OR REPLACE FUNCTION public.tg_sync_employee_current_pay_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_latest_date date;
BEGIN
  -- Only act when the row is (or becomes) 'applied'.
  IF NEW.status <> 'applied' THEN
    RETURN NEW;
  END IF;

  -- Find the latest applied effective_date for this employee (including NEW).
  SELECT MAX(effective_date) INTO v_latest_date
  FROM public.pay_rate_changes
  WHERE employee_id = NEW.employee_id
    AND status = 'applied';

  -- If NEW is the latest applied change, repoint employees.current_pay_change_id.
  IF NEW.effective_date = v_latest_date THEN
    UPDATE public.employees
    SET current_pay_change_id = NEW.id,
        base_salary = NEW.to_amount,
        currency_code = NEW.currency_code
    WHERE id = NEW.employee_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_employee_current_pay_change ON public.pay_rate_changes;
CREATE TRIGGER trg_sync_employee_current_pay_change
AFTER INSERT OR UPDATE OF status, effective_date, to_amount, currency_code
ON public.pay_rate_changes
FOR EACH ROW
EXECUTE FUNCTION public.tg_sync_employee_current_pay_change();

-- Backfill: for each employee, pick the latest applied change.
WITH latest AS (
  SELECT DISTINCT ON (employee_id)
    employee_id, id
  FROM public.pay_rate_changes
  WHERE status = 'applied'
  ORDER BY employee_id, effective_date DESC, created_at DESC
)
UPDATE public.employees e
SET current_pay_change_id = l.id
FROM latest l
WHERE e.id = l.employee_id
  AND (e.current_pay_change_id IS DISTINCT FROM l.id);
