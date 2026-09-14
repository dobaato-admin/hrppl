/**
 * Background CSV export jobs.
 * Client enqueues a job, then polls its status. The handler does the work and
 * writes the result row; the UI never blocks waiting for it. Caps at CSV_MAX_ROWS.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { enforceRateLimit, CSV_MAX_ROWS } from "./rate-limit.functions";
import { requireTenantId } from "@/lib/tenant-scope";

const FilterSchema = z.object({
  source: z.enum(["onboarding", "offboarding", "all"]).default("all"),
  employeeId: z.string().uuid().optional().nullable(),
  channel: z.string().trim().max(60).optional().nullable(),
  actorId: z.string().uuid().optional().nullable(),
  actorSearch: z.string().trim().max(200).optional().nullable(),
  action: z.string().trim().max(60).optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  assignmentId: z.string().uuid().optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  includeArchive: z.boolean().default(false),
}).partial();

type Filters = z.infer<typeof FilterSchema>;

const JOB_TYPES = ["audit_unified", "audit_onboarding"] as const;

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function getRetentionDays(supabase: any, tenantId: string): Promise<number> {
  const { data } = await supabase.from("tenants").select("csv_export_retention_days").eq("id", tenantId).maybeSingle();
  const n = Number((data as any)?.csv_export_retention_days);
  return Number.isFinite(n) && n > 0 ? n : 7;
}

function expiryFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function dateRange(q: any, f: Filters) {
  if (f.startDate) q = q.gte("created_at", `${f.startDate}T00:00:00Z`);
  if (f.endDate) q = q.lte("created_at", `${f.endDate}T23:59:59Z`);
  return q;
}

async function fetchOnboarding(supabase: any, tenantId: string, f: Filters, table: string) {
  let q = supabase.from(table)
    .select("id, created_at, action, details, actor_id, actor_email, actor_name, employee_id, assignment_id, task_id")
    .eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(CSV_MAX_ROWS);
  if (f.employeeId) q = q.eq("employee_id", f.employeeId);
  if (f.taskId) q = q.eq("task_id", f.taskId);
  if (f.assignmentId) q = q.eq("assignment_id", f.assignmentId);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch) q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = dateRange(q, f);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({ ...r, source: "onboarding", channel: null }));
}

async function fetchOffboarding(supabase: any, tenantId: string, f: Filters, table: string) {
  let q = supabase.from(table)
    .select("id, created_at, action, before, after, actor_id, actor_email, actor_name, case_id, comms_row_id, channel")
    .eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(CSV_MAX_ROWS);
  if (f.channel) q = q.eq("channel", f.channel);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch) q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = dateRange(q, f);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({ ...r, source: "offboarding", employee_id: null, details: r.after }));
}

async function processJob(supabase: any, jobId: string, tenantId: string, jobType: string, filters: Filters) {
  await supabase.from("csv_export_jobs").update({ status: "running", started_at: new Date().toISOString(), progress: 5 }).eq("id", jobId);
  try {
    const rows: any[] = [];
    const onbTable = filters.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
    const offTable = filters.includeArchive ? "offboarding_comms_removal_audit_archive" : "offboarding_comms_removal_audit";

    if (jobType === "audit_onboarding") {
      rows.push(...await fetchOnboarding(supabase, tenantId, filters, onbTable));
    } else {
      if (filters.source !== "offboarding") rows.push(...await fetchOnboarding(supabase, tenantId, filters, onbTable));
      await supabase.from("csv_export_jobs").update({ progress: 45 }).eq("id", jobId);
      if (filters.source !== "onboarding") rows.push(...await fetchOffboarding(supabase, tenantId, filters, offTable));
    }
    await supabase.from("csv_export_jobs").update({ progress: 75 }).eq("id", jobId);

    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const capped = rows.slice(0, CSV_MAX_ROWS);
    const header = ["timestamp_utc","source","action","actor_name","actor_email","employee_id","channel","assignment_id","task_id","case_id","details"];
    const body = capped.map((r: any) => [
      r.created_at, r.source, r.action, r.actor_name ?? "", r.actor_email ?? "",
      r.employee_id ?? "", r.channel ?? "", r.assignment_id ?? "", r.task_id ?? "", r.case_id ?? "",
      r.details ?? r.after ?? {},
    ]);
    const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
    await supabase.from("csv_export_jobs").update({
      status: "succeeded", progress: 100, completed_at: new Date().toISOString(),
      row_count: capped.length, truncated: rows.length > CSV_MAX_ROWS, result_csv: csv,
    }).eq("id", jobId);
    // In-app notification: user knows the file is ready in Recent jobs.
    const { data: jobRow } = await supabase.from("csv_export_jobs").select("requested_by, tenant_id").eq("id", jobId).maybeSingle();
    if (jobRow?.requested_by) {
      await supabase.from("in_app_notifications").insert({
        user_id: jobRow.requested_by, tenant_id: jobRow.tenant_id,
        kind: "csv_export_ready",
        title: `CSV export ready (${capped.length} rows${rows.length > CSV_MAX_ROWS ? " — capped at 50k" : ""})`,
        body: "Your audit-history export finished. Open Recent jobs to download.",
        link: `/admin/audit-history?job=${jobId}`,
      });
    }
  } catch (e: any) {
    await supabase.from("csv_export_jobs").update({
      status: "failed", completed_at: new Date().toISOString(), error_message: String(e?.message ?? e),
    }).eq("id", jobId);
    const { data: jobRow } = await supabase.from("csv_export_jobs").select("requested_by, tenant_id").eq("id", jobId).maybeSingle();
    if (jobRow?.requested_by) {
      await supabase.from("in_app_notifications").insert({
        user_id: jobRow.requested_by, tenant_id: jobRow.tenant_id,
        kind: "csv_export_failed",
        title: "CSV export failed",
        body: String(e?.message ?? e).slice(0, 280),
        link: `/admin/audit-history?job=${jobId}`,
      });
    }
  }
}


export const enqueueAuditExportJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    jobType: z.enum(JOB_TYPES).default("audit_unified"),
    filters: FilterSchema.default({}),
  }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await enforceRateLimit(supabase, "csv_export_job", 10, 60);
    const tenantId = await requireTenantId(supabase, userId);
    const retentionDays = await getRetentionDays(supabase, tenantId);
    const { data: job, error } = await supabase.from("csv_export_jobs").insert({
      tenant_id: tenantId, requested_by: userId,
      job_type: data.jobType, filters: data.filters, status: "queued", progress: 0,
      attempt: 1, expires_at: expiryFromNow(retentionDays),
    }).select("id").single();
    if (error) throw new Error(error.message);
    await processJob(supabase, job.id, tenantId, data.jobType, data.filters);
    return { jobId: job.id };
  });

/**
 * Retry a failed/cancelled CSV export job. Links the new job to the original
 * via parent_job_id and bumps `attempt` so the UI can show "Attempt 2" etc.
 */
