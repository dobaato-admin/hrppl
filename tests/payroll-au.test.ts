import { describe, it, expect } from "vitest";
import {
  computeOTE,
  computeSG,
  computePAYG,
  computeAuPeriod,
  type PayLine,
} from "../src/lib/payroll-au";

const ordinary: PayLine = {
  code: "BASE",
  amount: 2000,
  stp2_category: "gross",
  ote_eligible: true,
  super_eligible: true,
  is_taxable: true,
};
const overtime: PayLine = {
  code: "OT15",
  amount: 300,
  stp2_category: "overtime",
  ote_eligible: false,
  super_eligible: false,
  is_taxable: true,
};
const allowanceMeal: PayLine = {
  code: "MEAL",
  amount: 50,
  stp2_category: "allowance_MD",
  ote_eligible: false,
  super_eligible: false,
  is_taxable: false,
};

describe("payroll-au", () => {
  it("OTE excludes overtime and non-OTE allowances", () => {
    expect(computeOTE([ordinary, overtime, allowanceMeal])).toBe(2000);
  });

  it("SG = OTE * rate (no cap)", () => {
    expect(computeSG(2000, 0.12)).toBe(240);
  });

  it("SG applies quarterly cap pro-rated per fortnight", () => {
    // max quarterly base $65,070 → fortnightly cap ≈ $10,010.77; base above is clamped.
    const sg = computeSG(20000, 0.12, 65070, 6.5);
    expect(sg).toBeLessThan(20000 * 0.12);
  });

  it("PAYG-W = round(a*x − b), nearest dollar (.50 rounds up)", () => {
    // Bracket: a=0.325, b=117.5769 (Schedule 1 scale 2, fortnightly, mid-bracket)
    expect(computePAYG(2000, { a: 0.325, b: 117.5769 })).toBe(532);
    expect(computePAYG(0, { a: 0.325, b: 117.5769 })).toBe(0);
  });

  it("computeAuPeriod composes the full period", () => {
    const r = computeAuPeriod({
      lines: [ordinary, overtime, allowanceMeal],
      frequency: "fortnightly",
      paygCoeff: { a: 0.325, b: 117.5769 },
      sgRate: 0.12,
    });
    expect(r.gross).toBe(2350);
    expect(r.taxable).toBe(2300);
    expect(r.ote).toBe(2000);
    expect(r.sg).toBe(240);
    expect(r.payg).toBeGreaterThan(0);
    expect(r.net).toBe(2350 - r.payg);
  });
});
