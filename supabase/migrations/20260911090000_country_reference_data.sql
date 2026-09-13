-- ============================================================================
-- T16 / T18 · Country reference data: subdivisions, and default leave types
-- ============================================================================
--
-- Both tickets ask for the same thing in two domains: replace a hard-coded or
-- free-text value with reference data "so further countries are a data load,
-- not a code change". So both live in tables rather than in a TypeScript
-- constant, and adding Singapore later is an INSERT.
--
-- Launch coverage is Australia and Nepal. Nothing here claims to be complete
-- for any other country, and the application must degrade to free text where
-- a country has no rows — an empty dropdown is a dead end, and a form that
-- cannot be filled in is worse than one with a text box.
--
-- These are SHARED reference data, like `countries` and `public_holidays`:
-- readable by every authenticated user, writable only by the platform. They
-- carry no tenant_id and must never be given one.
-- ============================================================================

-- ---------------------------------------------------------------- subdivisions
CREATE TABLE IF NOT EXISTS public.country_subdivisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  -- The official subdivision code, unprefixed: 'NSW', not 'AU-NSW'.
  code text NOT NULL,
  name text NOT NULL,
  -- What the country calls it. Australia has both states and territories and
  -- the difference is real; Nepal has provinces. Shown as the field label so
  -- the form does not have to say "State / Province / Region" everywhere.
  kind text NOT NULL DEFAULT 'state',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, code)
);

CREATE INDEX IF NOT EXISTS country_subdivisions_country_idx
  ON public.country_subdivisions(country_code, sort_order);

GRANT SELECT ON public.country_subdivisions TO authenticated;
GRANT ALL ON public.country_subdivisions TO service_role;
ALTER TABLE public.country_subdivisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "country_subdivisions readable" ON public.country_subdivisions;
CREATE POLICY "country_subdivisions readable" ON public.country_subdivisions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "country_subdivisions platform write" ON public.country_subdivisions;
CREATE POLICY "country_subdivisions platform write" ON public.country_subdivisions
  FOR ALL TO authenticated
  USING (public.has_role(( SELECT auth.uid() ), 'super_admin'))
  WITH CHECK (public.has_role(( SELECT auth.uid() ), 'super_admin'));

-- ------------------------------------------------------- default leave types
CREATE TABLE IF NOT EXISTS public.country_leave_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  annual_quota_days numeric NOT NULL DEFAULT 0,
  accrual_per_month numeric NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT true,
  color text NOT NULL DEFAULT '#3b82f6',
  -- Pre-ticked in the setup wizard. "Standard" means most employers in that
  -- country will want it, not that it is legally mandatory — the admin can
  -- untick it, and can edit every number afterwards.
  is_standard boolean NOT NULL DEFAULT true,
  -- One sentence shown beside the checkbox. The wizard used to tick "seed
  -- default leave types" without saying what the defaults were.
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, code)
);

CREATE INDEX IF NOT EXISTS country_leave_defaults_country_idx
  ON public.country_leave_defaults(country_code, sort_order);

GRANT SELECT ON public.country_leave_defaults TO authenticated;
GRANT ALL ON public.country_leave_defaults TO service_role;
ALTER TABLE public.country_leave_defaults ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "country_leave_defaults readable" ON public.country_leave_defaults;
CREATE POLICY "country_leave_defaults readable" ON public.country_leave_defaults
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "country_leave_defaults platform write" ON public.country_leave_defaults;
CREATE POLICY "country_leave_defaults platform write" ON public.country_leave_defaults
  FOR ALL TO authenticated
  USING (public.has_role(( SELECT auth.uid() ), 'super_admin'))
  WITH CHECK (public.has_role(( SELECT auth.uid() ), 'super_admin'));

-- ============================================================================
-- Seed · Australia
-- ============================================================================
-- Six states and two internal territories. The distinction is not decoration:
-- long service leave entitlements differ between them, and payroll tax is
-- administered separately by each.
INSERT INTO public.country_subdivisions (country_code, code, name, kind, sort_order)
SELECT * FROM (VALUES
  ('AU', 'ACT', 'Australian Capital Territory', 'territory', 10),
  ('AU', 'NSW', 'New South Wales',              'state',     20),
  ('AU', 'NT',  'Northern Territory',           'territory', 30),
  ('AU', 'QLD', 'Queensland',                   'state',     40),
  ('AU', 'SA',  'South Australia',              'state',     50),
  ('AU', 'TAS', 'Tasmania',                     'state',     60),
  ('AU', 'VIC', 'Victoria',                     'state',     70),
  ('AU', 'WA',  'Western Australia',            'state',     80)
) AS v(country_code, code, name, kind, sort_order)
WHERE EXISTS (SELECT 1 FROM public.countries c WHERE c.code = 'AU')
ON CONFLICT (country_code, code) DO NOTHING;

