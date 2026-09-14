import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantId, requireTenantId } from "@/lib/tenant-scope";

async function getCtx(context: any) {
  const { supabase, userId } = context;
  const callerTenantId = await requireTenantId(supabase, userId);
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x: any) => x.role as string);
  const isAdmin = r.some((x: string) => ["org_admin", "super_admin", "manager"].includes(x));
  return { tenantId: callerTenantId as string, isAdmin, userId, supabase };
}

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const listCycles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId, supabase } = await getCtx(context);
    const { data, error } = await supabase
      .from("kpi_review_cycles")
      .select("id, label, starts_on, ends_on, status, opened_at, closed_at, last_reminder_sent_at, reminder_days_before, open_notified_at, closed_notified_at")
      .eq("tenant_id", tenantId)
      .order("starts_on", { ascending: false });
    if (error) throw new Error(error.message);
    return { cycles: data ?? [] };
  });

export const listOpenCyclesForMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { cycles: [] };
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("kpi_review_cycles")
      .select("id, label, starts_on, ends_on, status")
      .eq("tenant_id", tenantId)
      .eq("status", "open")
      .lte("starts_on", today)
      .gte("ends_on", today)
      .order("ends_on");
    if (error) throw new Error(error.message);
    return { cycles: data ?? [] };
  });

const UpsertCycle = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(60),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminder_days_before: z.number().int().min(0).max(60).optional(),
});

export const upsertCycle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpsertCycle.parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, userId, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    if (data.ends_on < data.starts_on) throw new Error("End date must be after start date");
    const payload: any = {
      tenant_id: tenantId,
      label: data.label,
      starts_on: data.starts_on,
      ends_on: data.ends_on,
      created_by: userId,
    };
    if (data.reminder_days_before != null) payload.reminder_days_before = data.reminder_days_before;
    const { data: row, error } = data.id
      ? await supabase.from("kpi_review_cycles").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single()
      : await supabase.from("kpi_review_cycles").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { cycle: row };
  });

async function notifyCycleParticipants(
  tenantId: string,
  cycle: { id: string; label: string; starts_on: string; ends_on: string },
  kind: "opened" | "closed" | "reminder",
) {
  const admin = await loadAdmin();
  // Find all employees with active duties for this tenant
  const { data: rows } = await admin
    .from("employee_duties")
    .select("employee_id, employees!inner(id, tenant_id, user_id, email, first_name)")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);
  if (!rows || rows.length === 0) return { notified: 0 };
  const seen = new Set<string>();
  const recipients: { user_id: string | null; email: string | null; first_name: string | null }[] = [];
  for (const r of rows as any[]) {
    const e = r.employees;
    if (!e || seen.has(e.id)) continue;
    seen.add(e.id);
    recipients.push({ user_id: e.user_id, email: e.email, first_name: e.first_name });
  }

  const today = new Date();
  const ends = new Date(cycle.ends_on);
  const daysRemaining = Math.max(0, Math.ceil((ends.getTime() - today.getTime()) / 86400000));
  const appUrl = (process.env.PUBLIC_APP_URL || "https://hrppl.io") +
    (kind === "closed" ? "/me/duties" : "/me/duty-self-review");

  // In-app notifications (batch insert)
  const inAppRows = recipients
    .filter((r) => !!r.user_id)
    .map((r) => ({
      tenant_id: tenantId,
      user_id: r.user_id as string,
      kind: `kpi_cycle_${kind}`,
      title:
        kind === "opened" ? `KPI review cycle ${cycle.label} is open`
        : kind === "closed" ? `KPI review cycle ${cycle.label} closed`
        : `Reminder: KPI self-review for ${cycle.label} (${daysRemaining}d left)`,
      body: kind === "closed"
        ? `Submissions are no longer accepted for ${cycle.label}.`
        : `Submit your duty self-scores before ${cycle.ends_on}.`,
      link: kind === "closed" ? "/me/duties" : "/me/duty-self-review",
      metadata: { cycle_id: cycle.id, cycle_label: cycle.label, kind },
    }));
  if (inAppRows.length) {
    await admin.from("in_app_notifications" as any).insert(inAppRows as any);
  }

  // Emails (best-effort, per recipient)
  try {
    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    for (const r of recipients) {
      if (!r.email) continue;
      await sendInternalEmail({
        templateName: "kpi-cycle-status",
        recipientEmail: r.email,
        idempotencyKey: `kpi-${cycle.id}-${kind}-${r.email}`,
        templateData: {
          kind,
          recipientName: r.first_name || undefined,
          cycleName: cycle.label,
          startsOn: cycle.starts_on,
          endsOn: cycle.ends_on,
          daysRemaining: kind === "reminder" ? daysRemaining : undefined,
          appUrl,
        },
      });
    }
  } catch (e) {
    console.error("[kpi-cycle] email send failed", e);
  }
  return { notified: recipients.length };
}

