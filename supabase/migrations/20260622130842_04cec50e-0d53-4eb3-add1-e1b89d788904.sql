
INSERT INTO public.knowledge_articles (slug, title, summary, category, role_audience, body_md, tags, published, sort_order)
VALUES
(
  'onboarding-control-room-bulk',
  'Onboarding Control Room — bulk approve, reject & KPI tiles',
  'Filter onboarding tasks, bulk approve or reject in one click, and watch status KPI tiles update live.',
  'onboarding',
  ARRAY['org_admin','hr','manager','super_admin'],
$md$
# Onboarding Control Room

The Control Room at **Org → Onboarding → Control Room** (`/org/onboarding/control-room`) is the single queue for every onboarding task across your tenant.

## What's new

- **KPI tiles** — Pending / In progress / Blocked / Done update automatically as you act on tasks or change filters.
- **Bulk approve & bulk reject** — multi-select rows and act on the whole selection. Each action is written to the audit trail with actor, timestamp, and the affected task IDs.
- **Filters** — by stage, assignee, status, and free-text search. Filters drive both the table and the KPI tiles so the numbers always match what you see.
- **Keyboard navigation** — tab through rows, `Enter` to open, `Esc` to close the detail drawer; visible focus rings everywhere.

## Tips

- Use **bulk reject** with a short reason — the reason is sent to the assignee and stored on the task.
- The "Blocked" tile is a quick way to spot tasks waiting on document uploads or manager input.
$md$,
  ARRAY['onboarding','control-room','bulk','kpi','manager'],
  true,
  10
),
(
  'global-search-manager-dashboard',
  'Global search (⌘K) — find anything across employees, variations, onboarding & timesheets',
  'Press ⌘K (Ctrl+K) anywhere in the manager dashboard to search employees, employment variations, onboarding tasks, and timesheets at once.',
  'navigation',
  ARRAY['org_admin','hr','manager','super_admin'],
$md$
# Global search

Hit **⌘K** (macOS) or **Ctrl+K** (Windows/Linux) from any page in the manager dashboard to open the global search palette.

## What it searches

- **Employees** — name, email, employee number.
- **Employment variations** — title, employee, status.
- **Onboarding tasks** — task label, assignee.
- **Timesheets** — period, employee, status.

Results are grouped by category and scoped to your tenant. Press `Enter` to open the top result, or use arrows + `Enter` to jump to a specific row.

## Keyboard

- `⌘K` / `Ctrl+K` — open.
- `↑` / `↓` — move selection.
- `Enter` — open the highlighted result.
- `Esc` — close.
$md$,
  ARRAY['search','navigation','keyboard','manager'],
  true,
  15
),
(
  'performance-management-overview',
  'Performance Management — cycles, KPI tiles & scorecard reviews',
  'Run review cycles, track progress with cycle-only KPI tiles, search employees, and complete scorecards in a single workflow.',
  'performance',
  ARRAY['org_admin','hr','manager','super_admin'],
$md$
# Performance Management

Open **Org → Performance** (`/org/performance`) for the manager view of every review cycle and scorecard.

## Cycle KPI tiles

The top of the page shows four tiles — **Total**, **Draft**, **Active**, **Closed** — that update automatically when you change the cycle filters (status, date range, name).

## Cycle filters

Filter by status, review-cycle start/end range, or name. Both the KPI tiles and the cycles table update together so the numbers always match the rows on screen.

## Scorecard workflow

1. Open an active cycle and pick an employee from the searchable list.
2. Score each KPI/KRA against the template's rating scale, add comments, and attach evidence if needed.
3. **Submit** to finalize — the reviewee gets notified and the cycle progress bar advances.

Drafts auto-save so you can return later without losing input.
$md$,
  ARRAY['performance','cycles','scorecard','kpi','manager'],
  true,
  18
),
(
  'payroll-setup-wizard',
  'Payroll setup wizard — guided config with live payslip preview',
  'A guided admin wizard to configure country/currency, pay period, taxes, deductions, overtime, allowances and leave types with a live payslip preview.',
  'payroll',
  ARRAY['org_admin','super_admin'],
$md$
# Payroll setup wizard

Open **Admin → Payroll setup → Open setup wizard** (`/admin/payroll-wizard`) for the guided configuration flow.

## Steps

1. **Country & currency** — pre-filled from your tenant defaults.
2. **Pay period & standard hours** — weekly / fortnightly / monthly and the standard work hours used for overtime base.
3. **Components** — taxes, deductions, retirement/PF, overtime, allowances. Toggle active, set flat or percentage rates.
4. **Scenarios** — model what-if rules (see related article).
5. **Review & export** — print or download the full configuration bundle.

## Live payslip preview

A sidebar continuously recalculates a sample payslip (Basic + earnings − deductions = Net) using your active components and tenant currency. Use it to sanity-check rates before saving.

## Stepper validation

The **Next** button is disabled until each step meets its requirements (e.g. country/currency set, at least one active mandatory tax). Inline error alerts explain exactly what is missing.
$md$,
  ARRAY['payroll','wizard','admin','setup'],
  true,
  20
),
(
  'payroll-scenarios-comparison',
  'Payroll wizard — scenarios & side-by-side comparison',
  'Model what-if changes to tax, leave and overtime rules, then compare resulting payslips side-by-side with net-pay deltas.',
  'payroll',
  ARRAY['org_admin','super_admin'],
$md$
# Payroll scenarios

The **Scenarios** step in the payroll wizard lets you model alternate rules without touching live config.

## Building a scenario

1. Click **Add scenario** and give it a name (e.g. "Overtime +25%").
2. Override any combination of tax rates, leave accrual, or overtime multipliers.
3. The card recalculates the sample payslip immediately.

## Side-by-side comparison

The comparison table summarises every scenario's key inputs alongside the baseline and shows the **net-pay delta** (absolute and %). Use it to pick the scenario that best matches the policy change you're considering.

## Accessibility

- Full keyboard navigation through scenario cards and the comparison table.
- Skip link to main content, visible focus rings, ARIA labels on every region.
$md$,
  ARRAY['payroll','wizard','scenarios','comparison'],
  true,
  22
),
(
  'payroll-export-bundle',
  'Payroll wizard — CSV / PDF export with selective sections',
  'Export your configured payroll rules, taxes, holidays, leave types, overtime/penalty rates and scenarios as CSV or PDF — pick exactly which sections to include.',
  'payroll',
  ARRAY['org_admin','super_admin'],
$md$
# Exporting payroll configuration

From the wizard header (or the final **Review & export** step) use **Export CSV** or **Export PDF** to download a snapshot of your payroll configuration.

## Pick what to include

The **Sections** popover lets you tick the exact sections to export:

- Country & currency
- Pay period & hours
- Components (taxes, deductions, overtime, allowances)
- Holidays
- Leave types
- Scenarios

## Metadata block

Every export starts with a metadata header — scenario names, generated-at timestamp, exporter identity, and the active rule versions — so the file is fully self-describing for audit reviewers.

## Audit

Each export is recorded in the **Admin audit log** (see related article).
$md$,
  ARRAY['payroll','export','csv','pdf','audit'],
  true,
  24
),
(
  'admin-audit-log',
  'Admin audit log — payroll rule changes, scenarios & exports',
  'Every payroll rule edit, scenario action, and export is recorded with actor, action, entity and timestamp so admins can answer "who changed what, when".',
  'security',
  ARRAY['org_admin','super_admin'],
$md$
# Admin audit log

The admin audit log captures admin-level actions across payroll configuration. Entries include:

- **Payroll rule changes** — settings upserts, component toggles, component deletes.
- **Scenario events** — created, updated, deleted.
- **Exports** — CSV/PDF download events, including the sections selected.

## Fields recorded

`actor_id`, `category`, `action`, `entity_type`, `entity_id`, `details` (JSON), `created_at`.

## Access

Only `org_admin` and `super_admin` can read the log. Entries are tenant-scoped via RLS and cannot be edited or deleted from the UI.
$md$,
  ARRAY['audit','security','admin','payroll'],
  true,
  26
),
(
  'accessibility-sweep-2026',
  'Accessibility & responsive sweep — what changed across dashboards',
  'Cards, tables and modals across the dashboard now have full keyboard navigation, visible focus rings, ARIA labelling and mobile-safe overflow handling.',
  'accessibility',
  ARRAY['all'],
$md$
# Accessibility & responsive sweep

We did a deeper a11y pass across the manager dashboards. Highlights:

## Tables

- Major data tables (Performance cycles, Employment variations, Onboarding Control Room) are wrapped in horizontal-scroll containers so they scroll on narrow viewports instead of breaking the layout.
- Tab order follows visual order; `Enter` opens the row's detail panel; `Esc` closes any open modal or drawer.

## Cards & tiles

- Status KPI tiles expose ARIA labels so screen readers announce both the metric and its value.
- Custom cards have focus-visible rings that match the design tokens.

## Modals & dialogs

- Focus is trapped while open and returned to the trigger on close.
- `Esc` to close is honoured everywhere.

## Skip links

A "Skip to main content" link is now the first focusable element on the payroll wizard and other long-form admin pages.
$md$,
  ARRAY['accessibility','a11y','keyboard','responsive'],
  true,
  28
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  category = EXCLUDED.category,
  role_audience = EXCLUDED.role_audience,
  body_md = EXCLUDED.body_md,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
