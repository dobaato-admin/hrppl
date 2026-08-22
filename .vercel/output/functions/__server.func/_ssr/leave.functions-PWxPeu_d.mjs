import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
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
async function loadLeaveContext(admin, requestId) {
  const {
    data: req
  } = await admin.from("leave_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req) return null;
  const [{
    data: emp
  }, {
    data: lt
  }] = await Promise.all([admin.from("employees").select("first_name,last_name,email").eq("id", req.employee_id).maybeSingle(), admin.from("leave_types").select("name").eq("id", req.leave_type_id).maybeSingle()]);
  return {
    req,
    employeeEmail: emp?.email,
    employeeName: emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : void 0,
    leaveTypeName: lt?.name
  };
}
async function getManagerEmails(admin, tenantId) {
  const {
    data: profiles
  } = await admin.from("profiles").select("id,email").eq("tenant_id", tenantId);
  if (!profiles?.length) return [];
  const ids = profiles.map((p) => p.id);
  const {
    data: roles
  } = await admin.from("user_roles").select("user_id,role").in("user_id", ids).in("role", ["manager", "org_admin"]);
  const roleSet = new Set((roles ?? []).map((r) => r.user_id));
  return profiles.filter((p) => roleSet.has(p.id) && p.email).map((p) => p.email);
}
async function getApproverName(admin, userId) {
  const {
    data
  } = await admin.from("profiles").select("full_name,email").eq("id", userId).maybeSingle();
  return data?.full_name || data?.email;
}
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function loadEmailSender() {
  const {
    sendInternalEmail
  } = await import("./send-internal.server-9cG3k97B.mjs");
  return sendInternalEmail;
}
async function getRoles(ctxSupabase, userId) {
  const {
    data
  } = await ctxSupabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
async function getEmployeeForUser(ctxSupabase, userId) {
  const {
    data
  } = await ctxSupabase.from("employees").select("id,tenant_id").eq("user_id", userId).maybeSingle();
  return data;
}
async function assertApproverForTenant(ctxSupabase, userId, tenantId) {
  const rs = await getRoles(ctxSupabase, userId);
  if (rs.includes("super_admin")) return;
  if (!rs.includes("manager") && !rs.includes("org_admin")) {
    throw new Error("Forbidden: manager or org admin role required");
  }
  const {
    data: profile
  } = await ctxSupabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!profile || profile.tenant_id !== tenantId) throw new Error("Forbidden: tenant mismatch");
}
const submitLeaveRequest_createServerFn_handler = createServerRpc({
  id: "51dc49f9f5fa2d4880620c24ceb97b55255cc14c1d3e473e99af061851cf699d",
  name: "submitLeaveRequest",
  filename: "src/lib/leave.functions.ts"
}, (opts) => submitLeaveRequest.__executeServer(opts));
const submitLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  leaveTypeId: stringType().uuid(),
  startDate: stringType(),
  endDate: stringType(),
  days: numberType().positive().max(366),
  halfDayStart: booleanType().optional(),
  halfDayEnd: booleanType().optional(),
  reason: stringType().max(2e3).optional()
}).parse(d)).handler(submitLeaveRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const sendInternalEmail = await loadEmailSender();
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("Employee profile not found");
  if (new Date(data.endDate) < new Date(data.startDate)) throw new Error("End date must be on or after start date");
  const admin = await loadAdmin();
  const {
    data: lt
  } = await admin.from("leave_types").select("tenant_id,is_active,allow_half_day").eq("id", data.leaveTypeId).maybeSingle();
  if (!lt || !lt.is_active) throw new Error("Leave type not available");
  if (lt.tenant_id !== emp.tenant_id) throw new Error("Leave type does not belong to your organization");
  if ((data.halfDayStart || data.halfDayEnd) && !lt.allow_half_day) throw new Error("Half-day not allowed for this leave type");
  const {
    data: req,
    error
  } = await admin.from("leave_requests").insert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    leave_type_id: data.leaveTypeId,
    start_date: data.startDate,
    end_date: data.endDate,
    days: data.days,
    half_day_start: !!data.halfDayStart,
    half_day_end: !!data.halfDayEnd,
    reason: data.reason ?? null,
    status: "pending"
  }).select().single();
  if (error) {
    console.error("[leave.submit] DB error:", error.message, error.code);
    throw new Error("Failed to submit leave request.");
  }
  const year = new Date(data.startDate).getUTCFullYear();
  await upsertBalanceDelta(admin, emp.tenant_id, emp.id, data.leaveTypeId, year, {
    pending: data.days
  });
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "leave_request",
    entity_id: req.id,
    action: "submit",
    metadata: {
      leave_type_id: data.leaveTypeId,
      days: data.days
    }
  });
  try {
    const ctx = await loadLeaveContext(admin, req.id);
    const baseData = {
      employeeName: ctx?.employeeName,
      leaveType: ctx?.leaveTypeName,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason
    };
    if (ctx?.employeeEmail) {
      await sendInternalEmail({
        templateName: "leave-submitted-employee",
        recipientEmail: ctx.employeeEmail,
        idempotencyKey: `leave-submitted-employee-${req.id}`,
        templateData: baseData,
        preferenceKey: "notify_leave_submitted"
      });
    }
    const managers = await getManagerEmails(admin, emp.tenant_id);
    await Promise.all(managers.map((m) => sendInternalEmail({
      templateName: "leave-submitted-manager",
      recipientEmail: m,
      idempotencyKey: `leave-submitted-manager-${req.id}-${m}`,
      templateData: baseData,
      preferenceKey: "notify_leave_submitted"
    })));
  } catch (e) {
    console.error("[leave.submit] notify failed", e);
  }
  return {
    request: req
  };
});
const cancelLeaveRequest_createServerFn_handler = createServerRpc({
  id: "b52994b4c73f413d7cfb4e1546af79359c94a09044a87eb847e2ebb546df7a10",
  name: "cancelLeaveRequest",
  filename: "src/lib/leave.functions.ts"
}, (opts) => cancelLeaveRequest.__executeServer(opts));
const cancelLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(cancelLeaveRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const sendInternalEmail = await loadEmailSender();
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("Employee profile not found");
  const admin = await loadAdmin();
  const {
    data: req
  } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
  if (!req) throw new Error("Request not found");
  if (req.employee_id !== emp.id) throw new Error("You can only cancel your own requests");
  if (req.status !== "pending") throw new Error("Only pending requests can be cancelled");
  const {
    error
  } = await admin.from("leave_requests").update({
    status: "cancelled"
  }).eq("id", req.id);
  if (error) {
    console.error("[leave.cancel]", error.message, error.code);
    throw new Error("Failed to cancel request.");
  }
  const year = new Date(req.start_date).getUTCFullYear();
  await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, {
    pending: -Number(req.days)
  });
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "leave_request",
    entity_id: req.id,
    action: "cancel",
    metadata: {}
  });
  try {
    const ctx = await loadLeaveContext(admin, req.id);
    const baseData = {
      employeeName: ctx?.employeeName,
      leaveType: ctx?.leaveTypeName,
      startDate: req.start_date,
      endDate: req.end_date,
      days: Number(req.days)
    };
    const managers = await getManagerEmails(admin, req.tenant_id);
    await Promise.all(managers.map((m) => sendInternalEmail({
      templateName: "leave-cancelled-manager",
      recipientEmail: m,
      idempotencyKey: `leave-cancelled-manager-${req.id}-${m}`,
      templateData: baseData,
      preferenceKey: "notify_leave_cancelled"
    })));
  } catch (e) {
    console.error("[leave.cancel] notify failed", e);
  }
  return {
    ok: true
  };
});
const approveLeaveRequest_createServerFn_handler = createServerRpc({
  id: "4b098ff8304ccf4f65a4522ea2009394eac5aed196f330a2be6a8de2e821ed95",
  name: "approveLeaveRequest",
  filename: "src/lib/leave.functions.ts"
}, (opts) => approveLeaveRequest.__executeServer(opts));
const approveLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(approveLeaveRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const sendInternalEmail = await loadEmailSender();
  const admin = await loadAdmin();
  const {
    data: req
  } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Only pending requests can be approved");
  await assertApproverForTenant(supabase, userId, req.tenant_id);
  const {
    error
  } = await admin.from("leave_requests").update({
    status: "approved",
    approved_by: userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", req.id);
  if (error) {
    console.error("[leave.approve]", error.message, error.code);
    throw new Error("Failed to approve request.");
  }
  const year = new Date(req.start_date).getUTCFullYear();
  await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, {
    pending: -Number(req.days),
    used: Number(req.days)
  });
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "leave_request",
    entity_id: req.id,
    action: "approve",
    metadata: {
      days: req.days
    }
  });
  try {
    const ctx = await loadLeaveContext(admin, req.id);
    const approverName = await getApproverName(admin, userId);
    if (ctx?.employeeEmail) {
      await sendInternalEmail({
        templateName: "leave-approved",
        recipientEmail: ctx.employeeEmail,
        idempotencyKey: `leave-approved-${req.id}`,
        templateData: {
          approverName,
          leaveType: ctx.leaveTypeName,
          startDate: req.start_date,
          endDate: req.end_date,
          days: Number(req.days)
        },
        preferenceKey: "notify_leave_decision"
      });
    }
  } catch (e) {
    console.error("[leave.approve] notify failed", e);
  }
  return {
    ok: true
  };
});
const rejectLeaveRequest_createServerFn_handler = createServerRpc({
  id: "99fe582eafb1895c99f5deecf27c7774bc76bcddc7cf45c04504ec0a4ff2ca33",
  name: "rejectLeaveRequest",
  filename: "src/lib/leave.functions.ts"
}, (opts) => rejectLeaveRequest.__executeServer(opts));
const rejectLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  reason: stringType().max(2e3).optional()
}).parse(d)).handler(rejectLeaveRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const sendInternalEmail = await loadEmailSender();
  const admin = await loadAdmin();
  const {
    data: req
  } = await admin.from("leave_requests").select("*").eq("id", data.requestId).maybeSingle();
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Only pending requests can be rejected");
  await assertApproverForTenant(supabase, userId, req.tenant_id);
  const {
    error
  } = await admin.from("leave_requests").update({
    status: "rejected",
    approved_by: userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    rejection_reason: data.reason ?? null
  }).eq("id", req.id);
  if (error) {
    console.error("[leave.reject]", error.message, error.code);
    throw new Error("Failed to reject request.");
  }
  const year = new Date(req.start_date).getUTCFullYear();
  await upsertBalanceDelta(admin, req.tenant_id, req.employee_id, req.leave_type_id, year, {
    pending: -Number(req.days)
  });
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "leave_request",
    entity_id: req.id,
    action: "reject",
    metadata: {
      reason: data.reason ?? null
    }
  });
  try {
    const ctx = await loadLeaveContext(admin, req.id);
    const approverName = await getApproverName(admin, userId);
    if (ctx?.employeeEmail) {
      await sendInternalEmail({
        templateName: "leave-rejected",
        recipientEmail: ctx.employeeEmail,
        idempotencyKey: `leave-rejected-${req.id}`,
        templateData: {
          approverName,
          leaveType: ctx.leaveTypeName,
          startDate: req.start_date,
          endDate: req.end_date,
          days: Number(req.days),
          rejectionReason: data.reason
        },
        preferenceKey: "notify_leave_decision"
      });
    }
  } catch (e) {
    console.error("[leave.reject] notify failed", e);
  }
  return {
    ok: true
  };
});
async function upsertBalanceDelta(admin, tenantId, employeeId, leaveTypeId, year, delta) {
  const {
    data: existing
  } = await admin.from("leave_balances").select("*").eq("employee_id", employeeId).eq("leave_type_id", leaveTypeId).eq("year", year).maybeSingle();
  if (existing) {
    const update = {};
    if (delta.pending !== void 0) update.pending_days = Math.max(0, Number(existing.pending_days) + delta.pending);
    if (delta.used !== void 0) update.used_days = Math.max(0, Number(existing.used_days) + delta.used);
    if (delta.accrued !== void 0) update.accrued_days = Number(existing.accrued_days) + delta.accrued;
    if (delta.carried_over !== void 0) update.carried_over_days = Number(existing.carried_over_days) + delta.carried_over;
    await admin.from("leave_balances").update(update).eq("id", existing.id);
  } else {
    const {
      data: lt
    } = await admin.from("leave_types").select("annual_quota_days").eq("id", leaveTypeId).maybeSingle();
    await admin.from("leave_balances").insert({
      tenant_id: tenantId,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year,
      accrued_days: Number(lt?.annual_quota_days ?? 0) + (delta.accrued ?? 0),
      used_days: Math.max(0, delta.used ?? 0),
      pending_days: Math.max(0, delta.pending ?? 0),
      carried_over_days: delta.carried_over ?? 0
    });
  }
}
export {
  approveLeaveRequest_createServerFn_handler,
  cancelLeaveRequest_createServerFn_handler,
  rejectLeaveRequest_createServerFn_handler,
  submitLeaveRequest_createServerFn_handler
};
