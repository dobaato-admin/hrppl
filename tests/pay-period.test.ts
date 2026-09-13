/**
 * Default pay periods for a new run.
 *
 * "New run" presented three empty date fields. The admin knows what they want
 * — last month — and had to derive and type three dates the tenant's own
 * pay-period setting already determines. That is not merely slow: the period
 * bounds decide which timesheets and approved leave fall into the run, so a
 * period off by a day moves somebody's overtime into the wrong pay and
 * nothing visibly breaks.
 *
 * Everything here is calendar-date arithmetic on `YYYY-MM-DD`, never local
 * `Date` maths, for the reason `src/lib/work-date.ts` exists.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  proposePayPeriod,
  recentPayPeriods,
  PAY_DATE_OFFSET_DAYS,
} from "@/lib/pay-period";

describe("monthly", () => {
  it("proposes the last COMPLETE month, not the current one", () => {
    // You cannot pay a month that has not finished, and a run opened over a
    // half-finished month computes against partial timesheets.
    const p = proposePayPeriod("monthly", "2026-09-13");
    expect(p.periodStart).toBe("2026-08-01");
    expect(p.periodEnd).toBe("2026-08-31");
    expect(p.label).toBe("August 2026");
  });

  it("steps back a whole month at a time", () => {
    expect(proposePayPeriod("monthly", "2026-09-13", 1).periodStart).toBe("2026-07-01");
    expect(proposePayPeriod("monthly", "2026-09-13", 2).periodStart).toBe("2026-06-01");
  });

  it("crosses a year boundary", () => {
    const p = proposePayPeriod("monthly", "2026-01-10");
    expect(p.periodStart).toBe("2025-12-01");
    expect(p.periodEnd).toBe("2025-12-31");
    expect(p.label).toBe("December 2025");
  });

  it("gets February right, including a leap year", () => {
    expect(proposePayPeriod("monthly", "2026-03-05").periodEnd).toBe("2026-02-28");
    expect(proposePayPeriod("monthly", "2024-03-05").periodEnd).toBe("2024-02-29");
  });

  it("is unaffected by the day of the month it is asked on", () => {
    for (const day of ["01", "15", "28", "30"]) {
      const p = proposePayPeriod("monthly", `2026-09-${day}`);
      expect(p.periodStart).toBe("2026-08-01");
      expect(p.periodEnd).toBe("2026-08-31");
    }
  });

  it("never proposes a 31st that does not exist", () => {
    // The month-stepping has to clamp: 31 Mar minus one month is 28 or 29
    // Feb, not 2 March.
    for (let m = 1; m <= 12; m++) {
      const today = `2026-${String(m).padStart(2, "0")}-31`.replace(/-31$/, "-28");
      const p = proposePayPeriod("monthly", today);
      expect(p.periodEnd >= p.periodStart).toBe(true);
      expect(p.periodEnd.slice(0, 7)).toBe(p.periodStart.slice(0, 7));
    }
  });
});

describe("semimonthly", () => {
  it("splits the month at the 15th", () => {
    // Asked on the 20th, the last complete half is the 1st–15th.
    const p = proposePayPeriod("semimonthly", "2026-09-20");
    expect([p.periodStart, p.periodEnd]).toEqual(["2026-09-01", "2026-09-15"]);
  });

  it("walks back into the previous month's second half", () => {
    const p = proposePayPeriod("semimonthly", "2026-09-10");
    expect([p.periodStart, p.periodEnd]).toEqual(["2026-08-16", "2026-08-31"]);
  });

  it("ends the second half on the real last day of the month", () => {
    const feb = proposePayPeriod("semimonthly", "2026-03-10");
    expect(feb.periodEnd).toBe("2026-02-28");
  });

  it("steps back through halves in order", () => {
    const halves = recentPayPeriods("semimonthly", "2026-09-20", 4).map((p) => [
      p.periodStart,
      p.periodEnd,
    ]);
    expect(halves).toEqual([
      ["2026-09-01", "2026-09-15"],
      ["2026-08-16", "2026-08-31"],
      ["2026-08-01", "2026-08-15"],
      ["2026-07-16", "2026-07-31"],
    ]);
  });
});

describe("weekly and fortnightly", () => {
  it("proposes the last complete Monday–Sunday week", () => {
    // 2026-09-13 is a Sunday. The last week that has FINISHED ended the
    // Sunday before — today's week is not complete until midnight.
    const p = proposePayPeriod("weekly", "2026-09-13");
    expect(p.periodEnd).toBe("2026-09-06");
    expect(p.periodStart).toBe("2026-08-31");
  });

  it("a fortnight is fourteen days ending on a Sunday", () => {
    const p = proposePayPeriod("fortnightly", "2026-09-13");
    expect(p.periodEnd).toBe("2026-09-06");
    expect(p.periodStart).toBe("2026-08-24");
  });

  it("periods do not overlap or leave gaps", () => {
    const weeks = recentPayPeriods("weekly", "2026-09-13", 5);
    for (let i = 0; i < weeks.length - 1; i++) {
      const earlierEnd = weeks[i + 1].periodEnd;
      const laterStart = weeks[i].periodStart;
      const gapDays =
        (Date.parse(laterStart) - Date.parse(earlierEnd)) / 86_400_000;
      expect(gapDays).toBe(1);
    }
  });

  it("always starts on a Monday and ends on a Sunday", () => {
    for (const p of recentPayPeriods("weekly", "2026-09-13", 6)) {
      expect(new Date(p.periodStart + "T00:00:00Z").getUTCDay()).toBe(1);
      expect(new Date(p.periodEnd + "T00:00:00Z").getUTCDay()).toBe(0);
    }
  });
});

describe("pay date", () => {
  it("falls a few days after the period ends, and is editable", () => {
    const p = proposePayPeriod("monthly", "2026-09-13");
    expect(p.payDate).toBe("2026-09-03");
    expect(PAY_DATE_OFFSET_DAYS).toBe(3);
  });

  it("is always after the period it pays for", () => {
    for (const cadence of ["weekly", "fortnightly", "semimonthly", "monthly"] as const) {
      for (const p of recentPayPeriods(cadence, "2026-09-13", 3)) {
        expect(p.payDate > p.periodEnd).toBe(true);
      }
    }
  });

  it("crosses a month and a year boundary correctly", () => {
    expect(proposePayPeriod("monthly", "2026-01-10").payDate).toBe("2026-01-03");
  });
});

describe("defaults and guards", () => {
  it("treats a missing cadence as monthly", () => {
    expect(proposePayPeriod(null, "2026-09-13").periodStart).toBe("2026-08-01");
    expect(proposePayPeriod(undefined, "2026-09-13").label).toBe("August 2026");
  });

  it("recentPayPeriods returns the requested count, most recent first", () => {
    const three = recentPayPeriods("monthly", "2026-09-13", 3);
    expect(three.map((p) => p.label)).toEqual(["August 2026", "July 2026", "June 2026"]);
  });

  it("every proposed period is well-formed", () => {
    for (const cadence of ["weekly", "fortnightly", "semimonthly", "monthly"] as const) {
      for (const p of recentPayPeriods(cadence, "2026-09-13", 6)) {
        expect(p.periodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.payDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.periodEnd >= p.periodStart).toBe(true);
        expect(p.label.length).toBeGreaterThan(3);
      }
    }
  });
});

describe("the payroll page gates before the work, not after", () => {
  const page = readFileSync("src/routes/org.payroll.tsx", "utf8");
  const gate = readFileSync("src/components/payroll/PayrollReadinessGate.tsx", "utf8");

  it("reads readiness on load, not on submit", () => {
    // The refusal used to arrive as a toast AFTER the admin opened the dialog,
    // typed three dates and pressed Create.
    expect(page).toMatch(/queryKey: \["outstanding-setup"\]/);
    expect(page).toMatch(/<PayrollReadinessGate/);
  });

  it("disables New run only on items that actually block a run", () => {
    // Leave setup does not stop a run — createPayrollRun passes null for it.
    expect(page).toMatch(/const \{ blocking: runBlockers \} = partitionForRun\(outstanding\)/);
    expect(page).toMatch(/setupIncomplete = runBlockers\.length > 0/);
  });

  it("separates blocking from advisory in the banner", () => {
    expect(gate).toMatch(/partitionForRun/);
    expect(gate).toMatch(/Doesn't stop a run/);
  });

  it("every outstanding item links to where it is fixed", () => {
    expect(gate).toMatch(/to=\{item\.href\}/);
  });

  it("the server refusal names the page, not just 'the setup guide'", () => {
    const fn = readFileSync("src/lib/payroll.functions.ts", "utf8");
    expect(fn).toMatch(/Configure it at \$\{where\}/);
  });

  it("the dialog proposes a period instead of three empty boxes", () => {
    expect(page).toMatch(/applyPeriod\(periodOptions\[0\]\)/);
    expect(page).toMatch(/periodOptions\.map/);
  });

  it("a preset fills only the dates, never the admin's own fields", () => {
    // Currency, FX and notes are theirs; a preset that cleared them is a trap.
    const fn = page.slice(page.indexOf("function applyPeriod"), page.indexOf("async function onCreate"));
    expect(fn).toMatch(/periodStart: p\.periodStart/);
    expect(fn).not.toMatch(/currencyCode/);
    expect(fn).not.toMatch(/notes/);
  });
});

describe("readiness covers everything compute needs", () => {
  it("checks for a payslip template", () => {
    // Found by seeding: three runs were created happily and every compute
    // failed with "No published payslip template for NP". Readiness said the
    // tenant was ready.
    const setup = readFileSync("src/lib/payroll-setup.functions.ts", "utf8");
    expect(setup).toMatch(/payslipTemplate: \(templates \?\? \[\]\)\.length > 0/);
    expect(setup).toMatch(/\.eq\("status", "published"\)/);
  });

  it("a missing template blocks the run, not merely warns", () => {
    const readiness = readFileSync("src/lib/payroll-readiness.ts", "utf8");
    const block = readiness.slice(readiness.indexOf("const BLOCKS_A_RUN"));
    expect(block).toMatch(/payslipTemplate/);
  });
});
