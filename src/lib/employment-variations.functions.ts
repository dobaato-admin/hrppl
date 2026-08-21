import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

const VariationType = z.enum([
  "promotion","transfer","pay_change","hours_change","role_change","department_change","contract_change",
]);
const Status = z.enum(["draft","pending_approval","approved","rejected","applied","cancelled"]);

async function getMyTenant(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
  return data?.tenant_id ?? null;
}

async function getActor(supabase: any, userId: string) {
  const { data: p } = await supabase
    .from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  return { email: p?.email ?? null, name: p?.full_name ?? null };
}

async function audit(opts: {
  supabase: any; userId: string; variation_id: string; action: string;
  details?: Record<string, any>;
}) {
  const actor = await getActor(opts.supabase, opts.userId);
  await opts.supabase.from("employment_variation_audit").insert({
    variation_id: opts.variation_id,
    action: opts.action,
    details: opts.details ?? {},
    actor_id: opts.userId,
    actor_email: actor.email,
    actor_name: actor.name,
  });
  return actor;
}

async function notifyVariation(opts: {
  supabase: any; variation_id: string; action: string;
  actor: { email: string | null; name: string | null }; reason?: string | null;
}) {
  try {
    const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
    const { data: v } = await opts.supabase
      .from("employment_variations")
      .select(
        "variation_type, effective_date, requested_by, employee:employee_id(first_name, last_name, email, manager_id)",
      )
      .eq("id", opts.variation_id).maybeSingle();
    if (!v?.employee) return;
    const emp = v.employee as any;
    const recipients = new Set<string>();
    if (emp.email) recipients.add(emp.email);
    if (emp.manager_id) {
      const { data: mgr } = await opts.supabase
        .from("employees").select("email").eq("id", emp.manager_id).maybeSingle();
      if (mgr?.email) recipients.add(mgr.email);
    }
    if (v.requested_by) {
      const { data: r } = await opts.supabase
        .from("profiles").select("email").eq("id", v.requested_by).maybeSingle();
      if (r?.email) recipients.add(r.email);
    }
    for (const to of recipients) {
      await sendInternalEmail({
        templateName: "employment-variation-status",
        recipientEmail: to,
        idempotencyKey: `variation-${opts.variation_id}-${opts.action}`,
        templateData: {
          employeeName: `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
          variationType: v.variation_type,
          effectiveDate: v.effective_date,
          status: opts.action,
          actorName: opts.actor.name ?? opts.actor.email ?? "Someone",
          reason: opts.reason ?? null,
        },
      });
    }
  } catch (e) { console.error("[variation email]", e); }
}

export const listVariations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      status: Status.or(z.literal("all")).default("all"),
      employee_id: z.string().uuid().optional(),
    }).partial().parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getMyTenant(supabase, userId);
    let q = supabase
      .from("employment_variations")
      .select(
        "id, variation_type, effective_date, status, current_snapshot, proposed_changes, requested_by, approver_id, approved_at, applied_at, rejection_reason, notes, created_at, employee:employee_id(id, first_name, last_name, employee_number)",
      )
      .order("created_at", { ascending: false }).limit(200);
    if (tenantId) q = q.eq("tenant_id", tenantId);
    if (data?.status && data.status !== "all") q = q.eq("status", data.status);
    if (data?.employee_id) q = q.eq("employee_id", data.employee_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const listVariationAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ variation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: entries, error } = await supabase
      .from("employment_variation_audit")
      .select("*").eq("variation_id", data.variation_id)
      .order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return { entries: entries ?? [] };
  });

export const createVariation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      employee_id: z.string().uuid(),
      variation_type: VariationType,
      effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      proposed_changes: z.record(z.string(), z.any()),
      notes: z.string().trim().max(2000).nullable().optional(),
      submit: z.boolean().default(false),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .select("id, tenant_id, first_name, last_name, job_title, department_id, employment_type, base_salary, hourly_rate")
      .eq("id", data.employee_id).maybeSingle();
    if (empErr) throw new Error(empErr.message);
    if (!emp) throw new Error("Employee not found");

    const snapshot = {
      job_title: emp.job_title, department_id: emp.department_id,
      employment_type: emp.employment_type, base_salary: emp.base_salary,
      hourly_rate: emp.hourly_rate,
    };

    const { data: ins, error } = await supabase
      .from("employment_variations")
      .insert({
        employee_id: emp.id, tenant_id: emp.tenant_id,
        variation_type: data.variation_type, effective_date: data.effective_date,
        current_snapshot: snapshot, proposed_changes: data.proposed_changes,
        status: data.submit ? "pending_approval" : "draft",
        requested_by: userId, notes: data.notes ?? null,
      })
      .select("id").single();
    if (error) throw new Error(error.message);
    const actor = await audit({
      supabase, userId, variation_id: ins.id,
      action: data.submit ? "submitted" : "created",
      details: { variation_type: data.variation_type, effective_date: data.effective_date },
    });
    if (data.submit) {
      await notifyVariation({ supabase, variation_id: ins.id, action: "submitted", actor });
    }
    return { ok: true, id: ins.id };
  });

export const submitVariation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { error } = await supabase
      .from("employment_variations")
      .update({ status: "pending_approval" })
      .eq("id", data.id).eq("status", "draft");
    if (error) throw new Error(error.message);
    const actor = await audit({ supabase, userId, variation_id: data.id, action: "submitted" });
    await notifyVariation({ supabase, variation_id: data.id, action: "submitted", actor });
    return { ok: true };
  });

export const approveVariation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), comment: z.string().trim().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { error } = await supabase
      .from("employment_variations")
      .update({
        status: "approved", approver_id: userId,
        approved_at: new Date().toISOString(), rejection_reason: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("employment_variation_approvals").insert({
      variation_id: data.id, step_no: 1, approver_role: "approver",
      approver_id: userId, decision: "approved",
      decided_at: new Date().toISOString(), comment: data.comment ?? null,
    });
    const actor = await audit({
      supabase, userId, variation_id: data.id, action: "approved",
      details: { comment: data.comment ?? null },
    });
    await notifyVariation({
      supabase, variation_id: data.id, action: "approved", actor,
      reason: data.comment ?? null,
    });
    return { ok: true };
  });

export const rejectVariation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), reason: z.string().trim().min(3).max(1000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { error } = await supabase
      .from("employment_variations")
      .update({
        status: "rejected", approver_id: userId,
        approved_at: null, rejection_reason: data.reason,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("employment_variation_approvals").insert({
      variation_id: data.id, step_no: 1, approver_role: "approver",
      approver_id: userId, decision: "rejected",
      decided_at: new Date().toISOString(), comment: data.reason,
    });
    const actor = await audit({
      supabase, userId, variation_id: data.id, action: "rejected",
      details: { reason: data.reason },
    });
    await notifyVariation({
      supabase, variation_id: data.id, action: "rejected", actor, reason: data.reason,
    });
    return { ok: true };
  });

export const applyVariation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: v, error: vErr } = await supabase
      .from("employment_variations")
      .select("id, employee_id, status, proposed_changes")
      .eq("id", data.id).maybeSingle();
    if (vErr) throw new Error(vErr.message);
    if (!v) throw new Error("Variation not found");
    if (v.status !== "approved") throw new Error("Variation must be approved before applying");

    const allowed = ["job_title","department_id","employment_type","base_salary","hourly_rate"];
    const updates: Record<string, any> = {};
    for (const k of allowed) {
      if (v.proposed_changes && k in v.proposed_changes && v.proposed_changes[k] !== null && v.proposed_changes[k] !== "") {
        updates[k] = v.proposed_changes[k];
      }
    }
    if (Object.keys(updates).length) {
      const { error: upErr } = await supabase.from("employees").update(updates).eq("id", v.employee_id);
      if (upErr) throw new Error(upErr.message);
    }
    const { error: stErr } = await supabase
      .from("employment_variations")
      .update({ status: "applied", applied_at: new Date().toISOString() })
      .eq("id", v.id);
    if (stErr) throw new Error(stErr.message);
    const actor = await audit({
      supabase, userId, variation_id: v.id, action: "applied",
      details: { applied_fields: Object.keys(updates) },
    });
    await notifyVariation({ supabase, variation_id: v.id, action: "applied", actor });
    return { ok: true };
  });
