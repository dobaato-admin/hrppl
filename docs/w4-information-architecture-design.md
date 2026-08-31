# Wave 4 — Information architecture: design document (Deliverable 1)

**Status: draft, for review. No code changes in this wave until this document is approved** — per
`docs/plan-waves.md`, Wave 4's own working agreement.

This replaces the summary in `docs/plan-waves.md` §"Wave 4" with the actual regrouped tree, the
concrete duplicate-resolution mapping (file-level, not just counts), the per-role dashboard
proposal, and the open decisions the user needs to make before Deliverable 2 (implementation)
starts.

---

## 1. Why this wave exists

The sidebar (`src/components/AppShell.tsx`) grew feature-by-feature over Waves 1–3 with no pass to
re-shape it. Re-counted directly from source today (2026-08-30), not from the earlier audit
snapshot, which had already drifted by a handful of items as W3.3 added `/admin/wfh`:

- **103 sidebar entries across 8 groups.** *Organization* alone is 52 of those (half the nav), and
  its "Operations" sub-list is **17 items in one flat, unscrollable-feeling accordion** — onboarding,
  performance, training, documents, expenses and five separate "template" pages, all at the same
  visual level.
- **~20 in-app pages have no nav entry at all**, including **4 setup wizards** and a **duplicate
  security-findings page** — confirmed below at the file level, not estimated.
- **`GlobalSearch.tsx:30-68`** is a second, hand-maintained registry of ~30 destinations with its
  own `feature` gates, independent of the sidebar. It already lists things the sidebar doesn't
  (`/help/org-admin-manual`, ten `/help/*` how-to pages) and is missing things the sidebar has
  (nothing under Compliance, nothing under Insights). The two will keep drifting apart as long as
  they're maintained by hand in two files.
- **Every role sees the same dashboard.** `employee`, `manager`, `hr` and `finance` all get the
  identical 5 KPI tiles and 3 board cards (`src/routes/dashboard.tsx:229-328`); `finance` and
  `regional_admin` get no admin shortcuts at all (`:334` gates shortcuts to `isOrg || isRegional ||
  isSuper` only). Two board rows are hardcoded, not reactive to data (`:312` "Personal documents"
  always shows `status="Open"`; `:326` "Notification preferences" always shows `status="Info"`).
- **No single name per page.** The dashboard is "Home" in the sidebar, "Me — hrppl" and "hrppl
  Dashboard"-style strings in `<title>` depending on which of three routes you're on, and "My
  dashboard — hrppl" on the one that's actually a leftover duplicate.

None of this is a correctness bug in the Wave 1–3 sense — nothing leaks data or approves the wrong
request. It's discoverability debt: a `hr` or `branch_admin` opening *Organization → Operations*
today sees 17 undifferentiated rows and has to read every label to find "Review cycles."

---

## 2. Confirmed duplicate / orphan sets (file-level)

This table replaces the count-only claims in `docs/plan-waves.md` with what each set actually is,
checked against the route files' own titles and gates. **"Action" is a recommendation, not a
decision** — §6 lists which of these need the user's sign-off before Deliverable 2 touches them.

