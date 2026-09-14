/**
 * Payroll cost over time.
 *
 * The trend screen had no real charts and no comparisons, so "is payroll going
 * up" could only be answered by opening runs one at a time. Everything here is
 * the arithmetic behind the new charts, which is where the errors live: a
 * quarter starting in the wrong month, a year-on-year comparison against a
 * period that does not exist, a per-employee average divided by zero.
 *
 * The recurring decision in these tests: **absent is not zero**. A month with
 * no payroll run is a month nobody was paid, and drawing it as a zero invents
 * a cliff that did not happen. A first period has nothing to compare against,
 * and "+100%" would be a fabrication.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  bucketKey,
  bucketLabel,
  buildTrend,
  costOf,
  costPerEmployee,
  periodOnPeriod,
  yearOnYear,
  priorYearKey,
  trendTotals,
  type RunPoint,
  type TrendBucket,
} from "@/lib/payroll-trends";

const run = (payDate: string, over: Partial<RunPoint> = {}): RunPoint => ({
  payDate,
  periodStart: payDate,
  periodEnd: payDate,
  gross: 1000,
  incomeTax: 100,
  employeeContributions: 50,
  employerContributions: 90,
  netPay: 850,
  headcount: 5,
  currency: "AUD",
  ...over,
});

describe("bucketKey", () => {
  it("groups by month", () => {
    expect(bucketKey("2026-08-15", "month")).toBe("2026-08");
  });

  it("puts each month in the right quarter", () => {
    const q = (m: string) => bucketKey(`2026-${m}-15`, "quarter");
    expect([q("01"), q("02"), q("03")]).toEqual(["2026-Q1", "2026-Q1", "2026-Q1"]);
    expect([q("04"), q("06")]).toEqual(["2026-Q2", "2026-Q2"]);
    expect([q("07"), q("09")]).toEqual(["2026-Q3", "2026-Q3"]);
    expect([q("10"), q("12")]).toEqual(["2026-Q4", "2026-Q4"]);
  });

  it("groups by year", () => {
    expect(bucketKey("2026-12-31", "year")).toBe("2026");
  });
});

describe("bucketLabel", () => {
  it("reads the way a person says it", () => {
    expect(bucketLabel("2026-08", "month")).toBe("Aug 2026");
    expect(bucketLabel("2026-Q3", "quarter")).toBe("Q3 2026");
    expect(bucketLabel("2026", "year")).toBe("2026");
  });
});

describe("buildTrend", () => {
  it("sums runs falling in the same bucket", () => {
    const [b] = buildTrend([run("2026-08-03"), run("2026-08-17")], [], "month");
    expect(b.runs).toBe(2);
    expect(b.gross).toBe(2000);
    expect(b.netPay).toBe(1700);
  });

  it("takes the MAXIMUM headcount, never the sum", () => {
    // Two monthly runs of five people in one quarter is five people, not ten.
    const [b] = buildTrend(
      [run("2026-07-03", { headcount: 5 }), run("2026-08-03", { headcount: 6 })],
      [],
      "quarter",
    );
    expect(b.headcount).toBe(6);
  });

  it("returns buckets oldest first", () => {
    const t = buildTrend([run("2026-08-03"), run("2026-06-03"), run("2026-07-03")], [], "month");
    expect(t.map((b) => b.key)).toEqual(["2026-06", "2026-07", "2026-08"]);
  });

  it("does NOT invent empty buckets for months with no payroll", () => {
    // A gap is a month nobody was paid. Filling it with a zero draws a cliff
    // that did not happen; carrying the previous value forward draws a payroll
    // that did not happen.
    const t = buildTrend([run("2026-06-03"), run("2026-09-03")], [], "month");
    expect(t.map((b) => b.key)).toEqual(["2026-06", "2026-09"]);
  });

  it("adds expenses into the bucket they were paid in", () => {
    const t = buildTrend([run("2026-08-03")], [{ paidDate: "2026-08-20", amount: 250 }], "month");
    expect(t[0].expenses).toBe(250);
  });

  it("keeps an expense-only period — money still went out", () => {
    const t = buildTrend([run("2026-08-03")], [{ paidDate: "2026-09-05", amount: 90 }], "month");
    expect(t.map((b) => b.key)).toEqual(["2026-08", "2026-09"]);
    expect(t[1].runs).toBe(0);
    expect(t[1].expenses).toBe(90);
  });

  it("handles no data at all", () => {
    expect(buildTrend([], [], "month")).toEqual([]);
  });
});

describe("costOf — the four views are genuinely different", () => {
  const [b] = buildTrend([run("2026-08-03")], [{ paidDate: "2026-08-09", amount: 200 }], "month");

  it("net is what the employee received", () => {
    expect(costOf(b, "net")).toBe(850);
  });

  it("gross adds what was withheld on their behalf", () => {
    expect(costOf(b, "gross")).toBe(1000);
  });

  it("employer cost adds contributions the employee never sees", () => {
    // These appear on no payslip, which is exactly why a payslip total is not
    // the cost to the business.
    expect(costOf(b, "employer")).toBe(1090);
  });

  it("the widest view adds reimbursed expenses", () => {
    expect(costOf(b, "withExpenses")).toBe(1290);
  });

  it("no two views return the same number for the same data", () => {
    const values = (["net", "gross", "employer", "withExpenses"] as const).map((v) => costOf(b, v));
    expect(new Set(values).size).toBe(4);
  });
});

describe("periodOnPeriod", () => {
  const t = buildTrend([run("2026-07-03"), run("2026-08-03", { netPay: 1700 })], [], "month");

  it("compares the latest with the one before", () => {
    const c = periodOnPeriod(t, "net");
    expect(c.current).toBe(1700);
    expect(c.previous).toBe(850);
    expect(c.change).toBe(850);
    expect(c.percent).toBe(100);
    expect(c.againstLabel).toBe("Jul 2026");
  });

  it("reports NO comparison for a first period, not +100%", () => {
    const first = buildTrend([run("2026-08-03")], [], "month");
    const c = periodOnPeriod(first, "net");
    expect(c.previous).toBeNull();
    expect(c.change).toBeNull();
    expect(c.percent).toBeNull();
    expect(c.againstLabel).toBeNull();
  });

  it("omits the percentage when the prior period was zero", () => {
    // A percentage against zero is not infinity, it is meaningless. The
    // absolute change is still reported.
    const zeroed = buildTrend(
      [run("2026-07-03", { netPay: 0, gross: 0, employerContributions: 0 }), run("2026-08-03")],
      [],
      "month",
    );
    const c = periodOnPeriod(zeroed, "net");
    expect(c.change).toBe(850);
    expect(c.percent).toBeNull();
  });

  it("handles no data without throwing", () => {
    const c = periodOnPeriod([], "net");
    expect(c.current).toBe(0);
    expect(c.previous).toBeNull();
  });
});

describe("yearOnYear", () => {
  it("matches the same bucket a year earlier BY KEY, not by offset", () => {
    // With gaps, "twelve buckets back" is not "a year ago". Comparing August
    // against the previous March silently is worse than not comparing.
    const t = buildTrend(
      [run("2025-08-03", { netPay: 800 }), run("2026-03-03"), run("2026-08-03", { netPay: 1000 })],
      [],
      "month",
    );
    const c = yearOnYear(t, "net");
    expect(c.previous).toBe(800);
    expect(c.againstLabel).toBe("Aug 2025");
    expect(c.change).toBe(200);
  });

  it("reports nothing to compare when last year's period is absent", () => {
    const t = buildTrend([run("2026-03-03"), run("2026-08-03")], [], "month");
    expect(yearOnYear(t, "net").previous).toBeNull();
  });

  it("works for quarters and years too", () => {
    expect(priorYearKey("2026-Q3")).toBe("2025-Q3");
    expect(priorYearKey("2026-08")).toBe("2025-08");
    expect(priorYearKey("2026")).toBe("2025");
  });
});

describe("costPerEmployee", () => {
  it("divides by headcount", () => {
    const [b] = buildTrend([run("2026-08-03", { headcount: 5 })], [], "month");
    expect(costPerEmployee(b, "net")).toBe(170);
  });

  it("returns null rather than Infinity when nobody was paid", () => {
    // An expense-only bucket has no headcount. Infinity on a finance screen is
    // not a number anybody can act on.
    const t = buildTrend([], [{ paidDate: "2026-08-01", amount: 500 }], "month");
    expect(costPerEmployee(t[0], "withExpenses")).toBeNull();
  });
});

describe("trendTotals", () => {
  const t = buildTrend(
    [run("2026-06-03"), run("2026-07-03"), run("2026-08-03")],
    [{ paidDate: "2026-09-02", amount: 400 }],
    "month",
  );

  it("totals across every bucket", () => {
    expect(trendTotals(t, "net").total).toBe(2550);
    expect(trendTotals(t, "net").runs).toBe(3);
  });

  it("averages over periods that actually had a run", () => {
    // September is expenses only; including it would understate the average
    // payroll by a quarter.
    expect(trendTotals(t, "net").averagePerPeriod).toBe(850);
    expect(trendTotals(t, "net").periods).toBe(4);
  });

  it("reports peak headcount, not a sum", () => {
    expect(trendTotals(t, "net").peakHeadcount).toBe(5);
  });

  it("does not divide by zero on empty input", () => {
    expect(trendTotals([], "net").averagePerPeriod).toBe(0);
  });
});

describe("the trend surface", () => {
  const chart = readFileSync("src/components/payroll/PayrollTrends.tsx", "utf8");
  const page = readFileSync("src/routes/org.payroll.tsx", "utf8");
  const fns = readFileSync("src/lib/payroll-insights.functions.ts", "utf8");

  it("is on the payroll home page, not behind a dialog", () => {
    expect(page).toMatch(/<PayrollTrends/);
  });

  it("counts approved runs only", () => {
    // A draft is a proposal and a pending run is an unanswered question.
    // Either one in a cost trend reports money as spent that nobody agreed to.
    const fn = fns.slice(fns.indexOf("export const getPayrollTrends"));
    expect(fn).toMatch(/\.eq\("status", "approved"\)/);
  });

  it("counts only expenses that were actually paid", () => {
    const fn = fns.slice(fns.indexOf("export const getPayrollTrends"));
    expect(fn).toMatch(/\.not\("paid_at", "is", null\)/);
  });

  it("says which date it groups by", () => {
    // A run for June paid in July counts in July. Without saying so, the chart
    // looks a month out.
    expect(chart).toMatch(/pay date/);
  });

  it("offers all four cost views and explains each", () => {
    expect(chart).toMatch(/COST_VIEW_LABEL/);
    expect(chart).toMatch(/COST_VIEW_HELP\[view\]/);
  });

  it("plots headcount alongside the total", () => {
    // A rise in cost and a rise in headcount look identical on one line and
    // mean completely different things.
    expect(chart).toMatch(/dataKey="headcount"/);
    expect(chart).toMatch(/yAxisId="right"/);
  });

  it("distinguishes a failed read from an empty history", () => {
    expect(chart).toMatch(/Could not load payroll history/);
    expect(chart).toMatch(/No approved runs yet/);
  });

  it("exports what is on screen", () => {
    expect(chart).toMatch(/function exportCsv/);
  });
});

describe("payslip delivery is discoverable", () => {
  /**
   * Whitespace-collapsed before matching. These assertions are about SENTENCES
   * the page shows, and JSX text is free to wrap across lines — Prettier moved
   * "…and cannot be emailed until it is approved." onto two lines and the
   * regexes started failing on copy that had not changed at all. Collapsing
   * runs of whitespace keeps the test about what the user reads rather than
   * about where the formatter chose to break the line.
   */
  const page = readFileSync("src/routes/org.payroll.tsx", "utf8").replace(/\s+/g, " ");

  it("shows the email action even when the run is not yet approved", () => {
    // It used to render only for an approved run, so on a pending run nothing
    // on the page mentioned sending payslips at all — which reads as the
    // feature not existing.
    expect(page).not.toMatch(
      /isOrgAdmin && selected\.status === "approved" && payslips\.length > 0/,
    );
    expect(page).toMatch(/Payslips can be sent once the run is approved/);
  });

  it("says so in the status line too", () => {
    expect(page).toMatch(/cannot be emailed until it is approved/);
  });

  it("can export every run at once", () => {
    expect(page).toMatch(/function exportAllRuns/);
    expect(page).toMatch(/Export runs/);
  });
});
