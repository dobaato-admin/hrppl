INSERT INTO public.blog_posts (
  slug, title, excerpt, content_md, cover_image_url, og_image_url,
  tags, seo_title, seo_description, status, published_at, author_name, reading_minutes
) VALUES (
  'payday-super-xero-myob-quickbooks-guide',
  'Payday Super Is Coming: What Xero, MYOB and QuickBooks Users Need to Do Now',
  'From 1 July 2026, Australian employers must pay superannuation on the same day as wages. Here is how users of Xero, MYOB, QuickBooks and other payroll platforms can get ready — and how HRPPL closes the gaps.',
$md$
## What is Payday Super?

From **1 July 2026**, Australian employers will be legally required to pay employees' Superannuation Guarantee (SG) contributions at the same time as their salary or wages — not quarterly as today. The reform is designed to reduce the $5+ billion in unpaid super each year and let employees see contributions land in their fund within days, not months.

In practice, three things change:

1. **Frequency** — SG must be received by the employee's fund within **7 business days** of payday.
2. **Penalties** — The Super Guarantee Charge (SGC) is being redesigned so late or short payments attract immediate, automated penalties calculated daily.
3. **Single Touch Payroll (STP)** — STP reporting is being extended so the ATO can match every pay event to a matching super contribution in near real time.

If your payroll cadence is weekly or fortnightly, you are about to move from 4 super runs a year to **52 or 26**.

## Why this is harder than it sounds

Most accounting and payroll platforms — Xero, MYOB, QuickBooks, Reckon, KeyPay/Employment Hero, Sage and the rest — already support SuperStream batches. The difficulty is not the file format. It is everything around it:

- **Clearing house timing.** A contribution is only "paid" when the fund receives it. Bank cut-offs, clearing-house SLAs and weekends all eat into the 7-day window.
- **New starters without a stapled fund.** Each pay run now needs a fund lookup, not just the quarterly one.
- **Adjustments mid-cycle.** Backpays, terminations, bonuses, salary sacrifice changes and award reinterpretations all trigger SG that must clear inside the same window.
- **Reconciliation.** You need a clean audit trail showing pay event → SG calculation → SuperStream message → fund receipt, every single payday.
- **Cashflow.** Super now leaves the business 12 times more often. Treasury, overdraft facilities and invoice-cycle assumptions need to be revisited.

## What changes for Xero Payroll users

Xero already runs an automated super payments service via its clearing house. To be Payday Super ready you should:

- Move every pay calendar to **auto super at finalisation** instead of the manual quarterly batch.
- Top up the **Xero auto super float** so the direct debit settles inside the 7-day window — the current 4 business day lead time eats most of it.
- Turn on **stapled super fund lookups** for every new starter before their first pay event.
- Review your **bank feed and clearing balance** weekly so a failed debit does not silently breach SG.

Gaps Xero does not solve on its own: cross-entity payroll, contractor SG (where you have voluntarily extended super), and approval workflows for ad-hoc backpays.

## What changes for MYOB users (AccountRight and Business)

MYOB's Pay Super service uses the same SuperStream pipeline but is initiated per pay run.

- Switch from "submit when ready" to **submit immediately after each pay run is recorded**.
- Verify the **authoriser is available every payday** — Pay Super requires a sign-off and a missing approver is now a compliance event, not an inconvenience.
- Reconcile the **Pay Super clearing account** to zero each week so unpaid contributions cannot sit there unnoticed.
- Re-check **award interpretation** for any employee on a custom pay item — the SG base under Payday Super includes OTE on every pay event, including allowances that attract super.

Gaps MYOB does not solve: roster-driven shift swaps, time-in-lieu accruals that later convert to paid hours, and reimbursements misclassified as wages.

## What changes for QuickBooks Online (KeyPay / Employment Hero Payroll) users

QuickBooks Payroll in Australia is powered by KeyPay, so the same guidance applies to Employment Hero Payroll, Reckon Payroll and any other KeyPay-based product.

- Enable **Beam (the built-in clearing house) auto-pay** at pay run finalisation.
- Lock down **pay schedules** so off-cycle pays still trigger a super event — manual journals to "fix" a missed pay are the most common cause of late SG.
- Use the **employee self-service portal** so super fund choice forms are captured before the first pay, not after.
- Build a **pre-finalisation checklist** that catches negative leave balances, unapproved overtime and missing timesheets — these now create SG shortfalls if discovered after payday.

Gaps KeyPay-based products do not solve: shift-swap evidence trails, manager approvals for overtime that converts to TOIL, multi-entity HR records, and structured policy acknowledgements.

## What changes for everyone else (Reckon, Sage, Attaché, in-house payroll)

The same principles apply:

1. Confirm your provider's **Payday Super roadmap** in writing — specifically the SLA between pay finalisation and fund receipt.
2. Test a **full end-to-end run** before 1 July 2026 with a small pay group.
3. Document a **late-payment runbook** so a failed clearing-house batch is detected and remediated inside 7 business days, not at quarter end.

## Where HRPPL fits alongside your accounting platform

HRPPL is not replacing your payroll engine. Xero, MYOB and QuickBooks keep doing the SG calculation and SuperStream submission. HRPPL closes the operational gaps that turn into Payday Super breaches:

- **Single source of truth for OTE inputs.** Approved timesheets, overtime, shift swaps, allowances, TOIL conversions and reimbursements flow into HRPPL with a full audit trail before they ever hit payroll — so the SG base is correct on the first pay event, not the third reconciliation.
- **Approval gates before payroll close.** Managers approve overtime, leave and reimbursements inside HRPPL with role-based controls (Manager, HR, Org Admin). Nothing reaches the export to Xero/MYOB/QuickBooks unless it has been approved.
- **TOIL and overtime reconciliation.** Time in Lieu accruals, expiries and conversions are tracked per employee with a ledger you can reconcile against payroll and against accrued super.
- **Multi-entity, multi-award coverage.** One HR record per employee even when payroll is split across multiple Xero/MYOB files or QuickBooks companies.
- **Stapled super and onboarding evidence.** Capture super choice, TFN declaration, policy acknowledgements and right-to-work documents during onboarding so the first pay event is compliant.
- **Reporting for the new SGC regime.** Pull a per-pay-period view of OTE, SG due, SG paid and variance — the exact shape auditors will ask for under the redesigned Super Guarantee Charge.

## A 90-day Payday Super readiness plan

**Days 1–30 — Map and measure**
- Inventory every pay calendar, pay group and clearing-house arrangement.
- Confirm the SLA from "pay run finalised" to "contribution received by fund" for each one.
- Identify every employee on a non-standard arrangement (salary sacrifice, contractors with voluntary super, multi-entity).

**Days 31–60 — Tighten the inputs**
- Move timesheet, overtime, TOIL, leave and reimbursement approvals into HRPPL so payroll only ever imports approved data.
- Turn on stapled fund lookups in onboarding.
- Run a parallel weekly super cycle for one pay group as a dress rehearsal.

**Days 61–90 — Switch over and monitor**
- Move all pay groups to per-pay-run super.
- Stand up a weekly reconciliation report: OTE → SG due → SG paid → variance.
- Document the late-payment runbook and assign an owner.

## Bottom line

Payday Super is not a software upgrade — it is a cadence change that touches treasury, payroll, HR and compliance every single payday. Xero, MYOB and QuickBooks will handle the mechanics. HRPPL makes sure the inputs they receive — hours, overtime, TOIL, leave, reimbursements, super choice — are approved, auditable and on time, every payday.
$md$,
  '/__l5e/assets-v1/2fc0b113-b2c5-4f3b-bc8f-fd8635775a72/payday-super-cover.jpg',
  '/__l5e/assets-v1/2fc0b113-b2c5-4f3b-bc8f-fd8635775a72/payday-super-cover.jpg',
  ARRAY['payroll','superannuation','compliance','xero','myob','quickbooks','payday-super','australia']::text[],
  'Payday Super Guide for Xero, MYOB & QuickBooks Users (2026)',
  'From 1 July 2026 super must be paid every payday. A practical readiness guide for Australian employers using Xero, MYOB, QuickBooks and other payroll platforms.',
  'published',
  now(),
  'HRPPL Editorial',
  8
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content_md = EXCLUDED.content_md,
  cover_image_url = EXCLUDED.cover_image_url,
  og_image_url = EXCLUDED.og_image_url,
  tags = EXCLUDED.tags,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = 'published',
  published_at = COALESCE(public.blog_posts.published_at, now()),
  reading_minutes = EXCLUDED.reading_minutes,
  updated_at = now();