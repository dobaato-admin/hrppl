import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import {
  evaluateGeofence,
  outsideFenceMessage,
  type GeofenceOutcome,
  type GeofenceRow,
} from "@/lib/geofence";
import {
  resolvePunchInstant,
  resolveTimeZone,
  workDateInZone,
  workTimeInZone,
} from "@/lib/work-date";

/**
 * Escape hatch for schema this build's generated types do not know about yet.
 *
 * `src/integrations/supabase/types.ts` is generated from the *live* schema, so
 * it necessarily lags a migration until that migration has been replayed and
 * the types regenerated. Migration 20260823060000 adds the attendance columns
 * and the `has_approved_wfh()` function this module uses.
 *
 * Casting at the call site is the lesser evil: hand-editing the generated file
 * would be silently reverted by the next regeneration, and CLAUDE.md rules it
 * out for exactly that reason.
 *
 * **Remove every `as PendingSchema` in this file once types.ts is regenerated**
 * — they are suppressing real type checking on these queries until then.
 */
type PendingSchema = any;

/**
 * Columns and functions that only exist once 20260823060000 has been applied.
 *
 * Listed explicitly so a punch can still be written against the old schema.
 * Without this, deploying the code ahead of the migration does not degrade the
 * feature — it breaks clocking in outright with a PostgREST 42703, which is a
 * far worse failure than losing the provenance fields for one deploy window.
 */
const POST_MIGRATION_COLUMNS = [
  "work_timezone",
  "work_location",
  "needs_review",
  "review_reason",
  "clock_in_recorded_at",
  "clock_out_recorded_at",
  "clock_in_skew_seconds",
  "clock_out_skew_seconds",
  "clock_in_accuracy_meters",
  "clock_out_accuracy_meters",
  "clock_out_latitude",
  "clock_out_longitude",
  "clock_out_geofence_id",
  "clock_out_distance_meters",
] as const;

/**
 * PostgREST's two ways of saying "that column does not exist": 42703 straight
 * from Postgres, and PGRST204 when its own schema cache has not seen it.
 */
export function isUnknownColumnError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  if (!e) return false;
  if (e.code === "42703" || e.code === "PGRST204") return true;
  return /column .* does not exist|could not find the .* column/i.test(e.message ?? "");
}

export function withoutPostMigrationColumns(payload: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!(POST_MIGRATION_COLUMNS as readonly string[]).includes(k)) out[k] = v;
  }
  return out;
}

/** Warn once per process rather than on every punch. */
let warnedAboutPendingMigration = false;
function warnPendingMigration() {
  if (warnedAboutPendingMigration) return;
  warnedAboutPendingMigration = true;
  console.warn(
    "[attendance] migration 20260823060000 is not applied — recording punches " +
      "without timezone, location-quality and review provenance. Apply it with " +
      "scripts/apply-migration.mjs, then regenerate types.ts.",
  );
}

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getEmployeeForUser(supabase: any, userId: string) {
  const { data } = await supabase
    .from("employees")
    .select("id,tenant_id,branch_id,first_name,last_name")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function getRoles(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role);
}

/**
 * The zone an employee's working day is measured in: their branch's if it has
 * one, otherwise the tenant's, otherwise UTC.
 *
 * Resolved per punch rather than cached, and then *stored on the row*, so that
 * correcting a tenant's timezone setting later cannot retroactively move every
 * historical shift onto a different date.
 */
