# Guided onboarding routes — specification

**Captured 2026-09-03 from the product owner. Scheduled AFTER Wave 6 (LMS).**

Three guided flows, each a route a user is walked through rather than a set of pages they must
find: **Phase 1** an org admin configuring a new tenant, **Phase 2** a new employee completing
their own record, **Phase 3** the automatic provisioning that follows.

> **Read §9 before building anything.** Most of the underlying data already exists — this is
> largely a *sequencing and guidance* layer over surfaces the platform already has, not a new
> subsystem. The parts that genuinely do not exist are listed there, and one of them
> (bank details, currently in three tables) needs a decision before it is extended.

---

## Phase 1 — Company setup (org admin)

### Segment 1: Company profile & legal entity

| Field | Description | AU specifics |
| --- | --- | --- |
| Legal entity name | Full legal operating name | Must match ATO registration |
| Trading name (DBA) | Display name for internal systems and payslips | Optional |
| ABN / ACN | 11-digit ABN, 9-digit ACN | Real-time ABN Lookup API validation |
| Head office address | Physical and postal | Australian address autocomplete |
| STP Phase 2 details | Software ID (BMS ID) display, ATO routing | Provisioning for STP reporting |

### Segment 2: Payroll engine, leave & pay calendars

**Pay period & calendar**
- Pay frequencies — weekly, fortnightly, bi-monthly, monthly.
- Pay period start, end and scheduled payout dates.
- Public holiday calendars — auto-populate AU federal and state/territory (NSW, VIC, QLD, WA, SA,
  TAS, NT, ACT), with custom additions.

**Leave categories & accrual**
- Standard NES leave: annual (4 weeks, 5 for shift workers), personal/carer's (10 days), long
  service (state-based), compassionate, parental.
- Custom types: study, volunteer, unpaid.
- Accrual settings: hours per pay period, leave loading (e.g. 17.5%), roll-over rules, cash-out
  limits.

**Superannuation defaults**
- Default Superannuation Guarantee percentage.
- Default clearing-house routing and default employer fund (APRA fund name + USI).

### Segment 3: Performance, KRAs & KPI framework
- **Rating scales** — 1–5, 3-tier, or qualitative descriptors.
- **KRA / KPI template library**, role-based. *Example KRA:* "Engineering delivery quality" →
  *KPI:* "Maintain sprint scope creep below 5%."
- **Review cycle schedules** — quarterly, bi-annual, annual, probationary 90-day — with automated
  sign-off between employee, line manager and HR.

### Segment 4: LMS setup
- **Module creation** — WYSIWYG editor, embedded video, attached PDFs.
- **Assessment engine** — multiple-choice quizzes, pass-percentage thresholds, retry limits.
- **Compliance mapping** — flag modules mandatory (WHS, anti-bullying & harassment) with recurring
  renewal intervals (e.g. annual re-certification).

> **SCORM package upload is deferred** (product owner, 2026-09-03). It is not a content type
> alongside the others — it is a player, a sequencing runtime and a `cmi.*` state model, and it
> would be the largest single item in the LMS. The four native content types cover mandatory
> compliance training, which is what Phase 3 depends on. Revisit once the content layer is in use.
> See §10.

### Segment 5: Asset register
- **Categories** — laptops, mobile devices, vehicles, security access cards, tools/uniforms.
- **Master log** — bulk CSV import or manual entry (serial, model, purchase date, value, condition).
- **Assignment rules** — require a digital signature on employee receipt.

### Segment 6: Expense policies & financial governance
- **Categories** — mileage, travel, client entertainment, home office setup, professional development.
- **Policy rules & caps** — per-claim thresholds requiring a receipt (e.g. mandatory over $30 AUD);
  mileage at ATO cents-per-kilometre rates.
- **Approval matrices** — single-tier (line manager) or multi-tier (line manager → department head
  → finance/payroll).

### Segment 7: Grievance handling & HR policy engine
- **Policy document library** — code of conduct, whistleblower, sexual harassment & grievance.
- **Reporting channels** — anonymous vs named; designated grievance officers / HR case managers
  receiving lodgement notifications.
- **Resolution workflows** — SLA timelines for investigation, response templates, escalation paths.

### State retention & save/resume

The admin must be able to stop at any point and come back:

