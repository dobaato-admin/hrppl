-- ============================================================================
-- Published payslip templates for AU and NP
-- ============================================================================
--
-- `computePayrollRun` opens with
--
--     SELECT active_payslip_template(country, pay_date)
--     IF NOT FOUND -> throw "No published payslip template for NP on 2026-09-03"
--
-- and the database had exactly one template: Australia, effective 2026-09-01,
-- with ZERO line items. So:
--
--   * Nepal could not compute payroll at all; and
--   * even for Australia, any run whose pay date fell before 2026-09-01 —
--     which is every run for a past period, i.e. every run anybody would
--     actually make — failed the same way.
--
-- Found by seeding demo payroll: three monthly runs were created happily and
-- every compute failed. The run creation guard checks pay items, pay dates,
-- overtime rates and currency; it did not check that a payslip could be
-- rendered, so the product reported itself ready to run payroll it could not
-- run. `checkPayrollReadiness` now checks this too.
--
-- effective_from is backdated to 2020-01-01 so historical periods resolve. The
-- lookup takes the LATEST effective_from on or before the pay date, so adding
-- a properly-dated successor later supersedes this without editing it.
-- ============================================================================

DO $$
DECLARE
  v_au uuid;
  v_np uuid;
BEGIN
  -- ------------------------------------------------------------------ AU ---
  SELECT id INTO v_au FROM public.payslip_templates
   WHERE country_code = 'AU' AND status = 'published'
   ORDER BY effective_from LIMIT 1;

  IF v_au IS NULL THEN
    INSERT INTO public.payslip_templates
      (country_code, currency_code, name, locale, status, effective_from, is_default, is_active)
    VALUES ('AU', 'AUD', 'Australia payslip', 'en-AU', 'published', DATE '2020-01-01', true, true)
    RETURNING id INTO v_au;
  ELSE
    -- Exists but starts too late for any historical run.
    UPDATE public.payslip_templates
       SET effective_from = LEAST(effective_from, DATE '2020-01-01')
     WHERE id = v_au;
  END IF;

  -- ------------------------------------------------------------------ NP ---
  SELECT id INTO v_np FROM public.payslip_templates
   WHERE country_code = 'NP' AND status = 'published'
   ORDER BY effective_from LIMIT 1;

  IF v_np IS NULL THEN
    INSERT INTO public.payslip_templates
      (country_code, currency_code, name, locale, status, effective_from, is_default, is_active)
    VALUES ('NP', 'NPR', 'Nepal payslip', 'en-US', 'published', DATE '2020-01-01', true, true)
    RETURNING id INTO v_np;
  END IF;

  -- --------------------------------------------------------------- lines ---
  -- BASE is emitted by the engine itself and must NOT be a line item here —
  -- computePayrollRun skips code 'BASE' when walking the template, so adding
  -- one would be silently ignored rather than doubling pay, but it would still
  -- mislead anyone reading the template.
  --
  -- Rates are 0 where the real figure is a tenant decision. A template exists
  -- to give a payslip its shape; inventing a superannuation rate or an income
  -- tax percentage here would put a number on a payslip that nobody chose.

  IF NOT EXISTS (SELECT 1 FROM public.payslip_line_items WHERE template_id = v_au) THEN
    INSERT INTO public.payslip_line_items
      (template_id, sort_order, code, label, category, calc_type, rate, is_taxable, is_visible)
    VALUES
      (v_au, 10, 'ALLOWANCE',  'Allowances',            'allowance', 'fixed', 0, true,  true),
      (v_au, 20, 'OVERTIME',   'Overtime',              'earning',   'fixed', 0, true,  true),
      (v_au, 30, 'PAYG',       'PAYG withholding',      'deduction', 'fixed', 0, false, true),
      (v_au, 40, 'SUPER',      'Superannuation (SG)',   'deduction', 'fixed', 0, false, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.payslip_line_items WHERE template_id = v_np) THEN
    INSERT INTO public.payslip_line_items
      (template_id, sort_order, code, label, category, calc_type, rate, is_taxable, is_visible)
    VALUES
      (v_np, 10, 'ALLOWANCE',  'Allowances',            'allowance', 'fixed', 0, true,  true),
      (v_np, 20, 'OVERTIME',   'Overtime',              'earning',   'fixed', 0, true,  true),
      (v_np, 30, 'INCOME_TAX', 'Income tax',            'deduction', 'fixed', 0, false, true),
      (v_np, 40, 'SSF',        'Social Security Fund',  'deduction', 'fixed', 0, false, true);
  END IF;
END $$;
