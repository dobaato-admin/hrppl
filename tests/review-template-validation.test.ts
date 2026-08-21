import { describe, it, expect } from "vitest";
import { validateTemplate } from "../src/lib/review-template-validation";
import { expandSchedule } from "../src/lib/review-schedule";
import type { PresetCompetency } from "../src/lib/review-presets";

const base = (over: Partial<PresetCompetency> = {}): PresetCompetency => ({
  id: "a", label: "A", type: "number", required: true, ...over,
});

describe("review template validation — scoring matrices", () => {
  it("flags weights totalling > 100%", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ id: "a", weight: 60 }), base({ id: "b", weight: 60 })],
    });
    expect(issues.some((i) => i.field === "weight")).toBe(true);
  });

  it("accepts weights totalling exactly 100%", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ id: "a", weight: 40 }), base({ id: "b", weight: 60 })],
    });
    expect(issues.some((i) => i.field === "weight")).toBe(false);
  });

  it("flags target outside of min/max (range overlap)", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ min: 0, max: 10, target: 15 })],
    });
    expect(issues.some((i) => i.field === "target" && /exceeds Max/i.test(i.message))).toBe(true);
  });

  it("flags min > max", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ min: 10, max: 5 })],
    });
    expect(issues.some((i) => i.field === "minmax")).toBe(true);
  });

  it("flags percentage outside 0–100", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ type: "percentage", min: -1, max: 150 })],
    });
    expect(issues.some((i) => i.field === "minmax" && /0–100/.test(i.message))).toBe(true);
  });

  it("rejects required evidence type not in allowed set", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({
        evidenceEnabled: true,
        evidenceTypes: ["document"],
        requiredEvidenceTypes: ["screenshot"],
      })],
    });
    expect(issues.some((i) => i.field === "evidence")).toBe(true);
  });

  it("rejects duplicate item ids", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ id: "x" }), base({ id: "x" })],
    });
    expect(issues.some((i) => i.field === "id")).toBe(true);
  });

  it("rejects scale max ≤ scale min", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 5, scaleMax: 5, competencies: [base()],
    });
    expect(issues.some((i) => i.field === "scale")).toBe(true);
  });
});

describe("schedule consistency", () => {
  it("rejects too many periods for quarterly", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ schedule: { type: "quarterly", periods: ["Q1","Q2","Q3","Q4","Q5"] } })],
    });
    expect(issues.some((i) => i.field === "schedule")).toBe(true);
  });

  it("requires startDate for custom schedule", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ schedule: { type: "custom", periods: ["2026-01"] } })],
    });
    expect(issues.some((i) => i.field === "schedule" && /start date/i.test(i.message))).toBe(true);
  });

  it("accepts valid quarterly schedule", () => {
    const issues = validateTemplate({
      name: "T", scaleMin: 1, scaleMax: 5,
      competencies: [base({ schedule: { type: "quarterly", periods: ["Q1","Q2"] } })],
    });
    expect(issues.some((i) => i.field === "schedule")).toBe(false);
  });
});

describe("expandSchedule — instance generation", () => {
  it("emits 4 quarterly dates within the horizon", () => {
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-12-31T00:00:00Z");
    const out = expandSchedule({ type: "quarterly", startDate: "2026-01-01" }, from, to);
    expect(out).toHaveLength(4);
    expect(out.map((o) => o.period)).toEqual(["Q1","Q2","Q3","Q4"]);
  });

  it("emits 12 monthly dates with default labels", () => {
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-12-31T00:00:00Z");
    const out = expandSchedule({ type: "monthly", startDate: "2026-01-01" }, from, to);
    expect(out).toHaveLength(12);
  });

  it("emits nothing when schedule undefined", () => {
    expect(expandSchedule(undefined, new Date(), new Date())).toEqual([]);
  });

  it("respects custom YYYY-MM periods within the horizon", () => {
    const out = expandSchedule(
      { type: "custom", periods: ["2026-03", "2026-09", "2027-02"], startDate: "2026-01-01" },
      new Date("2026-01-01T00:00:00Z"),
      new Date("2026-12-31T00:00:00Z"),
    );
    expect(out.map((o) => o.period)).toEqual(["2026-03","2026-09"]);
  });
});
