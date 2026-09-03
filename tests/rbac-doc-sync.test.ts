import { describe, it, expect } from "vitest";
import { execFileSync } from "child_process";
import { join } from "path";

/**
 * `docs/rbac.md`'s matrix must match `src/lib/rbac.ts`.
 *
 * CLAUDE.md tells you to update the doc alongside any matrix change. Wave 5
 * added seventeen feature keys and none of them reached it — which is the
 * normal outcome for a hand-maintained table sitting beside the code it
 * describes. A stale authorization document is worse than none, because it is
 * the thing someone checks instead of the code.
 *
 * The matrix section is generated now. This runs the generator in --check mode,
 * so adding a feature key without regenerating fails here rather than quietly
 * making the document wrong.
 */
describe("the RBAC document matches the code", () => {
  it("docs/rbac.md is regenerated from rbac.ts", () => {
    const root = process.cwd();
    let out = "";
    try {
      out = execFileSync("node", [join(root, "scripts/gen-rbac-matrix.mjs"), "--check"], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e: any) {
      throw new Error(
        "docs/rbac.md is out of date with src/lib/rbac.ts. " +
          "Run: node scripts/gen-rbac-matrix.mjs\n" +
          (e.stderr ?? e.stdout ?? e.message),
      );
    }
    expect(out).toMatch(/is current \(\d+ feature keys\)/);
  });
});
