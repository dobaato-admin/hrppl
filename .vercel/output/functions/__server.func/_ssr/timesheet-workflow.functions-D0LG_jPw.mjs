import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { z as stringType, a as objectType, B as enumType } from "../_libs/zod.mjs";
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
const dateStr = stringType().regex(/^\d{4}-\d{2}-\d{2}$/);
async function notifyTimesheet(opts) {
  try {
    const {
      sendInternalEmail
    } = await import("./send-internal.server-9cG3k97B.mjs");
    const {
      data: t
    } = await opts.supabase.from("timesheets").select("id, period_start, period_end, total_hours, employee:employee_id(first_name, last_name, email, manager_id)").eq("id", opts.timesheet_id).maybeSingle();
    if (!t?.employee) return;
    const emp = t.employee;
    const {
      data: actorP
    } = await opts.supabase.from("profiles").select("email, full_name").eq("id", opts.userId).maybeSingle();
    const recipients = /* @__PURE__ */ new Set();
    if (emp.email) recipients.add(emp.email);
    if (emp.manager_id) {
      const {
        data: mgr
      } = await opts.supabase.from("employees").select("email").eq("id", emp.manager_id).maybeSingle();
      if (mgr?.email) recipients.add(mgr.email);
    }
    for (const to of recipients) {
      await sendInternalEmail({
        templateName: "timesheet-status",
        recipientEmail: to,
        idempotencyKey: `timesheet-${opts.timesheet_id}-${opts.action}`,
        preferenceKey: "notify_timesheet",
        templateData: {
          employeeName: `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
          periodStart: t.period_start,
          periodEnd: t.period_end,
          totalHours: Number(t.total_hours ?? 0),
          status: opts.action,
          actorName: actorP?.full_name ?? actorP?.email ?? "Someone",
          reason: opts.reason ?? null
        }
      });
    }
  } catch (e) {
    console.error("[timesheet email]", e);
  }
}
const submitMyTimesheet_createServerFn_handler = createServerRpc({
  id: "c0fd210c433caf14a752547f1fb4ae2176ab9f043dc2285a5f6f59a856f4efe4",
  name: "submitMyTimesheet",
  filename: "src/lib/timesheet-workflow.functions.ts"
}, (opts) => submitMyTimesheet.__executeServer(opts));
const submitMyTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  period_start: dateStr,
  period_end: dateStr,
  notes: stringType().trim().max(1e3).nullable().optional()
}).parse(d)).handler(submitMyTimesheet_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp,
    error: empErr
  } = await supabase.from("employees").select("id, tenant_id").eq("user_id", userId).maybeSingle();
  if (empErr) throw new Error(empErr.message);
  if (!emp) throw new Error("Employee profile not found");
  const {
    data: entries,
    error: entErr
  } = await supabase.from("time_entries").select("hours, work_date").eq("employee_id", emp.id).gte("work_date", data.period_start).lte("work_date", data.period_end);
  if (entErr) throw new Error(entErr.message);
  if (!entries || entries.length === 0) {
    throw new Error("No time entries in this period to submit");
  }
  const total = entries.reduce((s, r) => s + Number(r.hours || 0), 0);
  const {
    data: existing
  } = await supabase.from("timesheets").select("id, status").eq("employee_id", emp.id).eq("period_start", data.period_start).eq("period_end", data.period_end).maybeSingle();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const payload = {
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    period_start: data.period_start,
    period_end: data.period_end,
    total_hours: total,
    overtime_hours: 0,
    status: "submitted",
    submitted_at: now,
    submitted_by: userId,
    notes: data.notes ?? null,
    rejection_reason: null,
    approved_at: null,
    approved_by: null,
    totals: {
      entries: entries.length,
      hours: total
    }
  };
  let tsId;
  if (existing) {
    if (existing.status === "approved") {
      throw new Error("Timesheet for this period has already been approved");
    }
    const {
      error
    } = await supabase.from("timesheets").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    tsId = existing.id;
  } else {
    const {
      data: ins,
      error
    } = await supabase.from("timesheets").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    tsId = ins.id;
  }
  await notifyTimesheet({
    supabase,
    userId,
    timesheet_id: tsId,
    action: "submitted"
  });
  return {
    ok: true,
    id: tsId,
    status: "submitted"
  };
});
const listMyTimesheets_createServerFn_handler = createServerRpc({
  id: "34384cbaf14a51d4cee13db4d484801476ba2bf38ddbdf2b8da7a5c9e3f3b5a7",
  name: "listMyTimesheets",
  filename: "src/lib/timesheet-workflow.functions.ts"
}, (opts) => listMyTimesheets.__executeServer(opts));
const listMyTimesheets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyTimesheets_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    timesheets: []
  };
  const {
    data,
    error
  } = await supabase.from("timesheets").select("id, period_start, period_end, total_hours, status, submitted_at, approved_at, rejection_reason, notes").eq("employee_id", emp.id).order("period_start", {
    ascending: false
  }).limit(50);
  if (error) throw new Error(error.message);
  return {
    timesheets: data ?? []
  };
});
const listPendingTimesheets_createServerFn_handler = createServerRpc({
  id: "88b97621fabcdf3c9c46d80908d710dc8e0ce4afc294a8e77734fd40571615a1",
  name: "listPendingTimesheets",
  filename: "src/lib/timesheet-workflow.functions.ts"
}, (opts) => listPendingTimesheets.__executeServer(opts));
const listPendingTimesheets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["submitted", "approved", "rejected", "all"]).default("submitted")
}).partial().parse(d ?? {})).handler(listPendingTimesheets_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("timesheets").select("id, employee_id, period_start, period_end, total_hours, status, submitted_at, approved_at, rejection_reason, notes, employees:employee_id(first_name, last_name, employee_number)").order("submitted_at", {
    ascending: false,
    nullsFirst: false
  }).limit(200);
  const status = data?.status ?? "submitted";
  if (status !== "all") q = q.eq("status", status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    timesheets: rows ?? []
  };
});
const approveTimesheet_createServerFn_handler = createServerRpc({
  id: "69f6ae2536a2e4826c69427822bb9e033c36cfeb436770cd7f415598bf4fef01",
  name: "approveTimesheet",
  filename: "src/lib/timesheet-workflow.functions.ts"
}, (opts) => approveTimesheet.__executeServer(opts));
const approveTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(approveTimesheet_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("timesheets").update({
    status: "approved",
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    approved_by: userId,
    rejection_reason: null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await notifyTimesheet({
    supabase,
    userId,
    timesheet_id: data.id,
    action: "approved"
  });
  return {
    ok: true
  };
});
const rejectTimesheet_createServerFn_handler = createServerRpc({
  id: "057fccf1556f97bfef2151cb27957d15638fa490daffcc4ccd27a1d7cd11c961",
  name: "rejectTimesheet",
  filename: "src/lib/timesheet-workflow.functions.ts"
}, (opts) => rejectTimesheet.__executeServer(opts));
const rejectTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  reason: stringType().trim().min(3).max(1e3)
}).parse(d)).handler(rejectTimesheet_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("timesheets").update({
    status: "rejected",
    rejection_reason: data.reason,
    approved_at: null,
    approved_by: userId
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await notifyTimesheet({
    supabase,
    userId,
    timesheet_id: data.id,
    action: "rejected",
    reason: data.reason
  });
  return {
    ok: true
  };
});
export {
  approveTimesheet_createServerFn_handler,
  listMyTimesheets_createServerFn_handler,
  listPendingTimesheets_createServerFn_handler,
  rejectTimesheet_createServerFn_handler,
  submitMyTimesheet_createServerFn_handler
};