- **Auto-save** — every field change triggers an asynchronous save.
- **Completion checklist sidebar** — visual completed vs pending per module.
- **Setup lock & launch** — when all mandatory items are checked, "Finalize & Activate Platform"
  unlocks full operational functionality.

---

## Phase 2 — Employee onboarding

### Step 1: Invitation (HR admin / manager)
First and last name · personal email and mobile · employment type (full-time, part-time, casual,
contractor) · award / classification / pay rate · department, role title, direct manager.

### Step 2: Employee self-service portal
Candidate receives an email/SMS link into a secure portal.

**Section 1 — Personal details.** Full legal name, preferred name, gender, date of birth;
residential address (validated via lookup); emergency contacts (primary and secondary: name,
relationship, phone).

**Section 2 — TFN declaration** (STP Phase 2 compliant, digital):
- Tax file number
- Residency status for tax purposes (Australian resident, foreign resident, working holiday maker)
- Tax-free threshold claim (yes/no)
- HELP / VSL / Financial Supplement debt status

**Section 3 — Bank account allocation.** Account holder name, BSB (6 digits), account number.
Option to split pay across multiple accounts by percentage or fixed dollar amount.

**Section 4 — Superannuation choice.**
- A: standard employer default fund
- B: nominate existing APRA-regulated fund (name, USI, member number)
- C: self-managed fund (name, ABN, electronic service address, bank details)

### Step 3: Document upload
- Right to work verification (passport, **or** birth certificate + photo ID)
- Driver's licence, if the role requires it
- Qualification certificates and licences (White Card, RSA, First Aid)
- Signed employment contract + Fair Work Information Statement acknowledgement

### Step 4: Verification & activation
HR/payroll receives a review alert to verify bank details, superannuation selection and uploaded
documents. On approval the employee record moves from **Pending onboarding** to **Active**.

---

## Phase 3 — Automated post-onboarding provisioning

Triggered by the employee record becoming Active; assignments derive from role, department and
location templates.

1. **KRA & KPI assignment** — standard role KPIs mapped to the employee's dashboard; employee and
   manager prompted to review and acknowledge targets in the first week.
2. **Training & LMS enrolment** — mandatory compliance modules queued with due dates (e.g. complete
   within 7 days).
3. **Asset allocation & sign-off** — admin designates registered items (laptop serial, passcard);
   employee confirms receipt and accepts usage terms with a digital signature.
4. **Policy sign-offs** — mandatory read-and-sign tasks (grievance handling, code of conduct, IT
   usage).

---

## 9. Coverage against what is already built

Checked against the live schema on 2026-09-03. **Most of this exists.** The work is predominantly
a guided *sequence* over surfaces that are already there, plus the genuinely missing pieces below.

### Already built — sequence these, do not rebuild

| Spec area | Where it already lives |
| --- | --- |
| STP Phase 2 employer details | `tenant_payroll_settings.abn / bms_id / branch_code / stp_gateway` · `/admin/payroll-setup` |
| Default super fund + SG | `tenant_payroll_settings.default_super_fund_id` · `super_funds` · `/admin/super-funds` |
| Public holidays | `public_holidays` · `/admin/holiday-calendar`, `/admin/holiday-categories` |
| Leave types & accrual | `leave_types`, `leave_balances` · `/admin/leave-types` · `admin.leave-setup-wizard` |
| Payroll config | `admin.payroll-setup-wizard`, `admin.payroll-wizard`, `admin.overtime-setup-wizard` |
| Review templates & cycles | `review_templates` · `/admin/review-templates`, `/admin/review-cycles` |
| KRA/duty targets | `employee_duties` (has `kpi_target`) · `/admin/employee-duties` |
| Training courses & enrolment | `training_courses`, `training_enrollments` · `/org/training`, `/admin/training` |
| Asset register & assignment | `assets`, `asset_assignments` · `/admin/assets` |
| Expense categories & approvals | `expense_categories`, `expense_approval_rules` · `/admin/expenses` |
| Grievances | `grievances` · `/admin/discipline` |
| Employee TFN/STP2 fields | `employees.tfn_status / tax_treatment_code / income_type / employment_basis` |
| Employee super choice | `employee_super_choices` · `/admin/super-funds` → Member choices |
| Document upload & checklist | `employee_documents`, `onboarding_checklists` · `/onboarding`, `/org/onboarding/tracker` |
| Invitation flow | `staff-invitations.functions.ts` · `/invite/$token` · `/org/invitations` |
| Readiness gating | `checkPayrollReadiness` / `checkOvertimeReadiness` in `onboarding-readiness` — **already the "mandatory items complete" concept the spec's Setup Lock needs** |

