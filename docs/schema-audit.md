# Schema Audit — Phase 2 (Read-Only)

> **Status:** Audit only. No SQL is executed in this phase. Each item below is labeled with a recommendation and risk level so you can green-light specific refactors for Phase 3.

Legend
- 🟢 Low risk — additive, no read/write switch needed
- 🟡 Medium risk — requires backfill + dual-read/dual-write window
- 🔴 High risk — touches financial / locked records; needs careful rollout

---

## A. Overlapping / Conflicting Tables

### A1. Disciplinary domain has parallel sub-tables 🟡
Tables: `disciplinary_cases`, `disciplinary_actions`, `disciplinary_approvals`, `disciplinary_attachments`, `disciplinary_overdue_state`.

- `disciplinary_actions` and the status fields on `disciplinary_cases` overlap — an "action" is sometimes recorded on the case (severity, status) and sometimes as a row in `disciplinary_actions`. No single source of truth for "what happened next".
- `disciplinary_overdue_state` is a tracker table that duplicates derivable state (due-date vs now).

**Recommend:** Keep `disciplinary_cases` as the aggregate root. Move all timeline entries (`actions`, `approvals`) under a single polymorphic `disciplinary_events` view OR formalize `disciplinary_actions` as the only timeline and drop status duplication on the case. Drop `disciplinary_overdue_state` and compute on read (or materialized view).

### A2. Medical: incidents vs attachments split 🟢
Tables: `medical_incidents`, `medical_attachments`.

- Pattern is fine. But `medical_incidents.requires_case` auto-spawns a `disciplinary_cases` row tagged `medical_review` (see `tg_event_medical`). Mixing medical-confidential data into the disciplinary table is a privacy concern.

**Recommend:** Split `medical_cases` from `disciplinary_cases`. Use a shared `case_files` parent if you want one inbox, but keep RLS boundaries tight.

### A3. Recruitment vs Jobs 🟡
Tables: `recruitment_jobs`, `jobs`, `job_tasks`.

- `jobs` + `job_tasks` look like project/work-jobs (billable client work).
- `recruitment_jobs` is hiring requisitions.
- Same plural noun, different domains → constant developer confusion.

**Recommend:** Rename `jobs` → `client_jobs` (or `projects_jobs`) and keep `recruitment_jobs` as is. Cheap rename + view alias for one release.

### A4. Payroll components vs payslip lines 🟡
Tables: `payroll_components`, `payslip_line_items`, `payslip_templates`.

- `payroll_components` (catalog of earning/deduction codes) and `payslip_line_items` (per-template line) overlap on `code`, `label`, `category`, `is_taxable`.
- Risk: drift between catalog and template lines.

**Recommend:** Make `payslip_line_items.component_id` FK → `payroll_components.id`. Catalog stays authoritative for `code/label/category/is_taxable`; template stores only per-template overrides (sort, visibility, formula override).

### A5. Pay rate sources of truth 🔴
Tables: `pay_rate_changes`, `employee_payroll_details`.

- `employee_payroll_details` holds the current rate. `pay_rate_changes` holds the history. There is no FK linking the "current row" to the latest change.

**Recommend:** Add `current_change_id` on `employee_payroll_details` (nullable FK). On insert into `pay_rate_changes`, trigger updates `employee_payroll_details` + bumps `current_change_id`. Phase 3 includes a backfill of the latest change per employee.

### A6. Leave balances vs accrual log 🟢
Tables: `leave_balances`, `leave_accrual_log`.

- Healthy split (snapshot + ledger). `opening_balance_locked_at` guard already in place.
- Missing: a unique `(employee_id, leave_type_id, year)` constraint on `leave_balances` to prevent duplicates.

**Recommend:** Add unique index. Audit-only fix.

### A7. Onboarding has 4 tables, unclear ownership 🟡
Tables: `onboarding_checklists`, `onboarding_assignments`, `onboarding_progress`, `onboarding_default_assignments`, `staff_onboarding_profiles`.

- `staff_onboarding_profiles` (38 cols) is the new-hire data form.
- `onboarding_assignments` + `onboarding_progress` track checklist items.
- These do not link to each other. Closing the form does not mark a checklist item complete.

**Recommend:** Add `onboarding_progress.profile_section text` so a row can map to a `staff_onboarding_profiles` section. Manager dashboard then shows one unified % per hire.

### A8. Location concept duplicated 🟡
Columns/Tables: `tenant_branches`, `employees.work_location` (text), `assets.location` (text), `time_entries.location` (text/json), `sign_geofences.branch_id`.

- "Location" is sometimes a branch FK, sometimes a free-text city.
- HR dashboard cannot reliably surface "missing location" because the field has three shapes.

