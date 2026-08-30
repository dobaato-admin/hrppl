/**
 * No tenant-level "remote work allowed" switch existed — every tenant with an
 * employee record showed the WFH request route regardless of whether the
 * organisation actually intends to permit remote work. `wfh_enabled`
 * (20260824130000) defaults to true, so this is an opt-out switch: no
 * existing tenant's behaviour changes until an org_admin turns it off, and a
 * pre-migration or otherwise absent row must read as enabled too — that
 * column being unreadable must never be the reason nobody can request a WFH
 * day.
 */
import { describe, it, expect } from "vitest";
import { isWfhEnabled } from "@/lib/wfh.functions";

function fakeSupabase(wfhEnabled: boolean | null | undefined) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: wfhEnabled === undefined ? null : { wfh_enabled: wfhEnabled } }),
        }),
      }),
    }),
  };
}

describe("isWfhEnabled", () => {
  it("is true when the column is explicitly true", async () => {
    expect(await isWfhEnabled(fakeSupabase(true) as any, "t1")).toBe(true);
  });

  it("is false only when the column is explicitly false", async () => {
    expect(await isWfhEnabled(fakeSupabase(false) as any, "t1")).toBe(false);
  });

  it("defaults to true when the row is missing entirely (pre-migration or no tenant row)", async () => {
    expect(await isWfhEnabled(fakeSupabase(undefined) as any, "t1")).toBe(true);
  });

  it("defaults to true when the column reads as null", async () => {
    expect(await isWfhEnabled(fakeSupabase(null) as any, "t1")).toBe(true);
  });
});
