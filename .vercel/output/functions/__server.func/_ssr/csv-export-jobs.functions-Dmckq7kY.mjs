import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { e as enforceRateLimit, C as CSV_MAX_ROWS } from "./rate-limit.functions-CFVeXiWs.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, z as stringType, B as enumType, C as numberType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
const FilterSchema = objectType({
  source: enumType(["onboarding", "offboarding", "all"]).default("all"),
  employeeId: stringType().uuid().optional().nullable(),
  channel: stringType().trim().max(60).optional().nullable(),
  actorId: stringType().uuid().optional().nullable(),
  actorSearch: stringType().trim().max(200).optional().nullable(),
  action: stringType().trim().max(60).optional().nullable(),
  taskId: stringType().uuid().optional().nullable(),
  assignmentId: stringType().uuid().optional().nullable(),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  includeArchive: booleanType().default(false)
}).partial();
const JOB_TYPES = ["audit_unified", "audit_onboarding"];
function csvEscape(v) {
  if (v === null || v === void 0) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
async function getTenantId(supabase, userId) {
  const {
    data
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!data?.tenant_id) throw new Error("No tenant scope");
  return data.tenant_id;
}
async function getRetentionDays(supabase, tenantId) {
  const {
    data
  } = await supabase.from("tenants").select("csv_export_retention_days").eq("id", tenantId).maybeSingle();
  const n = Number(data?.csv_export_retention_days);
  return Number.isFinite(n) && n > 0 ? n : 7;
}
function expiryFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1e3).toISOString();
}
function dateRange(q, f) {
  if (f.startDate) q = q.gte("created_at", `${f.startDate}T00:00:00Z`);
  if (f.endDate) q = q.lte("created_at", `${f.endDate}T23:59:59Z`);
  return q;
}
async function fetchOnboarding(supabase, tenantId, f, table) {
  let q = supabase.from(table).select("id, created_at, action, details, actor_id, actor_email, actor_name, employee_id, assignment_id, task_id").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(CSV_MAX_ROWS);
  if (f.employeeId) q = q.eq("employee_id", f.employeeId);
  if (f.taskId) q = q.eq("task_id", f.taskId);
  if (f.assignmentId) q = q.eq("assignment_id", f.assignmentId);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch) q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = dateRange(q, f);
  const {
    data,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...r,
    source: "onboarding",
    channel: null
  }));
}
async function fetchOffboarding(supabase, tenantId, f, table) {
  let q = supabase.from(table).select("id, created_at, action, before, after, actor_id, actor_email, actor_name, case_id, comms_row_id, channel").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(CSV_MAX_ROWS);
  if (f.channel) q = q.eq("channel", f.channel);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch) q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = dateRange(q, f);
  const {
    data,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...r,
    source: "offboarding",
    employee_id: null,
    details: r.after
  }));
}
async function processJob(supabase, jobId, tenantId, jobType, filters) {
  await supabase.from("csv_export_jobs").update({
    status: "running",
    started_at: (/* @__PURE__ */ new Date()).toISOString(),
    progress: 5
  }).eq("id", jobId);
  try {
    const rows = [];
    const onbTable = filters.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
    const offTable = filters.includeArchive ? "offboarding_comms_removal_audit_archive" : "offboarding_comms_removal_audit";
    if (jobType === "audit_onboarding") {
      rows.push(...await fetchOnboarding(supabase, tenantId, filters, onbTable));
    } else {
      if (filters.source !== "offboarding") rows.push(...await fetchOnboarding(supabase, tenantId, filters, onbTable));
      await supabase.from("csv_export_jobs").update({
        progress: 45
      }).eq("id", jobId);
      if (filters.source !== "onboarding") rows.push(...await fetchOffboarding(supabase, tenantId, filters, offTable));
    }
    await supabase.from("csv_export_jobs").update({
      progress: 75
    }).eq("id", jobId);
    rows.sort((a, b) => a.created_at < b.created_at ? 1 : -1);
    const capped = rows.slice(0, CSV_MAX_ROWS);
    const header = ["timestamp_utc", "source", "action", "actor_name", "actor_email", "employee_id", "channel", "assignment_id", "task_id", "case_id", "details"];
    const body = capped.map((r) => [r.created_at, r.source, r.action, r.actor_name ?? "", r.actor_email ?? "", r.employee_id ?? "", r.channel ?? "", r.assignment_id ?? "", r.task_id ?? "", r.case_id ?? "", r.details ?? r.after ?? {}]);
    const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
    await supabase.from("csv_export_jobs").update({
      status: "succeeded",
      progress: 100,
      completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      row_count: capped.length,
      truncated: rows.length > CSV_MAX_ROWS,
      result_csv: csv
    }).eq("id", jobId);
    const {
      data: jobRow
    } = await supabase.from("csv_export_jobs").select("requested_by, tenant_id").eq("id", jobId).maybeSingle();
    if (jobRow?.requested_by) {
      await supabase.from("in_app_notifications").insert({
        user_id: jobRow.requested_by,
        tenant_id: jobRow.tenant_id,
        kind: "csv_export_ready",
        title: `CSV export ready (${capped.length} rows${rows.length > CSV_MAX_ROWS ? " — capped at 50k" : ""})`,
        body: "Your audit-history export finished. Open Recent jobs to download.",
        link: `/admin/audit-history?job=${jobId}`
      });
    }
  } catch (e) {
    await supabase.from("csv_export_jobs").update({
      status: "failed",
      completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      error_message: String(e?.message ?? e)
    }).eq("id", jobId);
    const {
      data: jobRow
    } = await supabase.from("csv_export_jobs").select("requested_by, tenant_id").eq("id", jobId).maybeSingle();
    if (jobRow?.requested_by) {
      await supabase.from("in_app_notifications").insert({
        user_id: jobRow.requested_by,
        tenant_id: jobRow.tenant_id,
        kind: "csv_export_failed",
        title: "CSV export failed",
        body: String(e?.message ?? e).slice(0, 280),
        link: `/admin/audit-history?job=${jobId}`
      });
    }
  }
}
const enqueueAuditExportJob_createServerFn_handler = createServerRpc({
  id: "653e717188d05af64cb1fd584e953d7220c3432cd506524e8ab90cbf8363dc81",
  name: "enqueueAuditExportJob",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => enqueueAuditExportJob.__executeServer(opts));
const enqueueAuditExportJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  jobType: enumType(JOB_TYPES).default("audit_unified"),
  filters: FilterSchema.default({})
}).parse(d ?? {})).handler(enqueueAuditExportJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "csv_export_job", 10, 60);
  const tenantId = await getTenantId(supabase, userId);
  const retentionDays = await getRetentionDays(supabase, tenantId);
  const {
    data: job,
    error
  } = await supabase.from("csv_export_jobs").insert({
    tenant_id: tenantId,
    requested_by: userId,
    job_type: data.jobType,
    filters: data.filters,
    status: "queued",
    progress: 0,
    attempt: 1,
    expires_at: expiryFromNow(retentionDays)
  }).select("id").single();
  if (error) throw new Error(error.message);
  await processJob(supabase, job.id, tenantId, data.jobType, data.filters);
  return {
    jobId: job.id
  };
});
const retryExportJob_createServerFn_handler = createServerRpc({
  id: "2db07948e34e2cae816a4c7775da3ec1b2e02923428acf8f5ff2b9dbd3e83fc5",
  name: "retryExportJob",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => retryExportJob.__executeServer(opts));
const retryExportJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  jobId: stringType().uuid()
}).parse(d)).handler(retryExportJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: orig,
    error: e1
  } = await supabase.from("csv_export_jobs").select("id, job_type, filters, status, requested_by, tenant_id, attempt, parent_job_id, expires_at").eq("id", data.jobId).maybeSingle();
  if (e1) throw new Error(e1.message);
  if (!orig) throw new Error("Original job not found.");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: csvProbe
  } = await supabaseAdmin.from("csv_export_jobs").select("result_csv").eq("id", data.jobId).maybeSingle();
  const hasCsv = !!csvProbe?.result_csv;
  const isExpired = orig.status === "succeeded" && !hasCsv && orig.expires_at && new Date(orig.expires_at) < /* @__PURE__ */ new Date();
  if (orig.status === "succeeded" && !isExpired) throw new Error("This job already succeeded — download it from Recent jobs instead of retrying.");
  if (orig.status === "queued" || orig.status === "running") throw new Error("Job is still in progress — wait for it to finish before retrying.");
  if (orig.requested_by !== userId) throw new Error("You can only retry your own export jobs.");
  await enforceRateLimit(supabase, "csv_export_job", 10, 60);
  const parsedFilters = FilterSchema.parse(orig.filters ?? {});
  const jobType = JOB_TYPES.includes(orig.job_type) ? orig.job_type : "audit_unified";
  const retentionDays = await getRetentionDays(supabase, orig.tenant_id);
  const {
    data: job,
    error
  } = await supabase.from("csv_export_jobs").insert({
    tenant_id: orig.tenant_id,
    requested_by: userId,
    job_type: jobType,
    filters: parsedFilters,
    status: "queued",
    progress: 0,
    attempt: (orig.attempt ?? 1) + 1,
    parent_job_id: orig.parent_job_id ?? orig.id,
    expires_at: expiryFromNow(retentionDays)
  }).select("id").single();
  if (error) throw new Error(error.message);
  await processJob(supabase, job.id, orig.tenant_id, jobType, parsedFilters);
  const {
    data: finalRow
  } = await supabase.from("csv_export_jobs").select("status, row_count, error_message").eq("id", job.id).maybeSingle();
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
      reason: isExpired ? "expired_regenerate" : "failed_retry"
    }
  });
  return {
    jobId: job.id
  };
});
const getExportJobHistory_createServerFn_handler = createServerRpc({
  id: "c3cc822a7c06cee70e315cf00b753bb9ebcabf6b9b72fbca4832aa9dd49708d8",
  name: "getExportJobHistory",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => getExportJobHistory.__executeServer(opts));
const getExportJobHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  jobId: stringType().uuid()
}).parse(d)).handler(getExportJobHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: self
  } = await supabase.from("csv_export_jobs").select("id, parent_job_id, tenant_id").eq("id", data.jobId).maybeSingle();
  if (!self) throw new Error("Job not found.");
  const rootId = self.parent_job_id ?? self.id;
  const {
    data: chain,
    error: e2
  } = await supabase.from("csv_export_jobs").select("id, attempt, status, progress, row_count, error_message, created_at, completed_at, requested_by, parent_job_id, expires_at").or(`id.eq.${rootId},parent_job_id.eq.${rootId}`).order("attempt", {
    ascending: true
  });
  if (e2) throw new Error(e2.message);
  const ids = (chain ?? []).map((r) => r.id);
  let audits = [];
  if (ids.length > 0) {
    const {
      data: a
    } = await supabase.from("admin_audit_log").select("id, action, actor_id, entity_id, details, created_at").eq("category", "csv_export").in("entity_id", ids).order("created_at", {
      ascending: true
    });
    audits = a ?? [];
  }
  return {
    rootId,
    chain: chain ?? [],
    audits
  };
});
const getExportJob_createServerFn_handler = createServerRpc({
  id: "ac544c2ecd68d6831263be40ecb5814457f94a8cb41e8ba03900f0b45acee3a0",
  name: "getExportJob",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => getExportJob.__executeServer(opts));
const getExportJob = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  jobId: stringType().uuid()
}).parse(d)).handler(getExportJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("csv_export_jobs").select("id, job_type, status, progress, row_count, truncated, error_message, created_at, started_at, completed_at, attempt, parent_job_id, expires_at, requested_by").eq("id", data.jobId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Job not found.");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: probe
  } = await supabaseAdmin.from("csv_export_jobs").select("result_csv").eq("id", data.jobId).eq("requested_by", userId).maybeSingle();
  const hasFile = !!probe?.result_csv;
  const isExpired = row.status === "succeeded" && row.expires_at && new Date(row.expires_at) < /* @__PURE__ */ new Date() && !hasFile;
  const {
    requested_by,
    ...rest
  } = row;
  return {
    ...rest,
    expired: !!isExpired,
    fileAvailable: hasFile
  };
});
const downloadExportJob_createServerFn_handler = createServerRpc({
  id: "8761b24ee7fcc37bac8dd99522755e36012b032ad134fab44201e008fc5885a9",
  name: "downloadExportJob",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => downloadExportJob.__executeServer(opts));
const downloadExportJob = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  jobId: stringType().uuid()
}).parse(d)).handler(downloadExportJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("csv_export_jobs").select("status, result_csv, row_count, truncated, expires_at, requested_by").eq("id", data.jobId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Job not found.");
  if (row.requested_by !== userId) throw new Error("Not authorized to download this export.");
  if (row.status !== "succeeded") throw new Error(`Job is ${row.status}, not ready to download.`);
  if (!row.result_csv) {
    const when = row.expires_at ? ` on ${new Date(row.expires_at).toLocaleString()}` : "";
    throw new Error(`This CSV export expired${when} and is no longer available. Re-run the export to generate a fresh file.`);
  }
  return {
    csv: row.result_csv,
    rowCount: row.row_count ?? 0,
    truncated: !!row.truncated
  };
});
const listMyRecentExportJobs_createServerFn_handler = createServerRpc({
  id: "bde92074fb4da91ccaf860955c4341387d806f297e9593794f6f969fce396c44",
  name: "listMyRecentExportJobs",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => listMyRecentExportJobs.__executeServer(opts));
const listMyRecentExportJobs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyRecentExportJobs_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("csv_export_jobs").select("id, job_type, status, progress, row_count, truncated, error_message, created_at, completed_at, attempt, parent_job_id, expires_at").order("created_at", {
    ascending: false
  }).limit(20);
  if (error) throw new Error(error.message);
  const now = Date.now();
  const rows = (data ?? []).map((r) => ({
    ...r,
    expired: r.status === "succeeded" && r.expires_at && new Date(r.expires_at).getTime() < now
  }));
  return {
    rows
  };
});
const getCsvExportRetention_createServerFn_handler = createServerRpc({
  id: "0a2f37f3f622d44a57726ae0c9c3c095b7dac27b65220c0b62799f00a0b65f27",
  name: "getCsvExportRetention",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => getCsvExportRetention.__executeServer(opts));
const getCsvExportRetention = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getCsvExportRetention_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const tenantId = await getTenantId(supabase, userId);
  const {
    data,
    error
  } = await supabase.from("tenants").select("csv_export_retention_days").eq("id", tenantId).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    retentionDays: Number(data?.csv_export_retention_days ?? 7)
  };
});
const updateCsvExportRetention_createServerFn_handler = createServerRpc({
  id: "9e2e79e4eba6f1dd8aff2464fe45d058bb9ebd1c2b03162cb5be75d6d8abe476",
  name: "updateCsvExportRetention",
  filename: "src/lib/csv-export-jobs.functions.ts"
}, (opts) => updateCsvExportRetention.__executeServer(opts));
const updateCsvExportRetention = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  retentionDays: numberType().int().min(1).max(365)
}).parse(d)).handler(updateCsvExportRetention_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: isAdmin
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });
  if (!isAdmin) throw new Error("Only admins can change the CSV export retention window.");
  const tenantId = await getTenantId(supabase, userId);
  const {
    error
  } = await supabase.from("tenants").update({
    csv_export_retention_days: data.retentionDays
  }).eq("id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    retentionDays: data.retentionDays
  };
});
export {
  downloadExportJob_createServerFn_handler,
  enqueueAuditExportJob_createServerFn_handler,
  getCsvExportRetention_createServerFn_handler,
  getExportJobHistory_createServerFn_handler,
  getExportJob_createServerFn_handler,
  listMyRecentExportJobs_createServerFn_handler,
  retryExportJob_createServerFn_handler,
  updateCsvExportRetention_createServerFn_handler
};