async function resolveWorkTimeZone(
  supabase: any,
  emp: { tenant_id: string; branch_id?: string | null },
) {
  const [branchRes, tenantRes] = await Promise.all([
    emp.branch_id
      ? supabase.from("tenant_branches").select("timezone").eq("id", emp.branch_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("tenants").select("timezone").eq("id", emp.tenant_id).maybeSingle(),
  ]);
  return resolveTimeZone(branchRes?.data?.timezone, tenantRes?.data?.timezone);
}

/**
 * Record what happened at the perimeter, including refusals.
 *
 * Refused punches previously left no trace at all — not in geofence_audit_log,
 * not anywhere — so HR could not see who had been blocked, how often, or
 * whether a fence was simply drawn wrong. Someone standing outside a badly
 * placed boundary had no evidence they had tried.
 *
 * Written with the service-role client because the row must not be suppressible
 * by the person it is about, and because the refusal path has no successful
 * insert to attach to. Failures here are swallowed on purpose: the audit trail
 * must never be the reason a workforce cannot clock in, and
 * client.server.ts throws on construction when SUPABASE_SERVICE_ROLE_KEY is
 * absent — an environment where that is missing should still run attendance.
 */
async function recordPerimeterEvent(args: {
  tenantId: string;
  employeeId: string;
  userId: string;
  action: string;
  outcome: GeofenceOutcome;
  position: { latitude?: number | null; longitude?: number | null; accuracyMeters?: number | null };
  suspicious?: boolean;
  suspiciousReason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = await loadAdmin();
    const fenceId =
      args.outcome.kind === "outside"
        ? args.outcome.nearestFenceId
        : "fenceId" in args.outcome
          ? args.outcome.fenceId
          : null;
    await admin.from("geofence_audit_log").insert({
      tenant_id: args.tenantId,
      geofence_id: fenceId,
      actor_user_id: args.userId,
      action: args.action,
      source: "attendance",
      latitude: args.position.latitude ?? null,
      longitude: args.position.longitude ?? null,
      accuracy_m: args.position.accuracyMeters ?? null,
      is_suspicious: args.suspicious ?? false,
      suspicious_reason: args.suspiciousReason ?? null,
      metadata: {
        outcome: args.outcome,
        employee_id: args.employeeId,
        ...(args.metadata ?? {}),
      } as PendingSchema,
    });
  } catch (e) {
    console.error("[attendance] perimeter audit write failed (punch was not blocked)", e);
  }
}

/**
 * Queue a punch for human review.
 *
 * geofence_reconciliation already has a resolve UI and workflow on
 * /admin/geofences, so this is the existing queue rather than a second one
 * nobody opens. Same swallow-on-failure rule as the audit write.
 */
async function queueForReview(args: {
  tenantId: string;
  employeeId: string;
  userId: string;
  attendanceEntryId?: string | null;
  geofenceId?: string | null;
  eventTime: Date;
  mismatchType:
    | "wfh_outside_fence"
    | "outside_fence_blocked"
    | "accuracy_low"
    | "clock_skew"
    | "no_geofence_for_punch";
  details: Record<string, unknown>;
}) {
  try {
    const admin = await loadAdmin();
    await (admin as PendingSchema).from("geofence_reconciliation").insert({
      tenant_id: args.tenantId,
      employee_id: args.employeeId,
      actor_user_id: args.userId,
      geofence_id: args.geofenceId ?? null,
      attendance_entry_id: args.attendanceEntryId ?? null,
      event_time: args.eventTime.toISOString(),
      event_type: "capture",
      mismatch_type: args.mismatchType,
      details: args.details,
      status: "open",
    });
  } catch (e) {
    console.error("[attendance] review queue write failed (punch was not blocked)", e);
  }
}

const PunchSchema = z
  .object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    /** Browser's 95%-confidence radius in metres. Previously discarded. */
    accuracyMeters: z.number().min(0).max(100_000).optional(),
    locationError: z.string().max(200).optional(),
    /**
     * When the employee pressed the button, per their own device.
     *
     * The server used to stamp the time inside the handler, which is after the
     * auth round-trip, the employee lookup and the geofence query — so every
     * punch was late by the request latency, always in the employer's favour.
     * This is believed only within a tolerance; see resolvePunchInstant.
     */
    clientTime: z.string().datetime({ offset: true }).optional(),
    /** The device's own IANA zone. Informational — recorded, never trusted. */
    clientTimeZone: z.string().max(64).optional(),
  })
  .optional();

const ClockInSchema = PunchSchema;

