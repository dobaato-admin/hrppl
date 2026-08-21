import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import type { PresetCompetency } from "./review-presets";
import { expandSchedule } from "./review-schedule";

export { expandSchedule };

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}
async function requireAdmin(supabase: any, userId: string) {
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["org_admin", "super_admin", "manager"].includes(r))) {
    throw new Error("Not authorized");
  }
}

/* ---------- evidence validation (shared between submit & resubmit) ---------- */

const URL_RE = /^(https?:\/\/|data:|blob:)[^\s]+$/i;

export interface EvidenceValidationResult {
  ok: boolean;
  missingTypes: string[];
  minCount: number;
  haveCount: number;
  invalidUrls: { index: number; name: string }[];
  message?: string;
}

function validateEvidence(comp: any, evidence: any[]): EvidenceValidationResult {
  const minCount = comp?.evidenceEnabled ? (comp.minEvidenceCount ?? 0) : 0;
  const required: string[] = comp?.evidenceEnabled ? (comp.requiredEvidenceTypes ?? []) : [];
  const haveTypes = new Set(evidence.map((e) => e.type));
  const missingTypes = required.filter((t) => !haveTypes.has(t));
  const invalidUrls = evidence
    .map((e, i) => ({ index: i, name: e.name as string, url: e.url as string }))
    .filter((e) => !URL_RE.test(e.url ?? ""));
  const lacking = evidence.length < minCount;
  const ok = !lacking && missingTypes.length === 0 && invalidUrls.length === 0;
  let message: string | undefined;
  if (!ok) {
    const parts: string[] = [];
    if (lacking) parts.push(`Need at least ${minCount} evidence item(s) (have ${evidence.length}).`);
    if (missingTypes.length) parts.push(`Missing required type(s): ${missingTypes.join(", ")}.`);
    if (invalidUrls.length) parts.push(`Invalid URL on: ${invalidUrls.map((x) => x.name || `#${x.index + 1}`).join(", ")}.`);
    message = parts.join(" ");
  }
  return { ok, missingTypes, minCount, haveCount: evidence.length, invalidUrls: invalidUrls.map(({ index, name }) => ({ index, name })), message };
}

const evidenceSchema = z.array(z.object({
  type: z.enum(["document","url","social","screenshot"]),
  name: z.string().max(300),
  url: z.string().max(2000),
  size: z.number().optional(),
  mime: z.string().max(120).optional(),
})).max(20).default([]);

/* ---------- generate ---------- */

export const generateReviewInstances = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    templateId: z.string().uuid(),
    employeeIds: z.array(z.string().uuid()).min(1).max(2000).optional(),
    horizonDays: z.number().int().min(7).max(730).default(365),
    dueOffsetDays: z.number().int().min(0).max(60).default(7),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const admin = await loadAdmin();
    const { data: tpl } = await admin.from("review_templates" as any)
      .select("id,tenant_id,version,competencies").eq("id", data.templateId).maybeSingle();
    if (!tpl) throw new Error("Template not found");
    const t: any = tpl;

    let empIds = data.employeeIds;
    if (!empIds) {
      const { data: emps } = await admin.from("employees")
        .select("id").eq("tenant_id", t.tenant_id).eq("status", "active");
      empIds = (emps ?? []).map((e: any) => e.id);
    }
    if (!empIds.length) return { ok: true, created: 0 };

    const today = new Date(); today.setUTCHours(0,0,0,0);
    const horizon = new Date(today.getTime() + data.horizonDays * 86400000);

    const rows: any[] = [];
    for (const comp of (t.competencies ?? []) as PresetCompetency[]) {
      const periods = expandSchedule(comp.schedule, today, horizon);
      if (!periods.length) continue;
      for (const eid of empIds) {
        for (const { period, date } of periods) {
          const due = new Date(date.getTime() + data.dueOffsetDays * 86400000);
          rows.push({
            tenant_id: t.tenant_id, template_id: t.id, template_version: t.version ?? 1,
            employee_id: eid, item_id: comp.id, period_label: period,
            scheduled_for: date.toISOString().slice(0,10),
            due_date: due.toISOString().slice(0,10),
            status: "pending",
          });
        }
      }
    }
    if (!rows.length) return { ok: true, created: 0 };
    const { error } = await admin.from("review_instances" as any)
      .upsert(rows, { onConflict: "template_id,employee_id,item_id,period_label", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true, created: rows.length };
  });

