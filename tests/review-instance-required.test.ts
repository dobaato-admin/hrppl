/**
 * `required: true` on a template competency (review-presets.ts) has existed
 * since presets did, shown as a "Required" badge in the template preview
 * (ScorecardPreview.tsx), but nothing ever checked it — a required item
 * could be submitted with no score at all. `isScoreMissing` is the check
 * `performSubmit` now runs before accepting a submission.
 */
import { describe, it, expect } from "vitest";
import { isScoreMissing } from "@/lib/review-instances.functions";

describe("isScoreMissing", () => {
  it("treats null, undefined, and empty string as missing", () => {
    expect(isScoreMissing(null)).toBe(true);
    expect(isScoreMissing(undefined)).toBe(true);
    expect(isScoreMissing("")).toBe(true);
  });

  it("does not treat 0 as missing — a zero score is a real answer", () => {
    expect(isScoreMissing(0)).toBe(false);
  });

  it("does not treat false as missing — a 'no' on a yes/no item is a real answer", () => {
    expect(isScoreMissing(false)).toBe(false);
  });

  it("does not treat a non-empty string, number, or object as missing", () => {
    expect(isScoreMissing("looks good")).toBe(false);
    expect(isScoreMissing(4.5)).toBe(false);
    expect(isScoreMissing({ min: 1, max: 5 })).toBe(false);
  });
});