// ---------- Clock in ----------
export const clockIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ClockInSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    const timeZone = await resolveWorkTimeZone(supabase, emp);
    const punch = resolvePunchInstant(data?.clientTime, new Date());
    // The working day is a *local* calendar concept. Deriving it from the UTC
    // date filed early shifts in Kathmandu against yesterday and late shifts in
    // New York against tomorrow. See src/lib/work-date.ts.
    const workDate = workDateInZone(punch.instant, timeZone);
    const nowIso = punch.instant.toISOString();

    const position = {
      latitude: data?.latitude ?? null,
      longitude: data?.longitude ?? null,
      accuracyMeters: data?.accuracyMeters ?? null,
      locationError: data?.locationError ?? null,
    };

    const [{ data: fences }, wfhRes] = await Promise.all([
      (supabase as PendingSchema)
        .from("sign_geofences")
        .select("id,name,latitude,longitude,radius_meters,min_accuracy_meters")
        .eq("tenant_id", emp.tenant_id)
        .eq("is_active", true),
      (supabase as PendingSchema)
        .rpc("has_approved_wfh", { _employee_id: emp.id, _work_date: workDate })
        .then(
          (r: PendingSchema) => r,
          // Absent until 20260823060000 is applied. "No approved WFH day" is
          // the correct reading of a workforce that cannot yet request one.
          () => ({ data: null }),
        ),
    ]);
    const approvedWfh = wfhRes?.data === true;

    const outcome = evaluateGeofence(fences as GeofenceRow[] | null, position);

    let workLocation: "office" | "remote" | "unknown" = approvedWfh ? "remote" : "unknown";
    let matchedFenceId: string | null = null;
    let matchedDistance: number | null = null;
    let needsReview = false;
    const reviewReasons: string[] = [];
    let pendingReview: null | {
      mismatchType: "wfh_outside_fence" | "accuracy_low";
      details: Record<string, unknown>;
    } = null;

    switch (outcome.kind) {
      case "no_fences":
        // Nothing to enforce. An approved WFH day still marks the punch remote.
        break;

      case "no_location":
        if (!approvedWfh) {
          await recordPerimeterEvent({
            tenantId: emp.tenant_id,
            employeeId: emp.id,
            userId,
            action: "clock_in_blocked",
            outcome,
            position,
            suspicious: true,
            suspiciousReason: `No usable location: ${outcome.reason}`,
          });
          await queueForReview({
            tenantId: emp.tenant_id,
            employeeId: emp.id,
            userId,
            eventTime: punch.instant,
            mismatchType: "outside_fence_blocked",
            details: { work_date: workDate, reason: outcome.reason, cause: "no_location" },
          });
          throw new Error(
            `Cannot clock in: ${outcome.reason}. Your organisation enforces geo-fenced work zones — ` +
              `allow location access, or request a work-from-home day if you are working remotely.`,
          );
        }
        // Approved to work remotely: there is no perimeter to be inside of, so
        // a missing fix is not a violation. Recorded all the same.
        needsReview = true;
        reviewReasons.push("Approved work-from-home punch with no location fix");
        pendingReview = {
          mismatchType: "wfh_outside_fence",
          details: { work_date: workDate, cause: "no_location", reason: outcome.reason },
        };
        break;

      case "inside":
        workLocation = approvedWfh ? "remote" : "office";
        matchedFenceId = outcome.fenceId;
        matchedDistance = outcome.distanceMeters;
        break;

      case "inside_low_confidence":
      case "uncertain":
        workLocation = approvedWfh ? "remote" : "office";
        matchedFenceId = outcome.fenceId;
        matchedDistance = outcome.distanceMeters;
        needsReview = true;
        reviewReasons.push(
          outcome.kind === "uncertain"
            ? `Position ${outcome.distanceMeters}m from "${outcome.fenceName}", within the ±${Math.round(outcome.accuracyMeters ?? 0)}m margin of error`
            : `Location accurate only to ±${Math.round(outcome.accuracyMeters ?? 0)}m, coarser than the ${outcome.minAccuracyMeters}m this site requires`,
        );
        pendingReview = {
          mismatchType: "accuracy_low",
          details: {
            work_date: workDate,
            outcome: outcome.kind,
            distance_m: outcome.distanceMeters,
            accuracy_m: outcome.accuracyMeters,
            min_accuracy_m: outcome.minAccuracyMeters,
          },
        };
        await recordPerimeterEvent({
          tenantId: emp.tenant_id,
          employeeId: emp.id,
          userId,
          action: "clock_in_low_confidence",
          outcome,
          position,
          suspicious: false,
          suspiciousReason: reviewReasons[reviewReasons.length - 1],
        });
        break;

      case "outside":
        if (!approvedWfh) {
          await recordPerimeterEvent({
            tenantId: emp.tenant_id,
            employeeId: emp.id,
            userId,
            action: "clock_in_blocked",
            outcome,
            position,
            suspicious: true,
            suspiciousReason: `Outside all work zones by ${outcome.distanceMeters - outcome.radiusMeters}m`,
          });
          await queueForReview({
            tenantId: emp.tenant_id,
            employeeId: emp.id,
            userId,
            geofenceId: outcome.nearestFenceId,
            eventTime: punch.instant,
            mismatchType: "outside_fence_blocked",
            details: {
              work_date: workDate,
              distance_m: outcome.distanceMeters,
              radius_m: outcome.radiusMeters,
              accuracy_m: outcome.accuracyMeters,
              nearest: outcome.nearestFenceName,
            },
          });
          throw new Error(outsideFenceMessage(outcome));
        }
        // The exception the WFH module exists to grant. The punch succeeds and
        // is queued for priority review — that review is what makes granting it
        // safe, so it is not optional.
        workLocation = "remote";
        needsReview = true;
        reviewReasons.push(
          `Approved work-from-home punch, ${outcome.distanceMeters}m from "${outcome.nearestFenceName}"`,
        );
        pendingReview = {
          mismatchType: "wfh_outside_fence",
          details: {
            work_date: workDate,
            distance_m: outcome.distanceMeters,
            radius_m: outcome.radiusMeters,
            accuracy_m: outcome.accuracyMeters,
            nearest: outcome.nearestFenceName,
          },
        };
        break;
    }

    if (punch.rejectedClientTime) {
      needsReview = true;
      reviewReasons.push(
        `Device clock was ${Math.abs(punch.skewSeconds)}s out; server time recorded instead`,
      );
    }

    const { data: existing } = await (supabase as PendingSchema)
      .from("attendance_entries")
      .select("id,clock_in,clock_out")
      .eq("employee_id", emp.id)
      .eq("work_date", workDate)
      .maybeSingle();

    if (existing?.clock_in && !existing.clock_out) {
      throw new Error("Already clocked in");
    }

    const punchFields: Record<string, unknown> = {
      clock_in: nowIso,
      clock_in_recorded_at: new Date().toISOString(),
      clock_in_skew_seconds: data?.clientTime ? punch.skewSeconds : null,
      work_timezone: timeZone,
      work_location: workLocation,
      needs_review: needsReview,
      review_reason: reviewReasons.length ? reviewReasons.join("; ") : null,
    };
    if (typeof data?.latitude === "number") punchFields.clock_in_latitude = data.latitude;
    if (typeof data?.longitude === "number") punchFields.clock_in_longitude = data.longitude;
    if (typeof data?.accuracyMeters === "number")
      punchFields.clock_in_accuracy_meters = data.accuracyMeters;
    if (matchedFenceId) punchFields.clock_in_geofence_id = matchedFenceId;
    if (matchedDistance !== null) punchFields.clock_in_distance_meters = matchedDistance;

    // Retry once without the post-migration columns rather than failing the
    // punch. Losing provenance for a deploy window is recoverable; refusing to
    // let anyone start work is not.
    const writeEntry = async (payload: Record<string, unknown>) => {
      if (existing) {
        const res = await (supabase as PendingSchema)
          .from("attendance_entries")
          .update({ ...payload, clock_out: null, status: "open" })
          .eq("id", existing.id);
        return { id: existing.id as string, error: res.error };
      }
      const res = await (supabase as PendingSchema)
        .from("attendance_entries")
        .insert({
          tenant_id: emp.tenant_id,
          employee_id: emp.id,
          work_date: workDate,
          source: "web",
          status: "open",
          ...payload,
        })
        .select("id")
        .single();
      return { id: res.data?.id as string | undefined, error: res.error };
    };

    let written = await writeEntry(punchFields);
    if (written.error && isUnknownColumnError(written.error)) {
      warnPendingMigration();
      written = await writeEntry(withoutPostMigrationColumns(punchFields));
    }
    if (written.error) throw new Error(written.error.message);
    const entryId = written.id as string;

    if (pendingReview) {
      await queueForReview({
        tenantId: emp.tenant_id,
        employeeId: emp.id,
        userId,
        attendanceEntryId: entryId,
        geofenceId: matchedFenceId,
        eventTime: punch.instant,
        mismatchType: pendingReview.mismatchType,
        details: pendingReview.details,
      });
    }
    if (punch.rejectedClientTime) {
      await queueForReview({
        tenantId: emp.tenant_id,
        employeeId: emp.id,
        userId,
        attendanceEntryId: entryId,
        eventTime: punch.instant,
        mismatchType: "clock_skew",
        details: {
          work_date: workDate,
          skew_seconds: punch.skewSeconds,
          client_time: data?.clientTime,
        },
      });
    }

    return {
      ok: true,
      entryId,
      workDate,
      timeZone,
      localTime: workTimeInZone(punch.instant, timeZone),
      clockIn: nowIso,
      workLocation,
      needsReview,
      reviewReason: reviewReasons.join("; ") || null,
      remote: workLocation === "remote",
    };
  });