**Recommend:** Standardize: `branch_id uuid` everywhere, with a free-form `location_label text` for off-site. Backfill from `work_location` → `branch_id` by matching `tenant_branches.name`.

### A9. Designations vs job_title text 🟡
Tables: `designations`, `employees.job_title` (text).

- We just added `designations` but employees still carry `job_title text`. New hires get a string, not a FK.

**Recommend:** Add `employees.designation_id uuid` (nullable FK). Keep `job_title` as a denormalized cache for now. Dashboard counts "missing designation_id".

---

## B. RLS / Permissions Gaps

### B1. Linter findings (21 warnings)
- 4 × `Function Search Path Mutable` — patch by adding `SET search_path = public` to the affected functions.
- 17 × `Signed-In Users Can Execute SECURITY DEFINER Function` — review each definer fn; revoke `EXECUTE FROM authenticated` for internal helpers (e.g. `move_to_dlq`, `read_email_batch`, `delete_email`, `enqueue_email`, `log_event_access`, `record_employee_event`, `blog_publish_due_posts`, trigger functions). Keep `has_role`, `has_country_scope`, `user_tenant_id`, `my_employee_id`, `is_*` helpers (RLS depends on them).

### B2. Tables with policies but no `service_role` GRANT
Inferred from earlier migrations. To verify, run a `pg_table_privileges` query in Phase 3. Likely candidates: older tables added before the GRANT convention (`countries`, `regions`, `tax_brackets`).

### B3. Tables with anon read but no need
Any table with a `GRANT SELECT TO anon` whose only policy uses `auth.uid()` is wasting a grant. Phase 3: audit & revoke.

---

## C. Missing Indexes / FK Hygiene

- `pay_rate_changes(employee_id, effective_from desc)` — dashboard fetch.
- `leave_requests(employee_id, status, start_date)` — manager queue.
- `expense_claims(tenant_id, status, created_at desc)` — finance queue.
- `employee_events(employee_id, occurred_at desc)` — timeline.
- `audit_log(entity_type, entity_id)` — already exists? verify.
- `notification_preferences(user_id)` — single-row lookup.

All 🟢 — pure `CREATE INDEX CONCURRENTLY` migrations.

---

## D. Naming / Convention Drift

- `staff_*` vs `employee_*` vs `onboarding_*` prefixes inconsistent (`staff_invitations`, `staff_onboarding_profiles`, `employee_documents`, `onboarding_assignments`). Pick one (recommend `employee_*` for post-hire, `staff_*` for pre-hire / invitation funnel).
- `recruitment_*` is internally consistent. Keep.
- `blog_*` is its own world. Keep.
- `*_state` tracker tables (`disciplinary_overdue_state`, `email_send_state`, `offboarding_reminder_state`) — consider folding into the parent or a single `reminder_state` table keyed by `(resource_type, resource_id)`.

---

## E. Triggers worth reviewing

- `tg_event_medical` auto-creates a `disciplinary_cases` row — see A2 privacy note.
- `auto_assign_default_onboarding` runs on every employee insert. Confirm idempotency on re-hire.
- `tg_offboarding_seed` picks the most specific template; logic is sound, but it silently falls back to a hard-coded checklist when no template exists. Surface this as a dashboard anomaly ("tenant has no offboarding template").

---

## F. Recommended Phase 3 Execution Order

1. 🟢 Index hygiene (Section C) — zero risk, immediate query speedup.
2. 🟢 Lock down `SECURITY DEFINER` execute grants + add `search_path` (B1).
3. 🟢 Unique index on `leave_balances` (A6).
4. 🟡 Rename `jobs` → `client_jobs` with view alias (A3).
5. 🟡 Link `payslip_line_items.component_id` (A4).
6. 🟡 Add `employees.designation_id` + backfill (A9).
7. 🟡 Branch standardization (A8) — biggest UX win for "missing location" anomaly.
8. 🟡 Onboarding profile↔progress linkage (A7).
9. 🔴 Pay-rate current pointer (A5).
10. 🟡 Medical / disciplinary split (A2).
11. 🟡 Disciplinary timeline unification (A1).

---

## G. Out of Scope (Do Not Touch)

- `auth.*`, `storage.*`, `realtime.*`, `supabase_functions.*`, `vault.*`.
- `payroll_payslips`, `payroll_runs` core columns once `status = 'approved'` (locked by trigger).
- `timesheets.overtime_breakdown` after `consumed_by_run_id IS NOT NULL`.

---

**Next step:** reply with the item IDs (e.g. `A3, A6, C, B1`) you want executed in Phase 3 and I'll prepare migrations + UI/server-fn updates one batch at a time.
