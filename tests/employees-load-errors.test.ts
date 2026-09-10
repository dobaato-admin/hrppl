import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * An empty list and a failed request must not look the same.
 *
 * ---------------------------------------------------------------------------
 * T12 Part A — /org/employees returning no data
 * ---------------------------------------------------------------------------
 *
 * Two separate defects wearing one symptom.
 *
 * **The cause**, since fixed: `loadAll` opened with
 *
 *     const { data: prof } = await supabase.from("profiles").select("tenant_id")…
 *     if (!prof?.tenant_id) return;
 *
 * `profiles.tenant_id` is NULL for a platform account, so a `super_admin` or
 * `regional_admin` acting as a tenant returned at that line and the table stayed
 * empty forever. Verified fixed: `sam.platform` acting as Acme now sees all 9.
 * The page takes its tenant from `useMyTenant()`, which resolves the acting
 * tenant.
 *
 * **The masking**, fixed here: the read discarded its error —
 * `const { data: emps }` — and `emps ?? []` drew "No employees yet." So a
 * permissions failure, a dropped connection and a genuinely empty organisation
 * were indistinguishable, on screen and in the console. Nobody could tell which
 * they were looking at, and there was nothing to retry.
 *
 * Verified by forcing a 403 on the employees read in a live browser: the page
 * shows "Could not load employees for this organisation.", the reason
 * ("permission denied for table employees"), and a Try again button — and does
 * NOT say "No employees yet."
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const PAGE = read("src/routes/org.employees.tsx");

describe("the employees list distinguishes empty from broken", () => {
  it("does not discard the error from the employees read", () => {
    expect(
      PAGE,
      "Destructuring only `data` throws the error away, and `data ?? []` then " +
        "renders the same empty table for a failure as for an empty org.",
    ).not.toMatch(/const \[\{ data: emps \}/);
    expect(PAGE).toMatch(/empRes\.error/);
  });

  it("renders a distinct failure state, not the empty state", () => {
    expect(PAGE).toContain("Could not load employees for this organisation.");
    // The empty state must be suppressed when the read failed, or both appear.
    expect(PAGE).toMatch(/!loadError && filtered\.length === 0/);
  });

  it("shows the reason and offers a retry", () => {
    expect(PAGE).toMatch(/\{loadError\}/);
    expect(PAGE).toMatch(/Try again/);
  });

  it("logs the failure as well as showing it", () => {
    // "Confirm the failure is visible in logs" — an on-screen message alone
    // leaves nothing to find afterwards.
    expect(PAGE).toMatch(/console\.error\("\[employees\] list failed"/);
  });

  it("tells 'no employees' apart from 'no search matches'", () => {
    // An org with nine employees and a search for "zzz" is not an empty org.
    expect(PAGE).toContain("No employees match your search.");
  });

  it("takes its tenant from the shared resolver, not profiles directly", () => {
    // The original cause. A platform account has no profiles.tenant_id.
    expect(PAGE).toContain("useMyTenant()");
    expect(PAGE).not.toMatch(/from\("profiles"\)[\s\S]{0,120}select\("tenant_id"\)/);
  });
});

describe("the same masking elsewhere", () => {
  /**
   * `data ?? []` after a discarded error is a codebase-wide habit, and it is
   * how three separate outages in this product stayed invisible. This counts
   * the remaining list reads that do it, so the number can only fall.
   *
   * Not a failure: converting them is ongoing work. A rise means a new one.
   */
  it("does not grow", () => {
    const routes = join(ROOT, "src/routes");
    let count = 0;
    for (const f of readdirSync(routes)) {
      if (!f.endsWith(".tsx")) continue;
      const src = readFileSync(join(routes, f), "utf8");
      count += (src.match(/const \{ data: \w+ \} = await supabase/g) ?? []).length;
    }
    // 53 when this test was written. Falling is the goal; rising means someone
    // added a read whose failure will render as emptiness.
    expect(count).toBeLessThanOrEqual(53);
  });
});
