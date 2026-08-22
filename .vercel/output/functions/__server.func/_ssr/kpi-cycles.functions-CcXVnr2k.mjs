import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, z as stringType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
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
async function getCtx(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  const isAdmin = r.some((x) => ["org_admin", "super_admin", "manager"].includes(x));
  return {
    tenantId: prof.tenant_id,
    isAdmin,
    userId,
    supabase
  };
}
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const listCycles_createServerFn_handler = createServerRpc({
  id: "361b18249109298692958d5705e73c32f7c0000e1cbcf949f43a7fdd14a482a4",
  name: "listCycles",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => listCycles.__executeServer(opts));
const listCycles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listCycles_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId,
    supabase
  } = await getCtx(context);
  const {
    data,
    error
  } = await supabase.from("kpi_review_cycles").select("id, label, starts_on, ends_on, status, opened_at, closed_at, last_reminder_sent_at, reminder_days_before, open_notified_at, closed_notified_at").eq("tenant_id", tenantId).order("starts_on", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    cycles: data ?? []
  };
});
const listOpenCyclesForMe_createServerFn_handler = createServerRpc({
  id: "4e5b4c57436dc33cd06914494e442cbddab33d398e915acc1aaea5b79b4990be",
  name: "listOpenCyclesForMe",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => listOpenCyclesForMe.__executeServer(opts));
const listOpenCyclesForMe = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listOpenCyclesForMe_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) return {
    cycles: []
  };
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data,
    error
  } = await supabase.from("kpi_review_cycles").select("id, label, starts_on, ends_on, status").eq("tenant_id", prof.tenant_id).eq("status", "open").lte("starts_on", today).gte("ends_on", today).order("ends_on");
  if (error) throw new Error(error.message);
  return {
    cycles: data ?? []
  };
});
const UpsertCycle = objectType({
  id: stringType().uuid().optional(),
  label: stringType().trim().min(1).max(60),
  starts_on: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_on: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminder_days_before: numberType().int().min(0).max(60).optional()
});
const upsertCycle_createServerFn_handler = createServerRpc({
  id: "ee9e994f44ae3fcd2eea64a5b5209808bbbd804e6adf90e2401c50636da507ef",
  name: "upsertCycle",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => upsertCycle.__executeServer(opts));
const upsertCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertCycle.parse(d)).handler(upsertCycle_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    userId,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  if (data.ends_on < data.starts_on) throw new Error("End date must be after start date");
  const payload = {
    tenant_id: tenantId,
    label: data.label,
    starts_on: data.starts_on,
    ends_on: data.ends_on,
    created_by: userId
  };
  if (data.reminder_days_before != null) payload.reminder_days_before = data.reminder_days_before;
  const {
    data: row,
    error
  } = data.id ? await supabase.from("kpi_review_cycles").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single() : await supabase.from("kpi_review_cycles").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return {
    cycle: row
  };
});
async function notifyCycleParticipants(tenantId, cycle, kind) {
  const admin = await loadAdmin();
  const {
    data: rows
  } = await admin.from("employee_duties").select("employee_id, employees!inner(id, tenant_id, user_id, email, first_name)").eq("tenant_id", tenantId).eq("is_active", true);
  if (!rows || rows.length === 0) return {
    notified: 0
  };
  const seen = /* @__PURE__ */ new Set();
  const recipients = [];
  for (const r of rows) {
    const e = r.employees;
    if (!e || seen.has(e.id)) continue;
    seen.add(e.id);
    recipients.push({
      user_id: e.user_id,
      email: e.email,
      first_name: e.first_name
    });
  }
  const today = /* @__PURE__ */ new Date();
  const ends = new Date(cycle.ends_on);
  const daysRemaining = Math.max(0, Math.ceil((ends.getTime() - today.getTime()) / 864e5));
  const appUrl = (process.env.PUBLIC_APP_URL || "https://hrppl.io") + (kind === "closed" ? "/me/duties" : "/me/duty-self-review");
  const inAppRows = recipients.filter((r) => !!r.user_id).map((r) => ({
    tenant_id: tenantId,
    user_id: r.user_id,
    kind: `kpi_cycle_${kind}`,
    title: kind === "opened" ? `KPI review cycle ${cycle.label} is open` : kind === "closed" ? `KPI review cycle ${cycle.label} closed` : `Reminder: KPI self-review for ${cycle.label} (${daysRemaining}d left)`,
    body: kind === "closed" ? `Submissions are no longer accepted for ${cycle.label}.` : `Submit your duty self-scores before ${cycle.ends_on}.`,
    link: kind === "closed" ? "/me/duties" : "/me/duty-self-review",
    metadata: {
      cycle_id: cycle.id,
      cycle_label: cycle.label,
      kind
    }
  }));
  if (inAppRows.length) {
    await admin.from("in_app_notifications").insert(inAppRows);
  }
  try {
    const {
      sendInternalEmail
    } = await import("./send-internal.server-9cG3k97B.mjs");
    for (const r of recipients) {
      if (!r.email) continue;
      await sendInternalEmail({
        templateName: "kpi-cycle-status",
        recipientEmail: r.email,
        idempotencyKey: `kpi-${cycle.id}-${kind}-${r.email}`,
        templateData: {
          kind,
          recipientName: r.first_name || void 0,
          cycleName: cycle.label,
          startsOn: cycle.starts_on,
          endsOn: cycle.ends_on,
          daysRemaining: kind === "reminder" ? daysRemaining : void 0,
          appUrl
        }
      });
    }
  } catch (e) {
    console.error("[kpi-cycle] email send failed", e);
  }
  return {
    notified: recipients.length
  };
}
const setCycleStatus_createServerFn_handler = createServerRpc({
  id: "972bc4ca31856bab91740ca5ece74800427f7a6f00697fac06a1f28ad53463fa",
  name: "setCycleStatus",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => setCycleStatus.__executeServer(opts));
const setCycleStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["draft", "open", "closed"])
}).parse(d)).handler(setCycleStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    userId,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const patch = {
    status: data.status
  };
  if (data.status === "open") {
    patch.opened_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.opened_by = userId;
  }
  if (data.status === "closed") {
    patch.closed_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.closed_by = userId;
  }
  const {
    data: cycle,
    error
  } = await supabase.from("kpi_review_cycles").update(patch).eq("id", data.id).eq("tenant_id", tenantId).select("id, label, starts_on, ends_on, status, open_notified_at, closed_notified_at").single();
  if (error) throw new Error(error.message);
  let notified = 0;
  if (data.status === "open" && !cycle.open_notified_at) {
    const res = await notifyCycleParticipants(tenantId, cycle, "opened");
    notified = res.notified;
    await supabase.from("kpi_review_cycles").update({
      open_notified_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", cycle.id);
  } else if (data.status === "closed" && !cycle.closed_notified_at) {
    const res = await notifyCycleParticipants(tenantId, cycle, "closed");
    notified = res.notified;
    await supabase.from("kpi_review_cycles").update({
      closed_notified_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", cycle.id);
  }
  return {
    ok: true,
    notified
  };
});
const deleteCycle_createServerFn_handler = createServerRpc({
  id: "9e8b7f78a3747aa36dc86125d673c90f069c99cedc54e0b641818bb209e9da1c",
  name: "deleteCycle",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => deleteCycle.__executeServer(opts));
const deleteCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCycle_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    error
  } = await supabase.from("kpi_review_cycles").delete().eq("id", data.id).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getCycleSubmissionStatus_createServerFn_handler = createServerRpc({
  id: "34f508a4852fc8ebb38c6537eba77f6092b1bc1a01d549cf5b9b66d40cd70b95",
  name: "getCycleSubmissionStatus",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => getCycleSubmissionStatus.__executeServer(opts));
const getCycleSubmissionStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(getCycleSubmissionStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    data: duties
  } = await supabase.from("employee_duties").select("employee_id, employees!inner(id, first_name, last_name, email)").eq("tenant_id", tenantId).eq("is_active", true);
  const empMap = /* @__PURE__ */ new Map();
  for (const d of duties ?? []) {
    const e = d.employees;
    if (!e) continue;
    const cur = empMap.get(e.id) ?? {
      employee: e,
      total: 0,
      self: 0,
      reviewer: 0
    };
    cur.total += 1;
    empMap.set(e.id, cur);
  }
  const employeeIds = Array.from(empMap.keys());
  if (employeeIds.length === 0) return {
    rows: []
  };
  const {
    data: scores
  } = await supabase.from("duty_review_scores").select("employee_id, submitter_kind").eq("tenant_id", tenantId).eq("cycle_label", data.cycleLabel).in("employee_id", employeeIds);
  for (const s of scores ?? []) {
    const cur = empMap.get(s.employee_id);
    if (!cur) continue;
    if (s.submitter_kind === "self") cur.self += 1;
    else cur.reviewer += 1;
  }
  const rows = Array.from(empMap.values()).map((r) => {
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
      reviewer_status: reviewerStatus
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return {
    rows
  };
});
const getKpiWeightSettings_createServerFn_handler = createServerRpc({
  id: "5bf2fff50878a89e2f005c6950c9c43845d6f2aa79f137d97c2de9737cdcd144",
  name: "getKpiWeightSettings",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => getKpiWeightSettings.__executeServer(opts));
const getKpiWeightSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getKpiWeightSettings_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId,
    supabase
  } = await getCtx(context);
  const {
    data
  } = await supabase.from("tenants").select("kpi_weight_tolerance, kpi_strict_weights").eq("id", tenantId).maybeSingle();
  return {
    tolerance: Number(data?.kpi_weight_tolerance ?? 0),
    strict: Boolean(data?.kpi_strict_weights ?? true)
  };
});
const updateKpiWeightSettings_createServerFn_handler = createServerRpc({
  id: "2731f50b96dae24899bc75c832271f5ce776768d06dd35c873a5c585bb2824de",
  name: "updateKpiWeightSettings",
  filename: "src/lib/kpi-cycles.functions.ts"
}, (opts) => updateKpiWeightSettings.__executeServer(opts));
const updateKpiWeightSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tolerance: numberType().min(0).max(25),
  strict: booleanType()
}).parse(d)).handler(updateKpiWeightSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId,
    isAdmin,
    supabase
  } = await getCtx(context);
  if (!isAdmin) throw new Error("Admin / manager only");
  const {
    error
  } = await supabase.from("tenants").update({
    kpi_weight_tolerance: data.tolerance,
    kpi_strict_weights: data.strict
  }).eq("id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteCycle_createServerFn_handler,
  getCycleSubmissionStatus_createServerFn_handler,
  getKpiWeightSettings_createServerFn_handler,
  listCycles_createServerFn_handler,
  listOpenCyclesForMe_createServerFn_handler,
  setCycleStatus_createServerFn_handler,
  updateKpiWeightSettings_createServerFn_handler,
  upsertCycle_createServerFn_handler
};
