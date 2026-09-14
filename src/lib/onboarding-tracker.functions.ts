/**
 * Cross-employee onboarding tracker + attestation/evidence server fns.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { enforceRateLimit, validateEvidenceUrl } from "./rate-limit.functions";
import { getTenantId } from "@/lib/tenant-scope";

async function recordAudit(supabase: any, userId: string, assignment_id: string, task_id: string | null, action: string, details: Record<string, any>) {
  const { data: p } = await supabase.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  await supabase.from("onboarding_control_room_audit").insert({
    assignment_id, task_id, action, details,
    actor_id: userId, actor_email: p?.email ?? null, actor_name: p?.full_name ?? null,
  });
}

export const listOnboardingTrackerRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    status: z.string().max(40).optional(),
    country: z.string().max(8).optional(),
    branchId: z.string().uuid().optional(),
    onlyOverdue: z.boolean().optional(),
  }).partial().parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await getTenantId(supabase, userId);
    if (!tenantId) return { rows: [] };

    const { data: assignments } = await supabase
      .from("onboarding_assignments")
      .select("id, status, due_date, employee:employee_id(id, first_name, last_name, employee_number, hire_date, branch_id, tenant_id, job_title)")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(500);
    let rows = (assignments ?? []).filter((a: any) => a.employee?.tenant_id === tenantId);
    if (data?.status) rows = rows.filter((r: any) => r.status === data.status);
    if (data?.branchId) rows = rows.filter((r: any) => r.employee?.branch_id === data.branchId);

    // Resolve branch country if filtering by country
    if (data?.country) {
      const branchIds = Array.from(new Set(rows.map((r: any) => r.employee?.branch_id).filter(Boolean)));
      const { data: branches } = branchIds.length
        ? await supabase.from("tenant_branches").select("id, country_code").in("id", branchIds)
        : { data: [] };
      const cc = new Map((branches ?? []).map((b: any) => [b.id, b.country_code]));
      rows = rows.filter((r: any) => cc.get(r.employee?.branch_id) === data.country);
    }

    const ids = rows.map((r: any) => r.id);
    if (!ids.length) return { rows: [] };
    const { data: tasks } = await supabase
      .from("onboarding_control_room_tasks")
      .select("assignment_id, status, due_date, attestation_required, attested_at, evidence_url")
      .in("assignment_id", ids);

    const today = new Date().toISOString().slice(0, 10);
    const stats: Record<string, any> = {};
    (tasks ?? []).forEach((t: any) => {
      const s = stats[t.assignment_id] ??= { total: 0, done: 0, overdue: 0, missingAttest: 0, missingEvidence: 0 };
      s.total++;
      if (t.status === "completed" || t.status === "skipped") s.done++;
      if (t.status !== "completed" && t.status !== "skipped" && t.due_date && t.due_date < today) s.overdue++;
      if (t.attestation_required && !t.attested_at) s.missingAttest++;
      if (t.attestation_required && !t.evidence_url) s.missingEvidence++;
    });

    let out = rows.map((r: any) => ({
      ...r,
      stats: stats[r.id] ?? { total: 0, done: 0, overdue: 0, missingAttest: 0, missingEvidence: 0 },
    }));
    if (data?.onlyOverdue) out = out.filter((r: any) => r.stats.overdue > 0);
    return { rows: out };
  });

export const attestControlRoomTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    signature: z.string().trim().min(2).max(200),
    evidence_url: z.string().url().max(1000).optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "tracker_attest", 60, 60);
    if (data.evidence_url) validateEvidenceUrl(data.evidence_url);
    const { data: existing } = await supabase
      .from("onboarding_control_room_tasks")
      .select("id, assignment_id, title").eq("id", data.id).maybeSingle();
    if (!existing) throw new Error("Task not found");
    const { error } = await supabase.from("onboarding_control_room_tasks").update({
      attestation_required: true,
      attestation_signature: data.signature,
      attested_at: new Date().toISOString(),
      attested_by: userId,
      evidence_url: data.evidence_url ?? null,
      verifier_notes: data.notes ?? null,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await recordAudit(supabase, userId, existing.assignment_id, existing.id, "task_attested", {
      title: existing.title, signature: data.signature, evidence: !!data.evidence_url,
    });
    return { ok: true };
  });

export const toggleTaskAttestationRequired = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), required: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: t } = await supabase.from("onboarding_control_room_tasks")
      .select("assignment_id, title").eq("id", data.id).maybeSingle();
    const { error } = await supabase.from("onboarding_control_room_tasks")
      .update({ attestation_required: data.required }).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (t) await recordAudit(supabase, userId, t.assignment_id, data.id, "task_attestation_toggled", { title: t.title, required: data.required });
    return { ok: true };
  });

export const acknowledgeCountryMerge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ assignment_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: a } = await supabase.from("onboarding_assignments")
      .select("metadata").eq("id", data.assignment_id).maybeSingle();
    const meta = { ...(a?.metadata ?? {}), country_merge_acknowledged_at: new Date().toISOString(), country_merge_acknowledged_by: userId };
    await supabase.from("onboarding_assignments").update({ metadata: meta }).eq("id", data.assignment_id);
    await recordAudit(supabase, userId, data.assignment_id, null, "country_merge_acknowledged", {});
    return { ok: true };
  });
