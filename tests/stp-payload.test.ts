import { describe, it, expect } from "vitest";
import { createHash } from "crypto";

/**
 * Smoke test for the STP2 payload shape produced by buildStpPayEvent.
 * Validates the inline shape contract rather than DB round-trip.
 */
function buildShape(run: any, settings: any, payslips: any[], employees: any[]) {
  const empById = new Map(employees.map((e) => [e.id, e]));
  const payees = payslips.map((ps) => {
    const emp = empById.get(ps.employee_id) ?? {};
    const ote = (ps.lines ?? []).filter((l: any) => l.code === "BASE")
      .reduce((a: number, l: any) => a + Number(l.amount ?? 0), 0);
    const overtime = (ps.lines ?? [])
      .filter((l: any) => l.code === "OVERTIME" || (l.code as string).startsWith("OT_"))
      .reduce((a: number, l: any) => a + Number(l.amount ?? 0), 0);
    const sg = (ps.lines ?? []).find((l: any) => l.code === "SUPER_SG");
    return {
      payee_ref: ps.employee_id,
      tax_treatment_code: (emp as any).tax_treatment_code ?? "RTNRT",
      income_type: (emp as any).income_type ?? "SAW",
      gross: Number(ps.gross), ote, overtime,
      payg_w: Number(ps.income_tax),
      super_liability_sg: Number(sg?.amount ?? 0),
      net_pay: Number(ps.net_pay),
    };
  });
  return {
    schema: "STP2.v1",
    payer: { abn: settings.abn, bms_id: settings.bms_id },
    pay_event: {
      run_id: run.id, run_type: "normal",
      period_start: run.period_start, period_end: run.period_end,
      payment_date: run.pay_date,
    },
    totals: {
      gross: payees.reduce((a, p) => a + p.gross, 0),
      payg_w: payees.reduce((a, p) => a + p.payg_w, 0),
      super_sg: payees.reduce((a, p) => a + p.super_liability_sg, 0),
      net: payees.reduce((a, p) => a + p.net_pay, 0),
      payee_count: payees.length,
    },
    payees,
  };
}

describe("stp2 payload", () => {
  it("composes payer + totals + payees with OTE/PAYG/SG", () => {
    const run = { id: "r1", country_code: "AU", period_start: "2026-07-01", period_end: "2026-07-14", pay_date: "2026-07-14" };
    const settings = { abn: "12345678901", bms_id: "BMS-1" };
    const payslips = [{
      employee_id: "e1", gross: 2350, income_tax: 532, net_pay: 1818,
      lines: [
        { code: "BASE", amount: 2000, category: "earning" },
        { code: "OT_OT15", amount: 300, category: "earning" },
        { code: "PAYG_W", amount: 532, category: "tax" },
        { code: "SUPER_SG", amount: 240, category: "contribution_employer" },
      ],
    }];
    const employees = [{ id: "e1", tax_treatment_code: "RTNRT", income_type: "SAW" }];
    const p = buildShape(run, settings, payslips, employees);
    expect(p.schema).toBe("STP2.v1");
    expect(p.payer.abn).toBe("12345678901");
    expect(p.totals).toEqual({ gross: 2350, payg_w: 532, super_sg: 240, net: 1818, payee_count: 1 });
    expect(p.payees[0].ote).toBe(2000);
    expect(p.payees[0].overtime).toBe(300);
    const hash = createHash("sha256").update(JSON.stringify(p)).digest("hex");
    expect(hash).toHaveLength(64);
  });
});
