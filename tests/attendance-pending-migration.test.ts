/**
 * Clocking in must survive its own migration not being applied yet.
 *
 * 20260823060000 adds the provenance columns (work_timezone, work_location,
 * needs_review, the skew and accuracy fields). Deploying the code before the
 * migration lands would otherwise fail every punch with a PostgREST 42703 —
 * "column does not exist" — which is a far worse outcome than losing those
 * fields for one deploy window. Nobody being able to start work is not a
 * degradation, it is an outage.
 *
 * So the writes retry once without the new columns. These pin the two pieces
 * that decision rests on.
 */
import { describe, it, expect } from "vitest";
import { isUnknownColumnError, withoutPostMigrationColumns } from "@/lib/attendance.functions";

describe("isUnknownColumnError", () => {
  it("recognises Postgres 42703", () => {
    expect(
      isUnknownColumnError({
        code: "42703",
        message: 'column "work_timezone" of relation "attendance_entries" does not exist',
      }),
    ).toBe(true);
  });

  it("recognises PostgREST's own schema-cache miss", () => {
    // PostgREST answers PGRST204 when its cached schema predates the migration,
    // which happens even after the DDL has run until the cache reloads.
    expect(
      isUnknownColumnError({
        code: "PGRST204",
        message: "Could not find the 'needs_review' column of 'attendance_entries'",
      }),
    ).toBe(true);
  });

  it("does not treat an RLS refusal as a missing column", () => {
    // Retrying without the provenance columns would not help here, and doing so
    // would turn a permission failure into a silently degraded write.
    expect(
      isUnknownColumnError({
        code: "42501",
        message: "new row violates row-level security policy",
      }),
    ).toBe(false);
  });

  it("does not treat a unique violation as a missing column", () => {
    expect(isUnknownColumnError({ code: "23505", message: "duplicate key value" })).toBe(false);
  });

  it("handles null and undefined", () => {
    expect(isUnknownColumnError(null)).toBe(false);
    expect(isUnknownColumnError(undefined)).toBe(false);
  });
});

describe("withoutPostMigrationColumns", () => {
  const payload = {
    clock_in: "2026-08-23T04:00:00.000Z",
    clock_in_latitude: 27.7172,
    clock_in_longitude: 85.324,
    clock_in_geofence_id: "fence-1",
    clock_in_distance_meters: 42,
    // Everything below arrives with 20260823060000.
    work_timezone: "Asia/Kathmandu",
    work_location: "office",
    needs_review: true,
    review_reason: "Low accuracy",
    clock_in_recorded_at: "2026-08-23T04:00:02.000Z",
    clock_in_skew_seconds: -2,
    clock_in_accuracy_meters: 400,
  };

  it("keeps the punch itself", () => {
    // The whole point: the shift is still recorded, at the right instant, with
    // the coordinates and the fence match that already had columns.
    const out = withoutPostMigrationColumns(payload);
    expect(out).toEqual({
      clock_in: "2026-08-23T04:00:00.000Z",
      clock_in_latitude: 27.7172,
      clock_in_longitude: 85.324,
      clock_in_geofence_id: "fence-1",
      clock_in_distance_meters: 42,
    });
  });

  it("drops every column the migration introduces", () => {
    const out = withoutPostMigrationColumns(payload);
    for (const key of [
      "work_timezone",
      "work_location",
      "needs_review",
      "review_reason",
      "clock_in_recorded_at",
      "clock_in_skew_seconds",
      "clock_in_accuracy_meters",
    ]) {
      expect(out).not.toHaveProperty(key);
    }
  });

  it("leaves a payload with no new columns untouched", () => {
    const plain = { break_minutes: 30, hours_worked: 7.5 };
    expect(withoutPostMigrationColumns(plain)).toEqual(plain);
  });

  it("preserves falsy values it keeps", () => {
    // `0` and `false` are meaningful here — a zero break is not a missing one.
    const out = withoutPostMigrationColumns({ break_minutes: 0, clock_out: null });
    expect(out).toEqual({ break_minutes: 0, clock_out: null });
  });
});
