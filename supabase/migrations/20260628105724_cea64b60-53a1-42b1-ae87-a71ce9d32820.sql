
INSERT INTO public.knowledge_articles (slug, title, summary, category, role_audience, body_md, tags, sort_order, published) VALUES
('au-holiday-sync', 'Australian public holiday sync', 'How the daily data.gov.au sync works, where to view the log, and how to fix failed syncs.', 'holidays', ARRAY['org_admin','hr','super_admin'],
$$# Australian public holiday sync

hrppl pulls Australian public holidays automatically from the official **data.gov.au** CSV feed (free, no API key) and stores them per state region (NSW, VIC, QLD, WA, SA, TAS, ACT, NT, plus national).

## Where to view it
- **Admin → Holiday calendar** — see synced holidays for the current and next year.
- **Sync history** panel on the same page — last run time, status (`ok` / `partial` / `failed`), source URL and any CSV parse warnings.

## Trigger a sync
Click **Sync now** on the Holiday calendar page. A daily background job also runs automatically.

## Troubleshooting
- **Status = failed** → expand the row to read the error. Usually a data.gov.au URL change or upstream outage; click **Sync now** again later.
- **Partial** → some rows parsed but others were skipped. Warnings list the offending CSV lines (bad date, unknown jurisdiction code).
- Holidays you don't want applied to an individual employee can be suppressed in **Admin → Employee holidays**.
$$,
ARRAY['holidays','australia','sync'], 40, true),

('employee-holiday-overrides', 'Per-employee holiday overrides & audit trail', 'Set an employee''s state, suppress synced holidays, add custom dates, and review the full change history.', 'holidays', ARRAY['org_admin','hr','super_admin'],
$$# Per-employee holiday overrides

Use **Admin → Employee holidays** to tailor the public-holiday calendar for a single employee.

## What you can do
- **Set state region** (e.g. an employee based in QLD while the org default is NSW).
- **Suppress** a synced holiday for that employee.
- **Add custom** holiday dates (e.g. a local show day).

## Audit trail
Every change is captured in `employee_holiday_override_audit` via a database trigger and shown in the **Audit** panel:
- Who made the change, when, and the action (insert / update / delete).
- A full **before / after** snapshot of the employee's override list so you can see exactly what shifted.
$$,
ARRAY['holidays','audit','overrides'], 41, true),

('staff-onboarding-duties', 'Add KPI duties during staff onboarding', 'Capture each new hire''s duties, weights and KPI targets in the invitation so they appear on day one.', 'onboarding', ARRAY['org_admin','hr','super_admin'],
$$# Add KPI duties during onboarding

When you invite a staff member from **Organisation → Invitations**, you can now capture their duties up-front:

- **Title** (e.g. "Month-end close")
- **Weight %** — share of the overall KPI score
- **KPI target** — what "good" looks like (e.g. "WD+3, zero adjustments")
- **Description** (optional context)
- **State region** for their AU public-holiday calendar

When the invitee accepts, hrppl materialises these into `employee_duties` automatically — no second setup step.

## Weight validation
Duty weights should sum to **100%**. The system shows the running total as you type and warns if you save outside the configured tolerance (Admin → Review cycles → Settings).
$$,
ARRAY['onboarding','kpi','duties'], 11, true),

('employee-duties-admin', 'Manage employee duties (admin)', 'Edit duties, weights and KPI targets for existing employees, with strict weight validation.', 'performance', ARRAY['org_admin','hr','manager','super_admin'],
$$# Manage employee duties

Open **Admin → Employee duties**, pick an employee, and add, edit, deactivate or delete duties.

## Weight rules
- Weights of all **active** duties for an employee must sum to **100%** within the tenant tolerance.
- **Strict mode** (Admin → Review cycles → Settings) blocks saves that drift outside tolerance. If you need to save mid-edit, tick **Allow partial save** and finish the rebalance after.
- A non-strict tenant only surfaces a warning toast.

## Reordering & deactivating
- Use **Sort order** to control the order duties appear on the employee's self-review.
- Deactivate (don't delete) historic duties so past review cycles remain accurate.
$$,
ARRAY['performance','kpi','duties'], 21, true),

('kpi-review-cycles', 'KPI review cycles — open, close & remind', 'Create cycles with start/end dates, control the submission window, and send automatic reminders.', 'performance', ARRAY['org_admin','hr','manager','super_admin'],
$$# KPI review cycles

Cycles gate when employees and reviewers can submit duty scores.

## Lifecycle
1. **Draft** — set up the cycle name, start and end dates.
2. **Open** — employees can submit self-reviews; managers can submit reviewer scores. The system emails everyone with active duties.
3. **Closed** — no further submissions; managers finalise and export reports. A closure email is sent.

## Validation
Submissions outside the start/end window are rejected server-side with a clear error — you can't accidentally backfill a closed cycle.

## Reminders
A daily cron emails employees with pending self-reviews before the cycle deadline. Reminder status is shown on the cycle row.

## Submission status
The cycle screen lists every employee with their state (**not started**, **in progress**, **submitted**) so you can chase stragglers quickly.
$$,
ARRAY['performance','kpi','cycles'], 22, true),

('employee-self-review', 'Submit your KPI self-review', 'How employees score themselves against their duties during an open review cycle.', 'performance', ARRAY['employee','all'],
$$# Submit your KPI self-review

When a review cycle opens, you''ll get an email and an in-app notification.

1. Open **Me → Duty self-review**.
2. Choose the active cycle.
3. For each duty, give yourself a score from **0 to 100** and add a short comment (evidence, blockers, wins).
4. Save as you go — you can revisit until the cycle closes.

Your manager sees your scores alongside their own once the cycle ends. The final weighted score combines reviewer and self assessments per duty weight.
$$,
ARRAY['performance','self-review','employee'], 12, true),

('duty-review-exports', 'Export duty review reports (CSV & PDF)', 'Download a weighted performance report per cycle for record-keeping or sharing.', 'performance', ARRAY['org_admin','hr','manager','super_admin'],
$$# Export duty review reports

From **Admin → Duty reviews**, pick a cycle and choose:

- **Export CSV** — one row per employee × duty, with weight, reviewer score, self score and weighted contribution. Ideal for further analysis in Excel / BI tools.
- **Export PDF** — a formatted scorecard per employee with their duties, scores, comments, and the final weighted total. Use this for performance files or sharing with the employee.

Both exports respect the cycle window and only include duties that were active at the time of the cycle.
$$,
ARRAY['performance','export','pdf','csv'], 23, true)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  category = EXCLUDED.category,
  role_audience = EXCLUDED.role_audience,
  body_md = EXCLUDED.body_md,
  tags = EXCLUDED.tags,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  updated_at = now();
