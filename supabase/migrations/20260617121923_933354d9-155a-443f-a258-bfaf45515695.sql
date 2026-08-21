
INSERT INTO public.knowledge_articles (slug, title, summary, category, role_audience, body_md, tags, published)
VALUES (
  'org-admin-manual',
  'Org Admin Manual — full step-by-step guide',
  'Comprehensive reference for organization admins: setting up your tenant, employees, onboarding templates, expenses (claims, approvals, reimbursements), geofences with Google Maps, leave, payroll, templates hub, knowledge hub, and the global search.',
  'admin',
  ARRAY['org_admin','hr','super_admin'],
$md$
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
- **Org → Expenses** shows the queue, filterable by status:
  *Submitted → Recommended → Approved → Paid → Rejected*.
- Click a claim to open the drawer — review line items, view receipts, leave a comment.
- Click **Approve** or **Reject**.

### Reimbursement
- Once approved, finance opens the claim and enters a **payment reference**, then clicks **Mark paid**.
- The claim moves to **Paid**, a notification fires, and the employee sees the timestamp and reference in their history.

### Categories
- Manage what employees can claim against under **Org → Expenses → Categories** (set max amount, require receipt, etc.).

## 5. Geofences (with Google Maps picker)

- **Org admin → Geofences**.
- Click **Add geofence**: search for an address or click on the map to place the center pin; drag the pin to adjust; use the slider to set the radius.
- Toggle **Active** to enforce signing/attendance inside the circle.
- Employees signing documents or checking in from outside an active geofence are blocked server-side.

## 6. Leave

- **Org → Leave types** to configure entitlements per country.
- **Org → Holidays** for tenant calendars.
- Approvals appear in the manager's inbox; balances accrue nightly.

## 7. Payroll basics

- **Org → Payroll setup**: pay schedule, super, awards, components.
- **Org → Payroll runs** to create, calculate, finalise, and export STP / payslips.
- Approved expense claims marked **Paid** can be referenced from a run's notes.

## 8. Templates Hub

- **Org → Templates Hub** is the single place to manage:
  - Performance review templates
  - Feedback (360) question templates
  - Payslip templates
  - Onboarding checklists (with training + documents)
  - Training bundles
  - Document request bundles
- Clone any template, customize, and save as your own — the original stays untouched.

## 9. Knowledge hub

- **Help → Knowledge hub** — articles for every role.
- Admins can edit / publish under **Help → Knowledge editor**.
- Every article supports embedded video and Markdown.
- Use the **Download PDF** button on any article to keep a copy.

## 10. Global search

- Click the magnifying glass in the top bar or press **⌘K** (Ctrl-K on Windows).
- Type to filter pages and "How to" articles — go straight to Expenses, Geofences, Templates, etc.
- Results are scoped to your role, so org admins only see what they can act on.

---

### Need help?
- Use **Raise a support ticket** in the Help menu, or email support — we usually reply within one business day.
$md$,
  ARRAY['admin','manual','reference','expenses','onboarding','geofences','payroll'],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body_md = EXCLUDED.body_md,
  category = EXCLUDED.category,
  role_audience = EXCLUDED.role_audience,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published,
  updated_at = now();