// ---------- Clock out ----------
export const clockOut = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    PunchSchema.unwrap()
      .extend({ breakMinutes: z.number().int().min(0).max(720).optional() })
      .partial()
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    const timeZone = await resolveWorkTimeZone(supabase, emp);
    const punch = resolvePunchInstant(data?.clientTime, new Date());
    const workDate = workDateInZone(punch.instant, timeZone);

    // Look for today's open entry, then for yesterday's — an overnight shift
    // clocks out on the following calendar day, and refusing that would leave
    // the entry open forever with no hours on it.
    let { data: entry } = await (supabase as PendingSchema)
      .from("attendance_entries")
      .select("*")
      .eq("employee_id", emp.id)
      .eq("work_date", workDate)
      .maybeSingle();

    if (!entry?.clock_in) {
      const previous = new Date(punch.instant.getTime() - 24 * 60 * 60 * 1000);
      const previousWorkDate = workDateInZone(previous, timeZone);
      const { data: overnight } = await (supabase as PendingSchema)
        .from("attendance_entries")
        .select("*")
        .eq("employee_id", emp.id)
        .eq("work_date", previousWorkDate)
        .is("clock_out", null)
        .maybeSingle();
      if (overnight?.clock_in) entry = overnight;
    }

    if (!entry?.clock_in) throw new Error("Not clocked in");

    const start = new Date(entry.clock_in);
    const breakMin = data?.breakMinutes ?? entry.break_minutes ?? 0;
    const minutes = Math.max(0, (punch.instant.getTime() - start.getTime()) / 60000 - breakMin);
    const hours = Math.round((minutes / 60) * 100) / 100;

    const reviewReasons = entry.review_reason ? [entry.review_reason] : [];
    let needsReview = !!entry.needs_review;
    if (punch.rejectedClientTime) {
      needsReview = true;
      reviewReasons.push(
        `Device clock was ${Math.abs(punch.skewSeconds)}s out at clock-out; server time recorded instead`,
      );
    }

    const update: Record<string, unknown> = {
      clock_out: punch.instant.toISOString(),
      clock_out_recorded_at: new Date().toISOString(),
      clock_out_skew_seconds: data?.clientTime ? punch.skewSeconds : null,
      break_minutes: breakMin,
      hours_worked: hours,
      status: "closed",
      needs_review: needsReview,
      review_reason: reviewReasons.length ? reviewReasons.join("; ") : null,
    };
    if (typeof data?.latitude === "number") update.clock_out_latitude = data.latitude;
    if (typeof data?.longitude === "number") update.clock_out_longitude = data.longitude;
    if (typeof data?.accuracyMeters === "number")
      update.clock_out_accuracy_meters = data.accuracyMeters;

    // Clock-out is recorded but not enforced — someone who has already started a
    // shift should not be trapped on site to end it, and blocking the punch
    // would only produce entries that never close. Where they were is now on
    // the row, so the asymmetry is at least visible to a reviewer.
    if (typeof data?.latitude === "number" && typeof data?.longitude === "number") {
      const { data: fences } = await (supabase as PendingSchema)
        .from("sign_geofences")
        .select("id,name,latitude,longitude,radius_meters,min_accuracy_meters")
        .eq("tenant_id", emp.tenant_id)
        .eq("is_active", true);
      const outcome = evaluateGeofence(fences as GeofenceRow[] | null, {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracyMeters: data.accuracyMeters ?? null,
      });
      if (outcome.kind === "outside") {
        update.clock_out_distance_meters = outcome.distanceMeters;
      } else if ("fenceId" in outcome) {
        update.clock_out_geofence_id = outcome.fenceId;
        update.clock_out_distance_meters = outcome.distanceMeters;
      }
    }

    // Same retry-without-the-new-columns rule as clockIn: an unapplied
    // migration must cost provenance, never the ability to close a shift.
    const applyUpdate = (payload: Record<string, unknown>) =>
      (supabase as PendingSchema).from("attendance_entries").update(payload).eq("id", entry.id);

    let { error } = await applyUpdate(update);
    if (error && isUnknownColumnError(error)) {
      warnPendingMigration();
      ({ error } = await applyUpdate(withoutPostMigrationColumns(update)));
    }
    if (error) throw new Error(error.message);

    if (punch.rejectedClientTime) {
      await queueForReview({
        tenantId: emp.tenant_id,
        employeeId: emp.id,
        userId,
        attendanceEntryId: entry.id,
        eventTime: punch.instant,
        mismatchType: "clock_skew",
        details: {
          work_date: entry.work_date,
          skew_seconds: punch.skewSeconds,
          phase: "clock_out",
        },
      });
    }

    return {
      ok: true,
      hours,
      workDate: entry.work_date,
      timeZone,
      localTime: workTimeInZone(punch.instant, timeZone),
      overnight: entry.work_date !== workDate,
    };
  });