-- ============================================================================
-- Seed · Nepal
-- ============================================================================
-- The seven provinces created by the 2015 constitution. Provinces 1 and 2 were
-- later named Koshi and Madhesh; both names are in circulation, so the name
-- here is the current official one and the code is the stable key.
INSERT INTO public.country_subdivisions (country_code, code, name, kind, sort_order)
SELECT * FROM (VALUES
  ('NP', 'P1', 'Koshi',           'province', 10),
  ('NP', 'P2', 'Madhesh',         'province', 20),
  ('NP', 'P3', 'Bagmati',         'province', 30),
  ('NP', 'P4', 'Gandaki',         'province', 40),
  ('NP', 'P5', 'Lumbini',         'province', 50),
  ('NP', 'P6', 'Karnali',         'province', 60),
  ('NP', 'P7', 'Sudurpashchim',   'province', 70)
) AS v(country_code, code, name, kind, sort_order)
WHERE EXISTS (SELECT 1 FROM public.countries c WHERE c.code = 'NP')
ON CONFLICT (country_code, code) DO NOTHING;

-- ============================================================================
-- Seed · default leave types
-- ============================================================================
-- Starting points an admin edits, not legal advice. Every figure is
-- adjustable in the leave setup wizard afterwards, which is why the wizard now
-- has to SHOW them rather than seeding silently.
--
-- Australia (National Employment Standards): 4 weeks annual leave, 10 days
-- personal/carer's. Long service leave is state-administered and its accrual
-- differs by state, so it is seeded with a quota of 0 and left for the admin.
INSERT INTO public.country_leave_defaults
  (country_code, code, name, annual_quota_days, accrual_per_month, is_paid, color, is_standard, description, sort_order)
SELECT * FROM (VALUES
  ('AU', 'ANNUAL', 'Annual Leave', 20::numeric, 1.6667::numeric, true, '#3b82f6', true,
   'Four weeks a year under the National Employment Standards, accruing progressively.', 10),
  ('AU', 'PERSONAL', 'Personal / Carer''s (Sick) Leave', 10::numeric, 0.8333::numeric, true, '#ef4444', true,
   'Ten days a year, for the employee''s own illness or to care for a household member.', 20),
  ('AU', 'LSL', 'Long Service Leave', 0::numeric, 0::numeric, true, '#8b5cf6', true,
   'Accrues after long continuous service. The entitlement is set by each state, so set the days yourself.', 30),
  ('AU', 'UNPAID', 'Unpaid Leave', 0::numeric, 0::numeric, false, '#6b7280', true,
   'Approved time away with no pay. Deducted from gross in the pay run.', 40),
  ('AU', 'PARENTAL', 'Parental Leave', 0::numeric, 0::numeric, false, '#ec4899', false,
   'Unpaid parental leave under the NES. Government paid parental leave is claimed separately.', 50),
  ('AU', 'COMPASSIONATE', 'Compassionate Leave', 2::numeric, 0::numeric, true, '#f59e0b', false,
   'Two days per occasion on the death or serious illness of an immediate family member.', 60)
) AS v(country_code, code, name, annual_quota_days, accrual_per_month, is_paid, color, is_standard, description, sort_order)
WHERE EXISTS (SELECT 1 FROM public.countries c WHERE c.code = 'AU')
ON CONFLICT (country_code, code) DO NOTHING;

-- Nepal (Labour Act 2074): home leave accrues at one day per twenty worked;
-- sick leave is 12 days a year; mourning leave 13 days. Figures are the
-- statutory minimum and many employers offer more.
INSERT INTO public.country_leave_defaults
  (country_code, code, name, annual_quota_days, accrual_per_month, is_paid, color, is_standard, description, sort_order)
SELECT * FROM (VALUES
  ('NP', 'HOME', 'Home Leave', 18::numeric, 1.5::numeric, true, '#3b82f6', true,
   'Accrues at one day for every twenty days worked — about eighteen days a year.', 10),
  ('NP', 'SICK', 'Sick Leave', 12::numeric, 1::numeric, true, '#ef4444', true,
   'Twelve days a year under the Labour Act.', 20),
  ('NP', 'MOURNING', 'Mourning Leave', 13::numeric, 0::numeric, true, '#6366f1', true,
   'Thirteen days for the employee performing the funeral rites.', 30),
  ('NP', 'UNPAID', 'Unpaid Leave', 0::numeric, 0::numeric, false, '#6b7280', true,
   'Approved time away with no pay. Deducted from gross in the pay run.', 40),
  ('NP', 'MATERNITY', 'Maternity Leave', 98::numeric, 0::numeric, true, '#ec4899', false,
   'Ninety-eight days, of which sixty are paid by the employer.', 50),
  ('NP', 'PATERNITY', 'Paternity Leave', 15::numeric, 0::numeric, true, '#14b8a6', false,
   'Fifteen days of paid leave for the spouse.', 60)
) AS v(country_code, code, name, annual_quota_days, accrual_per_month, is_paid, color, is_standard, description, sort_order)
WHERE EXISTS (SELECT 1 FROM public.countries c WHERE c.code = 'NP')
ON CONFLICT (country_code, code) DO NOTHING;
