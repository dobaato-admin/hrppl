import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { e as enforceRateLimit, C as CSV_MAX_ROWS } from "./rate-limit.functions-CFVeXiWs.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, B as enumType, C as numberType, A as booleanType, z as stringType } from "../_libs/zod.mjs";
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
  includeArchive: booleanType().default(false),
  limit: numberType().int().min(1).max(2e3).default(100),
  offset: numberType().int().min(0).max(1e5).default(0),
  sortBy: enumType(["created_at", "action", "source"]).default("created_at"),
  sortDir: enumType(["asc", "desc"]).default("desc")
}).partial();
async function fetchScopedTenant(supabase, userId) {
  const {
    data
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!data?.tenant_id) throw new Error("No tenant scope");
  return data.tenant_id;
}
function applyDateRange(q, f) {
  if (f.startDate) q = q.gte("created_at", `${f.startDate}T00:00:00Z`);
  if (f.endDate) q = q.lte("created_at", `${f.endDate}T23:59:59Z`);
  return q;
}
async function queryOnboarding(supabase, tenantId, f, table, fetchLimit) {
  let q = supabase.from(table).select("id, created_at, action, details, actor_id, actor_email, actor_name, tenant_id, employee_id, assignment_id, task_id").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(fetchLimit);
  if (f.employeeId) q = q.eq("employee_id", f.employeeId);
  if (f.taskId) q = q.eq("task_id", f.taskId);
  if (f.assignmentId) q = q.eq("assignment_id", f.assignmentId);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch) q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = applyDateRange(q, f);
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
async function queryOffboarding(supabase, tenantId, f, table, fetchLimit) {
  let q = supabase.from(table).select("id, created_at, action, before, after, actor_id, actor_email, actor_name, tenant_id, case_id, comms_row_id, channel").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(fetchLimit);
  if (f.channel) q = q.eq("channel", f.channel);
  if (f.actorId) q = q.eq("actor_id", f.actorId);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  if (f.actorSearch) q = q.or(`actor_email.ilike.%${f.actorSearch}%,actor_name.ilike.%${f.actorSearch}%`);
  q = applyDateRange(q, f);
  const {
    data,
    error
  } = await q;
  if (error) throw new Error(error.message);
  let rows = (data ?? []).map((r) => ({
    ...r,
    source: "offboarding",
    employee_id: null,
    details: r.after
  }));
  if (f.employeeId) {
    const caseIds = Array.from(new Set(rows.map((r) => r.case_id)));
    if (caseIds.length) {
      const {
        data: cases
      } = await supabase.from("offboarding_cases").select("id, employee_id").in("id", caseIds);
      const allowed = new Set((cases ?? []).filter((c) => c.employee_id === f.employeeId).map((c) => c.id));
      rows = rows.filter((r) => allowed.has(r.case_id));
    }
  }
  return rows;
}
const exploreAudit_createServerFn_handler = createServerRpc({
  id: "0f0776b6c6902e3e3f577fb0e065fa475664ae5b3f3f3544bff9ce44ee1a0eb4",
  name: "exploreAudit",
  filename: "src/lib/audit-explorer.functions.ts"
}, (opts) => exploreAudit.__executeServer(opts));
const exploreAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => FilterSchema.parse(d ?? {})).handler(exploreAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "audit_explorer", 60, 60);
  const tenantId = await fetchScopedTenant(supabase, userId);
  const f = data;
  const limit = f.limit ?? 100;
  const offset = f.offset ?? 0;
  const sortBy = f.sortBy ?? "created_at";
  const sortDir = f.sortDir ?? "desc";
  const fetchLimit = Math.min(2e3, offset + limit + 200);
  const onbTable = f.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
  const offTable = f.includeArchive ? "offboarding_comms_removal_audit_archive" : "offboarding_comms_removal_audit";
  const results = [];
  if (f.source !== "offboarding") results.push(...await queryOnboarding(supabase, tenantId, f, onbTable, fetchLimit));
  if (f.source !== "onboarding") results.push(...await queryOffboarding(supabase, tenantId, f, offTable, fetchLimit));
  const dir = sortDir === "asc" ? 1 : -1;
  results.sort((a, b) => {
    const av = a[sortBy] ?? "";
    const bv = b[sortBy] ?? "";
    return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
  });
  const total = results.length;
  const page = results.slice(offset, offset + limit);
  return {
    rows: page,
    total,
    limit,
    offset,
    hasMore: total > offset + limit
  };
});
function csvEscape(v) {
  if (v === null || v === void 0) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const exportAuditCsv_createServerFn_handler = createServerRpc({
  id: "97e2f5e2a53559a58d3a56c2b34751a44a0a35a82ccfda4534516299d3de984f",
  name: "exportAuditCsv",
  filename: "src/lib/audit-explorer.functions.ts"
}, (opts) => exportAuditCsv.__executeServer(opts));
const exportAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => FilterSchema.extend({
  limit: numberType().int().min(1).max(CSV_MAX_ROWS).default(CSV_MAX_ROWS)
}).parse(d ?? {})).handler(exportAuditCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "audit_export", 5, 60);
  const tenantId = await fetchScopedTenant(supabase, userId);
  const f = data;
  const onbTable = f.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
  const offTable = f.includeArchive ? "offboarding_comms_removal_audit_archive" : "offboarding_comms_removal_audit";
  const rows = [];
  if (f.source !== "offboarding") rows.push(...await queryOnboarding(supabase, tenantId, f, onbTable, CSV_MAX_ROWS));
  if (f.source !== "onboarding") rows.push(...await queryOffboarding(supabase, tenantId, f, offTable, CSV_MAX_ROWS));
  rows.sort((a, b) => a.created_at < b.created_at ? 1 : -1);
  const capped = rows.slice(0, CSV_MAX_ROWS);
  const header = ["timestamp_utc", "source", "action", "actor_name", "actor_email", "employee_id", "channel", "assignment_id", "task_id", "case_id", "details"];
  const body = capped.map((r) => [r.created_at, r.source, r.action, r.actor_name ?? "", r.actor_email ?? "", r.employee_id ?? "", r.channel ?? "", r.assignment_id ?? "", r.task_id ?? "", r.case_id ?? "", r.details ?? r.after ?? {}]);
  const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
  return {
    csv,
    rowCount: capped.length,
    truncated: rows.length > CSV_MAX_ROWS
  };
});
const exportOnboardingTrackerAuditCsv_createServerFn_handler = createServerRpc({
  id: "760d30b15466142371eb617a0a3e9308ce3f0e9f4dcafeeec112ee9da368b34c",
  name: "exportOnboardingTrackerAuditCsv",
  filename: "src/lib/audit-explorer.functions.ts"
}, (opts) => exportOnboardingTrackerAuditCsv.__executeServer(opts));
const exportOnboardingTrackerAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional().nullable(),
  assignmentId: stringType().uuid().optional().nullable(),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  includeArchive: booleanType().default(false)
}).partial().parse(d ?? {})).handler(exportOnboardingTrackerAuditCsv_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await enforceRateLimit(supabase, "audit_export", 5, 60);
  const tenantId = await fetchScopedTenant(supabase, userId);
  const table = data.includeArchive ? "onboarding_control_room_audit_archive" : "onboarding_control_room_audit";
  let q = supabase.from(table).select("created_at, action, actor_name, actor_email, employee_id, assignment_id, task_id, details").eq("tenant_id", tenantId).order("created_at", {
    ascending: false
  }).limit(CSV_MAX_ROWS);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  if (data.assignmentId) q = q.eq("assignment_id", data.assignmentId);
  if (data.startDate) q = q.gte("created_at", `${data.startDate}T00:00:00Z`);
  if (data.endDate) q = q.lte("created_at", `${data.endDate}T23:59:59Z`);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const header = ["timestamp_utc", "action", "actor_name", "actor_email", "employee_id", "assignment_id", "task_id", "details"];
  const body = (rows ?? []).map((r) => [r.created_at, r.action, r.actor_name ?? "", r.actor_email ?? "", r.employee_id ?? "", r.assignment_id, r.task_id ?? "", r.details ?? {}]);
  const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
  return {
    csv,
    rowCount: body.length
  };
});
export {
  exploreAudit_createServerFn_handler,
  exportAuditCsv_createServerFn_handler,
  exportOnboardingTrackerAuditCsv_createServerFn_handler
};
