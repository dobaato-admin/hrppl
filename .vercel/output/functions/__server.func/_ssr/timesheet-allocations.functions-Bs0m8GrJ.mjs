import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, D as arrayType, A as booleanType } from "../_libs/zod.mjs";
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
const allocationSchema = objectType({
  id: stringType().uuid().optional(),
  project_id: stringType().uuid().nullable().optional(),
  job_id: stringType().uuid().nullable().optional(),
  department_id: stringType().uuid().nullable().optional(),
  cost_centre_code: stringType().trim().max(40).nullable().optional(),
  percentage: numberType().min(1e-3).max(100),
  hours: numberType().min(0),
  notes: stringType().trim().max(500).nullable().optional()
});
const saveAllocationsInput = objectType({
  time_entry_id: stringType().uuid(),
  allocations: arrayType(allocationSchema).max(20)
});
const listAllocationsForEntry_createServerFn_handler = createServerRpc({
  id: "7f51a5219fc8951df81476267af25843fd475a7c1df5168a60c7e4fe6a240f94",
  name: "listAllocationsForEntry",
  filename: "src/lib/timesheet-allocations.functions.ts"
}, (opts) => listAllocationsForEntry.__executeServer(opts));
const listAllocationsForEntry = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  time_entry_id: stringType().uuid()
}).parse(d)).handler(listAllocationsForEntry_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("time_entry_allocations").select("*").eq("time_entry_id", data.time_entry_id).order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return {
    allocations: rows ?? []
  };
});
const saveAllocations_createServerFn_handler = createServerRpc({
  id: "757b057c01942415843dc531ebba6101972e3ffb8e632f65d2ad7e8de3d502a6",
  name: "saveAllocations",
  filename: "src/lib/timesheet-allocations.functions.ts"
}, (opts) => saveAllocations.__executeServer(opts));
const saveAllocations = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => saveAllocationsInput.parse(d)).handler(saveAllocations_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: te,
    error: teErr
  } = await supabase.from("time_entries").select("id, tenant_id, hours, employee_id").eq("id", data.time_entry_id).maybeSingle();
  if (teErr) throw new Error(teErr.message);
  if (!te) throw new Error("Time entry not found");
  const totalPct = data.allocations.reduce((s, a) => s + Number(a.percentage), 0);
  if (totalPct > 100.001) throw new Error(`Allocations exceed 100% (got ${totalPct.toFixed(2)}%)`);
  const sumHours = data.allocations.reduce((s, a) => s + Number(a.hours), 0);
  if (sumHours > Number(te.hours) + 0.01) {
    throw new Error(`Allocated hours (${sumHours}) exceed entry hours (${te.hours})`);
  }
  const {
    error: delErr
  } = await supabase.from("time_entry_allocations").delete().eq("time_entry_id", data.time_entry_id);
  if (delErr) throw new Error(delErr.message);
  if (data.allocations.length === 0) return {
    ok: true,
    allocations: []
  };
  const rows = data.allocations.map((a) => ({
    tenant_id: te.tenant_id,
    time_entry_id: data.time_entry_id,
    project_id: a.project_id || null,
    job_id: a.job_id || null,
    department_id: a.department_id || null,
    cost_centre_code: a.cost_centre_code || null,
    percentage: a.percentage,
    hours: a.hours,
    notes: a.notes || null
  }));
  const {
    data: inserted,
    error: insErr
  } = await supabase.from("time_entry_allocations").insert(rows).select("*");
  if (insErr) throw new Error(insErr.message);
  return {
    ok: true,
    allocations: inserted ?? []
  };
});
const listVarianceQueue_createServerFn_handler = createServerRpc({
  id: "486023faba105228bd375162a25cd818628e1d735a081b932251b1915b3f244f",
  name: "listVarianceQueue",
  filename: "src/lib/timesheet-allocations.functions.ts"
}, (opts) => listVarianceQueue.__executeServer(opts));
const listVarianceQueue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().optional(),
  to: stringType().optional(),
  only_flagged: booleanType().optional()
}).parse(d ?? {})).handler(listVarianceQueue_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = prof?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  let q = supabase.from("v_timesheet_variance").select("*").eq("tenant_id", tenantId).order("work_date", {
    ascending: false
  });
  if (data.from) q = q.gte("work_date", data.from);
  if (data.to) q = q.lte("work_date", data.to);
  if (data.only_flagged) q = q.eq("flag_suspicious", true);
  const {
    data: rows,
    error
  } = await q.limit(500);
  if (error) throw new Error(error.message);
  const empIds = Array.from(new Set((rows ?? []).map((r) => r.employee_id)));
  let empsById = {};
  if (empIds.length) {
    const {
      data: emps
    } = await supabase.from("employees").select("id, first_name, last_name, employee_number").in("id", empIds);
    empsById = Object.fromEntries((emps ?? []).map((e) => [e.id, e]));
  }
  return {
    rows: (rows ?? []).map((r) => ({
      ...r,
      employee: empsById[r.employee_id] ?? null
    }))
  };
});
const allocationRollup_createServerFn_handler = createServerRpc({
  id: "6b87c57029cc93f0a04881ab18c960ee70b6836ec0dd50248495fde164f3755b",
  name: "allocationRollup",
  filename: "src/lib/timesheet-allocations.functions.ts"
}, (opts) => allocationRollup.__executeServer(opts));
const allocationRollup = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().optional(),
  to: stringType().optional()
}).parse(d ?? {})).handler(allocationRollup_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = prof?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  let q = supabase.from("time_entry_allocations").select("hours, project_id, department_id, cost_centre_code, time_entries:time_entry_id(work_date, employee_id)").eq("tenant_id", tenantId);
  const {
    data: rows,
    error
  } = await q.limit(2e3);
  if (error) throw new Error(error.message);
  const byProject = {};
  const byDept = {};
  for (const r of rows ?? []) {
    const wd = r.time_entries?.work_date;
    if (data.from && wd && wd < data.from) continue;
    if (data.to && wd && wd > data.to) continue;
    const h = Number(r.hours || 0);
    if (r.project_id) byProject[r.project_id] = (byProject[r.project_id] || 0) + h;
    if (r.department_id) byDept[r.department_id] = (byDept[r.department_id] || 0) + h;
  }
  return {
    byProject,
    byDept
  };
});
export {
  allocationRollup_createServerFn_handler,
  listAllocationsForEntry_createServerFn_handler,
  listVarianceQueue_createServerFn_handler,
  saveAllocations_createServerFn_handler
};
