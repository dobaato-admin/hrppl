import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}
async function getEmployeeForUser(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select("id,tenant_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/** Mirrors `org.performance` in rbac.ts. */
const PERFORMANCE_VIEW_ROLES = [
  "super_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "manager",
] as const;

// Cycles
export const createReviewCycle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(1).max(120),
        periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const tenantId = await requireTenantId(supabase, userId);
    const { data: row, error } = await supabase
      .from("review_cycles")
      .insert({
        tenant_id: tenantId,
        name: data.name,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        status: "draft",
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const activateReviewCycle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cycleId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");

    const admin = await loadAdmin();
    const { data: cycle } = await admin
      .from("review_cycles")
      .select("*")
      .eq("id", data.cycleId)
      .maybeSingle();
    if (!cycle) throw new Error("Cycle not found");
    // Pin template version if a template is attached
    let templateVersion: number | null = (cycle as any).template_version ?? null;
    if ((cycle as any).template_id && templateVersion == null) {
      const { data: tpl } = await admin
        .from("review_templates" as any)
        .select("version")
        .eq("id", (cycle as any).template_id)
        .maybeSingle();
      templateVersion = (tpl as any)?.version ?? 1;
    }
    await admin
      .from("review_cycles")
      .update({ status: "active", template_version: templateVersion } as any)
      .eq("id", cycle.id);
    // Create a review row per active employee in tenant
    const { data: emps } = await admin
      .from("employees")
      .select("id,manager_id")
      .eq("tenant_id", cycle.tenant_id)
      .eq("status", "active");
    if (emps?.length) {
      const rows = emps.map((e: any) => ({
        tenant_id: cycle.tenant_id,
        employee_id: e.id,
        cycle_id: cycle.id,
        reviewer_id: e.manager_id,
        status: "draft" as const,
        template_id: (cycle as any).template_id ?? null,
        template_version: templateVersion,
      }));
      await admin
        .from("performance_reviews")
        .upsert(rows as any, { onConflict: "cycle_id,employee_id" });
    }
    return { ok: true };
  });

export const updateReviewCycleTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        cycleId: z.string().uuid(),
        templateId: z.string().uuid().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const patch: any = { template_id: data.templateId, template_version: null };
    if (data.templateId) {
      const { data: tpl } = await supabase
        .from("review_templates" as any)
        .select("version")
        .eq("id", data.templateId)
        .maybeSingle();
      patch.template_version = (tpl as any)?.version ?? 1;
    }
    const { error } = await supabase.from("review_cycles").update(patch).eq("id", data.cycleId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const closeReviewCycle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cycleId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const { error } = await supabase
      .from("review_cycles")
      .update({ status: "closed" })
      .eq("id", data.cycleId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Reminder cadence configuration per cycle
export const updateReviewCycleReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        cycleId: z.string().uuid(),
        remindersEnabled: z.boolean(),
        intervalDays: z.number().int().min(1).max(60),
        startOffsetDays: z.number().int().min(0).max(365),
        businessDaysOnly: z.boolean(),
        maxCount: z.number().int().min(1).max(50).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const { error } = await supabase
      .from("review_cycles")
      .update({
        reminders_enabled: data.remindersEnabled,
        reminder_interval_days: data.intervalDays,
        reminder_start_offset_days: data.startOffsetDays,
        reminder_business_days_only: data.businessDaysOnly,
        reminder_max_count: data.maxCount,
      } as any)
      .eq("id", data.cycleId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Preview which reminder dates would fire over the next N days based on
// cycle cadence + tenant country holiday calendar + weekends.
export const previewReviewReminderSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        cycleId: z.string().uuid(),
        horizonDays: z.number().int().min(1).max(180).default(30),
        overrides: z
          .object({
            remindersEnabled: z.boolean(),
            intervalDays: z.number().int().min(1).max(60),
            startOffsetDays: z.number().int().min(0).max(365),
            businessDaysOnly: z.boolean(),
            maxCount: z.number().int().min(1).max(50).nullable(),
          })
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");

    const admin = await loadAdmin();
    const { data: cycle } = await admin
      .from("review_cycles")
      .select(
        "id,tenant_id,name,period_start,reminders_enabled,reminder_interval_days,reminder_start_offset_days,reminder_business_days_only,reminder_max_count",
      )
      .eq("id", data.cycleId)
      .maybeSingle();
    if (!cycle) throw new Error("Cycle not found");

    const cfg = data.overrides ?? {
      remindersEnabled: (cycle as any).reminders_enabled ?? true,
      intervalDays: (cycle as any).reminder_interval_days ?? 3,
      startOffsetDays: (cycle as any).reminder_start_offset_days ?? 0,
      businessDaysOnly: (cycle as any).reminder_business_days_only ?? false,
      maxCount: (cycle as any).reminder_max_count ?? null,
    };

    const { data: tenant } = await admin
      .from("tenants")
      .select("country_code")
      .eq("id", (cycle as any).tenant_id)
      .maybeSingle();
    const countryCode: string | null = (tenant as any)?.country_code ?? null;

    const holidays: { date: string; name: string; recurring: boolean }[] = [];
    if (countryCode) {
      const { data: hs } = await admin
        .from("public_holidays")
        .select("holiday_date,name,is_recurring")
        .eq("country_code", countryCode);
      for (const h of (hs ?? []) as any[]) {
        holidays.push({ date: h.holiday_date, name: h.name, recurring: !!h.is_recurring });
      }
    }
    function holidayOn(iso: string): string | null {
      const md = iso.slice(5);
      for (const h of holidays) {
        if (h.date === iso) return h.name;
        if (h.recurring && h.date.slice(5) === md) return h.name;
      }
      return null;
    }

    const DAY_MS = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const startDate = (cycle as any).period_start
      ? new Date(((cycle as any).period_start as string) + "T00:00:00Z")
      : today;
    const firstEligible = new Date(startDate.getTime() + cfg.startOffsetDays * DAY_MS);

    type Day = {
      date: string;
      status: "scheduled" | "weekend" | "holiday" | "before-start" | "disabled" | "max-reached";
      reason?: string;
    };
    const days: Day[] = [];
    let scheduledCount = 0;
    let lastScheduledMs: number | null = null;

    for (let i = 0; i < data.horizonDays; i += 1) {
      const d = new Date(today.getTime() + i * DAY_MS);
      const iso = d.toISOString().slice(0, 10);
      if (!cfg.remindersEnabled) {
        days.push({ date: iso, status: "disabled" });
        continue;
      }
      if (d.getTime() < firstEligible.getTime()) {
        days.push({ date: iso, status: "before-start" });
        continue;
      }
      const dow = d.getUTCDay();
      if (cfg.businessDaysOnly && (dow === 0 || dow === 6)) {
        days.push({ date: iso, status: "weekend" });
        continue;
      }
      if (cfg.businessDaysOnly) {
        const h = holidayOn(iso);
        if (h) {
          days.push({ date: iso, status: "holiday", reason: h });
          continue;
        }
      }
      if (cfg.maxCount != null && scheduledCount >= cfg.maxCount) {
        days.push({ date: iso, status: "max-reached" });
        continue;
      }
      if (lastScheduledMs != null && d.getTime() - lastScheduledMs < cfg.intervalDays * DAY_MS) {
        // Interval gap — would not fire for a given review on this day
        days.push({ date: iso, status: "before-start", reason: `Interval (${cfg.intervalDays}d)` });
        continue;
      }
      days.push({ date: iso, status: "scheduled" });
      scheduledCount += 1;
      lastScheduledMs = d.getTime();
    }

    return {
      cycle: {
        id: (cycle as any).id,
        name: (cycle as any).name,
        period_start: (cycle as any).period_start,
      },
      countryCode,
      config: cfg,
      days,
      scheduledCount,
    };
  });

// Goals
export const upsertGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        cycleId: z.string().uuid().optional(),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        weight: z.number().min(0).max(100).default(0),
        progress: z.number().min(0).max(100).default(0),
        status: z
          .enum(["not_started", "in_progress", "completed", "cancelled"])
          .default("not_started"),
        dueDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");
    const payload: any = {
      tenant_id: emp.tenant_id,
      employee_id: emp.id,
      cycle_id: data.cycleId ?? null,
      title: data.title,
      description: data.description ?? null,
      weight: data.weight,
      progress: data.progress,
      status: data.status,
      due_date: data.dueDate ?? null,
    };
    if (data.id) {
      const { error } = await supabase.from("performance_goals").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await supabase
      .from("performance_goals")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("performance_goals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Reviews
const responseSchema = z
  .array(
    z.object({
      questionId: z.string().min(1).max(100),
      rating: z.number().nullable().optional(),
      text: z.string().max(5000).nullable().optional(),
    }),
  )
  .max(50)
  .optional();

export const submitSelfReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reviewId: z.string().uuid(),
        selfRating: z.number().min(1).max(10),
        selfComments: z.string().max(5000).optional(),
        responses: responseSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const patch: any = {
      self_rating: Math.round(data.selfRating),
      self_comments: data.selfComments ?? null,
      status: "self_submitted",
    };
    if (data.responses) patch.self_responses = data.responses;
    const { error } = await supabase
      .from("performance_reviews")
      .update(patch)
      .eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitManagerReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reviewId: z.string().uuid(),
        managerRating: z.number().min(1).max(10),
        managerComments: z.string().max(5000).optional(),
        finalize: z.boolean().default(false),
        responses: responseSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    // Matches `org.performance`, which admits branch_admin and hr. Both hold
    // policies on `performance_reviews` and `review_cycles` already
    // (20260613140101), so this was the guard refusing roles Postgres serves.
    if (
      !roles.some((r) =>
        PERFORMANCE_VIEW_ROLES.includes(r as (typeof PERFORMANCE_VIEW_ROLES)[number]),
      )
    )
      throw new Error("Not authorized");
    const payload: any = {
      manager_rating: Math.round(data.managerRating),
      manager_comments: data.managerComments ?? null,
      status: data.finalize ? "finalized" : "manager_submitted",
    };
    if (data.responses) payload.manager_responses = data.responses;
    if (data.finalize) payload.finalized_at = new Date().toISOString();
    const { error } = await supabase
      .from("performance_reviews")
      .update(payload)
      .eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const calibrateReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reviewId: z.string().uuid(),
        calibratedRating: z.number().min(1).max(10).nullable(),
        notes: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const { error } = await supabase
      .from("performance_reviews")
      .update({
        calibrated_rating: data.calibratedRating,
        calibration_notes: data.notes ?? null,
        calibrated_by: data.calibratedRating == null ? null : userId,
        calibrated_at: data.calibratedRating == null ? null : new Date().toISOString(),
      } as any)
      .eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acknowledgeReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reviewId: z.string().uuid(),
        comments: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("performance_reviews")
      .update({
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
        acknowledgment_comments: data.comments ?? null,
      } as any)
      .eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Removed in W5 P3: `addReviewFeedback`.
// Superseded by feedback360's submitFeedback360, which writes the same
// review_feedback rows but through a request, with structured per-question
// responses and ratings. /performance already calls it.

// Templates
const evidenceTypeEnum = z.enum(["document", "url", "social", "screenshot"]);
const scheduleSchema = z
  .object({
    type: z.enum(["monthly", "quarterly", "half_yearly", "annual", "custom"]),
    periods: z.array(z.string().max(20)).max(12).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .optional();

const competencySchema = z
  .object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    type: z
      .enum(["rating", "text", "number", "range", "yes_no", "scale", "percentage", "currency"])
      .default("rating"),
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional(),
    target: z.union([z.number(), z.string()]).optional(),
    unit: z.string().max(20).optional(),
    weight: z.number().min(0).max(100).optional(),
    yesLabel: z.string().max(40).optional(),
    noLabel: z.string().max(40).optional(),
    evidenceEnabled: z.boolean().optional(),
    evidenceTypes: z.array(evidenceTypeEnum).optional(),
    minEvidenceCount: z.number().int().min(0).max(20).optional(),
    requiredEvidenceTypes: z.array(evidenceTypeEnum).optional(),
    reviewPeriod: z.string().max(40).optional(),
    schedule: scheduleSchema,
  })
  .refine((c) => c.min == null || c.max == null || c.min <= c.max, {
    message: "min must be ≤ max",
  })
  .refine(
    (c) => {
      if (!c.evidenceEnabled) return true;
      const allowed = new Set(c.evidenceTypes ?? []);
      return (c.requiredEvidenceTypes ?? []).every((t) => allowed.has(t));
    },
    { message: "requiredEvidenceTypes must be a subset of evidenceTypes" },
  );

export const upsertReviewTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(120),
        description: z.string().max(1000).optional(),
        industry: z.string().max(60).optional(),
        kind: z.enum(["kpi", "kra", "competency", "mixed", "360"]).default("competency"),
        scaleMin: z.number().int().min(1).max(10).default(1),
        scaleMax: z.number().int().min(2).max(10).default(5),
        scaleLabels: z.array(z.string().max(80)).max(10).default([]),
        competencies: z.array(competencySchema).max(50).default([]),
        isDefault: z.boolean().default(false),
        changeNote: z.string().max(500).optional(),
        bumpVersion: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const tenantId = await requireTenantId(supabase, userId);
    if (data.scaleMax <= data.scaleMin) throw new Error("scaleMax must be greater than scaleMin");

    if (data.isDefault) {
      await supabase
        .from("review_templates" as any)
        .update({ is_default: false })
        .eq("tenant_id", tenantId);
    }

    if (data.id && data.bumpVersion) {
      const { data: existing } = await supabase
        .from("review_templates" as any)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (!existing) throw new Error("Template not found");
      const e: any = existing;
      await supabase
        .from("review_templates" as any)
        .update({ is_current: false })
        .eq("id", data.id);
      const { data: row, error } = await supabase
        .from("review_templates" as any)
        .insert({
          tenant_id: tenantId,
          name: data.name,
          description: data.description ?? null,
          industry: data.industry ?? null,
          kind: data.kind,
          scale_min: data.scaleMin,
          scale_max: data.scaleMax,
          scale_labels: data.scaleLabels,
          competencies: data.competencies,
          is_default: data.isDefault,
          version: (e.version ?? 1) + 1,
          parent_template_id: e.parent_template_id ?? data.id,
          is_current: true,
          change_note: data.changeNote ?? null,
          created_by: e.created_by,
          updated_by: userId,
        } as any)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, id: (row as any).id };
    }

    if (data.id) {
      const { error } = await supabase
        .from("review_templates" as any)
        .update({
          name: data.name,
          description: data.description ?? null,
          industry: data.industry ?? null,
          kind: data.kind,
          scale_min: data.scaleMin,
          scale_max: data.scaleMax,
          scale_labels: data.scaleLabels,
          competencies: data.competencies,
          is_default: data.isDefault,
          change_note: data.changeNote ?? null,
          updated_by: userId,
        } as any)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }

    const { data: row, error } = await supabase
      .from("review_templates" as any)
      .insert({
        tenant_id: tenantId,
        name: data.name,
        description: data.description ?? null,
        industry: data.industry ?? null,
        kind: data.kind,
        scale_min: data.scaleMin,
        scale_max: data.scaleMax,
        scale_labels: data.scaleLabels,
        competencies: data.competencies,
        is_default: data.isDefault,
        created_by: userId,
        updated_by: userId,
        change_note: data.changeNote ?? null,
      } as any)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: (row as any).id };
  });

export const deleteReviewTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin", "super_admin"].includes(r)))
      throw new Error("Not authorized");
    const { error } = await supabase
      .from("review_templates" as any)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCycleProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cycleId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("performance_reviews")
      .select("status,manager_rating,calibrated_rating,self_rating")
      .eq("cycle_id", data.cycleId);
    if (error) throw new Error(error.message);
    const all = (rows ?? []) as any[];
    const counts: Record<string, number> = {
      draft: 0,
      self_submitted: 0,
      manager_submitted: 0,
      finalized: 0,
      acknowledged: 0,
    };
    let ratingSum = 0,
      ratingN = 0;
    for (const r of all) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
      const finalR = r.calibrated_rating ?? r.manager_rating;
      if (finalR != null) {
        ratingSum += Number(finalR);
        ratingN += 1;
      }
    }
    const total = all.length;
    return {
      total,
      counts,
      completionPct:
        total === 0 ? 0 : Math.round(((counts.finalized + counts.acknowledged) / total) * 100),
      avgFinalRating: ratingN === 0 ? null : Number((ratingSum / ratingN).toFixed(2)),
    };
  });

export const getReviewAuditTrail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        cycleId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(500).default(100),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    // Matches `org.performance`, which admits branch_admin and hr. Both hold
    // policies on `performance_reviews` and `review_cycles` already
    // (20260613140101), so this was the guard refusing roles Postgres serves.
    if (
      !roles.some((r) =>
        PERFORMANCE_VIEW_ROLES.includes(r as (typeof PERFORMANCE_VIEW_ROLES)[number]),
      )
    )
      throw new Error("Not authorized");
    let q = supabase
      .from("audit_log")
      .select("*")
      .eq("entity_type", "performance_review")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const entries = (rows ?? []) as any[];
    const filtered = data.cycleId
      ? entries.filter((r) => r.metadata?.cycle_id === data.cycleId)
      : entries;
    return { entries: filtered };
  });
