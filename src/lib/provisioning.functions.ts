/**
 * Wave 7, Phase 3 — automated post-onboarding provisioning.
 *
 * The spec (`docs/onboarding-guided-routes.md` Phase 3) lists four things that
 * should happen once a new starter's record goes live. Two of them are built
 * here, one is deliberately left to a person, and one is **blocked** and says so
 * rather than being faked:
 *
 * | Step | Status |
 * | --- | --- |
 * | 1. KRA & KPI assignment | **Blocked** — see below |
 * | 2. Mandatory training enrolment with due dates | Built |
 * | 3. Asset allocation & sign-off | Left to a person, deliberately |
 * | 4. Policy sign-offs | Built |
 *
 * **Why step 1 is blocked.** `performance_reviews`, `review_instances` and
 * `duty_review_scores` share `review_templates` and never reconcile; there is
 * no assignment table (`docs/remaining-work.md` § Named debt). Auto-assigning
 * KPIs would have to pick one of the three, and picking one makes it a fourth
 * pathway rather than resolving anything. `docs/onboarding-guided-routes.md` §9
 * says exactly this: "Resolve that first or Phase 3 will add a fourth review
 * pathway." So this function reports the step as blocked, with the reason, and
 * does nothing. A silent no-op would be worse than the gap.
 *
 * **Why step 3 is not automated.** Handing someone a laptop is a physical act.
 * The register knows which assets exist and which are free; it cannot know that
 * this person was actually given serial ABC123. Fabricating an assignment would
 * put a false record into an asset register that exists to be authoritative, so
 * this returns the *candidates* and leaves the choice — and the signature — to
 * an admin.
 *
 * Everything here is **idempotent**. It is safe to re-run on the same employee:
 * enrolments upsert on `(course_id, employee_id)` and acknowledgements on
 * `(policy_id, employee_id, policy_version)`, so a second run adds nothing and
 * resets nothing somebody has already completed.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";
import { assertTrainingAuthor } from "@/lib/training-guard";

/** Days a new starter gets to finish mandatory compliance training. */
const TRAINING_DUE_DAYS = 7;
/** Days to read and sign the policies. Shorter: it is reading, not a course. */
const POLICY_DUE_DAYS = 3;

export type ProvisioningResult = {
  employeeId: string;
  training: { enrolled: number; alreadyEnrolled: number; courses: string[] };
  policies: { assigned: number; total: number };
  assets: { candidates: { id: string; name: string; asset_tag: string | null }[] };
  blocked: { step: string; reason: string }[];
};

/**
 * Preview what provisioning would do, without doing it.
 *
 * Worth having separately: an admin about to click "Provision" on a real person
 * should be able to see the seven courses and four policies first.
 */
export const previewProvisioning = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ employee_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    return gatherProvisioningPlan(supabase, tenantId, data.employee_id);
  });

async function gatherProvisioningPlan(supabase: any, tenantId: string, employeeId: string) {
  const [coursesRes, enrolledRes, policiesRes, ackRes, assetsRes] = await Promise.all([
    supabase
      .from("training_courses")
      .select("id,title")
      .eq("tenant_id", tenantId)
      .eq("is_mandatory", true)
      .eq("is_active", true),
    supabase.from("training_enrollments").select("course_id").eq("employee_id", employeeId),
    supabase
      .from("policy_documents")
      .select("id,title,version")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .eq("requires_acknowledgement", true),
    supabase
      .from("policy_acknowledgements")
      .select("policy_id,policy_version")
      .eq("employee_id", employeeId),
    supabase
      .from("assets")
      .select("id,name,asset_tag")
      .eq("tenant_id", tenantId)
      .eq("status", "available")
      .limit(20),
  ]);

  const mandatory = (coursesRes?.data ?? []) as any[];
  const already = new Set((enrolledRes?.data ?? []).map((e: any) => e.course_id));
  const policies = (policiesRes?.data ?? []) as any[];
  const ackKeys = new Set(
    (ackRes?.data ?? []).map((a: any) => `${a.policy_id}:${a.policy_version}`),
  );

  return {
    employeeId,
    courses: mandatory,
    coursesToEnrol: mandatory.filter((c) => !already.has(c.id)),
    policies,
    policiesToAssign: policies.filter((p) => !ackKeys.has(`${p.id}:${p.version}`)),
    assetCandidates: (assetsRes?.data ?? []) as any[],
    blocked: [
      {
        step: "KRA & KPI assignment",
        reason:
          "There is no KPI assignment table. performance_reviews, review_instances and " +
          "duty_review_scores share review_templates and never reconcile, so auto-assigning " +
          "would add a fourth review pathway rather than use an existing one. Assign duties " +
          "manually on /admin/employee-duties until those three are reconciled.",
      },
    ],
  };
}

