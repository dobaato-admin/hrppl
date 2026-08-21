
-- Enums
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern');
CREATE TYPE public.employee_status AS ENUM ('active', 'on_leave', 'terminated');

-- Departments
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  manager_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Employees
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid,
  employee_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  job_title text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  status public.employee_status NOT NULL DEFAULT 'active',
  hire_date date NOT NULL,
  termination_date date,
  base_salary numeric(14,2),
  currency_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_number),
  UNIQUE (tenant_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_employees_tenant ON public.employees(tenant_id);
CREATE INDEX idx_employees_department ON public.employees(department_id);
CREATE INDEX idx_departments_tenant ON public.departments(tenant_id);

-- Departments RLS
CREATE POLICY "org members read own tenant departments"
  ON public.departments FOR SELECT
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all departments"
  ON public.departments FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "regional admin reads scoped departments"
  ON public.departments FOR SELECT
  USING (
    public.has_role(auth.uid(), 'regional_admin')
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = departments.tenant_id
      AND public.has_country_scope(auth.uid(), t.country_code)
    )
  );

CREATE POLICY "org admin manages own tenant departments"
  ON public.departments FOR ALL
  USING (
    public.has_role(auth.uid(), 'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  );

-- Employees RLS
CREATE POLICY "org members read own tenant employees"
  ON public.employees FOR SELECT
  USING (tenant_id = public.user_tenant_id(auth.uid()));

CREATE POLICY "super admin all employees"
  ON public.employees FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "regional admin reads scoped employees"
  ON public.employees FOR SELECT
  USING (
    public.has_role(auth.uid(), 'regional_admin')
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = employees.tenant_id
      AND public.has_country_scope(auth.uid(), t.country_code)
    )
  );

CREATE POLICY "org admin manages own tenant employees"
  ON public.employees FOR ALL
  USING (
    public.has_role(auth.uid(), 'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'org_admin')
    AND tenant_id = public.user_tenant_id(auth.uid())
  );
