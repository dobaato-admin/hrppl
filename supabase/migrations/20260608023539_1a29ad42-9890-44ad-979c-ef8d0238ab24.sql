DROP POLICY IF EXISTS "org reads own country holidays" ON public.public_holidays;
CREATE POLICY "org admin manages own country holidays" ON public.public_holidays
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND country_code IN (
      SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid())
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND country_code IN (
      SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "org reads own country otp rates" ON public.overtime_penalty_rates;
CREATE POLICY "org admin manages own country otp rates" ON public.overtime_penalty_rates
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND country_code IN (
      SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid())
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND country_code IN (
      SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "org reads own country payslip templates" ON public.payslip_templates;
CREATE POLICY "org admin manages own country payslip templates" ON public.payslip_templates
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND country_code IN (
      SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid())
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND country_code IN (
      SELECT t.country_code FROM public.tenants t WHERE t.id = public.user_tenant_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "org reads own country payslip line items" ON public.payslip_line_items;
CREATE POLICY "org admin manages own country payslip line items" ON public.payslip_line_items
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.payslip_templates t
      WHERE t.id = payslip_line_items.template_id
        AND t.country_code IN (
          SELECT te.country_code FROM public.tenants te WHERE te.id = public.user_tenant_id(auth.uid())
        )
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'org_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.payslip_templates t
      WHERE t.id = payslip_line_items.template_id
        AND t.country_code IN (
          SELECT te.country_code FROM public.tenants te WHERE te.id = public.user_tenant_id(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "org members read own tenant white-label" ON public.white_label_settings;
DROP POLICY IF EXISTS "org admin manages own white-label" ON public.white_label_settings;
CREATE POLICY "super admin only white-label" ON public.white_label_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));