export const retryExportJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: orig, error: e1 } = await supabase.from("csv_export_jobs")
      .select("id, job_type, filters, status, requested_by, tenant_id, attempt, parent_job_id, expires_at")
      .eq("id", data.jobId).maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!orig) throw new Error("Original job not found.");
    // result_csv is column-revoked from authenticated; read presence via admin client.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: csvProbe } = await supabaseAdmin.from("csv_export_jobs")
      .select("result_csv").eq("id", data.jobId).maybeSingle();
    const hasCsv = !!csvProbe?.result_csv;
    const isExpired = orig.status === "succeeded" && !hasCsv && orig.expires_at && new Date(orig.expires_at) < new Date();
    if (orig.status === "succeeded" && !isExpired) throw new Error("This job already succeeded — download it from Recent jobs instead of retrying.");
    if (orig.status === "queued" || orig.status === "running") throw new Error("Job is still in progress — wait for it to finish before retrying.");
    if (orig.requested_by !== userId) throw new Error("You can only retry your own export jobs.");

    await enforceRateLimit(supabase, "csv_export_job", 10, 60);
    const parsedFilters = FilterSchema.parse(orig.filters ?? {});
    const jobType = (JOB_TYPES as readonly string[]).includes(orig.job_type) ? orig.job_type : "audit_unified";
    const retentionDays = await getRetentionDays(supabase, orig.tenant_id);

    const { data: job, error } = await supabase.from("csv_export_jobs").insert({
      tenant_id: orig.tenant_id, requested_by: userId,
      job_type: jobType, filters: parsedFilters, status: "queued", progress: 0,
      attempt: (orig.attempt ?? 1) + 1,
      parent_job_id: orig.parent_job_id ?? orig.id,
      expires_at: expiryFromNow(retentionDays),
    }).select("id").single();
    if (error) throw new Error(error.message);
    await processJob(supabase, job.id, orig.tenant_id, jobType, parsedFilters);

    // Audit trail: record who retried, attempt #, filters used, and outcome.
    // Read final status of the new job to capture success/failure in one row.
    const { data: finalRow } = await supabase.from("csv_export_jobs")
      .select("status, row_count, error_message").eq("id", job.id).maybeSingle();
    await supabase.from("admin_audit_log").insert({
      tenant_id: orig.tenant_id,
      actor_id: userId,
      category: "csv_export",
      action: "retry",
      entity_type: "csv_export_job",
      entity_id: job.id,
      details: {
        original_job_id: orig.id,
        parent_job_id: orig.parent_job_id ?? orig.id,
        attempt: (orig.attempt ?? 1) + 1,
        job_type: jobType,
        filters: parsedFilters,
        result_status: finalRow?.status ?? "unknown",
        row_count: finalRow?.row_count ?? null,
        error_message: finalRow?.error_message ?? null,
        reason: isExpired ? "expired_regenerate" : "failed_retry",
      },
    });

    return { jobId: job.id };
  });