/* ---------- list ---------- */

export const listMyReviewInstances = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    status: z.enum(["pending","submitted","approved","rejected","all"]).default("all"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: emp } = await supabase.from("employees")
      .select("id,tenant_id").eq("user_id", userId).maybeSingle();
    if (!emp) return { instances: [], templates: [] };
    let q = supabase.from("review_instances" as any).select("*")
      .eq("employee_id", emp.id).order("due_date", { ascending: true });
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r: any) => r.template_id)));
    let templates: any[] = [];
    if (ids.length) {
      const { data: t } = await supabase.from("review_templates" as any)
        .select("id,name,scale_min,scale_max,scale_labels,competencies").in("id", ids);
      templates = t ?? [];
    }
    return { instances: rows ?? [], templates };
  });

/* ---------- submit ---------- */

const submitInput = z.object({
  id: z.string().uuid(),
  score: z.any(),
  evidence: evidenceSchema,
  comments: z.string().max(2000).optional(),
});

async function performSubmit(
  supabase: any, userId: string, data: z.infer<typeof submitInput>, isResubmit: boolean,
) {
  const { data: inst } = await supabase.from("review_instances" as any)
    .select("id,employee_id,template_id,item_id,status,version,tenant_id,score,evidence,reviewer_comments,submitted_at,reviewed_at")
    .eq("id", data.id).maybeSingle();
  if (!inst) throw new Error("Not found");
  const i: any = inst;
  const { data: emp } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  if (!emp || emp.id !== i.employee_id) throw new Error("Not your scorecard");

  if (isResubmit && i.status !== "rejected") throw new Error("Only rejected scorecards can be resubmitted");
  if (!isResubmit && !["pending","rejected"].includes(i.status)) {
    throw new Error("This scorecard has already been submitted");
  }

  const { data: tpl } = await supabase.from("review_templates" as any)
    .select("competencies").eq("id", i.template_id).maybeSingle();
  const comp = ((tpl as any)?.competencies ?? []).find((c: any) => c.id === i.item_id);
  const validation = validateEvidence(comp, data.evidence);
  if (!validation.ok) {
    const err: any = new Error(validation.message || "Evidence requirements not met");
    err.validation = validation;
    throw err;
  }

  // Snapshot prior state on resubmit so admins/approvers see the version history
  if (isResubmit) {
    await supabase.from("review_instance_versions" as any).insert({
      tenant_id: i.tenant_id,
      instance_id: i.id,
      version: i.version ?? 1,
      status: i.status,
      score: i.score,
      evidence: i.evidence ?? [],
      reviewer_comments: i.reviewer_comments,
      submitted_at: i.submitted_at,
      reviewed_at: i.reviewed_at,
      snapshot_reason: "resubmit",
      actor_id: userId,
    } as any);
  }

  const newVersion = isResubmit ? (i.version ?? 1) + 1 : (i.version ?? 1);
  const { error } = await supabase.from("review_instances" as any).update({
    status: "submitted",
    score: data.score ?? null,
    evidence: data.evidence,
    reviewer_comments: isResubmit ? null : i.reviewer_comments,
    submitted_at: new Date().toISOString(),
    resubmitted_at: isResubmit ? new Date().toISOString() : null,
    version: newVersion,
    reminder_sent_at: null,
    reminder_count: 0,
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true, version: newVersion };
}

export const submitReviewInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => submitInput.parse(d))
  .handler(async ({ data, context }) => performSubmit(context.supabase, context.userId, data, false));

export const resubmitReviewInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => submitInput.parse(d))
  .handler(async ({ data, context }) => performSubmit(context.supabase, context.userId, data, true));

/* ---------- approver decision ---------- */

