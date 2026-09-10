/**
 * Wave 7 — the guided company setup (Phase 1 of
 * `docs/onboarding-guided-routes.md`).
 *
 * ---------------------------------------------------------------------------
 * Completion is computed, never asserted
 * ---------------------------------------------------------------------------
 *
 * Every check below reads the tenant's **actual data**: does a leave type
 * exist, is there a pay period, has a policy been published. Nothing here
 * stores "the admin ticked segment 3".
 *
 * That is deliberate, and it is the difference between a checklist and a
 * readiness gate. A stored flag records that somebody clicked a button; it goes
 * stale the moment anyone deletes the rows it was vouching for, and it cannot
 * tell an admin returning after a month what is actually missing.
 * `checkPayrollReadiness` already worked this way, and CLAUDE.md is explicit
 * that the Setup Lock should extend it rather than invent a second notion of
 * readiness. So `tenant_setup_state` stores exactly two things a query cannot
 * derive: which optional segments were skipped on purpose, and when the tenant
 * went live.
 *
 * The consequence worth knowing: **a segment can go back to incomplete.** Delete
 * every leave type and Segment 2 reopens. That is the honest answer, and the UI
 * says so rather than pretending otherwise.
 *
 * ---------------------------------------------------------------------------
 * A platform account acting as a tenant sees a LOWER percentage
 * ---------------------------------------------------------------------------
 *
 * `requireTenantId` resolves `platform_acting_tenant`, so the queries below are
 * scoped to the right tenant — but several of the tables they read carry RLS
 * keyed on `user_tenant_id(auth.uid())`, which is **NULL for a platform
 * account**. `training_courses` is the clearest: a super_admin acting as Acme
 * reads 0 of its 7 courses, so Segment 4 shows incomplete for them and complete
 * for Acme's own admin, looking at the same tenant on the same day.
 *
 * Measured 2026-09-07: 71% through the service-role client, 57% as
 * `sam.platform` acting as Acme — one segment's difference.
 *
 * This is gap 1 in `docs/remaining-work.md` (acting-tenant coverage), not
 * something this module can fix on its own; closing it means widening those RLS
 * policies, which is a migration. **It does not affect the gate**: all three
 * required segments read tables a platform account can see, so activation is
 * offered and refused identically either way. Worth knowing before someone
 * reports the percentage as a bug.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";
import { checkPayrollReadiness } from "@/lib/payroll-setup.functions";

/** The seven segments, in the order the spec walks an admin through them. */
export const SEGMENT_KEYS = [
  "company",
  "payroll",
  "performance",
  "learning",
  "assets",
  "expenses",
  "policies",
] as const;

export type SegmentKey = (typeof SEGMENT_KEYS)[number];

export type SetupCheck = {
  key: string;
  label: string;
  done: boolean;
  /** Where to go and do it. Every check is one click from its own surface. */
  href?: string;
  hint?: string;
};

export type SetupSegment = {
  key: SegmentKey;
  title: string;
  description: string;
  /**
   * Mandatory segments gate activation. The three that do are the ones a
   * payroll product cannot honestly operate without: the legal entity, the
   * payroll engine, and the policies people are asked to sign. The rest are
   * real work but a tenant can go live and add them next week.
   */
  required: boolean;
  checks: SetupCheck[];
  done: boolean;
  skipped: boolean;
};

/**
 * Segment definitions. Kept as data rather than markup so the route, the
 * dashboard tile and the tests all read the same list — the same reason
 * `src/lib/nav-tree.ts` exists.
 */
const SEGMENT_META: Record<SegmentKey, { title: string; description: string; required: boolean }> =
  {
    company: {
      title: "Company profile & legal entity",
      description: "Legal name, trading name, registration, address and STP routing.",
      required: true,
    },
    payroll: {
      title: "Payroll, leave & pay calendar",
      description: "Pay period, pay items, overtime rates, leave types, holidays and super.",
      required: true,
    },
    performance: {
      title: "Performance, KRAs & KPIs",
      description: "Rating scales, review templates and the cycles that run them.",
      required: false,
    },
    learning: {
      title: "Learning & compliance training",
      description: "Courses, lessons and the mandatory modules new starters are enrolled in.",
      required: false,
    },
    assets: {
      title: "Asset register",
      description: "What you issue to people, and the record of who has it.",
      required: false,
    },
    expenses: {
      title: "Expense policy & approvals",
      description: "Claim categories, receipt thresholds and who signs off.",
      required: false,
    },
    policies: {
      title: "HR policies & grievance handling",
      description: "The documents every employee must read and sign.",
      required: true,
    },
  };

function check(
  key: string,
  label: string,
  done: boolean,
  href?: string,
  hint?: string,
): SetupCheck {
  return { key, label, done, href, hint };
}

