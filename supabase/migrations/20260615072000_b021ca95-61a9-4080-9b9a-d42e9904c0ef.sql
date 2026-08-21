DROP POLICY IF EXISTS "tax_tables_au read" ON public.tax_tables_au;
REVOKE SELECT ON public.tax_tables_au FROM anon;