import { describe, it, expect } from "vitest";

/** Pure logic mirroring the audit's shortfall calc. */
function computeShortfall(
  baseEarnings: number, hours: number,
  awardHourly: number, casual: boolean, casualLoadingPct = 25,
) {
  if (hours <= 0 || baseEarnings <= 0 || awardHourly <= 0) return null;
  const paidRate = baseEarnings / hours;
  const effectiveAward = awardHourly * (1 + (casual ? casualLoadingPct : 0) / 100);
  if (paidRate + 0.0001 >= effectiveAward) return null;
  return {
    paidRate,
    awardRate: effectiveAward,
    shortfallPerHour: effectiveAward - paidRate,
    shortfallTotal: (effectiveAward - paidRate) * hours,
  };
}

describe("minimum-wage shortfall calc", () => {
  it("returns null when paid at or above award", () => {
    expect(computeShortfall(1000, 38, 25.5, false)).toBeNull();
  });

  it("flags underpayment for permanent staff", () => {
    const r = computeShortfall(900, 38, 25.5, false)!;
    expect(r.paidRate).toBeCloseTo(23.6842, 3);
    expect(r.awardRate).toBeCloseTo(25.5, 3);
    expect(r.shortfallTotal).toBeCloseTo((25.5 - 900 / 38) * 38, 2);
  });

  it("applies 25% casual loading", () => {
    // 25.5 * 1.25 = 31.875 → 25.0/h paid is short
    const r = computeShortfall(950, 38, 25.5, true)!;
    expect(r.awardRate).toBeCloseTo(31.875, 3);
    expect(r.shortfallPerHour).toBeGreaterThan(0);
  });
});

/** SLA sweep: only flips pending rows past due date. */
function shouldSweep(status: string, dueDate: string, today: string) {
  return ["pending", "queued", "scheduled", "draft"].includes(status)
    && dueDate < today;
}

describe("super SLA sweep predicate", () => {
  it("flips pending past-due", () => {
    expect(shouldSweep("pending", "2026-06-01", "2026-06-14")).toBe(true);
  });
  it("ignores already paid", () => {
    expect(shouldSweep("paid", "2026-06-01", "2026-06-14")).toBe(false);
  });
  it("ignores future-due", () => {
    expect(shouldSweep("pending", "2026-06-20", "2026-06-14")).toBe(false);
  });
});
