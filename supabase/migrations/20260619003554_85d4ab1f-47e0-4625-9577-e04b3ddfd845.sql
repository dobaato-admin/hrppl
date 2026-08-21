
INSERT INTO public.knowledge_articles (slug, title, summary, category, role_audience, body_md, tags, published, sort_order)
VALUES
(
  'kpi-kra-library',
  'KPI & KRA library — one-click apply',
  'Browse standard KPI and KRA presets by industry, role, or keyword, and seed them into your tenant with a single click. Includes filters, search, and access-control hints.',
  'performance',
  ARRAY['org_admin','hr','super_admin'],
$md$
# KPI & KRA library

The KPI & KRA library is a curated catalog of standard scorecards you can apply to your tenant in one click. It complements the full **Review templates** editor with a faster, focused entry point for KPIs and KRAs only.

## Where to find it

- Sidebar: **Admin → KPI & KRA library** (`/admin/kpi-kra`).
- Also linked from **Admin → Review templates** via the **KPI & KRA library** button in the toolbar.

> Access requires the `org_admin` or `super_admin` role. Other users see a clear "You don't have access" notice with the required role and a link to **My reviews**.

## What you can do

1. **Filter** by industry, by kind (KPI only / KRA only / both), and by free-text **search** across role, preset name, description, and individual KPI item labels.
2. **Preview** each preset — number of items, rating scale, and the first few KPI labels.
3. **Apply to my tenant** — creates a new review template under your org, ready to edit or attach to a cycle in **Performance → Cycles**.

## Editing after applying

Applied presets land in **Admin → Review templates**. Open the template to rename, tweak items, change the rating scale, or set it as the default for new cycles. You can also bump a new version with a change note.

## When to use the library vs. the templates editor

- Use the **library** when you want a known-good starting point and a quick seed.
- Use the **templates editor** when you need to build something custom from scratch, import a JSON export, or audit changes.
$md$,
  ARRAY['performance','kpi','kra','templates','admin'],
  true,
  20
),
(
  'expense-category-presets',
  'Expense category presets — quick-add standard categories',
  'Seed your tenant with industry-standard expense categories (Travel, Meals, Office supplies, Mileage, etc.) in one click. Each preset ships with sensible defaults for receipt requirements and max amounts.',
  'expenses',
  ARRAY['org_admin','hr','super_admin'],
$md$
# Expense category presets

The Categories tab under **Org → Expenses** now ships with a built-in library of 12 standard category presets. Use them to skip manual typing and start collecting expense claims in minutes.

## Where to find them

- **Org → Expenses → Categories**.
- The **Standard category presets** card sits above your existing categories list.

## Available presets

Travel · Accommodation · Meals · Client entertainment · Mileage · Office supplies · Software · Training · Phone & internet · Wellbeing · Team events · Other.

Each preset includes a name, a stable code, a sensible `max_amount`, and a `requires_receipt` default appropriate for the category.

## Actions

- **Quick add** — instantly creates the category with all defaults.
- **Customize** — opens the standard category form prefilled from the preset so you can tweak code, max amount, or receipt requirement before saving.

Already-added presets are detected by code/name and shown as **Added**, so you cannot accidentally duplicate them.

## Employee experience

Employees still add lines to their claim under **My workspace → My expenses → New claim**. The line form picks from your tenant's active categories and supports note + receipt upload per line.
$md$,
  ARRAY['expenses','categories','presets','admin'],
  true,
  30
),
(
  'platform-security-updates',
  'Recent security hardening — what changed',
  'Summary of recent platform security improvements: cron endpoint auth, biometric device secret protection, blog webhook secrets, and the scheduled re-scan workflow.',
  'security',
  ARRAY['org_admin','super_admin'],
$md$
# Recent security hardening

This article summarises platform-wide changes you should be aware of as an admin. None of them require action from end users, but org admins and super admins should know what changed.

## 1. Cron endpoints reject the publishable key

All scheduled hooks (`review-instance-reminders`, `monthly-billing-cycle`, `auto-retry-alerts`, and other `/api/public/hooks/*` routes) now authorise calls strictly via `isAuthorizedCronRequest()`. The publishable (anon) key — which ships in client JavaScript — is no longer accepted as proof of authorisation. Integration tests under `tests/cron-auth.test.ts` guard this contract on every CI run.

## 2. Biometric device shared secrets

The `biometric_devices` table stores cryptographic credentials used to authenticate webhook payloads from physical devices. HR-role access has been narrowed so HR can manage device metadata without reading `shared_secret` or `webhook_token`. Raw secrets are reachable only via service-role code paths.

## 3. Blog webhook secrets

Column-level read access on `blog_webhooks.secret` has been revoked from the `authenticated` role. Super admins can still manage all other columns; the raw `secret` is service-role only.

## 4. Scheduled security re-scan

A weekly GitHub Actions workflow (`.github/workflows/weekly-security-rescan.yml`) imports new findings from connected scanners into the security findings queue (deduped by signature) and emails the admin when new **high-severity** issues appear. You can also trigger it on demand.

## Where findings live

- **Super admin → Security findings** (queue with status filters).
- New findings: triaged, mapped against the security checklist, and marked fixed with the exact remediation commit when resolved.
$md$,
  ARRAY['security','cron','biometric','webhooks','admin'],
  true,
  90
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body_md = EXCLUDED.body_md,
  category = EXCLUDED.category,
  role_audience = EXCLUDED.role_audience,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

UPDATE public.knowledge_articles
SET
  body_md = $md$
# Org Admin Manual

Welcome — this is the complete reference for organization admins running hrppl day to day. You can read it here or download it as PDF for offline use using the **Download PDF** button at the top of this article.

> Tip: press **⌘K** (or click the magnifying glass in the top bar) at any time to jump to any section.

---

## 1. Getting started

1. Sign in at **hrppl.io** with your admin email.
2. Complete the **Organization setup** wizard (tenant name, country, currency, working week).
3. Confirm your role badge in the top-right header reads **Org admin**.
4. From the sidebar **Account → Organization**, set your logo, brand color and address.

## 2. Employees

- Go to **Org → Employees**.
- Click **Add employee**, fill in name, email, department, designation, hire date and pay.
- After saving you'll be offered **"Start onboarding now"** — pick a template and a start date to bulk-assign tasks, training and document requests.
- Use **Bulk import** to upload a CSV for multiple hires at once.
- Open any row to view their career timeline, pay-rate history, documents and assignments.

## 3. Onboarding

- **Org → Onboarding** lists everyone in flight with progress bars.
- Templates live under **Org → Templates Hub → Onboarding**.
- Each template can include checklist items, training courses and document requests.
- Applying a template creates an onboarding case, schedules emails, and enrols the employee in courses.

## 4. Expenses — claims, approvals, reimbursements

### As an employee
- **My workspace → My expenses → New claim**.
- Add line items (date, category, merchant, amount), upload receipts (image or PDF).
- Save as draft, or **Submit for approval**.

### As an approver
- **Org → Expenses** shows the queue, filterable by status: *Submitted → Recommended → Approved → Paid → Rejected*.
- Click a claim to open the drawer — review line items, view receipts, leave a comment, then **Approve** or **Reject**.

### Reimbursement
- Once approved, finance opens the claim, enters a **payment reference**, and clicks **Mark paid**.

### Categories
- Manage what employees can claim against under **Org → Expenses → Categories**.
- **New:** the **Standard category presets** card seeds Travel, Meals, Office supplies, Mileage and 8 more with sensible defaults. **Quick add** to accept defaults, or **Customize** to tweak code / max amount / receipt requirement. See the *Expense category presets* article.

## 5. Geofences (with Google Maps picker)

- **Org admin → Geofences**.
- Add geofence: search address or click the map to place the centre pin; drag to adjust; use the slider to set radius.
- Toggle **Active** to enforce signing/attendance inside the circle.
- Employees signing or checking in from outside an active geofence are blocked server-side.

## 6. Leave

- **Org → Leave types** to configure entitlements per country.
- **Org → Holidays** for tenant calendars.
- Approvals appear in the manager's inbox; balances accrue nightly.

## 7. Payroll basics

- **Org → Payroll setup**: pay schedule, super, awards, components.
- **Org → Payroll runs** to create, calculate, finalise, and export STP / payslips.
- Approved expense claims marked **Paid** can be referenced from a run's notes.

## 8. Performance — KPI, KRA & reviews

- **Org → Performance reviews** — cycles, instances, scorecards.
- **Admin → Review templates** — full editor (KPI, KRA, competency, 360°, mixed). Use the new toolbar **search** to find a preset by role, name, or KPI item.
- **Admin → KPI & KRA library** (`/admin/kpi-kra`) — new dedicated catalog of KPI / KRA presets with industry, kind, and keyword filters, and a one-click **Apply to my tenant** action. Shows a clear access-denied notice (naming the required role) when opened by a user without `org_admin` / `super_admin`.

## 9. Templates Hub

- **Org → Templates Hub** — single place for review templates, 360 question templates, payslip templates, onboarding checklists, training bundles, and document request bundles.
- Clone any template, customize, and save as your own — the original stays untouched.

## 10. Knowledge hub

- **Help → Knowledge hub** — articles for every role.
- Admins can edit / publish under **Help → Knowledge editor**.
- Every article supports embedded video and Markdown.
- Use the **Download PDF** button on any article to keep a copy.

## 11. Security & operations

- Scheduled cron hooks are authorised strictly via `isAuthorizedCronRequest()`; the publishable client key is **not** accepted.
- Biometric device shared secrets and blog webhook secrets are now service-role only.
- A weekly scheduled re-scan imports new scanner findings into the queue (deduped by signature) and emails the admin on new **high-severity** items. See *Recent security hardening*.

## 12. Global search

- Click the magnifying glass in the top bar or press **⌘K** (Ctrl-K on Windows).
- Type to filter pages and "How to" articles — go straight to Expenses, Geofences, Templates, KPI & KRA library, etc.
- Results are scoped to your role, so org admins only see what they can act on.

---

### Need help?
- Use **Raise a support ticket** in the Help menu, or email support — we usually reply within one business day.
$md$,
  summary = 'Comprehensive reference for organization admins: tenant setup, employees, onboarding, expenses (incl. standard category presets), geofences, leave, payroll, performance (KPI & KRA library), templates hub, knowledge hub, security updates, and global search.',
  tags = ARRAY['admin','manual','reference','expenses','onboarding','geofences','payroll','kpi','kra','security'],
  updated_at = now()
WHERE slug = 'org-admin-manual';
