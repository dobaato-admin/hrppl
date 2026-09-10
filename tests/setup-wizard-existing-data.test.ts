import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * A setup step has to show what is already there.
 *
 * ---------------------------------------------------------------------------
 * What was reported
 * ---------------------------------------------------------------------------
 *
 * "9 pay items configured. Add another below or move to the next step." — a
 * count and nothing else. An admin returning to that screen cannot tell whether
 * the item they meant to add is among the nine, whether a duplicate crept in,
 * or whether last week's change survived. The safe move is to add it again, and
 * now there are ten. The same shape was on leave types ("At least one active
 * leave type is configured") and overtime ("N rate(s) configured").
 *
 * In most cases the data was already in hand — `components` was passed into the
 * pay-items step and simply never rendered. Only overtime rates and the tenant
 * currency needed fetching.
 *
 * Verified in a live browser as gina.globex: pay items list nine rows with
 * code, label, kind and calc (INCOME_TAX shows "0% of gross", RETIRE "0% of
 * basic") collapsing after six; overtime shows "OT15 · Weekday overtime ×1.5 ·
 * ×1.50"; currency reads "NPR — Nepalese Rupee".
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const PAYROLL = read("src/routes/admin.payroll-setup-wizard.tsx");
const LEAVE = read("src/routes/admin.leave-setup-wizard.tsx");
const OT = read("src/routes/admin.overtime-setup-wizard.tsx");
const LIST = read("src/components/setup/ExistingList.tsx");

describe("no step reports only a count", () => {
  it.each([
    ["payroll wizard", "src/routes/admin.payroll-setup-wizard.tsx"],
    ["leave wizard", "src/routes/admin.leave-setup-wizard.tsx"],
    ["overtime wizard", "src/routes/admin.overtime-setup-wizard.tsx"],
  ])("%s renders the items themselves", (_name, file) => {
    expect(read(file)).toContain("<ExistingList");
  });

  it("the old count-only copy is gone", () => {
    expect(PAYROLL).not.toMatch(/pay item\{components\.length === 1 \? "" : "s"\} configured/);
    expect(LEAVE).not.toContain("At least one active leave type is configured. Add another");
  });

  it("each list shows enough to identify a row, not just a name", () => {
    // A list of nine labels is barely better than the number nine.
    expect(PAYROLL).toMatch(/\{c\.code\}/);
    expect(PAYROLL).toMatch(/\{c\.kind\}/);
    expect(PAYROLL).toMatch(/pct_of_basic/);
    expect(LEAVE).toMatch(/days\/yr/);
    expect(LEAVE).toMatch(/is_paid \? "paid" : "unpaid"/);
    expect(OT).toMatch(/rate_multiplier/);
  });
});

describe("the server hands over what the steps need to show", () => {
  const PAYROLL_FNS = read("src/lib/payroll-setup.functions.ts");
  const LEAVE_FNS = read("src/lib/leave-setup.functions.ts");

  it("getPayrollSetup returns the overtime rates and the currency", () => {
    // The overtime step previously received a boolean, and the currency step
    // received nothing at all.
    const fn = PAYROLL_FNS.slice(PAYROLL_FNS.indexOf("export const getPayrollSetup"));
    expect(fn.slice(0, 2200)).toContain("overtimeRates");
    expect(fn.slice(0, 2200)).toContain("currencyCode");
  });

  it("overtime rates are read by country, not tenant", () => {
    // They are shared reference data, like public holidays. Filtering by
    // tenant_id would return nothing, since the column does not exist.
    const fn = PAYROLL_FNS.slice(PAYROLL_FNS.indexOf("export const getPayrollSetup"));
    expect(fn.slice(0, 2200)).toMatch(/overtime_penalty_rates[\s\S]{0,200}country_code/);
  });

  it("getLeaveReadiness returns the leave types", () => {
    const fn = LEAVE_FNS.slice(LEAVE_FNS.indexOf("export const getLeaveReadiness"));
    expect(fn.slice(0, 1200)).toMatch(/from\("leave_types"\)/);
    expect(fn.slice(0, 1200)).toContain("types: types ?? []");
  });

  it("getOvertimeReadiness returns the rates", () => {
    const fn = PAYROLL_FNS.slice(PAYROLL_FNS.indexOf("export const getOvertimeReadiness"));
    expect(fn.slice(0, 1200)).toContain("rates: rates ?? []");
  });
});

describe("the currency step no longer proposes USD to everyone", () => {
  it("prefills from the tenant", () => {
    // It was hardcoded to "USD", so a tenant trading in NPR saw the wizard
    // offering to change it — and pressing Save would have.
    expect(PAYROLL).not.toMatch(/useState\("USD"\)/);
    expect(PAYROLL).toMatch(/useState\(current \?\? "USD"\)/);
  });

  it("states what is currently set", () => {
    expect(PAYROLL).toContain("Currently set");
    expect(PAYROLL).toMatch(/CURRENCIES\.find\(\(c\) => c\.code === current\)/);
  });
});

describe("ExistingList behaves like a summary, not a table dump", () => {
  it("distinguishes empty from configured, and says what to do", () => {
    expect(LIST).toMatch(/if \(items\.length === 0\)/);
    expect(LIST).toContain("emptyHint");
  });

  it("collapses a long list rather than paginating it", () => {
    expect(LIST).toMatch(/collapseAfter = 6/);
    expect(LIST).toMatch(/more not shown/);
  });

  it("the toggle is a real button, not a div", () => {
    // It is the only control in the component; making it unreachable by
    // keyboard would be a poor trade for a chevron.
    expect(LIST).toMatch(/<button\s+type="button"/);
  });
});

describe("a step that edits one record shows that record", () => {
  it("pay dates states what is stored, separately from the prefilled form", () => {
    // A prefilled field looks identical to a default, so the form alone cannot
    // tell an admin whether anything was ever saved.
    expect(PAYROLL).toContain("<CurrentSettings");
    expect(PAYROLL).toMatch(/existing\?\.pay_period && \(/);
  });
});