// ---------- Upsert an entry manually (correction) ----------
export const upsertAttendanceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        clockIn: z.string().optional().nullable(),
        clockOut: z.string().optional().nullable(),
        breakMinutes: z.number().int().min(0).max(720).default(0),
        notes: z.string().max(1000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    let hours = 0;
    if (data.clockIn && data.clockOut) {
      const minutes = Math.max(
        0,
        (new Date(data.clockOut).getTime() - new Date(data.clockIn).getTime()) / 60000 -
          data.breakMinutes,
      );
      hours = Math.round((minutes / 60) * 100) / 100;
    }

    const { data: existing } = await (supabase as PendingSchema)
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
      const { error } = await supabase
        .from("attendance_entries")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, entryId: existing.id };
    }
    const { data: ins, error } = await supabase
      .from("attendance_entries")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, entryId: ins.id };
  });

// ---------- Submit timesheet for a period ----------
export const submitTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        notes: z.string().max(1000).optional(),
      })
      .parse(d),
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

    const totalHours = (entries ?? []).reduce(
      (s: number, e: any) => s + Number(e.hours_worked || 0),
      0,
    );

    const { data: tenant } = await admin
      .from("tenants")
      .select("country_code")
      .eq("id", emp.tenant_id)
      .maybeSingle();
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
    const days = Math.max(
      1,
      (new Date(data.periodEnd).getTime() - new Date(data.periodStart).getTime()) / 86400000 + 1,
    );
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
      const { data: ins, error } = await admin
        .from("timesheets")
        .insert(payload)
        .select("id")
        .single();
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
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: userId,
        rejection_reason: null,
      })
      .eq("id", data.timesheetId);
    if (error) throw new Error(error.message);

    const admin = await loadAdmin();
    await admin.from("audit_log").insert({
      actor_id: userId,
      entity_type: "timesheet",
      entity_id: data.timesheetId,
      action: "approve",
    });
    return { ok: true };
  });

