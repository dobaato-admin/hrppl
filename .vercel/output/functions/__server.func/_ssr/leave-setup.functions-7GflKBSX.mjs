import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, B as enumType } from "../_libs/zod.mjs";
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
const getLeaveReadiness = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3a8e6bb94398f28b446fa84c62ee9ff68c455e86d3b97f4cbcb7bbe2b8e1c8ad"));
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
const upsertLeaveTypeQuick = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => QuickLeaveTypeSchema.parse(d)).handler(createSsrRpc("e9f61609fbf28968dd24e9432e7b3a990ea32ccf81d8342246ef2d46f782ca49"));
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
const listLeaveApprovalRoutes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b30f27cee2d74a06a1da9dc53a6189d7ca46c19d465305b9a4fd54c6e62a7071"));
const upsertLeaveApprovalRoute = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RouteSchema.parse(d)).handler(createSsrRpc("c1986285be9c7c50b0c21b05419094753636d306d8f606ea4b4ece25c0319faa"));
const deleteLeaveApprovalRoute = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("94f2dfdb64609e11aae4493602e8a57abc88f046f26097c9c8d14bb569bd1192"));
const listTenantApprovers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("32b414a7c4eb29293f430a354f70cd3c5fe04d7f0d556db8e7fbfe1a1c21baab"));
export {
  checkLeaveReadiness,
  deleteLeaveApprovalRoute,
  getLeaveReadiness,
  listLeaveApprovalRoutes,
  listTenantApprovers,
  upsertLeaveApprovalRoute,
  upsertLeaveTypeQuick
};
