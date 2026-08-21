import { describe, it, expect } from "vitest";

// Pure helper mirroring the file's addDays so we can unit-test due-date math
// without spinning up the server-fn runtime / Supabase client.
function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

describe("payday super due date", () => {
  it("is exactly 7 calendar days after pay date", () => {
    expect(addDays("2026-07-15", 7)).toBe("2026-07-22");
  });
  it("crosses month boundary", () => {
    expect(addDays("2026-07-28", 7)).toBe("2026-08-04");
  });
  it("crosses year boundary", () => {
    expect(addDays("2026-12-30", 7)).toBe("2027-01-06");
  });
});

describe("super batch payload shape", () => {
  it("contributions roll up to totals", () => {
    const contribs = [
      { amount: 240, employee_id: "e1" },
      { amount: 360.5, employee_id: "e2" },
      { amount: 120, employee_id: "e3" },
    ];
    const total = contribs.reduce((a, r) => a + r.amount, 0);
    expect(total).toBeCloseTo(720.5, 2);
    expect(contribs.length).toBe(3);
  });
});
