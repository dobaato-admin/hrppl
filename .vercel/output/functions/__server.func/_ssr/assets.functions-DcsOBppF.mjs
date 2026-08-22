import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
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
async function tenantId(ctx) {
  const {
    data
  } = await ctx.supabase.from("profiles").select("tenant_id").eq("id", ctx.userId).maybeSingle();
  if (!data?.tenant_id) throw new Error("No tenant");
  return data.tenant_id;
}
const listAssets_createServerFn_handler = createServerRpc({
  id: "fefed6b92333be889e22e8b290fa9f8136a4be4fbe87b46ba1f00c3f352c0f5d",
  name: "listAssets",
  filename: "src/lib/assets.functions.ts"
}, (opts) => listAssets.__executeServer(opts));
const listAssets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAssets_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("assets").select("*").order("created_at", {
    ascending: false
  }).limit(500);
  if (error) throw new Error(error.message);
  return {
    assets: data ?? []
  };
});
const createAsset_createServerFn_handler = createServerRpc({
  id: "c83c0a7349ea0eec53b2b2c3bc3ea7508eec1fbef34d916fded49a5d2cfbea2d",
  name: "createAsset",
  filename: "src/lib/assets.functions.ts"
}, (opts) => createAsset.__executeServer(opts));
const createAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assetTag: stringType().min(1).max(80),
  name: stringType().min(1).max(255),
  category: enumType(["laptop", "phone", "tablet", "monitor", "peripheral", "vehicle", "access_card", "sim", "uniform", "tool", "other"]).default("other"),
  brand: stringType().max(120).optional(),
  model: stringType().max(120).optional(),
  serialNumber: stringType().max(160).optional(),
  description: stringType().max(2e3).optional(),
  purchaseDate: stringType().optional(),
  purchaseCost: numberType().nonnegative().optional(),
  currencyCode: stringType().max(8).optional(),
  warrantyExpiresOn: stringType().optional()
}).parse(d)).handler(createAsset_createServerFn_handler, async ({
  data,
  context
}) => {
  const t = await tenantId(context);
  const {
    data: row,
    error
  } = await context.supabase.from("assets").insert({
    tenant_id: t,
    asset_tag: data.assetTag,
    name: data.name,
    category: data.category,
    brand: data.brand,
    model: data.model,
    serial_number: data.serialNumber,
    description: data.description,
    purchase_date: data.purchaseDate || null,
    purchase_cost: data.purchaseCost ?? null,
    currency_code: data.currencyCode || null,
    warranty_expires_on: data.warrantyExpiresOn || null,
    created_by: context.userId
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    asset: row
  };
});
async function userIsAdmin(ctx) {
  const {
    data
  } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  const roles = (data ?? []).map((r) => r.role);
  return roles.includes("org_admin") || roles.includes("super_admin");
}
const assignAsset_createServerFn_handler = createServerRpc({
  id: "604481d33c6821c5b7ed44bda1d8a6f8c485ac6b05707be0bdfb55db30115601",
  name: "assignAsset",
  filename: "src/lib/assets.functions.ts"
}, (opts) => assignAsset.__executeServer(opts));
const assignAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assetId: stringType().uuid(),
  employeeId: stringType().uuid(),
  expectedReturnOn: stringType().optional(),
  conditionOnIssue: stringType().max(500).optional(),
  conditionNotes: stringType().max(1e3).optional(),
  quantityIssued: numberType().int().min(1).max(999).default(1),
  notes: stringType().max(1e3).optional(),
  context: enumType(["onboarding", "employment", "offboarding"]).default("employment")
}).parse(d)).handler(assignAsset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: emp
  } = await context.supabase.from("employees").select("tenant_id").eq("id", data.employeeId).single();
  if (!emp) throw new Error("Employee not found");
  const admin = await userIsAdmin(context);
  const approvalStatus = admin ? "approved" : "pending";
  const {
    data: row,
    error
  } = await context.supabase.from("asset_assignments").insert({
    tenant_id: emp.tenant_id,
    asset_id: data.assetId,
    employee_id: data.employeeId,
    expected_return_on: data.expectedReturnOn || null,
    condition_on_issue: data.conditionOnIssue,
    condition_notes: data.conditionNotes,
    quantity_issued: data.quantityIssued,
    notes: data.notes,
    context: data.context,
    assigned_by: context.userId,
    approval_status: approvalStatus,
    approved_by: admin ? context.userId : null,
    approved_at: admin ? (/* @__PURE__ */ new Date()).toISOString() : null
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    assignment: row,
    requiresApproval: !admin
  };
});
const approveAssignment_createServerFn_handler = createServerRpc({
  id: "deb372557a58ed4278941e570e5f4d2ef8181005f099f897f6519788ab47b865",
  name: "approveAssignment",
  filename: "src/lib/assets.functions.ts"
}, (opts) => approveAssignment.__executeServer(opts));
const approveAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(approveAssignment_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await userIsAdmin(context)) throw new Error("Not authorized to approve assignments");
  const {
    error
  } = await context.supabase.from("asset_assignments").update({
    approval_status: data.decision,
    approved_by: context.userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    approval_notes: data.notes ?? null
  }).eq("id", data.assignmentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const reportReturn_createServerFn_handler = createServerRpc({
  id: "79cca338ffd2d45722244ffac637b587a786752886be265170492fc6b72c478c",
  name: "reportReturn",
  filename: "src/lib/assets.functions.ts"
}, (opts) => reportReturn.__executeServer(opts));
const reportReturn = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  quantityReturned: numberType().int().min(0).max(999),
  conditionNotes: stringType().max(2e3).optional(),
  returnNotes: stringType().max(2e3).optional(),
  returnCondition: enumType(["good", "damaged", "lost"]).default("good")
}).parse(d)).handler(reportReturn_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: emp
  } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
  if (!emp) throw new Error("Forbidden");
  const {
    data: a,
    error: e1
  } = await context.supabase.from("asset_assignments").select("quantity_issued, employee_id").eq("id", data.assignmentId).eq("employee_id", emp.id).single();
  if (e1 || !a) throw new Error("Assignment not found");
  const issued = a.quantity_issued ?? 1;
  if (data.quantityReturned > issued) throw new Error("Returned quantity exceeds issued");
  const status = data.quantityReturned >= issued ? "reported_full" : "reported_partial";
  const {
    error
  } = await context.supabase.from("asset_assignments").update({
    quantity_returned: data.quantityReturned,
    employee_return_reported_at: (/* @__PURE__ */ new Date()).toISOString(),
    employee_return_notes: data.returnNotes ?? null,
    condition_notes: data.conditionNotes ?? null,
    return_condition: data.returnCondition,
    return_status: status
  }).eq("id", data.assignmentId).eq("employee_id", emp.id);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    status
  };
});
const confirmReturn_createServerFn_handler = createServerRpc({
  id: "ba7170bf365ec02491b8248f9edc17b4608295a7498e12944aa8080ad6ae1121",
  name: "confirmReturn",
  filename: "src/lib/assets.functions.ts"
}, (opts) => confirmReturn.__executeServer(opts));
const confirmReturn = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  returnCondition: enumType(["good", "damaged", "lost"]).optional(),
  confirmationNotes: stringType().max(2e3).optional(),
  disputed: booleanType().default(false)
}).parse(d)).handler(confirmReturn_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await userIsAdmin(context)) throw new Error("Only HR can confirm returns");
  const patch = {
    return_confirmation_notes: data.confirmationNotes ?? null
  };
  if (data.disputed) {
    patch.return_status = "disputed";
  } else {
    patch.return_status = "confirmed";
    patch.return_confirmed_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.return_confirmed_by = context.userId;
    patch.returned_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.returned_to = context.userId;
    if (data.returnCondition) patch.return_condition = data.returnCondition;
  }
  const {
    error
  } = await context.supabase.from("asset_assignments").update(patch).eq("id", data.assignmentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const returnAsset_createServerFn_handler = createServerRpc({
  id: "b62569105d13ede8e99895342a9a309996693f0f91cd6a8b3d1758875132cfc4",
  name: "returnAsset",
  filename: "src/lib/assets.functions.ts"
}, (opts) => returnAsset.__executeServer(opts));
const returnAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  returnCondition: enumType(["good", "damaged", "lost"]).default("good"),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(returnAsset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: emp
  } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
  const {
    data: roles
  } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).in("role", ["org_admin", "super_admin"]);
  const isAdmin = (roles ?? []).length > 0;
  const {
    data: assignment
  } = await context.supabase.from("asset_assignments").select("id, employee_id").eq("id", data.assignmentId).maybeSingle();
  if (!assignment) throw new Error("Assignment not found");
  const isOwner = !!emp && emp.id === assignment.employee_id;
  if (!isAdmin && !isOwner) throw new Error("Forbidden");
  const {
    error
  } = await context.supabase.from("asset_assignments").update({
    returned_at: (/* @__PURE__ */ new Date()).toISOString(),
    returned_to: context.userId,
    return_condition: data.returnCondition,
    return_confirmed_at: (/* @__PURE__ */ new Date()).toISOString(),
    return_confirmed_by: context.userId,
    return_status: "confirmed",
    return_confirmation_notes: data.notes
  }).eq("id", data.assignmentId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const acknowledgeAsset_createServerFn_handler = createServerRpc({
  id: "9921da9ec24ca1cf3d06b94af7110a1e3a39d802abde3aea0af0c84657f8d99c",
  name: "acknowledgeAsset",
  filename: "src/lib/assets.functions.ts"
}, (opts) => acknowledgeAsset.__executeServer(opts));
const acknowledgeAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  notes: stringType().max(500).optional()
}).parse(d)).handler(acknowledgeAsset_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: emp
  } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
  if (!emp) throw new Error("Forbidden");
  const {
    data: existing
  } = await context.supabase.from("asset_assignments").select("id").eq("id", data.assignmentId).eq("employee_id", emp.id).maybeSingle();
  if (!existing) throw new Error("Assignment not found");
  const {
    error
  } = await context.supabase.from("asset_assignments").update({
    acknowledged_at: (/* @__PURE__ */ new Date()).toISOString(),
    acknowledgement_notes: data.notes
  }).eq("id", data.assignmentId).eq("employee_id", emp.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listAssignments_createServerFn_handler = createServerRpc({
  id: "8ad03a6750f03a6ac8fe43417ab08cd47f4c36681a1fc0bee4b60de212ded1a3",
  name: "listAssignments",
  filename: "src/lib/assets.functions.ts"
}, (opts) => listAssignments.__executeServer(opts));
const listAssignments = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional(),
  openOnly: booleanType().default(false)
}).parse(d)).handler(listAssignments_createServerFn_handler, async ({
  data,
  context
}) => {
  let q = context.supabase.from("asset_assignments").select("*, assets:asset_id(name,asset_tag,category,brand,model)").order("assigned_at", {
    ascending: false
  }).limit(500);
  if (data.employeeId) q = q.eq("employee_id", data.employeeId);
  if (data.openOnly) q = q.is("returned_at", null);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    assignments: rows ?? []
  };
});
const myAssignments_createServerFn_handler = createServerRpc({
  id: "fc21ae80fbf058748623fb201f6f574077ec152bdc8883b9007bf9df959f4641",
  name: "myAssignments",
  filename: "src/lib/assets.functions.ts"
}, (opts) => myAssignments.__executeServer(opts));
const myAssignments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(myAssignments_createServerFn_handler, async ({
  context
}) => {
  const {
    data: emp
  } = await context.supabase.from("employees").select("id").eq("user_id", context.userId).maybeSingle();
  if (!emp) return {
    assignments: []
  };
  const {
    data,
    error
  } = await context.supabase.from("asset_assignments").select("*, assets:asset_id(name,asset_tag,category,brand,model,serial_number)").eq("employee_id", emp.id).order("assigned_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    assignments: data ?? []
  };
});
export {
  acknowledgeAsset_createServerFn_handler,
  approveAssignment_createServerFn_handler,
  assignAsset_createServerFn_handler,
  confirmReturn_createServerFn_handler,
  createAsset_createServerFn_handler,
  listAssets_createServerFn_handler,
  listAssignments_createServerFn_handler,
  myAssignments_createServerFn_handler,
  reportReturn_createServerFn_handler,
  returnAsset_createServerFn_handler
};
