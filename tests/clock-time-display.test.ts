/**
 * T24 — "clocked in at 23:50, displayed as 13:50."
 *
 * Ten hours exactly, which is the AEST offset. The instant was stored
 * correctly; what was wrong was reading it back. The page rendered punches
 * with
 *
 *     new Date(iso).toLocaleTimeString([])
 *
 * which renders in whatever zone the *renderer* is in — the browser for a
 * hydrated page, a UTC server under SSR, and the wrong zone entirely for
 * anybody looking at a colleague's punch from another country.
 *
 * The editing half was worse, because it wrote rather than displayed:
 *
 *     new Date(`${workDate}T${hhmm}:00`)
 *
 * parses a wall-clock reading as browser-local, so saving a row without
 * touching it moved the punch by the offset difference.
 *
 * The client's position is that hours worked is what matters. It is also the
 * one figure a zone cannot corrupt — a difference between two instants shifts
 * at both ends — which is exactly why the display has to be fixed anyway: a
 * punch rendered in the wrong zone can land on the wrong calendar day, and
 * hours then land in the wrong pay period while remaining individually right.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  instantFromZonedWallTime,
  workTimeInZone,
  workDateInZone,
  hoursWorked,
  zoneOffsetMinutes,
} from "@/lib/work-date";

const SYDNEY = "Australia/Sydney";
const KATHMANDU = "Asia/Kathmandu";
const NEW_YORK = "America/New_York";

describe("instantFromZonedWallTime", () => {
  it("round-trips a wall-clock reading through its own zone", () => {
    for (const zone of [SYDNEY, KATHMANDU, NEW_YORK, "UTC"]) {
      const instant = instantFromZonedWallTime("2026-03-15", "23:50", zone);
      expect(workTimeInZone(instant, zone)).toBe("23:50");
      expect(workDateInZone(instant, zone)).toBe("2026-03-15");
    }
  });

  it("reproduces the reported case: 23:50 AEST is not 13:50 to the employee", () => {
    const instant = instantFromZonedWallTime("2026-06-01", "23:50", SYDNEY);
    // Stored as a real instant — 13:50 UTC, which is what was being shown.
    expect(instant.toISOString()).toBe("2026-06-01T13:50:00.000Z");
    // And read back in the zone it was taken in, it is 23:50 again.
    expect(workTimeInZone(instant, SYDNEY)).toBe("23:50");
    expect(workTimeInZone(instant, "UTC")).toBe("13:50");
  });

  it("handles a sub-hour offset — Nepal is +05:45, not +5 or +6", () => {
    expect(zoneOffsetMinutes(new Date("2026-06-01T00:00:00Z"), KATHMANDU)).toBe(345);
    const instant = instantFromZonedWallTime("2026-06-01", "00:30", KATHMANDU);
    expect(instant.toISOString()).toBe("2026-05-31T18:45:00.000Z");
    expect(workTimeInZone(instant, KATHMANDU)).toBe("00:30");
  });

  it("uses the offset in force at that instant, not a fixed one", () => {
    // New York is -05:00 in January and -04:00 in July. A hard-coded offset
    // would put one of these an hour out.
    const winter = instantFromZonedWallTime("2026-01-15", "09:00", NEW_YORK);
    const summer = instantFromZonedWallTime("2026-07-15", "09:00", NEW_YORK);
    expect(winter.toISOString()).toBe("2026-01-15T14:00:00.000Z");
    expect(summer.toISOString()).toBe("2026-07-15T13:00:00.000Z");
  });

  it("resolves correctly right after a DST transition", () => {
    // 2026-03-08 02:00 is when New York springs forward. 03:00 that morning
    // is the first reading on the new offset, and a single-pass solver that
    // read the offset at the pre-corrected guess would land an hour out.
    const after = instantFromZonedWallTime("2026-03-08", "03:00", NEW_YORK);
    expect(workTimeInZone(after, NEW_YORK)).toBe("03:00");
    const before = instantFromZonedWallTime("2026-03-08", "01:00", NEW_YORK);
    expect(workTimeInZone(before, NEW_YORK)).toBe("01:00");
  });

  it("falls back rather than throwing on an unrecognised zone", () => {
    // tenants.timezone is free text. A typo must not stop a workforce being
    // shown their own hours.
    const instant = instantFromZonedWallTime("2026-06-01", "09:00", "Not/AZone");
    expect(instant.toISOString()).toBe("2026-06-01T09:00:00.000Z");
  });

  it("refuses an unparseable date or time rather than inventing an instant", () => {
    expect(() => instantFromZonedWallTime("", "09:00", SYDNEY)).toThrow();
    expect(() => instantFromZonedWallTime("2026-06-01", "", SYDNEY)).toThrow();
  });
});

describe("hoursWorked", () => {
  it("is unaffected by the zone the punches were taken in", () => {
    const zones = [SYDNEY, KATHMANDU, NEW_YORK, "UTC"];
    const results = zones.map((z) =>
      hoursWorked(
        instantFromZonedWallTime("2026-06-01", "09:00", z),
        instantFromZonedWallTime("2026-06-01", "17:30", z),
        30,
      ),
    );
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe(8);
  });

  it("spans midnight, which is where the wrong zone did its damage", () => {
    const inAt = instantFromZonedWallTime("2026-06-01", "23:50", SYDNEY);
    const outAt = instantFromZonedWallTime("2026-06-02", "07:50", SYDNEY);
    expect(hoursWorked(inAt, outAt, 0)).toBe(8);
  });

  it("returns null when the shift is still open — not zero", () => {
    // Zero hours and "hasn't clocked out" are different facts, and a timesheet
    // that reports the second as the first understates pay.
    expect(hoursWorked("2026-06-01T09:00:00Z", null)).toBeNull();
    expect(hoursWorked(null, "2026-06-01T17:00:00Z")).toBeNull();
  });

  it("never returns a negative, and subtracts the break", () => {
    expect(hoursWorked("2026-06-01T17:00:00Z", "2026-06-01T09:00:00Z")).toBe(0);
    expect(hoursWorked("2026-06-01T09:00:00Z", "2026-06-01T10:00:00Z", 90)).toBe(0);
    expect(hoursWorked("2026-06-01T09:00:00Z", "2026-06-01T12:00:00Z", 15)).toBe(2.75);
  });

  it("ignores a nonsensical negative break rather than inflating hours", () => {
    expect(hoursWorked("2026-06-01T09:00:00Z", "2026-06-01T10:00:00Z", -600)).toBe(1);
  });
});

describe("the attendance page reads and writes in the recorded zone", () => {
  const src = readFileSync("src/routes/attendance.tsx", "utf8");

  it("no longer renders a punch with toLocaleTimeString", () => {
    expect(src).not.toMatch(/clock_in[\s\S]{0,80}toLocaleTimeString/);
    expect(src).not.toMatch(/const fmtTime[^\n]*toLocaleTimeString/);
  });

  it("no longer builds an instant by parsing a wall-clock string as local", () => {
    expect(src).not.toMatch(/new Date\(`\$\{ds\}T\$\{clock/);
    expect(src).toMatch(/instantFromZonedWallTime\(ds, clockInStr, zone\)/);
  });

  it("does not read the row's zone back from the tenant", () => {
    // work_timezone is stamped per row on purpose: correcting a tenant's
    // timezone setting must not retroactively move historical shifts.
    expect(src).toMatch(/work_timezone/);
    expect(src).toMatch(/function zoneOf/);
  });

  it("tells the reader which zone the times are in", () => {
    expect(src).toMatch(/time zone each punch was recorded in/);
    expect(src).toMatch(/not affected by time zones/);
  });
});