/** Retry-history details for a job (used by the admin detail dialog). */
export const getExportJobHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    // Find the root (original) job, then all jobs that share that root via parent_job_id.
    const { data: self } = await supabase.from("csv_export_jobs")
      .select("id, parent_job_id, tenant_id").eq("id", data.jobId).maybeSingle();
    if (!self) throw new Error("Job not found.");
    const rootId = self.parent_job_id ?? self.id;

    const { data: chain, error: e2 } = await supabase.from("csv_export_jobs")
      .select("id, attempt, status, progress, row_count, error_message, created_at, completed_at, requested_by, parent_job_id, expires_at")
      .or(`id.eq.${rootId},parent_job_id.eq.${rootId}`)
      .order("attempt", { ascending: true });
    if (e2) throw new Error(e2.message);

    const ids = (chain ?? []).map((r: any) => r.id);
    let audits: any[] = [];
    if (ids.length > 0) {
      const { data: a } = await supabase.from("admin_audit_log")
        .select("id, action, actor_id, entity_id, details, created_at")
        .eq("category", "csv_export")
        .in("entity_id", ids)
        .order("created_at", { ascending: true });
      audits = a ?? [];
    }
    return { rootId, chain: chain ?? [], audits };
  });

export const getExportJob = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row, error } = await supabase.from("csv_export_jobs")
      .select("id, job_type, status, progress, row_count, truncated, error_message, created_at, started_at, completed_at, attempt, parent_job_id, expires_at, requested_by")
      .eq("id", data.jobId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Job not found.");
    // result_csv column SELECT is revoked from authenticated roles to prevent
    // direct PostgREST/Realtime leaks; check presence via the admin client.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: probe } = await supabaseAdmin.from("csv_export_jobs")
      .select("result_csv").eq("id", data.jobId).eq("requested_by", userId).maybeSingle();
    const hasFile = !!probe?.result_csv;
    const isExpired = row.status === "succeeded" && row.expires_at && new Date(row.expires_at) < new Date() && !hasFile;
    const { requested_by, ...rest } = row as any;
    return { ...rest, expired: !!isExpired, fileAvailable: hasFile };
  });

export const downloadExportJob = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ jobId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    // result_csv column SELECT is revoked from authenticated; fetch via admin
    // client AFTER enforcing ownership so the CSV payload never travels through
    // PostgREST/Realtime to the client.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("csv_export_jobs")
      .select("status, result_csv, row_count, truncated, expires_at, requested_by")
      .eq("id", data.jobId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Job not found.");
    if (row.requested_by !== userId) throw new Error("Not authorized to download this export.");
    if (row.status !== "succeeded") throw new Error(`Job is ${row.status}, not ready to download.`);
    if (!row.result_csv) {
      const when = row.expires_at ? ` on ${new Date(row.expires_at).toLocaleString()}` : "";
      throw new Error(`This CSV export expired${when} and is no longer available. Re-run the export to generate a fresh file.`);
    }
    return { csv: row.result_csv, rowCount: row.row_count ?? 0, truncated: !!row.truncated };
  });

export const listMyRecentExportJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase.from("csv_export_jobs")
      .select("id, job_type, status, progress, row_count, truncated, error_message, created_at, completed_at, attempt, parent_job_id, expires_at")
      .order("created_at", { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    const now = Date.now();
    const rows = (data ?? []).map((r: any) => ({
      ...r,
      expired: r.status === "succeeded" && r.expires_at && new Date(r.expires_at).getTime() < now,
    }));
    return { rows };
  });

/** Per-tenant CSV export file retention (admin-only writes). */
export const getCsvExportRetention = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await requireTenantId(supabase, userId);
    const { data, error } = await supabase.from("tenants")
      .select("csv_export_retention_days").eq("id", tenantId).maybeSingle();
    if (error) throw new Error(error.message);
    return { retentionDays: Number((data as any)?.csv_export_retention_days ?? 7) };
  });

export const updateCsvExportRetention = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    retentionDays: z.number().int().min(1).max(365),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only admins can change the CSV export retention window.");
    const tenantId = await requireTenantId(supabase, userId);
    const { error } = await supabase.from("tenants")
      .update({ csv_export_retention_days: data.retentionDays })
      .eq("id", tenantId);
    if (error) throw new Error(error.message);
    return { ok: true, retentionDays: data.retentionDays };
  });
