/**
 * Per-tenant reminder cron scheduling tests.
 *
 * Re-implements the SQL logic from public.tenants_due_for_reminder_now() in
 * pure JS and validates it across:
 *   - multiple timezones (Sydney, NYC, London, Kathmandu, Honolulu)
 *   - DST boundaries (US spring-forward, AU autumn fall-back)
 *   - mixed reminder_local_hour values per tenant
 *
 * Mirrors:
 *   EXTRACT(HOUR FROM (now() AT TIME ZONE COALESCE(t.timezone, 'UTC')))
 *     = COALESCE(_target_hour, t.reminder_local_hour)
 */
import { describe, it, expect } from "vitest";

type Tenant = { id: string; timezone: string; reminder_local_hour: number };

function localHour(nowUtc: Date, tz: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "numeric", hour12: false,
  });
  // Intl returns "24" for midnight in some impls; normalize to 0..23.
  const h = Number(fmt.format(nowUtc));
  return h === 24 ? 0 : h;
}

function tenantsDueNow(tenants: Tenant[], nowUtc: Date, targetHour?: number): string[] {
  return tenants
    .filter((t) => localHour(nowUtc, t.timezone) === (targetHour ?? t.reminder_local_hour))
    .map((t) => t.id);
}

const tenants: Tenant[] = [
  { id: "sydney", timezone: "Australia/Sydney", reminder_local_hour: 9 },
  { id: "nyc", timezone: "America/New_York", reminder_local_hour: 9 },
  { id: "london", timezone: "Europe/London", reminder_local_hour: 9 },
  { id: "kathmandu", timezone: "Asia/Kathmandu", reminder_local_hour: 9 }, // +5:45
  { id: "honolulu", timezone: "Pacific/Honolulu", reminder_local_hour: 8 }, // no DST
];

describe("per-tenant reminder cron — multi-timezone gating", () => {
  it("fires Sydney tenant when its 09:00 local time arrives (winter)", () => {
    // 2026-07-01 09:00 AEST = 23:00 UTC the previous day (UTC+10, no DST)
    const due = tenantsDueNow(tenants, new Date("2026-06-30T23:00:00Z"));
    expect(due).toContain("sydney");
    expect(due).not.toContain("nyc");
  });

  it("fires NYC tenant at 09:00 EDT during US daylight saving", () => {
    // 2026-07-01 09:00 EDT = 13:00 UTC (UTC-4)
    const due = tenantsDueNow(tenants, new Date("2026-07-01T13:00:00Z"));
    expect(due).toContain("nyc");
  });

  it("fires London tenant at 09:00 BST during UK daylight saving", () => {
    // 2026-07-01 09:00 BST = 08:00 UTC (UTC+1)
    const due = tenantsDueNow(tenants, new Date("2026-07-01T08:00:00Z"));
    expect(due).toContain("london");
  });

  it("handles US spring-forward DST boundary (2026-03-08 02:00 -> 03:00)", () => {
    // Day after spring-forward in NYC: 09:00 EDT = 13:00 UTC
    const dueAfter = tenantsDueNow(tenants, new Date("2026-03-09T13:00:00Z"));
    expect(dueAfter).toContain("nyc");
    // Day before spring-forward, NYC is still EST (UTC-5): 09:00 EST = 14:00 UTC
    const dueBefore = tenantsDueNow(tenants, new Date("2026-03-07T14:00:00Z"));
    expect(dueBefore).toContain("nyc");
    // At 13:00 UTC the day before, NYC is at 08:00 EST — must NOT fire 9am job
    const tooEarly = tenantsDueNow(tenants, new Date("2026-03-07T13:00:00Z"));
    expect(tooEarly).not.toContain("nyc");
  });

  it("handles AU autumn fall-back (Sydney 2026-04-05 03:00 -> 02:00)", () => {
    // Before fall-back on Apr 4 (AEDT, UTC+11): 09:00 local = 22:00 UTC Apr 3
    const dstDue = tenantsDueNow(tenants, new Date("2026-04-03T22:00:00Z"));
    expect(dstDue).toContain("sydney");
    // After fall-back on Apr 5 (AEST, UTC+10): 09:00 local = 23:00 UTC Apr 4
    const stdDue = tenantsDueNow(tenants, new Date("2026-04-04T23:00:00Z"));
    expect(stdDue).toContain("sydney");
  });

  it("supports half-hour offset timezones (Kathmandu UTC+5:45)", () => {
    // 09:00 NPT = 03:15 UTC; cron fires hourly, so at 03:00 UTC Kathmandu hour is 8 (not due),
    // at 04:00 UTC Kathmandu hour is 9 -> due.
    expect(tenantsDueNow(tenants, new Date("2026-06-01T03:00:00Z"))).not.toContain("kathmandu");
    expect(tenantsDueNow(tenants, new Date("2026-06-01T04:00:00Z"))).toContain("kathmandu");
  });

  it("honors per-tenant custom reminder_local_hour (Honolulu at 08:00)", () => {
    // 08:00 HST = 18:00 UTC (UTC-10, no DST)
    expect(tenantsDueNow(tenants, new Date("2026-07-01T18:00:00Z"))).toContain("honolulu");
    expect(tenantsDueNow(tenants, new Date("2026-07-01T19:00:00Z"))).not.toContain("honolulu");
  });

  it("returns empty when no tenant's local hour matches", () => {
    // Pick a UTC time when none of these tenants are at their target hour.
    // 2026-07-01 06:00 UTC: Sydney=16, NYC=02, London=07, Kathmandu=11:45->11, Honolulu=20
    expect(tenantsDueNow(tenants, new Date("2026-07-01T06:00:00Z"))).toEqual([]);
  });
});
