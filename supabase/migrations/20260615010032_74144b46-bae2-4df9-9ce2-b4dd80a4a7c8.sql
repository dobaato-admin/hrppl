
-- super_funds: restrict reads to privileged roles
DROP POLICY IF EXISTS "super_funds tenant read" ON public.super_funds;
CREATE POLICY "super_funds privileged read" ON public.super_funds FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.is_org_admin(auth.uid(), tenant_id)
    OR public.is_hr(auth.uid(), tenant_id)
    OR public.is_finance(auth.uid(), tenant_id)
  );

-- employee_super_choices: self + privileged roles
DROP POLICY IF EXISTS "emp_super tenant read" ON public.employee_super_choices;
CREATE POLICY "emp_super self or privileged read" ON public.employee_super_choices FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.is_org_admin(auth.uid(), tenant_id)
    OR public.is_hr(auth.uid(), tenant_id)
    OR public.is_finance(auth.uid(), tenant_id)
    OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

-- email_unsubscribe_tokens: explicit deny for anon/authenticated reads (service_role bypasses RLS)
DROP POLICY IF EXISTS "email_unsubscribe_tokens deny authenticated read" ON public.email_unsubscribe_tokens;
CREATE POLICY "email_unsubscribe_tokens deny authenticated read" ON public.email_unsubscribe_tokens
  AS RESTRICTIVE FOR SELECT TO authenticated, anon USING (false);

-- suppressed_emails: explicit restrictive block for non-super_admin reads
DROP POLICY IF EXISTS "suppressed_emails restrict non super read" ON public.suppressed_emails;
CREATE POLICY "suppressed_emails restrict non super read" ON public.suppressed_emails
  AS RESTRICTIVE FOR SELECT TO authenticated, anon
  USING (public.has_role(auth.uid(),'super_admin'));

-- leads: block all anon/authenticated writes (service_role/super_admin still work)
DROP POLICY IF EXISTS "leads restrict anon authenticated insert" ON public.leads;
CREATE POLICY "leads restrict anon authenticated insert" ON public.leads
  AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);

-- mfa_email_challenges: explicit restrictive blocks for write ops by clients
DROP POLICY IF EXISTS "mfa_challenges no client insert" ON public.mfa_email_challenges;
CREATE POLICY "mfa_challenges no client insert" ON public.mfa_email_challenges
  AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
DROP POLICY IF EXISTS "mfa_challenges no client update" ON public.mfa_email_challenges;
CREATE POLICY "mfa_challenges no client update" ON public.mfa_email_challenges
  AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "mfa_challenges no client delete" ON public.mfa_email_challenges;
CREATE POLICY "mfa_challenges no client delete" ON public.mfa_email_challenges
  AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

-- tax_tables_au and au_sg_rates: restrict reads to authenticated users only
DROP POLICY IF EXISTS "tax_tables_au_read" ON public.tax_tables_au;
CREATE POLICY "tax_tables_au_read" ON public.tax_tables_au FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "au_sg_rates read" ON public.au_sg_rates;
CREATE POLICY "au_sg_rates read" ON public.au_sg_rates FOR SELECT TO authenticated USING (true);