### Genuinely missing — this is the build

| # | Missing | Note |
| --- | --- | --- |
| 1 | **Guided route shell itself** | Stepper, progress sidebar, auto-save, resume. Nothing like it exists; the four wizards are single-purpose and do not compose. |
| 2 | **`tenants.trading_name`, ABN on the tenant** | ABN currently lives only on `tenant_payroll_settings`, which is a *payroll* concern. Decide whether the legal entity owns it before duplicating. |
| 3 | **Pay calendars as first-class rows** | `payroll_runs` has `period_start`/`period_end`, but there is no reusable calendar to generate them from. Segment 2's "pay frequencies + scheduled payout date" needs one. |
| 4 | **Policy document library + acknowledgements** | No `policy_documents` or `policy_acknowledgements` table. Segment 7 and Phase 3 step 4 both depend on it. |
| 5 | **KPI library** | `employee_duties.kpi_target` is free text per employee. Segment 3 wants a reusable role-based library. |
| 6 | **Rating scales as config** | Currently implicit in review templates. |
| 7 | **Split pay across multiple accounts** | See the warning below. |
| 8 | **ABN Lookup + AU address autocomplete** | Both are external API integrations, both need a key and a failure mode. Neither exists. |
| 9 | ~~SCORM support~~ | **Deferred** — see §10. Not in W6, not in this wave. |
| 10 | **Setup Lock & Launch** | The readiness functions exist; the tenant-level "activated" state and the gate it opens do not. |

### ⚠ Decide before building: bank details already exist in three places

```
employee_payroll_details   bank_account_name, bank_account_number, bank_bsb, bank_name, tfn
staff_onboarding_profiles  bank_account_holder, bank_account_number, bank_branch_code,
                           bank_iban, bank_name, bank_swift
employees                  au_tfn, tfn_status
```

Three shapes for a bank account and **two for a TFN**. The spec's "split pay across multiple
accounts" would be a fourth. Reconcile these into one owner before adding — a fourth
representation of an employee's bank details in a payroll product is a defect waiting to happen,
and TFN in two places is a privacy problem as much as a modelling one.

### Sequencing note

Phase 1 Segment 4 (LMS setup) presumes the Wave 6 content layer exists — module authoring, quizzes
and compliance flagging are W6 deliverables. **That is why this work is scheduled after W6.**
Phase 3 step 2 (mandatory module enrolment with due dates) has the same dependency.

Phase 3 step 1 lands in the middle of the unreconciled review systems documented in
`docs/remaining-work.md` §5 — auto-assigning KPIs needs an assignment table that does not exist.
Resolve that first or Phase 3 will add a fourth review pathway.

---

## 10. Deferred — SCORM

**Decided 2026-09-03: later item. Not in Wave 6, not in the guided-onboarding wave.**

SCORM reads like one more entry in a list of content types. It is not. Supporting it means
shipping a **runtime**, not a format:

- an iframe-hosted player exposing the SCORM JavaScript API (`LMSInitialize`, `LMSGetValue`,
  `LMSSetValue`, `LMSCommit`, `LMSFinish`) on `window` for the package to call;
- a `cmi.*` data model persisted per learner per attempt — `lesson_status`, `suspend_data`,
  `score.raw`, `session_time` — with suspend/resume semantics that are the package's, not ours;
- sequencing and navigation rules (SCORM 2004) if packages use them;
- manifest parsing (`imsmanifest.xml`), zip extraction, and static hosting of arbitrary
  third-party HTML/JS, which is a **content-security decision** as much as a feature — the whole
  point of a SCORM package is that it runs code we did not write.

That last point matters most here: everything else in this platform sanitises stored HTML at write
and render (`docs/security-model.md` §6). A SCORM package is the deliberate exception, so it needs
an origin-isolation story before it needs an editor.

**What ships instead:** the four native content types — rich text, video, document, external link
— plus the quiz engine. That covers mandatory compliance training, which is the only LMS
dependency Phase 3 has.

**Revisit when** there is a real package a customer needs to run, and treat it as its own wave with
the sandboxing question answered first.
