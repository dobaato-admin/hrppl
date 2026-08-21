
-- Branch scope for leave types (nullable = tenant-wide)
ALTER TABLE public.leave_types
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.tenant_branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leave_types_branch ON public.leave_types(branch_id);

-- Opening balance support on leave_balances (lock-in once set)
ALTER TABLE public.leave_balances
  ADD COLUMN IF NOT EXISTS opening_balance numeric(10,2),
  ADD COLUMN IF NOT EXISTS opening_balance_locked_at timestamptz;

-- Guard: opening_balance becomes immutable once locked
CREATE OR REPLACE FUNCTION public.guard_leave_opening_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.opening_balance_locked_at IS NOT NULL
     AND NEW.opening_balance IS DISTINCT FROM OLD.opening_balance THEN
    RAISE EXCEPTION 'Opening balance is locked and cannot be changed';
  END IF;
  IF NEW.opening_balance IS NOT NULL
     AND OLD.opening_balance IS NULL
     AND NEW.opening_balance_locked_at IS NULL THEN
    NEW.opening_balance_locked_at := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_leave_opening_balance ON public.leave_balances;
CREATE TRIGGER trg_guard_leave_opening_balance
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.guard_leave_opening_balance();
