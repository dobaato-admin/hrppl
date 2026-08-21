/**
 * Unit tests for the audit detail "what changed" summarizer used by the
 * audit history detail dialog. Verifies the diff array matches the
 * before/after JSON for evidence uploads and attestation updates.
 */
import { describe, it, expect } from "vitest";
import { summarizeDiff } from "../src/lib/audit-detail.functions";

describe("summarizeDiff — audit detail what changed", () => {
  it("flags an evidence upload as an added field", () => {
    const before = { status: "pending", evidence_url: null };
    const after = { status: "pending", evidence_url: "https://files.example/x.pdf" };
    const diff = summarizeDiff(before, after);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({ key: "evidence_url", kind: "changed", from: null, to: "https://files.example/x.pdf" });
  });

  it("flags an attestation update as a changed boolean + actor add", () => {
    const before = { attested: false, attested_by: null };
    const after = { attested: true, attested_by: "user-123" };
    const diff = summarizeDiff(before, after);
    const keys = Object.fromEntries(diff.map((d) => [d.key, d]));
    expect(keys.attested).toMatchObject({ kind: "changed", from: false, to: true });
    expect(keys.attested_by).toMatchObject({ kind: "changed", from: null, to: "user-123" });
  });

  it("marks fields only in after as added and only in before as removed", () => {
    const before = { a: 1, b: 2 };
    const after = { a: 1, c: 3 };
    const diff = summarizeDiff(before, after);
    expect(diff.find((d) => d.key === "b")).toMatchObject({ kind: "removed", from: 2, to: null });
    expect(diff.find((d) => d.key === "c")).toMatchObject({ kind: "added", from: null, to: 3 });
    expect(diff.find((d) => d.key === "a")).toBeUndefined();
  });

  it("treats deep-equal JSON values as unchanged", () => {
    const before = { meta: { a: 1, b: [1, 2] } };
    const after = { meta: { a: 1, b: [1, 2] } };
    expect(summarizeDiff(before, after)).toEqual([]);
  });

  it("handles null/undefined before by listing every after key as added/changed", () => {
    const diff = summarizeDiff(null, { attested: true, evidence_url: "u" });
    const keys = diff.map((d) => d.key).sort();
    expect(keys).toEqual(["attested", "evidence_url"]);
    for (const d of diff) expect(d.kind).toBe("added");
  });
});
