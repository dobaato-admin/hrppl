/**
 * Server-side authorization for the Australian payroll-compliance domain.
 *
 * ---------------------------------------------------------------------------
 * Why this file exists
 * ---------------------------------------------------------------------------
 *
 * Six modules implement AU compliance (`super`, `stp`, `eofy`, `awards`,
 * `minimum-wage-audit`, `super-sla`) and five of them had grown their own
 * private copy of "is this caller allowed here", under five different names,
 * with three different meanings:
 *
 *   assertAuOrgAdmin      stp, eofy            org_admin + AU tenant
 *   assertAuOrgAdminOrHr  minimum-wage-audit   org_admin | hr + AU tenant
 *   assertOrgAdmin        awards               org_admin, NO country check
 *   assertOrgAdminOrHr    super-sla            org_admin | hr, NO country check
 *   (none)                super                8 functions, no check at all
 *
 * Copies drift. Two had already lost the country check, and the largest module
 * never had a check to lose. One definition per *policy* is the fix.
 *
 * ---------------------------------------------------------------------------
 * The rule these guards follow
 * ---------------------------------------------------------------------------
 *
 * **Each guard mirrors the RLS write policy of the tables it fronts, and says
 * which one in its comment.** The AU domain is deliberately not uniform — the
 * database grants Payday Super to finance and STP lodgement to org_admin
 * alone — so a single "AU admin" guard would be wrong in one direction or the
 * other. Widening a guard here without widening the policy in the same change
 * only moves the failure from "Forbidden" to "new row violates row-level
 * security policy", which is strictly worse: the user gets further in before
 * being stopped, and the error names a database object.
 *
 * `tests/au-guard-coverage.test.ts` pins that every exported AU server fn
 * calls one of these.
 *
 * ---------------------------------------------------------------------------
 * Two properties every guard here has
 * ---------------------------------------------------------------------------
 *
 * 1. **It runs on the CALLER's client, never the service-role client.** These
 *    are `supabase.rpc(...)` calls against SECURITY DEFINER helpers, so the
 *    answer is about the caller. Several AU handlers legitimately go on to use
 *    `supabaseAdmin` for the work itself (cross-employee aggregation that RLS
 *    would otherwise narrow) — which is exactly why the check in front of it
 *    has to be real.
 *
 * 2. **It checks the tenant is Australian.** Not decoration: these functions
 *    write ATO-shaped payloads and a Nepali tenant reaching them would be a
 *    data-integrity problem, not just a permissions one.
 *
 * `is_org_admin` already returns true for `super_admin` (unscoped), so no
 * guard needs to name that role. `is_hr` and `is_finance` do not — they are
 * strictly tenant-scoped — which is the intended asymmetry.
 */

/** Roles a guard may admit, beyond the implicit org_admin/super_admin. */
type Helper = "is_org_admin" | "is_hr" | "is_finance";

async function anyOf(
  supabase: any,
  userId: string,
  tenantId: string,
  helpers: Helper[],
): Promise<boolean> {
  for (const helper of helpers) {
    const { data } = await supabase.rpc(helper, {
      _user_id: userId,
      _tenant_id: tenantId,
    } as any);
    if (data) return true;
  }
  return false;
}

async function assertAustralianTenant(supabase: any, tenantId: string): Promise<void> {
  const { data: tenant } = await supabase
    .from("tenants")
    .select("country_code")
    .eq("id", tenantId)
    .maybeSingle();
  if (!tenant || (tenant as any).country_code !== "AU") {
    throw new Error("Tenant is not configured for Australia");
  }
}

async function guard(
  supabase: any,
  userId: string,
  tenantId: string,
  helpers: Helper[],
  label: string,
): Promise<void> {
  if (!(await anyOf(supabase, userId, tenantId, helpers))) {
    throw new Error(`Forbidden: ${label} required`);
  }
  await assertAustralianTenant(supabase, tenantId);
}

/**
 * org_admin (or super_admin) only.
 *
 * Mirrors `stp_pay_events org_admin write` and "Org admins manage finalisation
 * events". Lodging with the ATO is the narrowest thing in this domain — it is
 * a legal declaration by the employer, and the database agrees.
 */
export async function assertAuOrgAdmin(supabase: any, userId: string, tenantId: string) {
  return guard(supabase, userId, tenantId, ["is_org_admin"], "org admin");
}

/**
 * org_admin or hr.
 *
 * Mirrors "Org admins and HR can manage underpayment findings" on
 * `payroll_underpayment_findings`. Underpayment remediation is a compliance
 * matter that HR owns as much as finance does.
 */
export async function assertAuOrgAdminOrHr(supabase: any, userId: string, tenantId: string) {
  return guard(supabase, userId, tenantId, ["is_org_admin", "is_hr"], "org admin or HR");
}

/**
 * org_admin or finance.
 *
 * Mirrors `super_batches finance write`. Building and remitting a Payday Super
 * batch is a payments operation; the policy grants it to finance, so this does
 * too. Note it does NOT admit hr — hr may maintain funds and member choices
 * (below) but may not move money.
 */
export async function assertAuPayroll(supabase: any, userId: string, tenantId: string) {
  return guard(supabase, userId, tenantId, ["is_org_admin", "is_finance"], "org admin or finance");
}

/**
 * org_admin, finance or hr.
 *
 * Mirrors `super_funds admin write`, `emp_super admin write` and
 * `super_contrib finance write` — the three tables that hold reference data
 * and member details rather than payment instructions. All three name the same
 * trio.
 */
export async function assertAuPayrollOrHr(supabase: any, userId: string, tenantId: string) {
  return guard(
    supabase,
    userId,
    tenantId,
    ["is_org_admin", "is_finance", "is_hr"],
    "org admin, finance or HR",
  );
}