/**
 * Build the whole guide for one tenant.
 *
 * Exported separately from the server fn so `tests/setup-guide.test.ts` can
 * drive it against a stub client without a live database — the same shape
 * `checkPayrollReadiness` uses, and the reason that function has tests at all.
 */
export async function buildSetupGuide(
  supabase: any,
  tenantId: string,
): Promise<{ segments: SetupSegment[]; state: any; requiredComplete: boolean; percent: number }> {
  const [
    tenantRes,
    payrollSettingsRes,
    payrollReadiness,
    leaveTypesRes,
    superFundsRes,
    templatesRes,
    cyclesRes,
    coursesRes,
    lessonsRes,
    assetsRes,
    expenseCatsRes,
    expenseRulesRes,
    policiesRes,
    stateRes,
  ] = await Promise.all([
    supabase
      .from("tenants")
      .select(
        "id,name,legal_name,trading_name,country_code,currency_code,address_line1,registration_number",
      )
      .eq("id", tenantId)
      .maybeSingle(),
    supabase
      .from("tenant_payroll_settings")
      .select("tenant_id,pay_period,abn,bms_id,default_super_fund_id")
      .eq("tenant_id", tenantId)
      .maybeSingle(),
    checkPayrollReadiness(supabase, tenantId),
    supabase
      .from("leave_types")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .limit(1),
    supabase.from("super_funds").select("id").eq("tenant_id", tenantId).limit(1),
    supabase.from("review_templates").select("id").eq("tenant_id", tenantId).limit(1),
    supabase.from("review_cycles").select("id").eq("tenant_id", tenantId).limit(1),
    supabase
      .from("training_courses")
      .select("id,is_mandatory,content_mode")
      .eq("tenant_id", tenantId),
    supabase.from("training_lessons").select("id").eq("tenant_id", tenantId).limit(1),
    supabase.from("assets").select("id").eq("tenant_id", tenantId).limit(1),
    supabase
      .from("expense_categories")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .limit(1),
    supabase
      .from("expense_approval_rules")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .limit(1),
    supabase
      .from("policy_documents")
      .select("id,requires_acknowledgement")
      .eq("tenant_id", tenantId)
      .eq("is_active", true),
    supabase.from("tenant_setup_state").select("*").eq("tenant_id", tenantId).maybeSingle(),
  ]);

  const tenant = tenantRes?.data ?? {};
  const settings = payrollSettingsRes?.data ?? null;
  const country = tenant.country_code ?? null;

  // Public holidays are keyed by country, not tenant — they are shared
  // reference data, so this asks "does this tenant's country have any" rather
  // than filtering by tenant_id, which would always be empty.
  const holidayCount = country
    ? ((
        await supabase
          .from("public_holidays")
          .select("id", { count: "exact", head: true })
          .eq("country_code", country)
      ).count ?? 0)
    : 0;

  const courses = (coursesRes?.data ?? []) as any[];
  const policies = (policiesRes?.data ?? []) as any[];
  const state = stateRes?.data ?? null;
  const skipped: string[] = state?.skipped_segments ?? [];

  const isAu = String(country ?? "").toUpperCase() === "AU";

  const checksBySegment: Record<SegmentKey, SetupCheck[]> = {
    company: [
      check("legal_name", "Registered legal entity name", !!tenant.legal_name, "/org/setup"),
      check(
        "trading_name",
        "Trading name (DBA)",
        !!tenant.trading_name,
        undefined,
        "Optional if you trade under the legal name.",
      ),
      check(
        "country",
        "Country and currency",
        !!tenant.country_code && !!tenant.currency_code,
        "/org/setup",
      ),
      check("address", "Head office address", !!tenant.address_line1, undefined),
      check(
        "abn",
        isAu ? "ABN recorded for STP" : "Business registration number",
        !!(settings?.abn || tenant.registration_number),
        "/admin/payroll-setup",
      ),
      ...(isAu
        ? [
            check(
              "bms",
              "STP software ID (BMS ID)",
              !!settings?.bms_id,
              "/admin/payroll-setup",
              "Issued when you connect your STP gateway.",
            ),
          ]
        : []),
    ],
    payroll: [
      check(
        "pay_period",
        "Pay frequency and pay dates",
        !!settings?.pay_period,
        "/admin/payroll-setup-wizard",
      ),
      check(
        "pay_items",
        "Pay items configured",
        payrollReadiness.steps.payItems,
        "/admin/payroll-setup",
      ),
      check(
        "overtime",
        "Overtime and penalty rates",
        payrollReadiness.steps.overtimeRates,
        "/admin/overtime-setup-wizard",
      ),
      check("currency", "Currency set", payrollReadiness.steps.currency, "/org/setup"),
      check(
        "leave_types",
        "Leave categories and accrual",
        (leaveTypesRes?.data ?? []).length > 0,
        "/admin/leave-types",
      ),
      check("holidays", "Public holiday calendar", holidayCount > 0, "/admin/holiday-calendar"),
      check(
        "super",
        isAu ? "Default superannuation fund" : "Retirement contribution defaults",
        !!settings?.default_super_fund_id || (superFundsRes?.data ?? []).length > 0,
        "/admin/super-funds",
      ),
    ],
    performance: [
      check(
        "templates",
        "Review template with a rating scale",
        (templatesRes?.data ?? []).length > 0,
        "/admin/review-templates",
      ),
      check(
        "cycles",
        "At least one review cycle",
        (cyclesRes?.data ?? []).length > 0,
        "/admin/review-cycles",
      ),
      check(
        "duties",
        "Role duties carrying KPI targets",
        false,
        "/admin/employee-duties",
        "Assigned per employee — there is no reusable KPI library yet.",
      ),
    ],
    learning: [
      check("courses", "At least one course", courses.length > 0, "/admin/training"),
      check(
        "mandatory",
        "A mandatory compliance course",
        courses.some((c) => c.is_mandatory),
        "/admin/training",
      ),
      check(
        "lessons",
        "Course content hosted here",
        (lessonsRes?.data ?? []).length > 0,
        "/admin/training",
        "Optional — a course can link out instead.",
      ),
    ],
    assets: [
      check(
        "register",
        "Assets in the register",
        (assetsRes?.data ?? []).length > 0,
        "/admin/assets",
      ),
    ],
    expenses: [
      check(
        "categories",
        "Expense categories",
        (expenseCatsRes?.data ?? []).length > 0,
        "/admin/expenses",
      ),
      check(
        "rules",
        "Approval matrix",
        (expenseRulesRes?.data ?? []).length > 0,
        "/admin/expenses",
      ),
    ],
    policies: [
      check("published", "At least one published policy", policies.length > 0, "/admin/policies"),
      check(
        "acknowledgeable",
        "A policy people must sign",
        policies.some((p) => p.requires_acknowledgement),
        "/admin/policies",
      ),
    ],
  };

  const segments: SetupSegment[] = SEGMENT_KEYS.map((key) => {
    const checks = checksBySegment[key];
    // A check carrying a `hint` is advisory: it tells the admin the thing
    // exists without holding the segment open for it. "There is no KPI library
    // yet" is not something an admin can act on, and a permanently unsatisfiable
    // check would make the whole guide untrustworthy.
    const blocking = checks.filter((c) => !c.hint);
    return {
      key,
      ...SEGMENT_META[key],
      checks,
      done: blocking.length > 0 && blocking.every((c) => c.done),
      skipped: skipped.includes(key),
    };
  });

  const required = segments.filter((s) => s.required);
  const requiredComplete = required.every((s) => s.done);
  const counted = segments.filter((s) => !s.skipped);
  const percent = counted.length
    ? Math.round((counted.filter((s) => s.done).length / counted.length) * 100)
    : 0;

  return { segments, state, requiredComplete, percent };
}