| Set | Files | What's actually going on | Recommended action |
|---|---|---|---|
| **Home, 3-way** | `dashboard.tsx` (`/dashboard`), `me.index.tsx` (`/me`), `me.dashboard.tsx` (`/me/dashboard`) | `me.dashboard.tsx` calls the same `getDashboardSnapshot` query as `/dashboard` — it's a genuine leftover duplicate. `/me` calls a *different* query (`getMeOverview`: leave balance, my documents, my tasks) and is a real, distinct "my profile at a glance" page already correctly separated in the sidebar (`Home` and `Me` are two distinct top items). | Redirect `/me/dashboard` → `/dashboard`. Keep `/dashboard` and `/me` as the two distinct pages they already are — this pair was never actually broken. |
| **Payroll wizard, 2-way — RESOLVED, not a duplicate** | `admin.payroll-wizard.tsx` (1094 lines) vs `admin.payroll-setup-wizard.tsx` (403 lines) | **Traced both entry points — neither is an orphan and neither supersedes the other.** `admin.payroll-setup.tsx` (in nav, "Payroll setup") has an "Open setup wizard" button pointing at **`/admin/payroll-wizard`** — a comprehensive 6-step flow (Country & currency → Pay period & hours → Taxes & deductions → Overtime & allowances → Scenarios → Review & preview), country-aware (reads `tenant.country_code`, shows preset pay frequency/workweek hours/overtime multiplier/fiscal-year start; offers a Nepal-specific quick-seed dialog when `country_code === "NP"`), with live salary-scenario modelling and a payroll-config export/audit-log viewer. Separately, `org.invitations.tsx` (in nav, "Invite staff") links to **`/admin/payroll-setup-wizard`** as its readiness gate — a narrower 4-step flow (Pay items → Pay dates → Overtime rates → Currency) whose specific job is blocking employee invitations until those four are done (`getPayrollReadiness`, also wired into `staff-invitations.functions.ts`). Their titles differ **only in capitalisation** ("Payroll setup wizard" vs "Payroll Setup Wizard"), which is what made them look like drafts of one flow — they're actually two different flows for two different moments, both live. | **Do not delete or redirect either.** Rename one for clarity so the near-identical titles stop reading as duplicates — e.g. `/admin/payroll-wizard` → "Payroll configuration wizard", `/admin/payroll-setup-wizard` → "Pre-invite payroll checklist". Your call on the exact wording; both stay wired to their current entry points either way. |
| **Setup wizards, the other 2 — also RESOLVED, also not orphans** | `admin.overtime-setup-wizard.tsx`, `admin.leave-setup-wizard.tsx` | Traced the same way: **both** are linked from `org.invitations.tsx` alongside the payroll readiness gate — the "Invite staff" page runs three parallel readiness checklists (payroll, overtime, leave) before it lets an admin invite an employee, each with its own "complete this" CTA into its own wizard. All 4 "orphan setup wizards" are in fact one coherent, already-working readiness-gate pattern living entirely on one page. | No nav entry needed for any of the 4 — they're one-time flows correctly reached only from the moment they're relevant (about to invite your first employee), not destinations someone returns to. This whole "duplicate set" was a false positive from counting routes without checking what links to them. |
| **Security findings, 2-way** | `admin.security.tsx` (`/admin/security`, in nav, "Security Findings", `noindex`) vs `admin.security-findings.tsx` (`/admin/security-findings`, orphan, "Security findings") | Near-identical titles, near-identical purpose. `admin.security.tsx` is the one already linked from *Super admin*. | Confirm `admin.security-findings.tsx` is superseded (quick diff), then redirect it to `/admin/security` and delete the route. |
| **Billing, 3-way (name collision, not true duplication)** | `admin.billing.tsx` ("Direct-debit billing", orphan), `admin.billing-ops.tsx` ("Billing operations", orphan), `settings.billing.tsx` ("Billing & subscription", in nav under *Account*) | Three different scopes — platform-side direct-debit config, internal billing ops, and the org's own subscription page — that happen to all be called "billing." Not a redundancy bug; a **naming and discoverability** bug: two admin-only billing surfaces have no path to them at all. | Rename for clarity (e.g. "Billing — direct debit setup", "Billing — internal ops") and place both under *Super admin*, next to `platform.tenants`/`platform.fx`, gated the same as those. |
| **Expenses, 3-way (also a name collision) — RESOLVED** | `org.expenses.tsx` ("Expenses" — manager/finance approvals, in nav), `me.expenses.tsx` ("My expenses" — personal submission, in nav), `admin.expenses.tsx` ("Expense settings" — category/policy config, **orphan**, currently self-gated `AdminGate allow={ADMIN_LAYOUT_ROLES}` — broader than it should be, since that allow-set includes `manager`/`branch_admin`, who should approve claims, not redefine categories) | Three legitimately different scopes (submit / approve / configure). Only the config page is missing a nav entry. | Add "Expense categories" under *Organization → Payroll*, next to "Expenses" (approvals) itself. **Narrow its gate to a new key**, `org.expenseSettings`: `SET("super_admin", "org_admin", "finance")` — mirrors `org.payslipTemplates`'s existing gate, the closest precedent for "define a tenant-wide config, not approve individual transactions." Requires updating `admin.expenses.tsx`'s own `AdminGate allow={...}` to match, not just adding the nav row. |
| **Templates, 5-way — CORRECTED, not a mergeable set** | `admin.templates.tsx` ("Templates Hub", in nav), `admin.review-templates.tsx`, `admin.feedback-templates.tsx`, `admin.payslip-templates.tsx` (all in nav), `org.documents.templates.tsx` (orphan, document-envelope templates) | **Read `admin.templates.tsx` before writing the first draft of this row and the claim below was wrong.** It is not a meta-page linking to the other four — it's its own independent template system with four tabs of its own (Onboarding templates, Training bundles, Document request templates, and a "Reviews" tab that's just a shortcut button to `/admin/review-templates`), backed by `templates.functions.ts` — a completely different backend from the other four pages' `review-templates`/`feedback-templates`/`payslip-templates`/`org.documents.templates` functions. Five things named "template," but genuinely five different systems, not a hub-and-spokes shape. The originally-planned "fold four pages into the hub's tabs" would have meant migrating four pages' worth of real CRUD UI into a page that already has a full, unrelated identity — real engineering work this document isn't scoped to redesign, not a nav change. | **No merge.** The actual fix is the regroup itself (§4) — once these five sit in the subgroups their *content* belongs to (Onboarding, Learning, Performance & growth, Records) instead of all seventeen Operations items in one flat list, five distinctly-named template pages in four different places read as five different things, which they are. The one real gap is `org.documents.templates.tsx`, which gets a first nav entry under Records. |
| **Holidays, mostly already coherent** | `admin.holiday-categories.tsx` ("Holiday calendars" — category/config, in nav), `admin.holiday-calendar.tsx` ("Public holidays" — the calendar view, in nav), `admin.holidays.tsx` (orphan, flat list view — **already documented in-code**, `AppShell.tsx:727-732`, as intentionally still linked *from inside* the calendar page as "List view"), `admin.employee-holidays.tsx` ("Per-employee holidays", in nav) | Three of four are correctly placed; the fourth is a deliberate secondary view, not a bug. The remaining issue is just that "Holiday calendars" (config) and "Public holidays" (the calendar itself) read as near-synonyms in a sidebar list. | Rename "Holiday calendars" → "Holiday categories" to match its actual title and stop reading as a duplicate of "Public holidays." No routing change needed. |
| **Onboarding, 7 routes, mostly correct nesting** | `onboarding.index.tsx` (`/onboarding`, personal checklist, in nav), `onboarding.profile.tsx` (`/onboarding/profile`, orphan — a **step inside** the checklist flow), `org.onboarding.tsx` + `org.onboarding.index.tsx` (`/org/onboarding`, admin overview, in nav), `org.onboarding.tracker.tsx` (in nav), `org.onboarding.control-room.index.tsx` + `org.onboarding.control-room.$id.tsx` (orphans — detail views reached **from** the tracker), `admin.onboarding-packs.tsx` (orphan, **not** part of the flow — it's the config page defining what an onboarding pack contains) | Of the 7, only `admin.onboarding-packs.tsx` is a genuine "should have a nav entry but doesn't" gap. The rest are child/detail routes correctly reached in-flow, not orphans in the sense that matters. | Add `admin.onboarding-packs.tsx` under *Organization → Onboarding* (see §4). It already self-gates `ORG_ADMIN_ONLY`, so the new nav entry inherits that directly — no new gate decision needed here. |
| **`hr.variations.tsx` — a real, fully-built feature, and only *partly* redundant, not wholly** | `/hr/variations`, "Employment variations" | Not a design/style preview (that was a guess in the previous draft of this doc, made without reading the file — corrected now). It's a complete workflow, gated inline (`hr`/`org_admin`/`super_admin`, redirect-on-deny — a different but equally valid pattern from `<AdminGate>`, which is why the `AdminGate` grep in §2's methodology missed it), covering 7 change types: **promotion, transfer, pay_change, hours_change, role_change, department_change, contract_change**, each going through `draft → pending_approval → approved/rejected → applied/cancelled`, backed by real server functions (`employment-variations.functions.ts`) with its own approvals log (`employment_variation_approvals`) and in-app notifications on submit/approve/apply — a stronger audit trail than either page it overlaps with. It has no nav entry anywhere and no link from any other page. **Checked both overlaps at the code level, not just by name:** its `promotion` type duplicates `org.promotions.tsx` (already in nav) — which has deeper business logic this page lacks (approving a promotion into a graded designation auto-proposes a `pay_rate_changes` row at the pay band's midpoint). Its `pay_change` type separately duplicates `org.pay-rates.tsx` / `pay_rate_changes` (already in nav, its own dedicated system with its own propose/decide functions). The other 5 types — transfer, hours_change, role_change, department_change, contract_change — have **no other system anywhere in the codebase**; this page is the only place they could ever be requested. So the honest finding is **2 of 7 types are superseded, 5 are not** — "comment out the whole page" would delete the only home for those 5. | Keep the page, give it a nav slot (§4, under Team). **Comment out only the `promotion` and `pay_change` options** in its type selector (not the server-side enum — leave that alone in case draft rows already use those values), with an inline comment pointing at `org.promotions.tsx` and `org.pay-rates.tsx` as the pages to use instead, and say so in the commit message per your instruction. The remaining 5 types keep the page's full workflow. |
| **Other real orphans, no duplicate set** | `notifications.tsx`, `org.settings.mfa-policy.tsx`, `org.timesheet-review.tsx`, `org.careers.settings.tsx`, `org.documents.expiring.tsx`, `admin.audit-history.tsx` | `/notifications` is reached via the bell icon, not the sidebar — correct as-is, not an orphan. The remaining five are real gaps: pages an admin needs but can currently only reach by typing the URL. | Place the five real gaps per §4's tree below. |

**A finding that surfaced while checking gates, outside pure IA scope:** `org.timesheet-review.tsx`,
`org.settings.mfa-policy.tsx`, `org.documents.expiring.tsx`, `org.documents.templates.tsx`, and
`org.careers.settings.tsx` have **no `<AdminGate>` in the route file itself** — unlike every other
admin-ish page checked, which wraps its content in `<AdminGate allow={...}>`. (`hr.variations.tsx`
looked like it belonged on this list too on the same grep, but reading it showed it gates inline via
`useAuth()` + a redirect-on-deny effect — a different, equally valid pattern, not a gap. Worth
remembering when doing this kind of check by grep: a missing `<AdminGate>` match is a prompt to
read the file, not a finding on its own.) The remaining five may be fine the same way, or may lean
entirely on server-fn/RLS enforcement (the actual security boundary per `CLAUDE.md`'s RBAC
section) — but that wasn't verified here and should be, as a quick pass, before or during
Deliverable 2. This is a UI-gating consistency check, not a claim that these pages are currently
exploitable.

---

## 3. What GlobalSearch has that the sidebar doesn't (and vice versa)

`GlobalSearch.tsx:30-68` is authoritative for `/help/*` — ten how-to pages and one manual
(`/help/org-admin-manual`) exist **only** in that file, reachable by search but with no link from
`Help → Knowledge hub` or anywhere else. Conversely, the sidebar's *Compliance* and *Insights*
subgroups (discipline, medical, assets, offboarding, biometric, WFH approvals, geofences,
analytics, reports — 10 destinations) have **no entry in GlobalSearch at all**.

**Recommendation:** stop maintaining two registries. Generate `GlobalSearch`'s "Pages" group from
the same nav-tree data structure §4 proposes (one array of `{title, to, feature, keywords}`, one
place edited); keep the "How to" group as its own hand-authored list — that one is genuinely
different content (task-based help articles, not destinations), but link its parent, "Knowledge
hub," to a page listing them, closing the "no link from Help" gap for exactly zero extra
maintenance going forward. This is a Deliverable-2 refactor of `AppShell.tsx`'s nav arrays into a
shared module (`src/lib/nav-tree.ts` or similar), not a design decision — noted here so it isn't
missed at implementation time.

---

## 4. Proposed nav tree

Groups and role gates are **unchanged from today's `src/lib/rbac.ts` feature keys** except where
marked **NEW** (a page gaining a nav entry it didn't have) or **RENAMED** (label change only, same
route, same gate). This is a regroup, not a re-permission — nothing here changes who can already
reach a page that already had a nav entry.

### My workspace *(unchanged — already well-organized from the earlier flat-list fix)*

Home, Me · **Profile** (Contact details, Banking & tax, Directory, Security) · **Time & leave** (My
leave, Attendance, My TOIL, Work from home) · **Pay & expenses** (My payslips, My expenses) ·
**Growth** (My performance, My scorecards, My duties, Duty self-review, My training, Recognition) ·
**Records & requests** (Onboarding, My requests, My documents, Signatures, My assets, My record,
Grievances)

### Practice *(unchanged)*

My time, Clients, Projects, Jobs, Invoices — all gated `practice.console`.

### Manager *(unchanged)*

Dashboard (`/team`), Requests inbox (`/admin/requests`).

### Organization — regrouped from 6 uneven sections into 9 capped ones

The old shape: Team (8) · Leave & time (7) · Payroll (7) · **Operations (17)** · Insights (2) ·
Compliance (8). The new shape caps every subgroup at 9 and gives Operations' contents an actual
shape:

- **Team** *(8 → 9, +1 NEW)* — Employees, Team members, Invite staff, Roles & permissions, Team
  assignments, Departments, Designations, Recruitment, **Employment variations** (NEW —
  `hr.variations.tsx`, inherits its existing inline `hr`/`org_admin`/`super_admin` gate). Placement
  only — whether this page should replace, merge with, or stay genuinely separate from Promotions
  right above it is the open product question from §2/§6, not settled by giving it a nav slot.
- **Leave & time** *(unchanged, 7)* — Leave management, Timesheets, Leave types, Holiday
  **categories** (RENAMED from "Holiday calendars," same route), Public holidays, Per-employee
  holidays, TOIL admin.
- **Payroll** *(7 → 9)* — Run payroll, Pay rates, Overtime rates, Promotions, Payroll setup,
  Payroll settings, Payslip templates *(stays — no merge, see the Templates correction below)*,
  **Expenses** (moved in from the old Operations list — approvals are compensation-adjacent, not
  really an "operation," and it now sits next to the config page it pairs with), **Expense
  categories** (NEW — `admin.expenses.tsx`, gated by a new, narrower key — resolved in §6:
  `org.expenseSettings`, `SET("super_admin","org_admin","finance")`, mirroring
  `org.payslipTemplates`'s existing gate rather than reusing the broader `org.expenses`). At the
  9-item cap; nothing else moves in here without moving something out.
- **Onboarding** *(new subgroup, pulled out of the old Operations, 3)* — Onboarding admin,
  Onboarding tracker, **Onboarding packs** (NEW — `admin.onboarding-packs.tsx`, inherits its
  existing `ORG_ADMIN_ONLY` self-gate).
- **Performance & growth** *(pulled out of Operations, 9)* — Performance reviews, Review cycles,
  Review analytics, KPI & KRA library, Duties & responsibilities, Duty-based KPI review, Review
  templates, Feedback templates, Templates Hub — all nine stay standalone (no merge, see below).
  Also at the 9-item cap.
- **Learning** *(new subgroup, pulled out of Operations, 2)* — Training, Training catalog.
- **Records** *(pulled out of Operations, 3 → 4, +2 moved/added)* — Documents, **Document
  templates** (NEW — `org.documents.templates.tsx`, closing its orphan gap directly rather than via
  a hub fold), **AU STP2 & Payday Super audit** (moved in per your call — resolved), Missing info
  requests.
- **Insights** *(unchanged, 2)* — Analytics, Reports.
- **Compliance & safety** *(unchanged, 8)* — Discipline & grievances, Medical incidents, Asset
  register, Exit & offboarding, Biometric devices, Work-from-home approvals, Signing geofences,
  White-label.

**Templates, corrected:** the five template pages do **not** merge (§2) — `admin.templates.tsx`
turned out to be its own independent system, not a hub for the other four. All five keep their
current routes, content, and (mostly) their current gates, and now sit in the subgroup their
content actually belongs to instead of one flat 17-item list: Payslip templates in Payroll;
Review templates, Feedback templates, and Templates Hub in Performance & growth; Document
templates (new) in Records. Splitting them across four subgroups by what they configure is itself
the fix for "five things called template look like duplicates" — no page merge required.

Net effect: Organization goes from **52 rows in 6 groups (one of them 17 long)** to **56 rows in 9
groups, none longer than 9** — the count grows because nothing was removed or merged, only
regrouped, plus four genuine gaps closed (Employment variations, Expense categories, Onboarding
packs, Document templates). No group requires scrolling past a wall of undifferentiated text to
find one item.

### Regional, Super admin, Account, Help *(unchanged, except:)*

- **Super admin** gains the two orphaned billing pages (RENAMED per §2): "Billing — direct debit"
  and "Billing — internal ops," gated the same as `platform.tenants`/`platform.fx` (i.e.
  `super_admin` only — narrower than `settings.billing`, which `org_admin` can also reach; these
  two are platform-internal, not a tenant's own subscription page).
- **Help** stays two items (Knowledge hub, Knowledge editor); the ten `/help/*` how-to pages and the
  org-admin manual get a visible list on the Knowledge hub page itself (§3), rather than a new nav
  row each.

---

## 5. Per-role dashboards

Today: `dashboard.tsx` renders identically for `employee`, `manager`, `hr`, and `finance`. The KPI
row (`:229-266`, Leave pending / Timesheets to submit / Reviews open / Onboarding tasks / Payslips
available) is genuinely personal data — correct for everyone, including `finance`, since it's "my"
leave/timesheets/reviews regardless of role. The problem is entirely below that row:

- **Admin shortcuts** (`:334-378`) gate to `isOrg || isRegional || isSuper` — `finance`, `hr`,
  `branch_admin`, and `manager` see none, even though each has real destinations worth
  surfacing (finance → pay runs due; hr → open requisitions; manager → team's pending approvals).
- **`ManagerQuickAccess`** (`:330`, `manager-quick-access.functions.ts`) already exists as a
  customizable tile picker, but only renders for `isManager`. The same mechanism — not a new one —
  is the natural fit for `hr` and `finance`, each with their own default tile set and their own
  saved customization (the underlying table is presumably already keyed by user, not by role — a
  design-doc note for whoever picks this up: confirm before assuming a `finance` and `manager`
  account can each have independent saved picks with no schema change).
- **Two board rows are hardcoded** (`:312`, `:326`) — cosmetic, but worth fixing in the same pass
  since Deliverable 2 is already touching this file.

**Proposed defaults** (all customizable via the existing quick-access mechanism, not hardcoded):

| Role | Default admin shortcuts |
|---|---|
| `manager` | Team dashboard, Requests inbox *(already the two "Manager" nav items — surface as tiles too)* |
| `hr` | Employees, Recruitment, Onboarding tracker |
| `finance` | Run payroll, Expense approvals *(`org.expenses`)*, Analytics |
| `branch_admin` | Team members, Requests inbox, Asset register |
| `org_admin`, `regional_admin`, `super_admin` | *(unchanged — already get the full Admin shortcuts row)* |

**Approved as the default proposal**, on the explicit condition that it's seeded through the
existing quick-access mechanism (customizable per user, same as `manager`'s today) rather than
hardcoded — the table above is exactly that: a starting default, editable afterwards, no schema
change implied.

---

## 6. Open decisions

Three of the original five are now resolved; two remain, and neither blocks the rest of
Deliverable 2 — they only block the specific rows they touch.

**Resolved:**

- **`admin.expenses.tsx`'s gate** → new, narrower key `org.expenseSettings`
  (`SET("super_admin","org_admin","finance")`), not a reuse of `org.expenses`. Applied in §2/§4.
- **AU STP2 audit's group** → Records. Applied in §4.
- **Per-role dashboard tile defaults** → §5's table accepted as the starting default, kept
  customizable via the existing quick-access mechanism rather than hardcoded.

**Still open:**

1. **Payroll wizard naming.** Traced both routes (§2) — they are two different, both-live flows,
   not duplicates, so there is nothing to delete. The only remaining question is what to rename
   `/admin/payroll-wizard` and `/admin/payroll-setup-wizard` to so their near-identical current
   titles ("Payroll setup wizard" vs "Payroll Setup Wizard") stop reading as the same page. Suggested
   in §2 ("Payroll configuration wizard" / "Pre-invite payroll checklist"); your call on the exact
   wording, or keep the current titles if the near-collision doesn't bother you now that you know
   they're genuinely different.
2. **`hr.variations.tsx` — RESOLVED, at the type level.** Checked both suspected overlaps at the
   code level (§2): its `promotion` type duplicates `org.promotions.tsx` (which additionally
   auto-proposes a pay-band pay-rate change on approval — genuinely more capable for that one
   type); its `pay_change` type duplicates the dedicated `org.pay-rates.tsx` / `pay_rate_changes`
   system. Neither duplication is close — the other 5 types (transfer, hours_change, role_change,
   department_change, contract_change) exist **only** on this page. Per your instruction: commenting
   out the two superseded type options (not the whole page, and not the server-side enum) in
   Deliverable 2, with a comment pointing to the two pages that supersede them and a note in the
   commit message so it's easy to find again if the scoping turns out to be wrong.

---

## 7. Naming convention (one name per page)

Going forward: **nav label = `<title>` tag = page `<h1>`**, verbatim, for every page. Today's
dashboard is "Home" (nav) / "hrppl Dashboard"-pattern (`<title>`, varies by route) / no consistent
`<h1>` — three names for one page. Fix: nav label becomes the single source, `head: () => ({ meta:
[{ title: "<label> — hrppl" }] })` is generated from it, and each `AppShell`/`PageHeader` `title`
prop passes the same string. This is mechanical once §4's tree is approved — every route file's
`head()` gets checked against its nav label as part of Deliverable 2, not decided here.

---

## 8. Rollout plan — status

Branch `feat/w4-information-architecture`.

1. **Done** — §4's Organization regroup applied directly in `AppShell.tsx` (9 subgroups, none over
   9 items). **Not done**: extracting the nav arrays into a shared `src/lib/nav-tree.ts` consumed by
   both `AppShell` and `GlobalSearch` (§3's recommendation) — deferred. `tests/nav-integrity.test.ts`
   already existed (found while starting this step) and regex-scans `AppShell.tsx` directly for
   uniqueness + route-resolution, so the safety net §8.8 wanted was already in place and needed no
   new file — it passed unchanged against every new/moved entry below. `GlobalSearch` is still a
   second, hand-maintained registry; it does not yet reflect this regroup.
2. `me.dashboard.tsx` → `/dashboard` and `admin.security-findings.tsx` → `/admin/security`
   redirects: **not done** — the two orphan pages still exist un-redirected. No redirect needed for
   the payroll/overtime/leave wizards (confirmed not duplicates).
3. Template pages: **not merged**, per the corrected §2/§4 — regrouped by domain instead.
4. New nav entries — **done**, gates resolved during implementation, not assumed:
   - `admin.expenses.tsx` → Payroll, gate narrowed from `ADMIN_LAYOUT_ROLES` to new
     `org.expenseSettings` / `ORG_ADMIN_OR_FINANCE`.
   - `admin.onboarding-packs.tsx` → Onboarding, kept its own `ORG_ADMIN_ONLY`.
   - `org.documents.templates.tsx` → Records. Had **no route-level gate at all**; added
     `AdminGate allow={ADMIN_LAYOUT_ROLES}` (found only while wiring the nav entry).
   - `hr.variations.tsx` → Team, as "Employment variations." Its `promotion`/`pay_change` type
     options are commented out on the page (server-side enum left alone) per §6.2.
   - `admin.billing.tsx` and `admin.billing-ops.tsx` → Super admin. **Both had `AdminGate`
     imported but never wired up** — genuinely no route-level gate despite
     `admin.billing-ops.tsx`'s own meta description already saying "Super-admin dashboard." Fixed
     with `SUPER_ADMIN_ONLY` alongside adding the nav entries; not something the design phase had
     found.
5. **Done** — "Holiday calendars" → "Holiday categories"; payroll wizard titles renamed to "Payroll
   configuration wizard" and "Pre-invite payroll checklist" (§6.1), including the cross-link labels
   on `org.invitations.tsx` and the "Open setup wizard" button on `admin.payroll-setup.tsx`.
6. **Done** — `dashboard.tsx`'s quick-access picker (`ManagerQuickAccess`) now renders for
   `finance` too (it already rendered for `manager`/`hr`/`branch_admin`/`org_admin`/`super_admin` —
   the design doc's original claim that hr/branch_admin saw nothing was wrong; only `finance` truly
   had no admin-facing section at all), with role-aware default seed keys per §5, still fully
   user-customizable via the existing `manager_quick_access` mechanism (no schema change). Also
   fixed, found while in this code: the quick-access card's description rendered the raw route
   `href` — changed to the tile's `group` label. **Not fixed**: the two hardcoded board-row
   statuses ("Personal documents," "Notification preferences") — needs a real data source, not a
   one-line change; left as a follow-up rather than fabricating a heuristic.
7. **Not done** — a dedicated `tests/nav-uniqueness.test.ts`; unnecessary, see item 1.
   `tests/admin-gate-role-sets.test.ts` extended instead, pinning the 4 gates fixed/narrowed above.
8. **Not done** — the naming-convention pass from §7 (nav label = `<title>` = `<h1>`) beyond the
   renames already listed under item 5.
9. **Also fixed in passing**: `tests/geofence-reconciliation.test.ts` (W3.3) hardcoded a calendar
   date for "now," which failed once real time passed outside its assumed 24h window — same bug
   class the test exists to catch, just in the test. Made relative to `Date.now()`.

**Verified**: `tsc --noEmit` clean; full suite at the documented baseline (846 → 850 passed, the
+4 from new gate-contract tests; still 4 failed / 5 skipped, no new failures);
`tests/nav-integrity.test.ts` and `tests/admin-gate-role-sets.test.ts` both green against every
change above.

---

## 9. Explicitly out of scope for this wave

- **Consolidating the three review systems** (`performance_reviews` / `review_instances` /
  `duty_review_scores`) — already flagged in `docs/plan-waves.md` §W3.1 as an open product question
  with its own resolution path. This wave regroups their *nav entries*; it does not touch which
  tables or code paths exist.
- **Public/marketing routes** (`index.tsx`, `pricing.tsx`, `careers.*`, `blog.*`, `contact.tsx`,
  `terms.tsx`, `privacy.tsx`, auth pages, `sign.*`, `[.well-known]`, `[.mcp]`) — not part of the
  authenticated sidebar, not touched here.
- **Merging `hr.variations.tsx`, `org.promotions.tsx`, and `org.pay-rates.tsx` into one system** —
  resolved as out of scope (§6 item 2): the two-type overlap is handled by narrowing what
  `hr.variations.tsx` offers, not by merging three working pages into one.
