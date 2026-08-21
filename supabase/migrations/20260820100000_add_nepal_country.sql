-- ---------------------------------------------------------------------------
-- Add Nepal to the countries reference table.
--
-- The application ships a complete Nepal payroll implementation:
--
--     src/lib/nepal-payroll.functions.ts
--     src/components/payroll/NepalPayrollWizardDialog.tsx
--     src/routes/admin.payroll-wizard.tsx      (branches on country_code)
--     src/lib/currencies.ts                    (NPR — Nepalese Rupee)
--
-- but 'NP' was never inserted into public.countries, and
-- tenants.country_code carries a foreign key to countries(code):
--
--     tenants_country_code_fkey  FOREIGN KEY (country_code) REFERENCES countries(code)
--
-- So creating a Nepal tenant fails with 23503 and the entire Nepal payroll
-- module is unreachable — not disabled, not feature-flagged, just impossible to
-- route to. Found by seeding a second tenant into a rebuilt project; it is
-- invisible on a database whose reference data was hand-edited.
--
-- The original seed in 20260603191709 inserted 14 countries and simply omitted
-- this one. currency_code on tenants has no FK, so NPR needed nothing here.
--
-- Idempotent: safe to replay against a database where someone has already
-- added the row by hand.
-- ---------------------------------------------------------------------------

INSERT INTO public.countries (code, name, region_code, currency_code)
VALUES ('NP', 'Nepal', 'APAC', 'NPR')
ON CONFLICT (code) DO NOTHING;