export const rejectTimesheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ timesheetId: z.string().uuid(), reason: z.string().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const roles = await getRoles(supabase, userId);
    if (!roles.some((r) => ["manager", "org_admin", "super_admin"].includes(r))) {
      throw new Error("Not authorized");
    }
    const { error } = await supabase
      .from("timesheets")
      .update({
        status: "rejected",
        rejection_reason: data.reason ?? null,
        approved_at: null,
        approved_by: null,
      })
      .eq("id", data.timesheetId);
    if (error) throw new Error(error.message);

    const admin = await loadAdmin();
    await admin.from("audit_log").insert({
      actor_id: userId,
      entity_type: "timesheet",
      entity_id: data.timesheetId,
      action: "reject",
      metadata: { reason: data.reason ?? null },
    });
    return { ok: true };
  });

// ---------- Everything the clock widget needs, in one call ----------
/**
 * One round-trip for the floating widget.
 *
 * The widget renders on every authenticated page, so it must not cost a burst
 * of queries per navigation — that is the mistake the notifications bell made,
 * and it produced a request storm that took a separate fix to unwind. Returning
 * a single shaped payload also keeps the *tenant's* timezone authoritative on
 * the client, so the widget shows the working day the server will actually file
 * the punch against rather than the browser's guess at it.
 */
