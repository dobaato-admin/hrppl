/**
 * Normalising six request types into one inbox.
 *
 * `leave_requests`, `wfh_requests`, `expense_claims`, `support_tickets`,
 * `toil_requests` and `grievances` each spell their states differently. The
 * inbox groups them so a single screen can count and filter across all six, and
 * these pin the mapping — a status that lands in the wrong group either hides
 * an outstanding request or claims a declined one is still live.
 */
import { describe, it, expect } from "vitest";
import {
  statusGroup,
  formatPeriod,
  REQUEST_KIND_LABELS,
  type RequestKind,
} from "@/lib/requests-inbox.functions";

describe("statusGroup", () => {
  it("groups the pending vocabularies from every table", () => {
    // leave/wfh say pending, expenses say submitted, tickets say open or new.
    for (const s of ["pending", "submitted", "open", "new", "in_review", "recommended"]) {
      expect(statusGroup(s), s).toBe("pending");
    }
  });

  it("groups the settled-affirmative vocabularies", () => {
    for (const s of ["approved", "resolved", "closed", "paid", "completed", "reimbursed"]) {
      expect(statusGroup(s), s).toBe("approved");
    }
  });

  it("groups refusals", () => {
    for (const s of ["rejected", "declined", "dismissed"]) {
      expect(statusGroup(s), s).toBe("rejected");
    }
  });

  it("groups withdrawals separately from refusals", () => {
    // Withdrawing your own request is not the same as being turned down, and
    // conflating them would misreport how often approvers decline things.
    for (const s of ["cancelled", "canceled", "withdrawn"]) {
      expect(statusGroup(s), s).toBe("cancelled");
    }
  });

  it("is case insensitive", () => {
    expect(statusGroup("Approved")).toBe("approved");
    expect(statusGroup("REJECTED")).toBe("rejected");
  });

  it("treats an unknown status as still outstanding", () => {
    // The failure mode that would make the inbox untrustworthy is silently
    // dropping a request whose status this code has not been taught about.
    // Erring towards "pending" keeps it visible.
    expect(statusGroup("escalated_to_legal")).toBe("pending");
    expect(statusGroup(null)).toBe("pending");
    expect(statusGroup(undefined)).toBe("pending");
    expect(statusGroup("")).toBe("pending");
  });
});

describe("formatPeriod", () => {
  it("shows a single day once, not as a range", () => {
    expect(formatPeriod("2026-08-23", "2026-08-23")).toBe("2026-08-23");
  });

  it("shows a real range with both ends", () => {
    expect(formatPeriod("2026-08-23", "2026-08-25")).toBe("2026-08-23 → 2026-08-25");
  });

  it("tolerates a missing end date", () => {
    expect(formatPeriod("2026-08-23", null)).toBe("2026-08-23");
    expect(formatPeriod("2026-08-23")).toBe("2026-08-23");
  });

  it("returns null when there is no period at all", () => {
    // Expenses and grievances have no date span; the UI omits the field rather
    // than rendering an empty one.
    expect(formatPeriod(null, null)).toBeNull();
    expect(formatPeriod(undefined, "2026-08-25")).toBeNull();
  });
});

describe("REQUEST_KIND_LABELS", () => {
  it("names every kind the inbox can produce", () => {
    const kinds: RequestKind[] = ["leave", "wfh", "expense", "ticket", "toil", "grievance"];
    for (const k of kinds) {
      expect(REQUEST_KIND_LABELS[k], k).toBeTruthy();
    }
    // A kind added without a label would render as blank chips in the filter
    // and the summary counts.
    expect(Object.keys(REQUEST_KIND_LABELS).sort()).toEqual([...kinds].sort());
  });
});