export const reviewReviewInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    decision: z.enum(["approved","rejected"]),
    comments: z.string().max(2000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    // Snapshot the submitted state so resubmits keep a full audit trail
    const { data: inst } = await context.supabase.from("review_instances" as any)
      .select("id,tenant_id,version,status,score,evidence,reviewer_comments,submitted_at")
      .eq("id", data.id).maybeSingle();
    if (inst) {
      const i: any = inst;
      await context.supabase.from("review_instance_versions" as any).insert({
        tenant_id: i.tenant_id, instance_id: i.id, version: i.version ?? 1,
        status: data.decision, score: i.score, evidence: i.evidence ?? [],
        reviewer_comments: data.comments ?? null, submitted_at: i.submitted_at,
        reviewed_at: new Date().toISOString(),
        snapshot_reason: `reviewer_${data.decision}`,
        actor_id: context.userId,
      } as any);
    }
    const { error } = await context.supabase.from("review_instances" as any).update({
      status: data.decision,
      reviewer_id: context.userId,
      reviewer_comments: data.comments ?? null,
      reviewed_at: new Date().toISOString(),
      rejected_at: data.decision === "rejected" ? new Date().toISOString() : null,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- version history ---------- */

export const listInstanceVersions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ instanceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from("review_instance_versions" as any)
      .select("*").eq("instance_id", data.instanceId).order("version", { ascending: false });
    if (error) throw new Error(error.message);
    return { versions: rows ?? [] };
  });

/* ---------- template audit ---------- */

export const logTemplateAuditEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    templateId: z.string().uuid().nullable(),
    templateName: z.string().min(1).max(200),
    action: z.enum(["export","import"]),
    fileName: z.string().max(300).optional(),
    snapshot: z.any().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin","super_admin"].includes(r))) throw new Error("Not authorized");
    const { data: prof } = await supabase.from("profiles").select("tenant_id,email").eq("id", userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    const { error } = await supabase.from("review_template_audit_log" as any).insert({
      tenant_id: prof.tenant_id,
      template_id: data.templateId,
      template_name: data.templateName,
      action: data.action,
      file_name: data.fileName ?? null,
      actor_id: userId,
      actor_email: (prof as any).email ?? null,
      snapshot: data.snapshot ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTemplateAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    limit: z.number().int().min(1).max(500).default(100),
    action: z.enum(["export","import","all"]).default("all"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["org_admin","super_admin"].includes(r))) throw new Error("Not authorized");
    let q = supabase.from("review_template_audit_log" as any).select("*")
      .order("created_at", { ascending: false }).limit(data.limit);
    if (data.action !== "all") q = q.eq("action", data.action);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { entries: rows ?? [] };
  });

/* ---------- admin dashboard summary ---------- */

export const reviewDashboardSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    templateId: z.string().uuid().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: prof } = await context.supabase.from("profiles").select("tenant_id").eq("id", context.userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    let q = context.supabase.from("review_instances" as any).select("*")
      .eq("tenant_id", prof.tenant_id)
      .gte("scheduled_for", data.from)
      .lte("scheduled_for", data.to);
    if (data.templateId) q = q.eq("template_id", data.templateId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as any[];

    const tplIds = Array.from(new Set(list.map((r) => r.template_id)));
    const { data: tpls } = tplIds.length
      ? await context.supabase.from("review_templates" as any).select("id,name,competencies").in("id", tplIds)
      : { data: [] as any[] };
    const tplMap = new Map((tpls ?? []).map((t: any) => [t.id, t]));

    // overall completion
    const total = list.length;
    const byStatus = { pending: 0, submitted: 0, approved: 0, rejected: 0 } as Record<string, number>;
    list.forEach((r) => { byStatus[r.status] = (byStatus[r.status] ?? 0) + 1; });
    const completionRate = total ? (byStatus.approved + byStatus.submitted) / total : 0;

    // by template
    const byTemplate = new Map<string, { templateId: string; name: string; total: number; approved: number; submitted: number; pending: number; rejected: number; avgScore: number | null; scoreCount: number }>();
    // by KPI item
    const byItem = new Map<string, { templateId: string; itemId: string; label: string; total: number; approved: number; avgScore: number | null; scoreCount: number; evidenceCompliant: number; evidenceRequired: number }>();
    let evidenceRequiredTotal = 0;
    let evidenceCompliantTotal = 0;

    for (const r of list) {
      const tpl = tplMap.get(r.template_id);
      const tplName = (tpl as any)?.name ?? "Unknown";
      const tBucket = byTemplate.get(r.template_id) ?? {
        templateId: r.template_id, name: tplName, total: 0, approved: 0, submitted: 0, pending: 0, rejected: 0, avgScore: null, scoreCount: 0,
      };
      tBucket.total += 1; (tBucket as any)[r.status] = ((tBucket as any)[r.status] ?? 0) + 1;
      const comp = ((tpl as any)?.competencies ?? []).find((c: any) => c.id === r.item_id);
      const numScore = typeof r.score === "number" ? r.score
        : typeof r.score === "boolean" ? (r.score ? 1 : 0) : null;
      if (numScore != null) {
        tBucket.avgScore = (((tBucket.avgScore ?? 0) * tBucket.scoreCount) + numScore) / (tBucket.scoreCount + 1);
        tBucket.scoreCount += 1;
      }
      byTemplate.set(r.template_id, tBucket);

      const key = `${r.template_id}:${r.item_id}`;
      const iBucket = byItem.get(key) ?? {
        templateId: r.template_id, itemId: r.item_id, label: comp?.label ?? r.item_id,
        total: 0, approved: 0, avgScore: null, scoreCount: 0, evidenceCompliant: 0, evidenceRequired: 0,
      };
      iBucket.total += 1;
      if (r.status === "approved") iBucket.approved += 1;
      if (numScore != null) {
        iBucket.avgScore = (((iBucket.avgScore ?? 0) * iBucket.scoreCount) + numScore) / (iBucket.scoreCount + 1);
        iBucket.scoreCount += 1;
      }
      if (comp?.evidenceEnabled) {
        iBucket.evidenceRequired += 1;
        evidenceRequiredTotal += 1;
        const validation = validateEvidence(comp, r.evidence ?? []);
        if (validation.ok && (r.evidence ?? []).length > 0) {
          iBucket.evidenceCompliant += 1;
          evidenceCompliantTotal += 1;
        }
      }
      byItem.set(key, iBucket);
    }

    return {
      range: { from: data.from, to: data.to },
      total, byStatus, completionRate,
      evidenceCompliance: evidenceRequiredTotal ? evidenceCompliantTotal / evidenceRequiredTotal : null,
      evidenceRequiredTotal, evidenceCompliantTotal,
      byTemplate: Array.from(byTemplate.values()),
      byItem: Array.from(byItem.values()).sort((a, b) => b.total - a.total).slice(0, 50),
    };
  });