export const getClockStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    // Platform accounts have no employee row. The widget hides itself rather
    // than showing a broken clock.
    if (!emp) return { hasEmployee: false as const };

    const timeZone = await resolveWorkTimeZone(supabase, emp);
    const now = new Date();
    const workDate = workDateInZone(now, timeZone);

    // Monday-anchored week, computed in the tenant's zone rather than the
    // browser's — a Sunday-evening punch in Sydney belongs to a different week
    // than the same instant does in London.
    const weekStart = new Date(`${workDate}T00:00:00Z`);
    const dow = (weekStart.getUTCDay() + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - dow);
    const weekStartDate = weekStart.toISOString().slice(0, 10);

    const [entryRes, weekRes, fenceRes, wfhRes, pendingWfhRes] = await Promise.all([
      (supabase as PendingSchema)
        .from("attendance_entries")
        // Wide rather than enumerated: several of these columns arrive with
        // migration 20260823060000 and naming them would 42703 until it lands.
        .select("*")
        .eq("employee_id", emp.id)
        .eq("work_date", workDate)
        .maybeSingle(),
      supabase
        .from("attendance_entries")
        .select("hours_worked")
        .eq("employee_id", emp.id)
        .gte("work_date", weekStartDate)
        .lte("work_date", workDate),
      supabase
        .from("sign_geofences")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", emp.tenant_id)
        .eq("is_active", true),
      (supabase as PendingSchema)
        .rpc("has_approved_wfh", { _employee_id: emp.id, _work_date: workDate })
        .then(
          (r: PendingSchema) => r,
          () => ({ data: null }),
        ),
      (supabase as PendingSchema)
        .from("wfh_requests")
        .select("id,start_date,end_date,status")
        .eq("employee_id", emp.id)
        .in("status", ["pending", "approved"])
        .gte("end_date", workDate)
        .order("start_date")
        .limit(5)
        .then(
          (r: PendingSchema) => r,
          () => ({ data: [] }),
        ),
    ]);

    const entry = (entryRes?.data ?? null) as PendingSchema;
    const weekHours = (weekRes?.data ?? []).reduce(
      (s: number, e: PendingSchema) => s + Number(e.hours_worked || 0),
      0,
    );

    return {
      hasEmployee: true as const,
      employeeId: emp.id as string,
      employeeName: `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim(),
      timeZone,
      workDate,
      localTime: workTimeInZone(now, timeZone),
      serverNow: now.toISOString(),
      entry: entry
        ? {
            id: entry.id as string,
            clockIn: entry.clock_in as string | null,
            clockOut: entry.clock_out as string | null,
            breakMinutes: Number(entry.break_minutes ?? 0),
            hoursWorked: Number(entry.hours_worked ?? 0),
            status: entry.status as string,
            workLocation: (entry.work_location ?? null) as string | null,
            needsReview: !!entry.needs_review,
            reviewReason: (entry.review_reason ?? null) as string | null,
          }
        : null,
      weekHours: Math.round(weekHours * 100) / 100,
      // Drives whether the widget asks the browser for a position at all. No
      // fences means no reason to prompt for a permission we will not use.
      geofenceCount: (fenceRes as PendingSchema)?.count ?? 0,
      approvedWfhToday: wfhRes?.data === true,
      upcomingWfh: ((pendingWfhRes?.data ?? []) as PendingSchema[]).map((w) => ({
        id: w.id as string,
        startDate: w.start_date as string,
        endDate: w.end_date as string,
        status: w.status as string,
      })),
    };
  });

// ---------- Break time on the open entry ----------
export const setBreakMinutes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ breakMinutes: z.number().int().min(0).max(720) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const emp = await getEmployeeForUser(supabase, userId);
    if (!emp) throw new Error("No employee record");

    const timeZone = await resolveWorkTimeZone(supabase, emp);
    const workDate = workDateInZone(new Date(), timeZone);

    const { data: entry } = await supabase
      .from("attendance_entries")
      .select("id,clock_in,clock_out,hours_worked")
      .eq("employee_id", emp.id)
      .eq("work_date", workDate)
      .maybeSingle();
    if (!entry?.clock_in) throw new Error("Not clocked in today");

    // Recompute hours when the shift is already closed, otherwise the break
    // would be recorded and silently not deducted.
    const update: Record<string, unknown> = { break_minutes: data.breakMinutes };
    if (entry.clock_out) {
      const minutes = Math.max(
        0,
        (new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()) / 60000 -
          data.breakMinutes,
      );
      update.hours_worked = Math.round((minutes / 60) * 100) / 100;
    }

    const { error } = await supabase
      .from("attendance_entries")
      .update(update as PendingSchema)
      .eq("id", entry.id);
    if (error) throw new Error(error.message);
    return { ok: true, breakMinutes: data.breakMinutes, hours: update.hours_worked ?? null };
  });
