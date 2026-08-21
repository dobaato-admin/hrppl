import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getEmployeeForUser(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select("id,tenant_id,first_name,last_name")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

// Haversine — meters between two coords
function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const ClockInSchema = z
  .object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationError: z.string().max(200).optional(),
  })
  .optional();

// ---------- Clock in ----------
export const clockIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ClockInSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    // Geofence enforcement: if the tenant has any active geofences, the
    // employee's current location must fall within at least one of them.
    const { data: fences } = await supabase
      .from("sign_geofences")
      .select("id,name,latitude,longitude,radius_meters")
      .eq("tenant_id", emp.tenant_id)
      .eq("is_active", true);

    let matchedFenceId: string | null = null;
    let matchedDistance: number | null = null;

    if (fences && fences.length > 0) {
      if (data?.locationError) {
        throw new Error(`Cannot clock in: ${data.locationError}. Your organisation enforces geo-fenced work zones.`);
      }
      if (typeof data?.latitude !== "number" || typeof data?.longitude !== "number") {
        throw new Error("Location required: please allow location access to clock in. Your organisation enforces geo-fenced work zones.");
      }
      let nearest: { name: string; distance: number; radius: number } | null = null;
      for (const f of fences as any[]) {
        const dist = distanceMeters(data.latitude, data.longitude, Number(f.latitude), Number(f.longitude));
        if (!nearest || dist < nearest.distance) {
          nearest = { name: f.name, distance: dist, radius: f.radius_meters };
        }
        if (dist <= f.radius_meters) {
          matchedFenceId = f.id;
          matchedDistance = dist;
          break;
        }
      }
      if (!matchedFenceId && nearest) {
        const meters = Math.round(nearest.distance);
        throw new Error(
          `Outside work zone — you are ${meters}m from "${nearest.name}" (allowed within ${nearest.radius}m). Move closer to an approved site to clock in.`,
        );
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("attendance_entries")
      .select("id,clock_in,clock_out")
      .eq("employee_id", emp.id)
      .eq("work_date", today)
      .maybeSingle();

    const locFields: Record<string, unknown> = {};
    if (typeof data?.latitude === "number") locFields.clock_in_latitude = data.latitude;
    if (typeof data?.longitude === "number") locFields.clock_in_longitude = data.longitude;
    if (matchedFenceId) locFields.clock_in_geofence_id = matchedFenceId;
    if (matchedDistance !== null) locFields.clock_in_distance_meters = matchedDistance;

    if (existing?.clock_in && !existing.clock_out) {
      throw new Error("Already clocked in");
    }

    if (existing) {
      const { error } = await supabase
        .from("attendance_entries")
        .update({ clock_in: now, clock_out: null, status: "open", ...locFields })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, entryId: existing.id };
    }

    const { data: inserted, error } = await supabase
      .from("attendance_entries")
      .insert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        work_date: today,
        clock_in: now,
        source: "web",
        status: "open",
        ...locFields,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, entryId: inserted.id };
  });

// ---------- Clock out ----------
export const clockOut = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ breakMinutes: z.number().int().min(0).max(720).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    const today = new Date().toISOString().slice(0, 10);
    const { data: entry } = await supabase
      .from("attendance_entries")
      .select("id,clock_in,break_minutes")
      .eq("employee_id", emp.id)
      .eq("work_date", today)
      .maybeSingle();

    if (!entry?.clock_in) throw new Error("Not clocked in");

    const now = new Date();
    const start = new Date(entry.clock_in);
    const breakMin = data.breakMinutes ?? entry.break_minutes ?? 0;
    const minutes = Math.max(0, (now.getTime() - start.getTime()) / 60000 - breakMin);
    const hours = Math.round((minutes / 60) * 100) / 100;

    const { error } = await supabase
      .from("attendance_entries")
      .update({
        clock_out: now.toISOString(),
        break_minutes: breakMin,
        hours_worked: hours,
        status: "closed",
      })
      .eq("id", entry.id);
    if (error) throw new Error(error.message);
    return { ok: true, hours };
  });

