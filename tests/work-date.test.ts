/**
 * The date arithmetic behind attendance.
 *
 * Attendance was filing punches against the wrong calendar day, and the reason
 * was `new Date().toISOString().slice(0, 10)` — today in UTC, not today where
 * the employee is. These cases pin the specific offsets that broke it, and the
 * DST behaviour the platform needs before it takes a tenant in a zone that
 * observes it.
 */
import { describe, it, expect } from "vitest";
import {
  workDateInZone,
  workTimeInZone,
  zoneOffsetMinutes,
  localYmd,
  resolveTimeZone,
  isValidTimeZone,
  resolvePunchInstant,
  CLOCK_SKEW_TOLERANCE_MS,
  FALLBACK_TIME_ZONE,
} from "@/lib/work-date";

describe("workDateInZone", () => {
  it("keeps an early Kathmandu shift on the same local day", () => {
    // 05:00 on the 23rd in Kathmandu (UTC+05:45) is 23:15 on the 22nd UTC.
    // The old code filed this against the 22nd — a whole day of pay on the
    // wrong date, and outside the timesheet period at a week boundary.
    const instant = new Date("2026-08-22T23:15:00Z");
    expect(instant.toISOString().slice(0, 10)).toBe("2026-08-22"); // the old answer
    expect(workDateInZone(instant, "Asia/Kathmandu")).toBe("2026-08-23");
  });

  it("keeps a late New York shift on the same local day", () => {
    // 20:00 on the 22nd in New York (UTC-04:00 in August) is 00:00 on the 23rd
    // UTC — the T+1 direction of the same bug.
    const instant = new Date("2026-08-23T00:00:00Z");
    expect(instant.toISOString().slice(0, 10)).toBe("2026-08-23"); // the old answer
    expect(workDateInZone(instant, "America/New_York")).toBe("2026-08-22");
  });

  it("agrees with UTC when the tenant is on UTC", () => {
    const instant = new Date("2026-08-22T23:15:00Z");
    expect(workDateInZone(instant, "UTC")).toBe("2026-08-22");
  });

  it("falls back rather than throwing on an unusable zone", () => {
    // tenants.timezone is free text with a literal 'UTC' default, so a typo is
    // reachable. It must not be able to stop a workforce clocking in.
    const instant = new Date("2026-08-22T23:15:00Z");
    expect(workDateInZone(instant, "Mars/Olympus_Mons")).toBe("2026-08-22");
  });

  it("rejects an unparseable instant", () => {
    expect(() => workDateInZone("not-a-date", "UTC")).toThrow(/invalid instant/);
  });
});

describe("daylight saving", () => {
  it("tracks the offset change across a DST boundary", () => {
    // Same zone, same wall-clock hour, six months apart.
    const jan = new Date("2026-01-15T12:00:00Z");
    const jul = new Date("2026-07-15T12:00:00Z");
    expect(zoneOffsetMinutes(jan, "America/New_York")).toBe(-300); // EST
    expect(zoneOffsetMinutes(jul, "America/New_York")).toBe(-240); // EDT
  });

  it("handles the sub-hour offsets that trip naive implementations", () => {
    // Nepal is +5:45, not +5 or +6, and observes no DST — so it is constant
    // across the year while New York is not.
    const jan = new Date("2026-01-15T12:00:00Z");
    const jul = new Date("2026-07-15T12:00:00Z");
    expect(zoneOffsetMinutes(jan, "Asia/Kathmandu")).toBe(345);
    expect(zoneOffsetMinutes(jul, "Asia/Kathmandu")).toBe(345);
  });

  it("puts the local date on the right side of a spring-forward night", () => {
    // 02:00 local on 2026-03-08 does not exist in New York; 07:00 UTC is 02:00
    // EST which the clock skips to 03:00 EDT. Either way it is still the 8th.
    const instant = new Date("2026-03-08T07:30:00Z");
    expect(workDateInZone(instant, "America/New_York")).toBe("2026-03-08");
  });

  it("reads the wall clock, not the UTC hour", () => {
    const instant = new Date("2026-08-22T23:15:00Z");
    expect(workTimeInZone(instant, "Asia/Kathmandu")).toBe("05:00");
    expect(workTimeInZone(instant, "UTC")).toBe("23:15");
  });
});

