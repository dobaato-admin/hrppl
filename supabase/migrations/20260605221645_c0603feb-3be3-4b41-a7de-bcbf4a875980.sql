
-- ============================================================
-- PRACTICE MANAGEMENT
-- ============================================================

-- Clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  billing_address text,
  country_code text,
  currency_code text,
  tax_number text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant clients" ON public.clients
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin/manager manage tenant clients" ON public.clients
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all clients" ON public.clients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  code text,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active', -- active | on_hold | completed | cancelled
  billing_type text NOT NULL DEFAULT 'time_and_materials', -- fixed | time_and_materials | retainer | non_billable
  budget_amount numeric,
  budget_hours numeric,
  hourly_rate numeric,
  currency_code text,
  start_date date,
  end_date date,
  manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant projects" ON public.projects
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin/manager manage projects" ON public.projects
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all projects" ON public.projects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Jobs (engagements/phases under a project — e.g. "VAT Return Q1")
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open', -- open | in_progress | review | completed | cancelled
  priority text NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
  due_date date,
  assignee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  estimated_hours numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant jobs" ON public.jobs
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin/manager manage jobs" ON public.jobs
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "assignee updates own job status" ON public.jobs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = jobs.assignee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = jobs.assignee_id AND e.user_id = auth.uid()));
CREATE POLICY "super admin all jobs" ON public.jobs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Tasks (checklist items under a job)
CREATE TABLE public.job_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  done_by uuid,
  sort_order int NOT NULL DEFAULT 0,
  assignee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_tasks TO authenticated;
GRANT ALL ON public.job_tasks TO service_role;
ALTER TABLE public.job_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant job tasks" ON public.job_tasks
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin/manager manage job tasks" ON public.job_tasks
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "assignee toggles own task" ON public.job_tasks
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = job_tasks.assignee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = job_tasks.assignee_id AND e.user_id = auth.uid()));
CREATE POLICY "super admin all job tasks" ON public.job_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_job_tasks_updated BEFORE UPDATE ON public.job_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Time entries (billable / non-billable)
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  work_date date NOT NULL,
  hours numeric NOT NULL CHECK (hours > 0 AND hours <= 24),
  description text,
  billable boolean NOT NULL DEFAULT true,
  hourly_rate numeric,
  currency_code text,
  status text NOT NULL DEFAULT 'draft', -- draft | submitted | approved | invoiced
  approved_by uuid,
  approved_at timestamptz,
  invoice_line_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_time_entries_emp_date ON public.time_entries(employee_id, work_date);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;
GRANT ALL ON public.time_entries TO service_role;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee manages own time entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = time_entries.employee_id AND e.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = time_entries.employee_id AND e.user_id = auth.uid() AND e.tenant_id = time_entries.tenant_id));
CREATE POLICY "manager reads tenant time" ON public.time_entries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'manager') AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages tenant time" ON public.time_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all time" ON public.time_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_time_entries_updated BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- draft | sent | paid | overdue | void
  issue_date date NOT NULL DEFAULT current_date,
  due_date date,
  currency_code text NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_total numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  notes text,
  terms text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, invoice_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant invoices" ON public.invoices
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin/manager manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Invoice lines
CREATE TABLE public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_lines TO authenticated;
GRANT ALL ON public.invoice_lines TO service_role;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read tenant invoice lines" ON public.invoice_lines
  FOR SELECT TO authenticated USING (tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin/manager manage invoice lines" ON public.invoice_lines
  FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'org_admin') OR has_role(auth.uid(),'manager')) AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all invoice lines" ON public.invoice_lines
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

-- ============================================================
-- SUPER ADMIN PLATFORM LAYER
-- ============================================================

-- Tenant governance: super-admin notes, suspension, plan tier
CREATE TABLE public.tenant_governance (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  health_status text NOT NULL DEFAULT 'healthy', -- healthy | warning | at_risk | suspended
  internal_notes text,
  risk_score int NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  last_reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tenant_governance TO authenticated;
GRANT ALL ON public.tenant_governance TO service_role;
ALTER TABLE public.tenant_governance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin all tenant governance" ON public.tenant_governance
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_tenant_governance_updated BEFORE UPDATE ON public.tenant_governance
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- White-label settings (per-tenant or platform-default when tenant_id IS NULL)
CREATE TABLE public.white_label_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  brand_name text,
  logo_url text,
  primary_color text,
  accent_color text,
  email_from_name text,
  email_from_address text,
  support_email text,
  footer_html text,
  custom_domain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);
GRANT SELECT ON public.white_label_settings TO authenticated;
GRANT ALL ON public.white_label_settings TO service_role;
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read own tenant white-label" ON public.white_label_settings
  FOR SELECT TO authenticated
  USING (tenant_id IS NULL OR tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "org admin manages own white-label" ON public.white_label_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'org_admin') AND tenant_id = user_tenant_id(auth.uid()));
CREATE POLICY "super admin all white-label" ON public.white_label_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_white_label_updated BEFORE UPDATE ON public.white_label_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- FX rates (platform-wide, super-admin managed, readable to all signed-in users)
CREATE TABLE public.fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text NOT NULL,
  quote_currency text NOT NULL,
  rate numeric NOT NULL CHECK (rate > 0),
  rate_date date NOT NULL DEFAULT current_date,
  source text NOT NULL DEFAULT 'manual', -- manual | api | seed
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (base_currency, quote_currency, rate_date)
);
CREATE INDEX idx_fx_pair_date ON public.fx_rates(base_currency, quote_currency, rate_date DESC);
GRANT SELECT ON public.fx_rates TO authenticated;
GRANT ALL ON public.fx_rates TO service_role;
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all authenticated read fx rates" ON public.fx_rates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "super admin manages fx rates" ON public.fx_rates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'super_admin'));
