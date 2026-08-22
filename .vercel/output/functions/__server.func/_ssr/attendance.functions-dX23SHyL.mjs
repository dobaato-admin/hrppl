import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType } from "../_libs/zod.mjs";
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
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function getEmployeeForUser(supabase, userId) {
  const {
    data
  } = await supabase.from("employees").select("id,tenant_id,first_name,last_name").eq("user_id", userId).maybeSingle();
  return data;
}
async function getRoles(supabase, userId) {
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
const ClockInSchema = objectType({
  latitude: numberType().min(-90).max(90).optional(),
  longitude: numberType().min(-180).max(180).optional(),
  locationError: stringType().max(200).optional()
}).optional();
const clockIn_createServerFn_handler = createServerRpc({
  id: "214a77e62f12e4e764f58fbba19b652fa5b3066d4ff5de816fa577df84a65b5c",
  name: "clockIn",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => clockIn.__executeServer(opts));
const clockIn = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ClockInSchema.parse(d ?? {})).handler(clockIn_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const {
    data: fences
  } = await supabase.from("sign_geofences").select("id,name,latitude,longitude,radius_meters").eq("tenant_id", emp.tenant_id).eq("is_active", true);
  let matchedFenceId = null;
  let matchedDistance = null;
  if (fences && fences.length > 0) {
    if (data?.locationError) {
      throw new Error(`Cannot clock in: ${data.locationError}. Your organisation enforces geo-fenced work zones.`);
    }
    if (typeof data?.latitude !== "number" || typeof data?.longitude !== "number") {
      throw new Error("Location required: please allow location access to clock in. Your organisation enforces geo-fenced work zones.");
    }
    let nearest = null;
    for (const f of fences) {
      const dist = distanceMeters(data.latitude, data.longitude, Number(f.latitude), Number(f.longitude));
      if (!nearest || dist < nearest.distance) {
        nearest = {
          name: f.name,
          distance: dist,
          radius: f.radius_meters
        };
      }
      if (dist <= f.radius_meters) {
        matchedFenceId = f.id;
        matchedDistance = dist;
        break;
      }
    }
    if (!matchedFenceId && nearest) {
      const meters = Math.round(nearest.distance);
      throw new Error(`Outside work zone — you are ${meters}m from "${nearest.name}" (allowed within ${nearest.radius}m). Move closer to an approved site to clock in.`);
    }
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: existing
  } = await supabase.from("attendance_entries").select("id,clock_in,clock_out").eq("employee_id", emp.id).eq("work_date", today).maybeSingle();
  const locFields = {};
  if (typeof data?.latitude === "number") locFields.clock_in_latitude = data.latitude;
  if (typeof data?.longitude === "number") locFields.clock_in_longitude = data.longitude;
  if (matchedFenceId) locFields.clock_in_geofence_id = matchedFenceId;
  if (matchedDistance !== null) locFields.clock_in_distance_meters = matchedDistance;
  if (existing?.clock_in && !existing.clock_out) {
    throw new Error("Already clocked in");
  }
  if (existing) {
    const {
      error: error2
    } = await supabase.from("attendance_entries").update({
      clock_in: now,
      clock_out: null,
      status: "open",
      ...locFields
    }).eq("id", existing.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      entryId: existing.id
    };
  }
  const {
    data: inserted,
    error
  } = await supabase.from("attendance_entries").insert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    work_date: today,
    clock_in: now,
    source: "web",
    status: "open",
    ...locFields
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    entryId: inserted.id
  };
});
const clockOut_createServerFn_handler = createServerRpc({
  id: "ab60a0940ed93c286890a4c4e055753b6088799ab6e7f9af78567bd07091fa7d",
  name: "clockOut",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => clockOut.__executeServer(opts));
const clockOut = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  breakMinutes: numberType().int().min(0).max(720).optional()
}).parse(d)).handler(clockOut_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: entry
  } = await supabase.from("attendance_entries").select("id,clock_in,break_minutes").eq("employee_id", emp.id).eq("work_date", today).maybeSingle();
  if (!entry?.clock_in) throw new Error("Not clocked in");
  const now = /* @__PURE__ */ new Date();
  const start = new Date(entry.clock_in);
  const breakMin = data.breakMinutes ?? entry.break_minutes ?? 0;
  const minutes = Math.max(0, (now.getTime() - start.getTime()) / 6e4 - breakMin);
  const hours = Math.round(minutes / 60 * 100) / 100;
  const {
    error
  } = await supabase.from("attendance_entries").update({
    clock_out: now.toISOString(),
    break_minutes: breakMin,
    hours_worked: hours,
    status: "closed"
  }).eq("id", entry.id);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    hours
  };
});
const upsertAttendanceEntry_createServerFn_handler = createServerRpc({
  id: "fa087c682e4f5d034e776a3d554cdcafd77cad98d9f600402ad0c876eb4b57af",
  name: "upsertAttendanceEntry",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => upsertAttendanceEntry.__executeServer(opts));
const upsertAttendanceEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockIn: stringType().optional().nullable(),
  clockOut: stringType().optional().nullable(),
  breakMinutes: numberType().int().min(0).max(720).default(0),
  notes: stringType().max(1e3).optional().nullable()
}).parse(d)).handler(upsertAttendanceEntry_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("No employee record");
  let hours = 0;
  if (data.clockIn && data.clockOut) {
    const minutes = Math.max(0, (new Date(data.clockOut).getTime() - new Date(data.clockIn).getTime()) / 6e4 - data.breakMinutes);
    hours = Math.round(minutes / 60 * 100) / 100;
  }
  const {
    data: existing
  } = await supabase.from("attendance_entries").select("id").eq("employee_id", emp.id).eq("work_date", data.workDate).maybeSingle();
  const payload = {
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    work_date: data.workDate,
    clock_in: data.clockIn || null,
    clock_out: data.clockOut || null,
    break_minutes: data.breakMinutes,
    hours_worked: hours,
    notes: data.notes ?? null,
    status: data.clockOut ? "closed" : "open",
    source: "manual"
  };
  if (existing) {
    const {
      error: error2
    } = await supabase.from("attendance_entries").update(payload).eq("id", existing.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      entryId: existing.id
    };
  }
  const {
    data: ins,
    error
  } = await supabase.from("attendance_entries").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    entryId: ins.id
  };
});
const submitTimesheet_createServerFn_handler = createServerRpc({
  id: "357947bb533d1c692665e58b6a7d498a31d843958095241b000630b16afec5c3",
  name: "submitTimesheet",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => submitTimesheet.__executeServer(opts));
const submitTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  periodStart: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(submitTimesheet_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const emp = await getEmployeeForUser(supabase, userId);
  if (!emp) throw new Error("No employee record");
  const admin = await loadAdmin();
  const {
    data: entries
  } = await admin.from("attendance_entries").select("hours_worked").eq("employee_id", emp.id).gte("work_date", data.periodStart).lte("work_date", data.periodEnd);
  const totalHours = (entries ?? []).reduce((s, e) => s + Number(e.hours_worked || 0), 0);
  const {
    data: tenant
  } = await admin.from("tenants").select("country_code").eq("id", emp.tenant_id).maybeSingle();
  let weeklyHours = 40;
  let otMultiplier = 1.5;
  if (tenant?.country_code) {
    const {
      data: cps
    } = await admin.from("country_payroll_settings").select("workweek_hours,overtime_multiplier").eq("country_code", tenant.country_code).maybeSingle();
    if (cps) {
      weeklyHours = Number(cps.workweek_hours);
      otMultiplier = Number(cps.overtime_multiplier);
    }
  }
  const days = Math.max(1, (new Date(data.periodEnd).getTime() - new Date(data.periodStart).getTime()) / 864e5 + 1);
  const weeks = days / 7;
  const expected = weeklyHours * weeks;
  const overtime = Math.max(0, totalHours - expected);
  const {
    data: existing
  } = await admin.from("timesheets").select("id,status").eq("employee_id", emp.id).eq("period_start", data.periodStart).eq("period_end", data.periodEnd).maybeSingle();
  const payload = {
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    period_start: data.periodStart,
    period_end: data.periodEnd,
    total_hours: Math.round(totalHours * 100) / 100,
    overtime_hours: Math.round(overtime * 100) / 100,
    status: "submitted",
    submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
    submitted_by: userId,
    notes: data.notes ?? null,
    totals: {
      expected_hours: expected,
      overtime_multiplier: otMultiplier
    },
    approved_at: null,
    approved_by: null,
    rejection_reason: null
  };
  let timesheetId;
  if (existing) {
    if (existing.status === "approved") throw new Error("Timesheet already approved");
    const {
      error
    } = await admin.from("timesheets").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    timesheetId = existing.id;
  } else {
    const {
      data: ins,
      error
    } = await admin.from("timesheets").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    timesheetId = ins.id;
  }
  await admin.from("attendance_entries").update({
    timesheet_id: timesheetId
  }).eq("employee_id", emp.id).gte("work_date", data.periodStart).lte("work_date", data.periodEnd);
  return {
    ok: true,
    timesheetId
  };
});
const approveTimesheet_createServerFn_handler = createServerRpc({
  id: "997f66817090c248bcdcf087eea62e3408dc29a51e5b29bfc263ec9e3ec8ba16",
  name: "approveTimesheet",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => approveTimesheet.__executeServer(opts));
const approveTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  timesheetId: stringType().uuid()
}).parse(d)).handler(approveTimesheet_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
    throw new Error("Not authorized");
  }
  const {
    error
  } = await supabase.from("timesheets").update({
    status: "approved",
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    approved_by: userId,
    rejection_reason: null
  }).eq("id", data.timesheetId);
  if (error) throw new Error(error.message);
  const admin = await loadAdmin();
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "timesheet",
    entity_id: data.timesheetId,
    action: "approve"
  });
  return {
    ok: true
  };
});
const rejectTimesheet_createServerFn_handler = createServerRpc({
  id: "a192dc79fa5b24d95e3addf72707b62be53254f6f26b0c07c4784fd7213029bb",
  name: "rejectTimesheet",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => rejectTimesheet.__executeServer(opts));
const rejectTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  timesheetId: stringType().uuid(),
  reason: stringType().max(1e3).optional()
}).parse(d)).handler(rejectTimesheet_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const roles = await getRoles(supabase, userId);
  if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
    throw new Error("Not authorized");
  }
  const {
    error
  } = await supabase.from("timesheets").update({
    status: "rejected",
    rejection_reason: data.reason ?? null,
    approved_at: null,
    approved_by: null
  }).eq("id", data.timesheetId);
  if (error) throw new Error(error.message);
  const admin = await loadAdmin();
  await admin.from("audit_log").insert({
    actor_id: userId,
    entity_type: "timesheet",
    entity_id: data.timesheetId,
    action: "reject",
    metadata: {
      reason: data.reason ?? null
    }
  });
  return {
    ok: true
  };
});
export {
  approveTimesheet_createServerFn_handler,
  clockIn_createServerFn_handler,
  clockOut_createServerFn_handler,
  rejectTimesheet_createServerFn_handler,
  submitTimesheet_createServerFn_handler,
  upsertAttendanceEntry_createServerFn_handler
};
