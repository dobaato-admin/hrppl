
-- Allow authenticated tenant members to read payslip templates/line items for their country, and public holidays for their country.

CREATE POLICY "tenant members read payslip templates"
ON public.payslip_templates
FOR SELECT
TO authenticated
USING (
  country_code IN (
    SELECT t.country_code FROM public.tenants t
    WHERE t.id = public.user_tenant_id(auth.uid())
  )
);

CREATE POLICY "tenant members read payslip line items"
ON public.payslip_line_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.payslip_templates t
    WHERE t.id = payslip_line_items.template_id
      AND t.country_code IN (
        SELECT te.country_code FROM public.tenants te
        WHERE te.id = public.user_tenant_id(auth.uid())
      )
  )
);

CREATE POLICY "tenant members read public holidays"
ON public.public_holidays
FOR SELECT
TO authenticated
USING (
  country_code IN (
    SELECT t.country_code FROM public.tenants t
    WHERE t.id = public.user_tenant_id(auth.uid())
  )
);
