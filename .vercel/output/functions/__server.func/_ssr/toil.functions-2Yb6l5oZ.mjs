import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, C as numberType, z as stringType, B as enumType } from "../_libs/zod.mjs";
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
async function getEmployee(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data;
}
async function isAdmin(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["org_admin", "super_admin", "hr"]);
  return (data ?? []).length > 0;
}
const getToilSettings_createServerFn_handler = createServerRpc({
  id: "efb0cd057ad4bb9847b226e4a310e6193b6bc58eacbe542794b93e785df79cdf",
  name: "getToilSettings",
  filename: "src/lib/toil.functions.ts"
}, (opts) => getToilSettings.__executeServer(opts));
const getToilSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getToilSettings_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const tenantId = emp?.tenant_id ?? profile?.tenant_id;
  if (!tenantId) return {
    settings: null
  };
  const {
    data
  } = await supabase.from("toil_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
  return {
    settings: data ?? {
      tenant_id: tenantId
    }
  };
});
const SettingsSchema = objectType({
  enabled: booleanType().default(true),
  overtime_multiplier: numberType().min(0).default(1),
  shift_swap_multiplier: numberType().min(0).default(1),
  penalty_multiplier: numberType().min(0).default(1.5),
  max_balance_hours: numberType().min(0).nullable().optional(),
  expiry_months: numberType().int().min(0).default(12),
  allow_overtime_to_toil: booleanType().default(true),
  allow_toil_to_overtime: booleanType().default(false),
  min_request_hours: numberType().min(0).default(1),
  require_approval: booleanType().default(true)
});
const updateToilSettings_createServerFn_handler = createServerRpc({
  id: "9778b76ca2160bcf041d0b6a1c661dfe0b791f335171ee829534d0d539e7dd90",
  name: "updateToilSettings",
  filename: "src/lib/toil.functions.ts"
}, (opts) => updateToilSettings.__executeServer(opts));
const updateToilSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SettingsSchema.parse(d)).handler(updateToilSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (!await isAdmin(supabase, userId)) throw new Error("Forbidden");
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).single();
  const payload = {
    ...data,
    tenant_id: profile.tenant_id
  };
  const {
    data: row,
    error
  } = await supabase.from("toil_settings").upsert(payload, {
    onConflict: "tenant_id"
  }).select().single();
  if (error) throw error;
  return {
    settings: row
  };
});
const getMyToilBalance_createServerFn_handler = createServerRpc({
  id: "93e4f54591ff5c472854f827e078523f1b496f638a6b68c6cfd802e0a70daa4f",
  name: "getMyToilBalance",
  filename: "src/lib/toil.functions.ts"
}, (opts) => getMyToilBalance.__executeServer(opts));
const getMyToilBalance = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyToilBalance_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) return {
    balance: null,
    accruals: [],
    requests: []
  };
  const [bal, acc, req] = await Promise.all([supabase.from("toil_balances").select("*").eq("employee_id", emp.id).maybeSingle(), supabase.from("toil_accruals").select("*").eq("employee_id", emp.id).order("accrued_on", {
    ascending: false
  }).limit(100), supabase.from("toil_requests").select("*").eq("employee_id", emp.id).order("created_at", {
    ascending: false
  }).limit(100)]);
  return {
    balance: bal.data,
    accruals: acc.data ?? [],
    requests: req.data ?? []
  };
});
const RequestSchema = objectType({
  start_date: stringType(),
  end_date: stringType(),
  hours: numberType().positive(),
  reason: stringType().max(500).optional().nullable()
});
const submitToilRequest_createServerFn_handler = createServerRpc({
  id: "5cf00bd0a0060e5a88be9d1768e50e136c7d013aa0406d52caa3207497669fbc",
  name: "submitToilRequest",
  filename: "src/lib/toil.functions.ts"
}, (opts) => submitToilRequest.__executeServer(opts));
const submitToilRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RequestSchema.parse(d)).handler(submitToilRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployee(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const {
    data: row,
    error
  } = await supabase.from("toil_requests").insert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    start_date: data.start_date,
    end_date: data.end_date,
    hours: data.hours,
    reason: data.reason ?? null,
    status: "pending"
  }).select().single();
  if (error) throw error;
  return {
    request: row
  };
});
const cancelToilRequest_createServerFn_handler = createServerRpc({
  id: "eaaef50a43920100fbc59206c5651924cb9724abecb07098fee6ca23cc8ce687",
  name: "cancelToilRequest",
  filename: "src/lib/toil.functions.ts"
}, (opts) => cancelToilRequest.__executeServer(opts));
const cancelToilRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(cancelToilRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("toil_requests").update({
    status: "cancelled"
  }).eq("id", data.id).eq("status", "pending");
  if (error) throw error;
  return {
    ok: true
  };
});
const listPendingToilApprovals_createServerFn_handler = createServerRpc({
  id: "d288e3fc866f1811066947ba7cd44902b75d47d8eba535b948ff6a4d6a762d62",
  name: "listPendingToilApprovals",
  filename: "src/lib/toil.functions.ts"
}, (opts) => listPendingToilApprovals.__executeServer(opts));
const listPendingToilApprovals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPendingToilApprovals_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data
  } = await supabase.from("toil_requests").select("*, employees(id, first_name, last_name, employee_code)").eq("status", "pending").order("created_at", {
    ascending: true
  });
  return {
    requests: data ?? []
  };
});
const DecisionSchema = objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(500).optional().nullable()
});
const decideToilRequest_createServerFn_handler = createServerRpc({
  id: "b7543b5778c4ebd6516882bb98777a9729d3b755df6e4eed4c5ebfbe9a6767f5",
  name: "decideToilRequest",
  filename: "src/lib/toil.functions.ts"
}, (opts) => decideToilRequest.__executeServer(opts));
const decideToilRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DecisionSchema.parse(d)).handler(decideToilRequest_createServerFn_handler, async ({
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
  } = await supabase.from("toil_requests").update({
    status: data.decision,
    decision_notes: data.notes ?? null,
    approver_id: userId,
    decided_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id).select().single();
  if (error) throw error;
  return {
    request: row
  };
});
const AccrualSchema = objectType({
  employee_id: stringType().uuid(),
  source: enumType(["overtime", "shift_swap", "penalty", "manual", "adjustment"]),
  hours: numberType(),
  accrued_on: stringType().optional(),
  expires_on: stringType().nullable().optional(),
  notes: stringType().max(500).optional().nullable()
});
const addToilAccrual_createServerFn_handler = createServerRpc({
  id: "bdb7bf50713b3cfbda9eb659028788a7926bd6d30934fc65b494f33400697517",
  name: "addToilAccrual",
  filename: "src/lib/toil.functions.ts"
}, (opts) => addToilAccrual.__executeServer(opts));
const addToilAccrual = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AccrualSchema.parse(d)).handler(addToilAccrual_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (!await isAdmin(supabase, userId)) throw new Error("Forbidden");
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id").eq("id", data.employee_id).single();
  const {
    data: settings
  } = await supabase.from("toil_settings").select("expiry_months").eq("tenant_id", emp.tenant_id).maybeSingle();
  let expires = data.expires_on ?? null;
  if (!expires && settings?.expiry_months) {
    const d = new Date(data.accrued_on ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    d.setMonth(d.getMonth() + settings.expiry_months);
    expires = d.toISOString().slice(0, 10);
  }
  const {
    data: row,
    error
  } = await supabase.from("toil_accruals").insert({
    tenant_id: emp.tenant_id,
    employee_id: data.employee_id,
    source: data.source,
    hours: data.hours,
    accrued_on: data.accrued_on ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    expires_on: expires,
    notes: data.notes ?? null,
    created_by: userId
  }).select().single();
  if (error) throw error;
  return {
    accrual: row
  };
});
const getToilReport_createServerFn_handler = createServerRpc({
  id: "4cb97f9251606316942a48a418cae55d6972633e8458d8eaf5bebb76b30a61e6",
  name: "getToilReport",
  filename: "src/lib/toil.functions.ts"
}, (opts) => getToilReport.__executeServer(opts));
const getToilReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getToilReport_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const [balances, pending, recent] = await Promise.all([supabase.from("toil_balances").select("*, employees!inner(id, first_name, last_name, employee_code, tenant_id)").order("available_hours", {
    ascending: false
  }).limit(200), supabase.from("toil_requests").select("*, employees(first_name, last_name, employee_code)").eq("status", "pending"), supabase.from("toil_accruals").select("*, employees(first_name, last_name, employee_code)").order("created_at", {
    ascending: false
  }).limit(100)]);
  return {
    balances: balances.data ?? [],
    pending: pending.data ?? [],
    recent: recent.data ?? []
  };
});
export {
  addToilAccrual_createServerFn_handler,
  cancelToilRequest_createServerFn_handler,
  decideToilRequest_createServerFn_handler,
  getMyToilBalance_createServerFn_handler,
  getToilReport_createServerFn_handler,
  getToilSettings_createServerFn_handler,
  listPendingToilApprovals_createServerFn_handler,
  submitToilRequest_createServerFn_handler,
  updateToilSettings_createServerFn_handler
};
