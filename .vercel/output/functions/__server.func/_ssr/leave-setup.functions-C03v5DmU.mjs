import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, A as booleanType, z as stringType, B as enumType } from "../_libs/zod.mjs";
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
async function assertOrgAdmin(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles ?? []).map((x) => x.role);
  if (!r.some((x) => ["org_admin", "super_admin"].includes(x))) {
    throw new Error("Forbidden: organisation admin only");
  }
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organisation");
  return {
    tenantId: prof.tenant_id,
    userId
  };
}
async function checkLeaveReadiness(supabase, tenantId) {
  const [{
    data: types
  }, {
    data: approvers
  }] = await Promise.all([supabase.from("leave_types").select("id, annual_quota_days, accrual_per_month, requires_approval").eq("tenant_id", tenantId).eq("is_active", true), supabase.from("user_roles").select("user_id, role").eq("tenant_id", tenantId).in("role", ["manager", "hr", "branch_admin", "org_admin", "super_admin"]).limit(1)]);
  const activeTypes = types ?? [];
  const leaveTypes = activeTypes.length > 0;
  const accruals = leaveTypes && activeTypes.every((t) => Number(t.annual_quota_days) > 0 || Number(t.accrual_per_month) > 0);
  const needsApprover = activeTypes.some((t) => t.requires_approval);
  const approvalRouting = !needsApprover || (approvers ?? []).length > 0;
  return {
    steps: {
      leaveTypes,
      accruals,
      approvalRouting
    },
    allComplete: leaveTypes && accruals && approvalRouting
  };
}
const getLeaveReadiness_createServerFn_handler = createServerRpc({
  id: "3a8e6bb94398f28b446fa84c62ee9ff68c455e86d3b97f4cbcb7bbe2b8e1c8ad",
  name: "getLeaveReadiness",
  filename: "src/lib/leave-setup.functions.ts"
}, (opts) => getLeaveReadiness.__executeServer(opts));
const getLeaveReadiness = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getLeaveReadiness_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile?.tenant_id) throw new Error("No organisation");
  return checkLeaveReadiness(supabase, profile.tenant_id);
});
const QuickLeaveTypeSchema = objectType({
  code: stringType().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/),
  name: stringType().trim().min(1).max(120),
  color: stringType().trim().regex(/^#[0-9a-fA-F]{6}$/).default("#3b82f6"),
  annual_quota_days: numberType().min(0).max(366),
  accrual_per_month: numberType().min(0).max(31),
  requires_approval: booleanType().default(true),
  is_paid: booleanType().default(true),
  allow_half_day: booleanType().default(true),
  allow_carry_over: booleanType().default(true),
  max_carry_over_days: numberType().min(0).max(366).default(0)
});
const upsertLeaveTypeQuick_createServerFn_handler = createServerRpc({
  id: "e9f61609fbf28968dd24e9432e7b3a990ea32ccf81d8342246ef2d46f782ca49",
  name: "upsertLeaveTypeQuick",
  filename: "src/lib/leave-setup.functions.ts"
}, (opts) => upsertLeaveTypeQuick.__executeServer(opts));
const upsertLeaveTypeQuick = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => QuickLeaveTypeSchema.parse(d)).handler(upsertLeaveTypeQuick_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("leave_types").upsert({
    tenant_id: tenantId,
    is_active: true,
    ...data
  }, {
    onConflict: "tenant_id,code"
  }).select().single();
  if (error) throw new Error(error.message);
  return {
    leaveType: row
  };
});
const APPROVER_ROLES = ["manager", "hr", "branch_admin", "org_admin", "super_admin"];
const RouteSchema = objectType({
  id: stringType().uuid().optional(),
  leave_type_id: stringType().uuid().nullable().optional(),
  tier: numberType().int().min(1).max(10),
  approver_role: enumType(APPROVER_ROLES).nullable().optional(),
  approver_user_id: stringType().uuid().nullable().optional(),
  escalate_after_hours: numberType().int().min(0).max(720).default(48),
  is_active: booleanType().default(true),
  notes: stringType().trim().max(500).nullable().optional()
}).refine((v) => !!v.approver_role || !!v.approver_user_id, {
  message: "Pick either an approver role or a specific user",
  path: ["approver_role"]
});
const listLeaveApprovalRoutes_createServerFn_handler = createServerRpc({
  id: "b30f27cee2d74a06a1da9dc53a6189d7ca46c19d465305b9a4fd54c6e62a7071",
  name: "listLeaveApprovalRoutes",
  filename: "src/lib/leave-setup.functions.ts"
}, (opts) => listLeaveApprovalRoutes.__executeServer(opts));
const listLeaveApprovalRoutes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listLeaveApprovalRoutes_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("leave_approval_routes").select("id,leave_type_id,tier,approver_role,approver_user_id,escalate_after_hours,is_active,notes,created_at,updated_at").eq("tenant_id", tenantId).order("leave_type_id", {
    ascending: true,
    nullsFirst: true
  }).order("tier", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return {
    routes: data ?? []
  };
});
const upsertLeaveApprovalRoute_createServerFn_handler = createServerRpc({
  id: "c1986285be9c7c50b0c21b05419094753636d306d8f606ea4b4ece25c0319faa",
  name: "upsertLeaveApprovalRoute",
  filename: "src/lib/leave-setup.functions.ts"
}, (opts) => upsertLeaveApprovalRoute.__executeServer(opts));
const upsertLeaveApprovalRoute = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RouteSchema.parse(d)).handler(upsertLeaveApprovalRoute_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const payload = {
    tenant_id: tenantId,
    leave_type_id: data.leave_type_id ?? null,
    tier: data.tier,
    approver_role: data.approver_role ?? null,
    approver_user_id: data.approver_user_id ?? null,
    escalate_after_hours: data.escalate_after_hours,
    is_active: data.is_active,
    notes: data.notes ?? null
  };
  const q = data.id ? supabase.from("leave_approval_routes").update(payload).eq("id", data.id).eq("tenant_id", tenantId).select().single() : supabase.from("leave_approval_routes").insert(payload).select().single();
  const {
    data: row,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    route: row
  };
});
const deleteLeaveApprovalRoute_createServerFn_handler = createServerRpc({
  id: "94f2dfdb64609e11aae4493602e8a57abc88f046f26097c9c8d14bb569bd1192",
  name: "deleteLeaveApprovalRoute",
  filename: "src/lib/leave-setup.functions.ts"
}, (opts) => deleteLeaveApprovalRoute.__executeServer(opts));
const deleteLeaveApprovalRoute = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteLeaveApprovalRoute_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("leave_approval_routes").delete().eq("id", data.id).eq("tenant_id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listTenantApprovers_createServerFn_handler = createServerRpc({
  id: "32b414a7c4eb29293f430a354f70cd3c5fe04d7f0d556db8e7fbfe1a1c21baab",
  name: "listTenantApprovers",
  filename: "src/lib/leave-setup.functions.ts"
}, (opts) => listTenantApprovers.__executeServer(opts));
const listTenantApprovers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listTenantApprovers_createServerFn_handler, async ({
  context
}) => {
  const {
    tenantId
  } = await assertOrgAdmin(context);
  const {
    supabase
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("user_id, role").eq("tenant_id", tenantId).in("role", APPROVER_ROLES);
  const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
  if (ids.length === 0) return {
    approvers: []
  };
  const {
    data: profiles
  } = await supabase.from("profiles").select("id,full_name,email").in("id", ids);
  const roleMap = /* @__PURE__ */ new Map();
  (roles ?? []).forEach((r) => {
    roleMap.set(r.user_id, [...roleMap.get(r.user_id) ?? [], r.role]);
  });
  return {
    approvers: (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      roles: roleMap.get(p.id) ?? []
    }))
  };
});
export {
  deleteLeaveApprovalRoute_createServerFn_handler,
  getLeaveReadiness_createServerFn_handler,
  listLeaveApprovalRoutes_createServerFn_handler,
  listTenantApprovers_createServerFn_handler,
  upsertLeaveApprovalRoute_createServerFn_handler,
  upsertLeaveTypeQuick_createServerFn_handler
};
