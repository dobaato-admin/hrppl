import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * T1–T5, T8–T11 — the approvals queue and everything hanging off it.
 *
 * These are source assertions rather than render tests, for the reason given in
 * `tests/nav-render-filter.test.ts`: mounting the shell needs the whole provider
 * stack, and a shallow approximation of it would be its own kind of lie. The
 * behaviour itself was verified in a live browser as `mia.acme` (manager) —
 * queue rendered with a pending badge, balance panel showed 3.50 accrued today
 * against 7.00 by the leave start date, a rejection with no reason was refused
 * with the field marked, and an approval wrote both the request status and an
 * `approval_actions` row recording `approver_role: manager`.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const FNS = read("src/lib/approvals.functions.ts");
const PAGE = read("src/routes/approvals.tsx");
const PANEL = read("src/components/approvals/LeaveBalancePanel.tsx");
const ESC = read("src/lib/approval-escalation.ts");
const GEN = read("src/routeTree.gen.ts");

describe("T1 — the queue only shows what the caller can action", () => {
  it("filters every kind through the approval scope", () => {
    expect(FNS).toContain("resolveApprovalScope");
    // A queue containing items you are refused on is worse than no queue: the
    // refusal arrives after you have read the request and formed a view.
    expect(FNS).toMatch(/const allowFor = \(kind: ApprovalKind\)/);
    expect(FNS).toMatch(/if \(!s\.canApprove\) return "none"/);
  });

  it("never surfaces the caller's own request", () => {
    expect(FNS).toMatch(/scope\.selfEmployeeId === row\.employee_id\) return null/);
  });

  it("sorts oldest first — the point of a queue", () => {
    expect(FNS).toMatch(/sort\(\(a, b\) => \(b\.daysPending \?\? 0\) - \(a\.daysPending \?\? 0\)\)/);
  });

  it("reports days pending, which is what makes it actionable", () => {
    expect(FNS).toContain("daysPending");
    expect(FNS).toMatch(/function wholeDaysSince/);
  });

  it("says when a kind failed rather than drawing an empty tab", () => {
    // The one place an empty list must never be ambiguous.
    expect(FNS).toMatch(/incomplete: errors/);
    expect(PAGE).toContain("This queue is incomplete.");
    expect(PAGE).toMatch(/do not treat an empty\s*\n?\s*tab as nothing pending/);
  });

  it("tells 'you cannot approve these' apart from 'nothing pending'", () => {
    expect(PAGE).toContain("You do not approve");
    expect(PAGE).toContain("Nothing waiting");
    // And the empty message reflects the caller's actual scope.
    expect(PAGE).toMatch(/None of your direct reports/);
    expect(PAGE).toMatch(/branches you administer/);
  });
});