describe("resolveTimeZone", () => {
  it("prefers the first usable candidate", () => {
    expect(resolveTimeZone("Asia/Kathmandu", "Australia/Sydney")).toBe("Asia/Kathmandu");
  });

  it("skips past null, empty and invalid entries", () => {
    // The real call is branch → tenant → undefined, and branch timezone is
    // nullable.
    expect(resolveTimeZone(null, "", "Australia/Sydney")).toBe("Australia/Sydney");
    expect(resolveTimeZone("Nowhere/Nothing", "Australia/Sydney")).toBe("Australia/Sydney");
  });

  it("falls back to UTC when nothing is usable", () => {
    expect(resolveTimeZone(null, undefined)).toBe(FALLBACK_TIME_ZONE);
  });

  it("recognises real zones and rejects invented ones", () => {
    expect(isValidTimeZone("Asia/Kathmandu")).toBe(true);
    expect(isValidTimeZone("Middle/Earth")).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
  });
});

describe("localYmd", () => {
  it("does not shift the date the way toISOString does", () => {
    // A local-midnight Date. toISOString() converts to UTC first, which for any
    // positive offset lands on the previous day — this is what shifted every
    // column of the attendance week grid.
    const d = new Date(2026, 7, 23, 0, 0, 0); // 23 Aug 2026, local
    expect(localYmd(d)).toBe("2026-08-23");
  });

  it("pads single-digit months and days", () => {
    expect(localYmd(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("resolvePunchInstant", () => {
  const server = new Date("2026-08-23T04:00:00Z");

  it("uses the device's moment when the clocks agree", () => {
    // The point of the whole exercise: the stored time is when the button was
    // pressed, not when the round-trip finished.
    const client = new Date(server.getTime() - 2_400).toISOString();
    const r = resolvePunchInstant(client, server);
    expect(r.instant.toISOString()).toBe(client);
    expect(r.rejectedClientTime).toBe(false);
    expect(r.skewSeconds).toBe(-2);
  });

  it("ignores a device clock that is too far out, but records how far", () => {
    const client = new Date(server.getTime() - 45 * 60_000).toISOString();
    const r = resolvePunchInstant(client, server);
    expect(r.instant).toBe(server);
    expect(r.rejectedClientTime).toBe(true);
    expect(r.skewSeconds).toBe(-2700);
  });

  it("ignores a device clock running ahead", () => {
    // Backdating is the obvious abuse, but forward-dating a clock-out is worth
    // the same amount and must be caught by the same rule.
    const client = new Date(server.getTime() + 90 * 60_000).toISOString();
    const r = resolvePunchInstant(client, server);
    expect(r.instant).toBe(server);
    expect(r.rejectedClientTime).toBe(true);
    expect(r.skewSeconds).toBe(5400);
  });

  it("treats the tolerance boundary as acceptable", () => {
    const client = new Date(server.getTime() - CLOCK_SKEW_TOLERANCE_MS).toISOString();
    expect(resolvePunchInstant(client, server).rejectedClientTime).toBe(false);
  });

  it("falls back to server time when the client sends nothing", () => {
    const r = resolvePunchInstant(undefined, server);
    expect(r.instant).toBe(server);
    expect(r.skewSeconds).toBe(0);
    expect(r.rejectedClientTime).toBe(false);
  });

  it("falls back and flags when the client sends garbage", () => {
    const r = resolvePunchInstant("yesterday afternoon", server);
    expect(r.instant).toBe(server);
    expect(r.rejectedClientTime).toBe(true);
  });
});
