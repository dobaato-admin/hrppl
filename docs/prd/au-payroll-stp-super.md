# PRD — Australian Payroll: STP Phase 2, Pay Standards & Payday Super

**Status:** Draft v1
**Owner:** Payroll squad
**Last updated:** 2026-06-14
**Scope country:** Australia (`country_code = 'AU'`)

---

## 1. Background

hrppl already supports multi-country payroll (payroll_components, payslips,
payslip_line_items, tenant_payroll_settings, pay_period). To onboard
Australian customers we must meet three mandatory regulatory regimes:

1. **Single Touch Payroll (STP) Phase 2** — every pay event must be reported
   to the ATO on or before payday.
2. **Fair Work pay standards** — National Employment Standards (NES), award
   pay rates, minimum wage, overtime, leave loading, allowances disaggregation.
3. **Payday Super (effective 1 July 2026)** — Super Guarantee contributions
   must reach the employee's fund within **7 calendar days** of payday
   (was quarterly).

Non-compliance carries ATO penalties, SG charge interest, and Fair Work
underpayment exposure. This PRD scopes the minimum viable AU payroll loop.

## 2. Goals

- Run a compliant AU pay run for fortnightly/weekly/monthly cycles.
- Emit a valid STP Phase 2 pay event to the ATO (via SBR2 / approved
  gateway) on or before payday.
- Calculate SG at the current statutory rate (12% from 1 Jul 2025) and
  remit within 7 days of payday with a Payday Super file/API call.
- Disaggregate gross into the STP2 income types and allowance categories.
- Capture and surface YTD figures, tax treatment codes, and termination
  payments correctly.

## 3. Non-goals (v1)

- Award interpretation engine (we will support manual award rates +
  allowance mapping; full award auto-interpretation is v2).
- Direct connection to every super clearing house — v1 ships
  SuperStream-compatible file export + one API integration (Beam or
  SuperChoice).
- Tax variations (ATO variation notices) beyond basic TFN declaration flags.

## 4. Regulatory summary

### 4.1 STP Phase 2 (mandatory since 1 Jan 2022)

Each pay event must include, per employee:

- TFN, date of birth, full name, address, employment basis
  (full-time / part-time / casual / labour hire / VPS / death beneficiary /
  non-employee).
- **Tax treatment code** (6 chars) — replaces the legacy tax scale.
  Encodes regular / horticulturist / seniors / working holiday maker /
  foreign resident / actors / no TFN, plus STSL (study loan), Medicare
  levy reduction/exemption.
- Income type: SAW, CHP, WHM, SWP, FEI, IAA, JPD, VOL, LAB, OSP, ...
- Country code (for WHM / FEI / IAA).
- **Disaggregated gross**:
  - Gross (residual ordinary earnings)
  - Paid leave (cash out, unused on termination, ancillary, other paid)
  - Allowances by category (CD car, AD award transport, LD laundry,
    MD meals, TD travel, KN tasks, QN qualifications, OD other,
    G1 general)
  - Overtime
  - Bonuses & commissions
  - Directors' fees
  - Lump sum (A R, A T, B, D, E, W)
  - Salary sacrifice (super `S`, other employee benefits `O`)
- Tax withheld (PAYG-W) + child support deductions (D / G).
- Super liability (SG amount) AND Reportable Employer Super Contributions
  (RESC) separately.
- YTD amounts since 1 July.
- Employment conditions: cessation type code on termination (V voluntary,
  I ill health, D deceased, R redundancy, F dismissal, C contract end,
  T transfer).
- Pay event metadata: payer ABN/BMS ID, payee record reference,
  pay period start/end, payment date, run type (normal / update / FFR).

Submission: SBR2 ebMS3 to ATO, signed with software developer cert,
acknowledged via response with `acceptance` or `errors`. We will use an
**approved gateway** (e.g. Ozedi, Standard Ledger, SuperChoice) so we are
not on the hook for the SBR2 plumbing.

### 4.2 Fair Work pay standards

- **National minimum wage** (FW Commission, reviewed annually each
  1 July). Store in `country_pay_standards` keyed by effective date.
- **NES**: hours of work (38/week + reasonable additional), paid annual
  leave (4 wks + leave loading where award applies), personal/carer's
  leave (10 days), compassionate, parental, community service, long
  service leave (state-based), public holidays, notice & redundancy
  scales, casual conversion.
- **Awards / EBAs**: pay rates, penalty rates, overtime multipliers,
  allowances. v1: tenant uploads a rate table per classification; v2:
  award auto-fetch.
- **Leave loading**: typically 17.5% on annual leave; configurable.
- **Casual loading**: typically 25%; flag on employment_type.

### 4.3 Payday Super (from 1 July 2026)

- SG contributions for a payday must be **received by the employee's
  fund within 7 calendar days** of payday (currently quarterly by 28th
  of month after quarter end).
- SG rate: **12%** (final step, 1 Jul 2025 onward).
- Maximum super contribution base still applies (indexed quarterly).
- Choice of fund: employee can nominate; otherwise use stapled fund
  (ATO lookup) before defaulting to employer's default fund.
- Non-compliance triggers a recalibrated SG charge (shortfall + nominal
  interest + admin fee + choice loading), all non-deductible.
- Requires near-real-time SuperStream file generation per pay run, plus
  reconciliation of fund acknowledgements within the 7-day window.

## 5. Personas

- **Org admin (AU)** — configures ABN, BMS ID, default super fund,
  award/classification table, STP gateway credentials.
- **Payroll officer** — runs pay, reviews STP pre-flight, submits pay
  event, monitors super remittance status.
- **Employee** — reviews payslip with STP2 disaggregation, super fund
  choice form, YTD income statement (myGov-style).
