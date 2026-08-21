
-- Payslip template tables
CREATE TABLE public.payslip_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  currency_code text NOT NULL,
  name text NOT NULL,
  locale text NOT NULL DEFAULT 'en-US',
  date_format text NOT NULL DEFAULT 'YYYY-MM-DD',
  number_format jsonb NOT NULL DEFAULT '{"decimal":".","thousands":",","decimals":2}'::jsonb,
  currency_position text NOT NULL DEFAULT 'prefix',
  header_html text,
  footer_html text,
  show_employer_contributions boolean NOT NULL DEFAULT true,
  show_ytd boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payslip_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.payslip_templates(id) ON DELETE CASCADE,
  sort_order smallint NOT NULL DEFAULT 0,
  code text NOT NULL,
  label text NOT NULL,
  category text NOT NULL,
  calc_type text NOT NULL DEFAULT 'fixed',
  formula text,
  rate numeric,
  is_taxable boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payslip_templates TO authenticated;
GRANT ALL ON public.payslip_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payslip_line_items TO authenticated;
GRANT ALL ON public.payslip_line_items TO service_role;

ALTER TABLE public.payslip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_line_items ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "super admin all payslip templates" ON public.payslip_templates
  FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "regional admin manages scoped payslip templates" ON public.payslip_templates
  FOR ALL USING (has_role(auth.uid(), 'regional_admin') AND has_country_scope(auth.uid(), country_code))
  WITH CHECK (has_role(auth.uid(), 'regional_admin') AND has_country_scope(auth.uid(), country_code));

CREATE POLICY "org reads own country payslip templates" ON public.payslip_templates
  FOR SELECT USING (country_code IN (SELECT t.country_code FROM tenants t WHERE t.id = user_tenant_id(auth.uid())));

-- Line items policies (delegated to template country)
CREATE POLICY "super admin all payslip line items" ON public.payslip_line_items
  FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "regional admin manages scoped payslip line items" ON public.payslip_line_items
  FOR ALL USING (
    has_role(auth.uid(), 'regional_admin') AND EXISTS (
      SELECT 1 FROM public.payslip_templates t
      WHERE t.id = payslip_line_items.template_id AND has_country_scope(auth.uid(), t.country_code)
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'regional_admin') AND EXISTS (
      SELECT 1 FROM public.payslip_templates t
      WHERE t.id = payslip_line_items.template_id AND has_country_scope(auth.uid(), t.country_code)
    )
  );

CREATE POLICY "org reads own country payslip line items" ON public.payslip_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payslip_templates t
      WHERE t.id = payslip_line_items.template_id
        AND t.country_code IN (SELECT te.country_code FROM tenants te WHERE te.id = user_tenant_id(auth.uid()))
    )
  );

CREATE TRIGGER payslip_templates_touch BEFORE UPDATE ON public.payslip_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER payslip_line_items_touch BEFORE UPDATE ON public.payslip_line_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_payslip_templates_country ON public.payslip_templates(country_code);
CREATE INDEX idx_payslip_line_items_template ON public.payslip_line_items(template_id, sort_order);