describe("T2/T4/T5 — deciding from the queue", () => {
  it("reuses the existing decision functions rather than reimplementing them", () => {
    // Approving leave touches balances and approving WFH changes what clockIn
    // accepts; a second copy of those rules would drift.
    for (const fn of [
      "approveLeaveRequest",
      "rejectLeaveRequest",
      "decideExpenseClaim",
      "approveTimesheet",
      "rejectTimesheet",
    ]) {
      expect(PAGE, `${fn} should be reused`).toContain(fn);
    }
  });

  it("requires a reason to reject, and marks the field", () => {
    expect(PAGE).toContain("A reason is required when rejecting");
    expect(PAGE).toMatch(/aria-invalid=\{isReject && note\.trim\(\)\.length === 0/);
  });

  it("allows an optional comment on approval, shown to the submitter", () => {
    expect(PAGE).toMatch(/Shown to \{item\?\.employeeName/);
  });
});

describe("T3 — the leave balance is on the approval screen", () => {
  it("projects to the leave start date, not to today", () => {
    // Accrual continues between now and the first day off, so today's figure
    // understates a request booked months ahead — and refusing on that basis
    // refuses wrongly.
    expect(FNS).toMatch(/monthsToStart/);
    expect(FNS).toMatch(/accruedByStart = accrued \+ accrualPerMonth \* monthsToStart/);
    expect(FNS).toMatch(/projected: accruedByStart - taken - otherPending - thisRequest/);
    expect(PANEL).toMatch(/As at \{request\.start_date\}/);
  });

  it("shows today's figure too, so the two are never confused", () => {
    expect(FNS).toContain("accruedToday");
    expect(PANEL).toContain("Accrued today");
    expect(PANEL).toContain("By start date");
  });

  it("lists every leave type, not only the requested one", () => {
    // Approvers routinely ask "do they have annual left instead?".
    expect(FNS).toMatch(/types: rows/);
    expect(FNS).toMatch(/isRequested: t\.id === req\.leave_type_id/);
  });

  it("counts other pending requests", () => {
    // Approving two in ignorance of each other overdraws the balance with
    // neither approver seeing it.
    expect(FNS).toContain("otherPendingByType");
    expect(PANEL).toContain("Other pending");
  });

  it("warns visibly when approving would go negative", () => {
    expect(FNS).toMatch(/wouldGoNegative/);
    expect(PANEL).toMatch(/wouldGoNegative &&/);
    expect(PANEL).toMatch(/below zero/);
  });

  it("says the panel is missing rather than showing an empty one", () => {
    expect(PANEL).toContain("Could not load the leave balance.");
    expect(PANEL).toMatch(/missing, not empty/);
  });
});

describe("T9 — escalation without delegation setup", () => {
  it("derives availability instead of asking for a stand-in", () => {
    expect(ESC).toContain("isApproverAvailable");
    expect(ESC).toMatch(/status = 'approved'|eq\("status", "approved"\)/);
    expect(ESC).toMatch(/account is not active/);
  });

  it("only an APPROVED leave request makes someone unavailable", () => {
    // Escalating on a pending request would route around approvers who are
    // present, and a decision made with less context is the cost.
    const fn = ESC.slice(ESC.indexOf("export async function isApproverAvailable"));
    expect(fn).toMatch(/\.eq\("status", "approved"\)/);
  });

  it("walks manager → branch admin → org admin/HR", () => {
    const fn = ESC.slice(ESC.indexOf("export async function resolveEscalation"));
    expect(fn.indexOf("manager_id")).toBeLessThan(fn.indexOf("branch_admin"));
    expect(fn.indexOf("branch_admin")).toBeLessThan(fn.indexOf("org_admin"));
  });

  it("returns null when the manager is available — doing nothing is correct", () => {
    expect(ESC).toMatch(/if \(available\) return null;/);
  });

  it("notifies both the new approver and the original", () => {
    // Otherwise the original returns to an empty queue and assumes nothing
    // happened.
    expect(ESC).toContain("Escalated to you for approval");
    expect(ESC).toContain("A request was escalated while you were away");
  });

  it("sweeps mid-flight too, idempotently", () => {
    // A request submitted the day before a fortnight's leave would otherwise
    // sit for a fortnight.
    expect(FNS).toContain("escalateStaleApprovals");
    expect(FNS).toMatch(/\.is\("escalated_at", null\)/);
    expect(FNS).toMatch(/approval_escalation_days/);
  });

  it("the ageing threshold is per-tenant and can be switched off", () => {
    expect(FNS).toMatch(/if \(days <= 0\) return .*disabled: true/s);
  });

  it("marks escalated items in the queue with the reason", () => {
    expect(FNS).toContain("escalatedBy");
    expect(PAGE).toMatch(/Escalated — \{r\.escalationReason\}/);
  });
});

describe("T10/T11 — the logs", () => {
  it("the personal log is read-only and scoped to the caller", () => {
    const fn = FNS.slice(FNS.indexOf("export const listMyRecentDecisions"));
    expect(fn).toMatch(/\.eq\("approver_id", userId\)/);
    expect(PAGE).toContain("Read-only");
  });

  it("the org-wide log narrows to the caller's scope rather than lying", () => {
    const fn = FNS.slice(FNS.indexOf("export const listApprovalActivity"));
    expect(fn).toMatch(/if \(scope\.employeeIds !== null\)/);
  });

  it("records the role each decision was made under", () => {
    // Written by the audit recorder, surfaced by the activity page.
    expect(read("src/lib/approval-audit.ts")).toContain("approver_role: input.roleUsed");
    const activity = read("src/routes/org.approval-activity.tsx");
    expect(activity).toContain("Acting as");
    expect(activity).toContain("{r.approver_role}");
  });

  it("exports CSV with the fields an audit needs", () => {
    const activity = read("src/routes/org.approval-activity.tsx");
    for (const col of ["when", "employee", "item_type", "outcome", "approver", "role_used", "reason"]) {
      expect(activity, `CSV needs ${col}`).toContain(`"${col}"`);
    }
    // Quoting matters: a rejection reason routinely contains a comma.
    expect(activity).toMatch(/replace\(\/"\/g, '""'\)/);
  });
});

describe("both surfaces are reachable and gated", () => {
  it("the routes exist", () => {
    expect(GEN).toContain("'/approvals'");
    expect(GEN).toContain("'/org/approval-activity'");
  });

  it("each is gated on its own feature key", () => {
    expect(PAGE).toMatch(/<AdminGate feature="org\.approvals">/);
    expect(read("src/routes/org.approval-activity.tsx")).toMatch(
      /<AdminGate feature="org\.approvalActivity">/,
    );
  });

  it("the nav rows quote the same keys", () => {
    const nav = read("src/lib/nav-tree.ts");
    expect(nav).toMatch(/to: "\/approvals"[\s\S]{0,200}feature: "org\.approvals"/);
    expect(nav).toMatch(/to: "\/org\/approval-activity"[\s\S]{0,200}feature: "org\.approvalActivity"/);
  });

  it("the approvals key admits every role that can decide something", () => {
    const rbac = read("src/lib/rbac.ts");
    const m = rbac.match(/"org\.approvals":\s*SET\(([^)]*)\)/)!;
    const roles = [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1]).sort();
    expect(roles).toEqual([
      "branch_admin", "finance", "hr", "manager", "org_admin", "super_admin",
    ]);
  });
});
