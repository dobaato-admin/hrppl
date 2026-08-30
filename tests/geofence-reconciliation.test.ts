/**
 * The 24h reconciliation cron (doReconcile) never knew about the WFH
 * exception: it correlates every attendance punch against background
 * geofence captures and flags `no_geofence_for_punch` whenever none is found
 * nearby. A remote (approved-WFH) punch is exactly the class least likely to
 * have one — the whole point of the day is not being near a fence — so every
 * WFH punch this cron ever saw was re-flagged a second time, on top of the
 * correct `wfh_outside_fence`/`accuracy_low` row already written at punch
 * time by clockIn/clockOut. This pins that a remote-tagged punch is now
 * skipped, and that an ordinary on-site punch with a genuine gap is still
 * caught — the fix must not blunt the real detection.
 */
import { describe, it, expect } from "vitest";
import { doReconcile } from "@/lib/geofence-reconciliation.functions";

type Row = Record<string, any>;

/** Minimal chainable mock: .from(t).select().eq().gte().in() resolves to an array; .insert() records what was written. */
function makeFakeSupabase(tables: Record<string, Row[]>) {
  const inserted: Record<string, Row[]> = {};
  function query(table: string) {
    const filters: Array<(r: Row) => boolean> = [];
    const chain: any = {
      select() { return chain; },
      eq(col: string, val: any) { filters.push((r) => r[col] === val); return chain; },
      gte(col: string, val: any) { filters.push((r) => r[col] >= val); return chain; },
      in(col: string, vals: any[]) { filters.push((r) => vals.includes(r[col])); return chain; },
      insert(rows: Row[]) {
        inserted[table] = (inserted[table] ?? []).concat(rows);
        return Promise.resolve({ data: rows, error: null });
      },
      then(onFulfilled: any) {
        const rows = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
        return Promise.resolve({ data: rows, error: null }).then(onFulfilled);
      },
    };
    return chain;
  }
  return { from: (t: string) => query(t), _inserted: inserted };
}

const TENANT = "tenant-1";
const NOW = new Date("2026-08-30T10:00:00.000Z");

describe("doReconcile — WFH-tagged punches", () => {
  it("does not flag a remote punch with no nearby geofence capture", async () => {
    const sb = makeFakeSupabase({
      geofence_audit_log: [],
      attendance_entries: [
        {
          id: "entry-1", tenant_id: TENANT, source: "web",
          clock_in: NOW.toISOString(), created_at: NOW.toISOString(),
          clock_in_latitude: 27.7, clock_in_longitude: 85.3,
          clock_in_geofence_id: null, clock_in_distance_meters: null,
          work_location: "remote",
        },
      ],
      sign_geofences: [],
      geofence_reconciliation: [],
    });

    const result = await doReconcile(sb, TENANT, 24);

    expect(result.created).toBe(0);
    expect((sb as any)._inserted.geofence_reconciliation ?? []).toHaveLength(0);
  });

  it("still flags an ordinary on-site punch with no nearby geofence capture", async () => {
    // Same shape, but not a WFH day — the fix must not blunt real detection.
    const sb = makeFakeSupabase({
      geofence_audit_log: [],
      attendance_entries: [
        {
          id: "entry-2", tenant_id: TENANT, source: "web",
          clock_in: NOW.toISOString(), created_at: NOW.toISOString(),
          clock_in_latitude: 27.7, clock_in_longitude: 85.3,
          clock_in_geofence_id: null, clock_in_distance_meters: null,
          work_location: "office",
        },
      ],
      sign_geofences: [],
      geofence_reconciliation: [],
    });

    const result = await doReconcile(sb, TENANT, 24);

    expect(result.created).toBe(1);
    const rows = (sb as any)._inserted.geofence_reconciliation ?? [];
    expect(rows).toHaveLength(1);
    expect(rows[0].mismatch_type).toBe("no_geofence_for_punch");
    expect(rows[0].attendance_entry_id).toBe("entry-2");
  });

  it("also skips a remote punch that happens to carry a geofence id (an approved WFH day that was still inside a fence)", () => {
    // work_location is set to "remote" for every approved-WFH-day punch
    // regardless of inside/outside, per clockIn — the skip must key off that
    // flag, not off whether a fence id happens to be present.
    return doReconcile(
      makeFakeSupabase({
        geofence_audit_log: [],
        attendance_entries: [
          {
            id: "entry-3", tenant_id: TENANT, source: "web",
            clock_in: NOW.toISOString(), created_at: NOW.toISOString(),
            clock_in_latitude: 27.7, clock_in_longitude: 85.3,
            clock_in_geofence_id: "fence-1", clock_in_distance_meters: 10,
            work_location: "remote",
          },
        ],
        sign_geofences: [{ id: "fence-1", tenant_id: TENANT, latitude: 27.7, longitude: 85.3, radius_meters: 150 }],
        geofence_reconciliation: [],
      }),
      TENANT,
      24,
    ).then((result) => {
      expect(result.created).toBe(0);
    });
  });
});
