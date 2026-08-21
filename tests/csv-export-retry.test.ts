/**
 * Unit tests for CSV export retry rules.
 *
 * The retryExportJob server fn enforces:
 *  - succeeded jobs cannot be retried (download instead)
 *  - in-progress jobs cannot be retried (wait for completion)
 *  - only the original requester can retry their own job
 *  - filters from the original job round-trip through the FilterSchema
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";

const FilterSchema = z.object({
  source: z.enum(["onboarding", "offboarding", "all"]).default("all"),
  employeeId: z.string().uuid().optional().nullable(),
  channel: z.string().trim().max(60).optional().nullable(),
  actorId: z.string().uuid().optional().nullable(),
  actorSearch: z.string().trim().max(200).optional().nullable(),
  action: z.string().trim().max(60).optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  assignmentId: z.string().uuid().optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  includeArchive: z.boolean().default(false),
}).partial();

type Status = "queued" | "running" | "succeeded" | "failed" | "cancelled";

function canRetry(orig: { status: Status; requested_by: string }, userId: string): { ok: true } | { ok: false; reason: string } {
  if (orig.status === "succeeded") return { ok: false, reason: "This job already succeeded — download it from Recent jobs instead of retrying." };
  if (orig.status === "queued" || orig.status === "running") return { ok: false, reason: "Job is still in progress — wait for it to finish before retrying." };
  if (orig.requested_by !== userId) return { ok: false, reason: "You can only retry your own export jobs." };
  return { ok: true };
}

describe("retryExportJob gating", () => {
  const me = "user-1";
  it("blocks retry of a succeeded job", () => {
    const r = canRetry({ status: "succeeded", requested_by: me }, me);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/already succeeded/i);
  });

  it("blocks retry while running or queued", () => {
    for (const status of ["running", "queued"] as Status[]) {
      const r = canRetry({ status, requested_by: me }, me);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/in progress/i);
    }
  });

  it("blocks retry by a different user", () => {
    const r = canRetry({ status: "failed", requested_by: "someone-else" }, me);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/your own/i);
  });

  it("allows retry of a failed job by the original requester", () => {
    expect(canRetry({ status: "failed", requested_by: me }, me)).toEqual({ ok: true });
  });

  it("allows retry of a cancelled job", () => {
    expect(canRetry({ status: "cancelled", requested_by: me }, me)).toEqual({ ok: true });
  });
});

describe("retry preserves original filters", () => {
  it("round-trips a typical failed-export filter set", () => {
    const original = {
      source: "onboarding",
      action: "attest",
      startDate: "2026-06-01",
      endDate: "2026-06-23",
      includeArchive: true,
    };
    const parsed = FilterSchema.parse(original);
    expect(parsed).toMatchObject(original);
  });

  it("drops unknown fields without throwing", () => {
    const parsed = FilterSchema.parse({ source: "all", unknownField: "ignore-me" } as any);
    expect(parsed.source).toBe("all");
    expect((parsed as any).unknownField).toBeUndefined();
  });

  it("rejects bad date formats so retries don't carry forward bad input", () => {
    expect(() => FilterSchema.parse({ startDate: "06/01/2026" })).toThrow();
  });
});