- **Super clearing house / ATO** — external systems we integrate with.

## 6. Functional requirements

### 6.1 Tenant onboarding (AU)

- New section in `/admin/payroll-setup` when `country_code='AU'`:
  - ABN, branch code, BMS ID (auto-generate UUID if blank).
  - Default super fund (USI, ABN, name) + clearing house choice.
  - STP gateway: dropdown (Ozedi / SuperChoice / Beam / Manual export),
    API key stored in `tenant_secrets`.
  - Pay cycle: weekly / fortnightly / monthly (already supported).
  - Award/EBA flag + classification table CSV upload.

### 6.2 Employee record extensions (AU)

New columns / lookup tables (employees scoped by tenant):

- `tfn` (encrypted), `tfn_status` (provided / applied_for / exempt /
  none / under_28d).
- `tax_treatment_code` (char(6)) — built from a wizard.
- `income_type` enum.
- `country_code` (for WHM/FEI).
- `employment_basis` enum.
- `commencement_date`, `cessation_date`, `cessation_reason_code`.
- `super_fund_id` → `employee_super_funds` (USI/ABN/member number),
  with `is_stapled` and `stapling_check_at`.
- `stsl_flag` (study/training loan).
- `medicare_levy_variation` (exemption/reduction code).

### 6.3 Pay run engine

- For each AU employee per period:
  1. Resolve gross from timesheet/salary (already exists).
  2. Apply allowances mapped to STP2 categories from `payroll_components`
     (add `stp2_category` column to that table).
  3. Compute PAYG-W via current ATO tax tables (table-driven; tables
     versioned by effective date).
  4. Compute SG at statutory rate × OTE (ordinary time earnings).
     Exclude overtime, certain allowances.
  5. Apply salary sacrifice (super S, other O), RESC tracking.
  6. Generate payslip line items + persist to `payslips`.
- Termination handling: ETP A/R/T calculations, unused leave, redundancy
  tax-free component.

### 6.4 STP submission

- New entity `stp_pay_events` (id, tenant_id, period_start, period_end,
  payment_date, run_type, status, payload_hash, gateway_message_id,
  ato_response, submitted_at, acknowledged_at).
- Server function `submitStpPayEvent({ pay_run_id })` — builds payload,
  signs, POSTs to gateway, persists response.
- Update events (full file replacement) and FFR (finalisation) supported.
- End-of-year finalisation declaration (by 14 July) flow.

### 6.5 Payday Super remittance

- After pay run is approved, schedule a `super_remittance` job:
  - Group SG by fund.
  - Build SuperStream alternative file format (SAFF) or use gateway API.
  - Submit within 1 business day; track ack within 7 calendar days.
- Dashboard tile: "Super due in N days" + red banner if any
  remittance is unacknowledged past payday + 5 days.

### 6.6 Reporting

- ATO YTD report per employee (Income Statement).
- SG remittance ledger per quarter & per pay run.
- Reconciliation: PAYG-W in pay runs vs IAS/BAS.
- Underpayment audit: minimum-wage compliance check per period.

## 7. Data model deltas (high level)

- `payroll_components`: add `stp2_category text`, `ote_eligible boolean`,
  `super_eligible boolean`.
- `tenant_payroll_settings`: add `abn`, `branch_code`, `bms_id`,
  `default_super_fund_id`, `stp_gateway`, `stp_gateway_credentials_ref`.
- New tables: `super_funds`, `employee_super_funds`, `stp_pay_events`,
  `super_remittances`, `country_pay_standards`, `tax_tables_au`.
- All AU tables: RLS scoped by `tenant_id`, GRANT to authenticated +
  service_role per project rules.

## 8. Security & compliance

- TFNs encrypted at rest (pgcrypto, key in Lovable Cloud secret).
- Audit log every STP submission & super remittance (immutable).
- Role gating: only `payroll_admin` / `org_admin` can submit STP / super.
- PII export only via signed-URL CSV with admin role + audit row.
- Retention: STP events 5 years (ATO requirement); super remittances 5y.

## 9. Milestones

| # | Milestone | Notes |
|---|-----------|-------|
| M1 | AU tenant setup + employee STP fields | tax_treatment wizard, super fund capture |
| M2 | Pay run engine: OTE, SG, PAYG-W (table v1) | basic awards, manual rates |
| M3 | STP Phase 2 pay event via gateway (sandbox) | Ozedi or SuperChoice test endpoint |
| M4 | Payday Super remittance (SAFF + API) | 7-day SLA monitor |
| M5 | EOFY finalisation + reconciliation reports | finalisation declaration |
| M6 | Award rate library + minimum-wage audit | underpayment guardrail |

## 10. Open questions

1. Which STP gateway do we ship first — Ozedi (cheap, file-based) or
   SuperChoice (full-service, more expensive)?
2. Do we build our own ATO tax-table engine or licence one (e.g.
   PayrollTax.com.au)?
3. Stapled super fund lookup — direct ATO API access requires
   AUSkey/myGovID; do we proxy via the gateway?
4. Do we support contractors (voluntary agreement income type VOL) in v1?
5. How do we surface Payday Super failures to the org admin — email
   only, or in-app red banner + Slack webhook?

## 11. References

- ATO — *Single Touch Payroll Phase 2 employer reporting guidelines* (2024)
- ATO — *Payday super: factsheet* (2025) and *Treasury Laws Amendment
  (Payday Superannuation) Bill 2025*
- Fair Work Ombudsman — *National Employment Standards*
- Fair Work Commission — *National Minimum Wage Order* (annual)
- ATO — *Schedule 1 — Statement of formulas for calculating amounts to
  be withheld* (PAYG-W tax tables)
- SuperStream — *Alternative File Format (SAFF) specification*
