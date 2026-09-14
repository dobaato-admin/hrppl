/**
 * Offboarding comms-removal verification server fns.
 * The 10 mandatory channel rows are auto-seeded by the DB trigger on case insert.
 * Audit rows are written by an AFTER trigger; we never insert into the audit table directly.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { enforceRateLimit, validateEvidenceUrl, CSV_MAX_ROWS } from "./rate-limit.functions";
import { requireTenantId } from "@/lib/tenant-scope";

export const listCommsRemoval = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ caseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase
      .from("offboarding_comms_removal").select("*")
      .eq("case_id", data.caseId)
      .order("is_mandatory", { ascending: false })
      .order("channel_label");
    if (error) throw new Error(error.message);
    const total = (rows ?? []).length;
    const verified = (rows ?? []).filter((r: any) => r.removed && r.attested_at).length;
    return { rows: rows ?? [], total, verified, complete: total > 0 && verified === total };
  });

export const updateCommsRemoval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    removed: z.boolean(),
    evidence_url: z.string().url().max(1000).optional().nullable(),
    attestation_signature: z.string().trim().max(200).optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
    due_date: z.string().optional().nullable(),
    reminder_interval_days: z.number().int().min(1).max(30).optional(),
    escalate_after_days: z.number().int().min(1).max(60).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "comms_evidence_update", 60, 60);
    if (data.evidence_url) validateEvidenceUrl(data.evidence_url);
    const patch: any = {
      removed: data.removed,
      removed_at: data.removed ? new Date().toISOString() : null,
      evidence_url: data.evidence_url ?? null,
      notes: data.notes ?? null,
    };
    if (data.due_date !== undefined) patch.due_date = data.due_date ?? null;
    if (data.reminder_interval_days !== undefined) patch.reminder_interval_days = data.reminder_interval_days;
    if (data.escalate_after_days !== undefined) patch.escalate_after_days = data.escalate_after_days;
    if (data.attestation_signature) {
      patch.attestation_signature = data.attestation_signature;
      patch.attested_by = userId;
      patch.attested_at = new Date().toISOString();
    } else if (!data.removed) {
      patch.attestation_signature = null;
      patch.attested_by = null;
      patch.attested_at = null;
    }
    const { error } = await supabase.from("offboarding_comms_removal").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addCustomCommsChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    caseId: z.string().uuid(),
    channel: z.string().trim().min(2).max(60),
    label: z.string().trim().min(2).max(200),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: c } = await supabase.from("offboarding_cases").select("tenant_id").eq("id", data.caseId).maybeSingle();
    if (!c) throw new Error("Case not found");
    const { error } = await supabase.from("offboarding_comms_removal").insert({
      tenant_id: c.tenant_id, case_id: data.caseId,
      channel: data.channel.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      channel_label: data.label, is_mandatory: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCommsAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ caseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { data: rows, error } = await supabase
      .from("offboarding_comms_removal_audit").select("*")
      .eq("case_id", data.caseId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

function toCsv(rows: any[][]): string {
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export const exportCommsRemovalCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    scope: z.enum(["all", "gaps"]).default("all"),
    caseId: z.string().uuid().optional(),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "audit_export", 5, 60);
    const tenantId = await requireTenantId(supabase, userId);

    let query = supabase
      .from("offboarding_comms_removal")
      .select("id, case_id, channel, channel_label, is_mandatory, removed, removed_at, evidence_url, attestation_signature, attested_at, due_date, notes, case:case_id(employee_id, status, last_working_day, employee:employee_id(first_name, last_name, employee_number))")
      .eq("tenant_id", tenantId)
      .limit(CSV_MAX_ROWS);
    if (data.caseId) query = query.eq("case_id", data.caseId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    let filtered = (rows ?? []) as any[];
    if (data.scope === "gaps") {
      filtered = filtered.filter((r) => !r.removed || !r.attested_at || !r.evidence_url);
    }

    const header = [
      "employee_number","employee_name","case_id","case_status","last_working_day",
      "channel","channel_label","mandatory","removed","removed_at",
      "evidence_url","attestation_signature","attested_at","due_date","notes",
    ];
    const body = filtered.map((r) => {
      const e = r.case?.employee ?? {};
      return [
        e.employee_number ?? "",
        [e.first_name, e.last_name].filter(Boolean).join(" "),
        r.case_id, r.case?.status ?? "", r.case?.last_working_day ?? "",
        r.channel, r.channel_label, r.is_mandatory, r.removed, r.removed_at ?? "",
        r.evidence_url ?? "", r.attestation_signature ?? "", r.attested_at ?? "",
        r.due_date ?? "", r.notes ?? "",
      ];
    });
    return { csv: toCsv([header, ...body]), rowCount: body.length };
  });