export const setCycleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    status: z.enum(["draft", "open", "closed"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, userId, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const patch: any = { status: data.status };
    if (data.status === "open") { patch.opened_at = new Date().toISOString(); patch.opened_by = userId; }
    if (data.status === "closed") { patch.closed_at = new Date().toISOString(); patch.closed_by = userId; }
    const { data: cycle, error } = await supabase.from("kpi_review_cycles")
      .update(patch).eq("id", data.id).eq("tenant_id", tenantId)
      .select("id, label, starts_on, ends_on, status, open_notified_at, closed_notified_at").single();
    if (error) throw new Error(error.message);

    let notified = 0;
    if (data.status === "open" && !cycle.open_notified_at) {
      const res = await notifyCycleParticipants(tenantId, cycle, "opened");
      notified = res.notified;
      await supabase.from("kpi_review_cycles").update({ open_notified_at: new Date().toISOString() }).eq("id", cycle.id);
    } else if (data.status === "closed" && !cycle.closed_notified_at) {
      const res = await notifyCycleParticipants(tenantId, cycle, "closed");
      notified = res.notified;
      await supabase.from("kpi_review_cycles").update({ closed_notified_at: new Date().toISOString() }).eq("id", cycle.id);
    }
    return { ok: true, notified };
  });

export const deleteCycle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { error } = await supabase.from("kpi_review_cycles").delete().eq("id", data.id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Submission status ----------
export const getCycleSubmissionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ cycleLabel: z.string().trim().min(1).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");

    const { data: duties } = await supabase
      .from("employee_duties")
      .select("employee_id, employees!inner(id, first_name, last_name, email)")
      .eq("tenant_id", tenantId).eq("is_active", true);
    const empMap = new Map<string, any>();
    for (const d of (duties ?? []) as any[]) {
      const e = d.employees;
      if (!e) continue;
      const cur = empMap.get(e.id) ?? { employee: e, total: 0, self: 0, reviewer: 0 };
      cur.total += 1;
      empMap.set(e.id, cur);
    }

    const employeeIds = Array.from(empMap.keys());
    if (employeeIds.length === 0) return { rows: [] };

    const { data: scores } = await supabase
      .from("duty_review_scores")
      .select("employee_id, submitter_kind")
      .eq("tenant_id", tenantId).eq("cycle_label", data.cycleLabel)
      .in("employee_id", employeeIds);
    for (const s of (scores ?? []) as any[]) {
      const cur = empMap.get(s.employee_id);
      if (!cur) continue;
      if (s.submitter_kind === "self") cur.self += 1; else cur.reviewer += 1;
    }

    const rows = Array.from(empMap.values()).map((r: any) => {
      const selfStatus = r.self === 0 ? "not_started" : r.self >= r.total ? "submitted" : "in_progress";
      const reviewerStatus = r.reviewer === 0 ? "not_started" : r.reviewer >= r.total ? "submitted" : "in_progress";
      return {
        employee_id: r.employee.id,
        name: `${r.employee.first_name ?? ""} ${r.employee.last_name ?? ""}`.trim(),
        email: r.employee.email,
        total_duties: r.total,
        self_submitted: r.self,
        reviewer_submitted: r.reviewer,
        self_status: selfStatus,
        reviewer_status: reviewerStatus,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return { rows };
  });

// ---------- Tenant KPI weight settings ----------
export const getKpiWeightSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tenantId, supabase } = await getCtx(context);
    const { data } = await supabase.from("tenants")
      .select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
    return {
      tolerance: Number(data?.kpi_weight_tolerance ?? 0),
      strict: Boolean(data?.kpi_strict_weights ?? true),
    };
  });

export const updateKpiWeightSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    tolerance: z.number().min(0).max(25),
    strict: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { tenantId, isAdmin, supabase } = await getCtx(context);
    if (!isAdmin) throw new Error("Admin / manager only");
    const { error } = await supabase.from("tenants")
      .update({ kpi_weight_tolerance: data.tolerance, kpi_strict_weights: data.strict })
      .eq("id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Shared helper for callers (duties, invitations) to enforce tolerance. */
export async function assertWeightWithinTolerance(
  admin: any,
  tenantId: string,
  sum: number,
): Promise<{ tolerance: number; strict: boolean; sum: number; ok: boolean }> {
  const { data } = await admin.from("tenants")
    .select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
  const tolerance = Number(data?.kpi_weight_tolerance ?? 0);
  const strict = Boolean(data?.kpi_strict_weights ?? true);
  const ok = Math.abs(sum - 100) <= tolerance;
  if (strict && !ok) {
    throw new Error(`KPI weights must sum to 100% (±${tolerance}%). Current total: ${sum}%.`);
  }
  return { tolerance, strict, sum, ok };
}
