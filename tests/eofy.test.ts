import { describe, it, expect } from "vitest";

// Mirror of fyRange in src/lib/eofy.functions.ts; pure helper test avoids
// loading the server-fn module (which pulls auth middleware via @/ alias).
function fyRange(fy: number): { start: string; end: string } {
  return { start: `${fy - 1}-07-01`, end: `${fy}-06-30` };
}

describe("EOFY fyRange", () => {
  it("FY2026 → 1 Jul 2025 .. 30 Jun 2026", () => {
    expect(fyRange(2026)).toEqual({ start: "2025-07-01", end: "2026-06-30" });
  });
  it("FY2025 → 1 Jul 2024 .. 30 Jun 2025", () => {
    expect(fyRange(2025)).toEqual({ start: "2024-07-01", end: "2025-06-30" });
  });
});