async function assertOrgAdmin(supabase: any, userId: string, tenantId: string) {
  const { data } = await supabase.rpc("is_org_admin", {
    _user_id: userId,
    _tenant_id: tenantId,
  } as any);
  if (!data) throw new Error("Forbidden: organisation admin required");
}

export const getSetupGuide = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const guide = await buildSetupGuide(supabase, tenantId);
    // The Segment 1 form edits these in place, so it needs the current values
    // to prefill from — otherwise saving one field blanks the rest.
    const { data: tenantProfile } = await supabase
      .from("tenants")
      .select("legal_name,trading_name,address_line1,city,region,postal_code,registration_number")
      .eq("id", tenantId)
      .maybeSingle();
    return { ...guide, tenantId, tenantProfile: tenantProfile ?? null };
  });

export const setSetupSegmentSkipped = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ segment: z.enum(SEGMENT_KEYS), skipped: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertOrgAdmin(supabase, userId, tenantId);

    // A mandatory segment cannot be skipped. Otherwise "skip" becomes a way to
    // talk the activation gate into opening, which is the one thing this state
    // must not be able to do.
    if (SEGMENT_META[data.segment].required && data.skipped) {
      throw new Error(`"${SEGMENT_META[data.segment].title}" is required and cannot be skipped`);
    }

    const { data: existing } = await supabase
      .from("tenant_setup_state")
      .select("skipped_segments")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    const current: string[] = existing?.skipped_segments ?? [];
    const next = data.skipped
      ? [...new Set([...current, data.segment])]
      : current.filter((s) => s !== data.segment);

    const { error } = await supabase
      .from("tenant_setup_state")
      .upsert({ tenant_id: tenantId, skipped_segments: next }, { onConflict: "tenant_id" });
    if (error) throw error;
    return { ok: true, skipped_segments: next };
  });

