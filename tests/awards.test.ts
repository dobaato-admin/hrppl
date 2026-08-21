import { describe, it, expect } from "vitest";

// Pure logic: pick the active rate row from a list given a date.
// Mirrors public.award_rate_on() in the DB.
type Rate = { effective_from: string; effective_to: string | null; hourly_rate: number; is_active: boolean };

function pickActiveRate(rates: Rate[], on: string): Rate | null {
  const candidates = rates
    .filter((r) => r.is_active)
    .filter((r) => r.effective_from <= on)
    .filter((r) => r.effective_to === null || r.effective_to >= on)
    .sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1));
  return candidates[0] ?? null;
}

describe("award_rate_on picker", () => {
  const rates: Rate[] = [
    { effective_from: "2024-07-01", effective_to: "2025-06-30", hourly_rate: 24.10, is_active: true },
    { effective_from: "2025-07-01", effective_to: null, hourly_rate: 25.50, is_active: true },
    { effective_from: "2023-07-01", effective_to: "2024-06-30", hourly_rate: 23.00, is_active: true },
  ];

  it("returns the FY24/25 rate mid-year", () => {
    expect(pickActiveRate(rates, "2024-10-15")?.hourly_rate).toBe(24.10);
  });

  it("returns the current open-ended rate after 1 Jul 2025", () => {
    expect(pickActiveRate(rates, "2026-01-01")?.hourly_rate).toBe(25.50);
  });

  it("returns null before any rate exists", () => {
    expect(pickActiveRate(rates, "2022-01-01")).toBeNull();
  });

  it("ignores inactive rows", () => {
    const r = pickActiveRate(
      [{ effective_from: "2025-07-01", effective_to: null, hourly_rate: 99, is_active: false }],
      "2026-01-01",
    );
    expect(r).toBeNull();
  });
});