/**
 * Run provisioning for one employee.
 *
 * Guarded with `assertTrainingAuthor` because its main effect is creating
 * training enrolments, and that guard already mirrors the RLS write policy on
 * `training_enrollments`. Policy assignment needs HR or org_admin, which is a
 * subset — so a `manager` provisioning a new starter gets the training and a
 * clear refusal on the policies rather than a silent half-run.
 */
export const provisionEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        employee_id: z.string().uuid(),
        training_due_days: z.number().int().min(1).max(90).default(TRAINING_DUE_DAYS),
        policy_due_days: z.number().int().min(1).max(90).default(POLICY_DUE_DAYS),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<ProvisioningResult> => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertTrainingAuthor(supabase, userId, tenantId);

    // Scope check before anything is written: the employee must be in the
    // caller's tenant. RLS would refuse the insert anyway, but this refuses
    // first and says why.
    const { data: employee } = await supabase
      .from("employees")
      .select("id,tenant_id,first_name,last_name")
      .eq("id", data.employee_id)
      .maybeSingle();
    if (!employee || (employee as any).tenant_id !== tenantId) {
      throw new Error("Employee not found in this organisation");
    }

    const plan = await gatherProvisioningPlan(supabase, tenantId, data.employee_id);

    // ---- Step 2: mandatory training ----------------------------------------
    const { workDateInZone, resolveTimeZone } = await import("@/lib/work-date");
    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("timezone")
      .eq("id", tenantId)
      .maybeSingle();
    const tz = resolveTimeZone((tenantRow as any)?.timezone);
    // Due dates are calendar dates in the tenant's own zone, not UTC's — the
    // rule in src/lib/work-date.ts. A 7-day deadline that lands a day early for
    // half the world is a support ticket.
    const dueIn = (days: number) => workDateInZone(new Date(Date.now() + days * 86_400_000), tz);

    let enrolled = 0;
    if (plan.coursesToEnrol.length) {
      const rows = plan.coursesToEnrol.map((c: any) => ({
        tenant_id: tenantId,
        course_id: c.id,
        employee_id: data.employee_id,
        assigned_by: userId,
        due_date: dueIn(data.training_due_days),
        status: "assigned" as const,
      }));
      const { error } = await supabase
        .from("training_enrollments")
        .upsert(rows, { onConflict: "course_id,employee_id", ignoreDuplicates: true });
      if (error) throw error;
      enrolled = rows.length;
    }

    // ---- Step 4: policy acknowledgements ------------------------------------
    let assigned = 0;
    if (plan.policiesToAssign.length) {
      const rows = plan.policiesToAssign.map((p: any) => ({
        tenant_id: tenantId,
        policy_id: p.id,
        employee_id: data.employee_id,
        policy_version: p.version,
        due_date: dueIn(data.policy_due_days),
      }));
      const { error } = await supabase.from("policy_acknowledgements").upsert(rows, {
        onConflict: "policy_id,employee_id,policy_version",
        ignoreDuplicates: true,
      });
      if (error) {
        // HR/org_admin gate this table; a manager reaches here legitimately and
        // must be told which half ran rather than losing the training too.
        throw new Error(
          `Training enrolled (${enrolled}), but policy assignment was refused: ${error.message}`,
        );
      }
      assigned = rows.length;
    }

    return {
      employeeId: data.employee_id,
      training: {
        enrolled,
        alreadyEnrolled: plan.courses.length - plan.coursesToEnrol.length,
        courses: plan.coursesToEnrol.map((c: any) => c.title),
      },
      policies: { assigned, total: plan.policies.length },
      assets: { candidates: plan.assetCandidates },
      blocked: plan.blocked,
    };
  });
