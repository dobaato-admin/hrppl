/**
 * T19 — the invite step blocked on payroll setup.
 *
 * `inviteStaff` refused to create any invitation until payroll, overtime and
 * leave setup were all complete, and said so by printing the raw check keys:
 *
 *   Complete the Payroll Setup Wizard before inviting employees.
 *   Outstanding: payItems, payDates.
 *
 * That makes the ordinary first move impossible — an org admin's first
 * invitation is often the HR or finance person who is going to *do* the
 * payroll setup. The reported symptom was an invite row stuck at "Failed".
 *
 * Enforcement moved to where a missing pay item actually produces a wrong
 * number: opening a payroll run, and computing one for somebody with no pay
 * details.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { outstandingSetupItems, outstandingSummary } from "@/lib/payroll-readiness";

const ALL_PAYROLL_OK = {
  steps: { payItems: true, payDates: true, overtimeRates: true, currency: true },
};
const ALL_LEAVE_OK = { steps: { leaveTypes: true, accruals: true, approvalRouting: true } };

describe("outstandingSetupItems", () => {
  it("says nothing when everything is configured", () => {
    expect(outstandingSetupItems(ALL_PAYROLL_OK, { allComplete: true }, ALL_LEAVE_OK)).toEqual([]);
  });

  it("names items the way an admin does, never by check key", () => {
    const items = outstandingSetupItems(
      { steps: { payItems: false, payDates: false, overtimeRates: false, currency: false } },
      { allComplete: false },
      { steps: { leaveTypes: false, accruals: false, approvalRouting: false } },
    );
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Pay items");
    expect(labels).toContain("Pay dates");
    expect(labels).toContain("Overtime rates");
    // The keys that used to be shown to the user.
    for (const raw of ["payItems", "payDates", "overtimeRates", "approvalRouting"]) {
      expect(labels.join(" ")).not.toContain(raw);
      expect(outstandingSummary(items)).not.toContain(raw);
    }
  });

  it("puts currency first — pay items are denominated in it", () => {
    const items = outstandingSetupItems(
      { steps: { payItems: false, payDates: false, overtimeRates: true, currency: false } },
      { allComplete: true },
      ALL_LEAVE_OK,
    );
    expect(items[0].key).toBe("currency");
  });

  it("gives every item somewhere to go and something to read", () => {
    const items = outstandingSetupItems(
      { steps: { payItems: false, payDates: false, overtimeRates: false, currency: false } },
      { allComplete: false },
      { steps: { leaveTypes: false, accruals: false, approvalRouting: false } },
    );
    expect(items.length).toBe(7);
    for (const item of items) {
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.detail.length).toBeGreaterThan(20);
    }
  });

  it("a check that could not be read is not reported as missing", () => {
    // An unread check and a failed check must not look the same. Telling an
    // admin to configure something that is already configured is how a
    // checklist stops being believed.
    expect(outstandingSetupItems(null, null, null)).toEqual([]);
    const partial = outstandingSetupItems(null, { allComplete: false }, ALL_LEAVE_OK);
    expect(partial.map((i) => i.key)).toEqual(["overtimeRates"]);
  });

  it("does not report overtime twice when both checks cover it", () => {
    const items = outstandingSetupItems(
      { steps: { payItems: true, payDates: true, overtimeRates: false, currency: true } },
      { allComplete: false },
      ALL_LEAVE_OK,
    );
    expect(items.filter((i) => i.key === "overtimeRates").length).toBe(1);
  });
});

describe("outstandingSummary", () => {
  it("reads as a sentence fragment, not a list of identifiers", () => {
    const items = outstandingSetupItems(
      { steps: { payItems: false, payDates: false, overtimeRates: true, currency: true } },
      { allComplete: true },
      ALL_LEAVE_OK,
    );
    expect(outstandingSummary(items)).toBe("Pay items and Pay dates");
  });

  it("is empty when nothing is outstanding", () => {
    expect(outstandingSummary([])).toBe("");
  });
});

describe("inviteStaff no longer gates on payroll setup", () => {
  const src = readFileSync("src/lib/staff-invitations.functions.ts", "utf8");
  const inviteFn = src.slice(
    src.indexOf("export const inviteStaff"),
    src.indexOf("// ---------- resendInvitation ----------"),
  );

  it("does not throw on an incomplete payroll, overtime or leave setup", () => {
    expect(inviteFn).not.toMatch(/throw new Error\([^)]*before inviting/i);
    expect(inviteFn).not.toMatch(/Complete the Payroll Setup Wizard/);
    expect(inviteFn).not.toMatch(/Complete the Leave Setup Wizard/);
  });

  it("still reports what is outstanding, so the caller can say so", () => {
    expect(inviteFn).toMatch(/payrollOutstanding/);
  });

  it("validates KPI weights before writing the row, not after sending the email", () => {
    // The refusal used to run after the invitation was created AND emailed, so
    // a rejected weight total left a live, delivered invitation while the
    // sender was told it failed.
    const weightCheck = inviteFn.indexOf("KPI weights must sum to 100%");
    const insert = inviteFn.indexOf('.from("staff_invitations").insert');
    expect(weightCheck).toBeGreaterThan(-1);
    expect(insert).toBeGreaterThan(-1);
    expect(weightCheck).toBeLessThan(insert);
  });

  it("does not discard a created invitation when the email fails", () => {
    const sendIdx = inviteFn.indexOf("sendInternalEmail({");
    const tryIdx = inviteFn.lastIndexOf("try {", sendIdx);
    expect(tryIdx).toBeGreaterThan(-1);
    expect(inviteFn).toMatch(/deliveryError/);
  });
});

describe("the enforcement moved to running payroll", () => {
  const payroll = readFileSync("src/lib/payroll.functions.ts", "utf8");

  it("createPayrollRun refuses against an incomplete payroll setup", () => {
    const fn = payroll.slice(
      payroll.indexOf("export const createPayrollRun"),
      payroll.indexOf("export const computePayrollRun"),
    );
    expect(fn).toMatch(/outstandingSetupItems/);
    expect(fn).toMatch(/cannot be opened/);
  });

  it("computePayrollRun refuses to pay an employee who has no pay details", () => {
    const fn = payroll.slice(payroll.indexOf("export const computePayrollRun"));
    expect(fn).toMatch(/no pay details/);
    // Naming them matters: the fix is per-person.
    expect(fn).toMatch(/names\.join/);
  });

  it("does not silently fall back to a gross of zero before that check", () => {
    // `gross = effectivePay ?? base_salary ?? 0` still stands — the guard is
    // what stops a 0 reaching it. Pin their order.
    const guard = payroll.indexOf("no pay details");
    const gross = payroll.indexOf("const gross = effectivePay.get(emp.id)");
    expect(guard).toBeGreaterThan(-1);
    expect(gross).toBeGreaterThan(guard);
  });
});