/* ---------- export ---------- */

export const exportReviewInstances = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    templateId: z.string().uuid().optional(),
    employeeId: z.string().uuid().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: prof } = await context.supabase.from("profiles").select("tenant_id").eq("id", context.userId).maybeSingle();
    if (!prof?.tenant_id) throw new Error("No tenant");
    let q = context.supabase.from("review_instances" as any).select("*")
      .eq("tenant_id", prof.tenant_id)
      .gte("scheduled_for", data.from)
      .lte("scheduled_for", data.to)
      .order("scheduled_for", { ascending: true });
    if (data.templateId) q = q.eq("template_id", data.templateId);
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const empIds = Array.from(new Set((rows ?? []).map((r: any) => r.employee_id)));
    const tplIds = Array.from(new Set((rows ?? []).map((r: any) => r.template_id)));
    const [empRes, tplRes] = await Promise.all([
      empIds.length
        ? context.supabase.from("employees").select("id,first_name,last_name,employee_number").in("id", empIds)
        : Promise.resolve({ data: [] as any[] }),
      tplIds.length
        ? context.supabase.from("review_templates" as any).select("id,name,competencies").in("id", tplIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const empMap = new Map(((empRes as any).data ?? []).map((e: any) => [e.id, e]));
    const tplMap = new Map(((tplRes as any).data ?? []).map((t: any) => [t.id, t]));

    const out = (rows ?? []).map((r: any) => {
      const e: any = empMap.get(r.employee_id) ?? {};
      const t: any = tplMap.get(r.template_id) ?? {};
      const comp = (t.competencies ?? []).find((c: any) => c.id === r.item_id);
      return {
        instance_id: r.id,
        employee_number: e.employee_number ?? "",
        employee_name: [e.first_name, e.last_name].filter(Boolean).join(" "),
        template: t.name ?? "",
        item: comp?.label ?? r.item_id,
        item_type: comp?.type ?? "",
        period: r.period_label,
        scheduled_for: r.scheduled_for,
        due_date: r.due_date ?? "",
        status: r.status,
        version: r.version ?? 1,
        score: r.score == null ? "" : (typeof r.score === "object" ? JSON.stringify(r.score) : String(r.score)),
        evidence_count: (r.evidence ?? []).length,
        evidence_types: Array.from(new Set((r.evidence ?? []).map((x: any) => x.type))).join("|"),
        evidence_urls: (r.evidence ?? []).map((x: any) => x.url).join("|"),
        submitted_at: r.submitted_at ?? "",
        reviewed_at: r.reviewed_at ?? "",
        reviewer_comments: r.reviewer_comments ?? "",
      };
    });
    return { rows: out };
  });
