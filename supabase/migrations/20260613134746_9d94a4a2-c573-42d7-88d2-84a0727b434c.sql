
-- Fix infinite recursion in employees RLS by using a security-definer helper
CREATE OR REPLACE FUNCTION public.my_employee_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.employees WHERE user_id = _user_id LIMIT 1;
$$;

DROP POLICY IF EXISTS "manager reads direct report employees" ON public.employees;

CREATE POLICY "manager reads direct report employees"
ON public.employees
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND tenant_id = user_tenant_id(auth.uid())
  AND (
    user_id = auth.uid()
    OR manager_id = public.my_employee_id(auth.uid())
  )
);