// ---------- Upsert an entry manually (correction) ----------
export const upsertAttendanceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      clockIn: z.string().optional().nullable(),
      clockOut: z.string().optional().nullable(),
      breakMinutes: z.number().int().min(0).max(720).default(0),
      notes: z.string().max(1000).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    let hours = 0;
    if (data.clockIn && data.clockOut) {
      const minutes = Math.max(0, (new Date(data.clockOut).getTime() - new Date(data.clockIn).getTime()) / 60000 - data.breakMinutes);
      hours = Math.round((minutes / 60) * 100) / 100;
    }

    const { data: existing } = await supabase
      .from("attendance_entries")
      .select("id")
      .eq("employee_id", emp.id)
      .eq("work_date", data.workDate)
      .maybeSingle();

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
      source: "manual",
    };

    if (existing) {
      const { error } = await supabase.from("attendance_entries").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, entryId: existing.id };
    }
    const { data: ins, error } = await supabase.from("attendance_entries").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, entryId: ins.id };
  });

// ---------- Submit timesheet for a period ----------
export const submitTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      notes: z.string().max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    const admin = await loadAdmin();
    const { data: entries } = await admin
      .from("attendance_entries")
      .select("hours_worked")
      .eq("employee_id", emp.id)
      .gte("work_date", data.periodStart)
      .lte("work_date", data.periodEnd);

    const totalHours = (entries ?? []).reduce((s: number, e: any) => s + Number(e.hours_worked || 0), 0);

    const { data: tenant } = await admin
      .from("tenants").select("country_code").eq("id", emp.tenant_id).maybeSingle();
    let weeklyHours = 40;
    let otMultiplier = 1.5;
    if (tenant?.country_code) {
      const { data: cps } = await admin
        .from("country_payroll_settings")
        .select("workweek_hours,overtime_multiplier")
        .eq("country_code", tenant.country_code)
        .maybeSingle();
      if (cps) {
        weeklyHours = Number(cps.workweek_hours);
        otMultiplier = Number(cps.overtime_multiplier);
      }
    }
    const days = Math.max(1, (new Date(data.periodEnd).getTime() - new Date(data.periodStart).getTime()) / 86400000 + 1);
    const weeks = days / 7;
    const expected = weeklyHours * weeks;
    const overtime = Math.max(0, totalHours - expected);

    const { data: existing } = await admin
      .from("timesheets")
      .select("id,status")
      .eq("employee_id", emp.id)
      .eq("period_start", data.periodStart)
      .eq("period_end", data.periodEnd)
      .maybeSingle();

    const payload = {
      tenant_id: emp.tenant_id,
      employee_id: emp.id,
      period_start: data.periodStart,
      period_end: data.periodEnd,
      total_hours: Math.round(totalHours * 100) / 100,
      overtime_hours: Math.round(overtime * 100) / 100,
      status: "submitted" as const,
      submitted_at: new Date().toISOString(),
      submitted_by: userId,
      notes: data.notes ?? null,
      totals: { expected_hours: expected, overtime_multiplier: otMultiplier },
      approved_at: null,
      approved_by: null,
      rejection_reason: null,
    };

    let timesheetId: string;
    if (existing) {
      if (existing.status === "approved") throw new Error("Timesheet already approved");
      const { error } = await admin.from("timesheets").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      timesheetId = existing.id;
    } else {
      const { data: ins, error } = await admin.from("timesheets").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      timesheetId = ins.id;
    }

    await admin
      .from("attendance_entries")
      .update({ timesheet_id: timesheetId })
      .eq("employee_id", emp.id)
      .gte("work_date", data.periodStart)
      .lte("work_date", data.periodEnd);

    return { ok: true, timesheetId };
  });

// ---------- Manager approve / reject ----------
export const approveTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ timesheetId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
      throw new Error("Not authorized");
    }
    const { error } = await supabase
      .from("timesheets")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: userId, rejection_reason: null })
      .eq("id", data.timesheetId);
    if (error) throw new Error(error.message);

    const admin = await loadAdmin();
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "timesheet", entity_id: data.timesheetId, action: "approve",
    });
    return { ok: true };
  });

export const rejectTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ timesheetId: z.string().uuid(), reason: z.string().max(1000).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
      throw new Error("Not authorized");
    }
    const { error } = await supabase
      .from("timesheets")
      .update({ status: "rejected", rejection_reason: data.reason ?? null, approved_at: null, approved_by: null })
      .eq("id", data.timesheetId);
    if (error) throw new Error(error.message);

    const admin = await loadAdmin();
    await admin.from("audit_log").insert({
      actor_id: userId, entity_type: "timesheet", entity_id: data.timesheetId, action: "reject",
      metadata: { reason: data.reason ?? null },
    });
    return { ok: true };
  });
