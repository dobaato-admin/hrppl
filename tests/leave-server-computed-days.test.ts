/**
 * `submitLeaveRequest` used to trust the client's `days` field outright — the
 * schema only bounded it to <= 366, independent of the actual date range, so
 * a crafted request could claim up to a year of leave regardless of how many
 * days the start/end dates actually span. It also accepted any day count with
 * no check against the employee's remaining balance.
 *
 * These pin the two pieces of logic that close both gaps: the day-count
 * formula the server now computes itself (identical to the client's, in
 * `leave.tsx:31-40`, so a crafted `days` can no longer diverge from the
 * dates), and the balance arithmetic that rejects a request exceeding what's
 * left.
 */
import { describe, it, expect } from "vitest";
import { daysBetween, hasLeaveQuota, availableLeaveBalance } from "@/lib/leave.functions";

describe("daysBetween", () => {
  it("counts inclusive calendar days", () => {
    expect(daysBetween("2026-09-01", "2026-09-01", false, false)).toBe(1);
    expect(daysBetween("2026-09-01", "2026-09-05", false, false)).toBe(5);
  });

  it("discounts a half day at the start", () => {
    expect(daysBetween("2026-09-01", "2026-09-05", true, false)).toBe(4.5);
  });

  it("discounts a half day at the end, but not for a single-day request", () => {
    expect(daysBetween("2026-09-01", "2026-09-05", false, true)).toBe(4.5);
    // Both flags on the same single day would double-discount a day that
    // isn't there — the same-day guard in the client formula is preserved.
    expect(daysBetween("2026-09-01", "2026-09-01", false, true)).toBe(1);
  });

  it("discounts both ends", () => {
    expect(daysBetween("2026-09-01", "2026-09-05", true, true)).toBe(4);
  });

  it("never goes below half a day", () => {
    expect(daysBetween("2026-09-01", "2026-09-01", true, true)).toBe(0.5);
  });

  it("returns 0 for an end date before the start date", () => {
    // A crafted request reversing the dates gets zero days, not a negative
    // one that could be used to inflate a balance elsewhere.
    expect(daysBetween("2026-09-05", "2026-09-01", false, false)).toBe(0);
  });

  it("cannot be forced past what the date range actually spans", () => {
    // This is the regression the fix closes: previously `days` came straight
    // from the client and the schema only capped it at 366, so a two-day
    // request could carry `days: 366`. The server now derives it from the
    // dates alone, so the widest possible gap between claimed and actual days
    // is the half-day rounding above — not 364 fabricated days.
    const claimed = 366;
    const actual = daysBetween("2026-09-01", "2026-09-02", false, false);
    expect(actual).toBe(2);
    expect(actual).not.toBe(claimed);
  });
});

describe("hasLeaveQuota", () => {
  it("is true for a type with an annual quota", () => {
    expect(hasLeaveQuota({ annual_quota_days: 21, accrual_per_month: 0 })).toBe(true);
  });

  it("is true for a type with only an accrual rate", () => {
    expect(hasLeaveQuota({ annual_quota_days: 0, accrual_per_month: 0.83 })).toBe(true);
  });

  it("is false for Unpaid Leave — zero quota and zero accrual", () => {
    expect(hasLeaveQuota({ annual_quota_days: 0, accrual_per_month: 0 })).toBe(false);
  });
});

describe("availableLeaveBalance", () => {
  it("falls back to the type's quota when no balance row exists yet", () => {
    expect(availableLeaveBalance({ annual_quota_days: 21 }, null)).toBe(21);
  });

  it("nets accrued + carried over against used + pending", () => {
    const balance = { accrued_days: 21, carried_over_days: 3, used_days: 10, pending_days: 5 };
    expect(availableLeaveBalance({ annual_quota_days: 21 }, balance)).toBe(9);
  });

  it("goes negative when pending already exceeds what's left", () => {
    // Not clamped to 0 — the caller compares `computedDays > available` and a
    // negative number still fails that check, which is all that matters.
    const balance = { accrued_days: 5, carried_over_days: 0, used_days: 4, pending_days: 3 };
    expect(availableLeaveBalance({ annual_quota_days: 5 }, balance)).toBe(-2);
  });
});
