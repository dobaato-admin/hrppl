DROP POLICY IF EXISTS "awards readable by all" ON public.awards;
DROP POLICY IF EXISTS "classifications readable by all" ON public.award_classifications;
DROP POLICY IF EXISTS "rates readable by all" ON public.award_rates;

CREATE POLICY "awards readable by authenticated" ON public.awards FOR SELECT TO authenticated USING (true);
CREATE POLICY "classifications readable by authenticated" ON public.award_classifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "rates readable by authenticated" ON public.award_rates FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.awards FROM anon;
REVOKE SELECT ON public.award_classifications FROM anon;
REVOKE SELECT ON public.award_rates FROM anon;