/** Resume support: remember where the admin was, nothing more. */
export const setSetupLastSegment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ segment: z.enum(SEGMENT_KEYS) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertOrgAdmin(supabase, userId, tenantId);
    const { error } = await supabase
      .from("tenant_setup_state")
      .upsert({ tenant_id: tenantId, last_segment: data.segment }, { onConflict: "tenant_id" });
    if (error) throw error;
    return { ok: true };
  });

/**
 * Setup Lock & Launch.
 *
 * Refuses unless every **required** segment is genuinely complete — re-checked
 * server-side against the live data, not taken from whatever the browser last
 * rendered. The client's copy of the guide can be minutes old, and this is the
 * one call where being out of date would matter.
 */
export const finalizeSetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertOrgAdmin(supabase, userId, tenantId);

    const guide = await buildSetupGuide(supabase, tenantId);
    if (!guide.requiredComplete) {
      const missing = guide.segments
        .filter((s) => s.required && !s.done)
        .map((s) => s.title)
        .join(", ");
      throw new Error(`Not ready to activate. Still required: ${missing}`);
    }

    const { error } = await supabase
      .from("tenant_setup_state")
      .upsert(
        { tenant_id: tenantId, activated_at: new Date().toISOString(), activated_by: userId },
        { onConflict: "tenant_id" },
      );
    if (error) throw error;
    return { ok: true, activatedAt: new Date().toISOString() };
  });

/** Undo an activation — for a tenant that went live and then found a gap. */
export const reopenSetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertOrgAdmin(supabase, userId, tenantId);
    const { error } = await supabase
      .from("tenant_setup_state")
      .upsert(
        { tenant_id: tenantId, activated_at: null, activated_by: null },
        { onConflict: "tenant_id" },
      );
    if (error) throw error;
    return { ok: true };
  });

/**
 * Segment 1's editor, which lives inside the guide rather than behind a link.
 *
 * There is no company-profile page to send an established admin to —
 * `/org/setup` edits these fields but it is the *create an organisation*
 * wizard, and bouncing someone into it to change an address is the kind of
 * "go and find the page" the guided flow exists to remove.
 *
 * Patches only what it is given. `updateOrganizationProfile` in
 * `org-signup.functions.ts` writes every column it knows about and nulls the
 * blanks, which is right for a wizard step that owns the whole form and wrong
 * for a partial save — calling it from here would quietly erase the tagline and
 * the website.
 */
export const updateCompanyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        // `nullish`, not `optional`. These mirror nullable columns, and the
        // form prefills straight from the row — so a tenant with no trading
        // name put `null` into the field and the whole submit was refused with
        // "Expected string, received null" for every empty column at once. A
        // null here means "clear it", which is a thing an admin may legitimately
        // want to do.
        legal_name: z.string().trim().max(200).nullish(),
        trading_name: z.string().trim().max(200).nullish(),
        address_line1: z.string().trim().max(200).nullish(),
        address_line2: z.string().trim().max(200).nullish(),
        city: z.string().trim().max(120).nullish(),
        region: z.string().trim().max(120).nullish(),
        postal_code: z.string().trim().max(30).nullish(),
        registration_number: z.string().trim().max(60).nullish(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    await assertOrgAdmin(supabase, userId, tenantId);

    const patch: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      // null and "" both mean "clear this column".
      patch[k] = v === null || String(v).trim() === "" ? null : String(v).trim();
    }
    if (Object.keys(patch).length === 0) return { ok: true };

    if (patch.registration_number) {
      const { data: t } = await supabase
        .from("tenants")
        .select("country_code")
        .eq("id", tenantId)
        .maybeSingle();
      const { validateBusinessRegistrationNumber } = await import("@/lib/payroll-validation");
      const res = validateBusinessRegistrationNumber(
        patch.registration_number,
        (t as any)?.country_code ?? "",
      );
      if (!res.ok) throw new Error(res.error);
      patch.registration_number = res.value;
    }

    // `.select()` is not decoration. PostgREST answers an UPDATE that matches
    // zero rows with 200 and no error, so without reading a row back this
    // returns `{ ok: true }` for a write RLS silently refused — which is
    // exactly what happened here before `20260907100000` gave org_admin an
    // UPDATE policy on `tenants`. The form saved, the toast said "saved", and
    // the row never changed.
    const { data: updated, error } = await supabase
      .from("tenants")
      .update(patch)
      .eq("id", tenantId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!updated) {
      throw new Error(
        "The organisation record was not updated — your account may not have permission to change it.",
      );
    }
    return { ok: true };
  });
