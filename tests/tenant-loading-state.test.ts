import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * "It says no tenant, then a refresh fixes it."
 *
 * ---------------------------------------------------------------------------
 * The bug this file exists to stop
 * ---------------------------------------------------------------------------
 *
 * A page keeps `const [tenant, setTenant] = useState(null)`, fills it from a
 * `useEffect` that reads `profiles.tenant_id` and then `tenants`, and renders
 * straight off it. `null` therefore means two different things — "still
 * loading" and "this account genuinely has no organisation" — and the render
 * treats it as the answer.
 *
 * Measured on /org before the fix:
 *
 *   +139ms  "No tenant assigned" + "Your account isn't linked to an
 *            organization yet", with a Create one button
 *   +545ms  "Acme Global · AU · AUD · starter"
 *
 * Four hundred milliseconds of a signed-in org admin being told they have no
 * organisation — longer on a free-tier database over a real network, and
 * entirely believable while it lasts. The same shape was on /org/employees and
 * /org/danger.
 *
 * Two rules follow, and this file enforces both.
 */

const ROOT = process.cwd();
const ROUTES = join(ROOT, "src/routes");

function routeFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".tsx")) out.push(p);
    }
  };
  walk(ROUTES);
  return out;
}

const rel = (p: string) => p.slice(ROOT.length + 1);

/**
 * Pages still reading `profiles.tenant_id` by hand instead of using the shared,
 * cached `useMyTenantId()` / `useMyTenant()`.
 *
 * Each entry costs a round trip that is already cached elsewhere, and each is
 * *in series* before the page's own query — which is most of what "the app is
 * slow" means. This list is the remaining work, in the order someone should
 * pick it up; it must only ever shrink.
 */
const HANDROLLED_TENANT_LOOKUP = new Set([
  "src/routes/admin.holiday-calendar.tsx",
  "src/routes/admin.holidays.tsx",
  "src/routes/admin.leave-types.tsx",
  "src/routes/admin.onboarding-packs.tsx",
  "src/routes/admin.overtime-rates.tsx",
  "src/routes/admin.payroll-settings.tsx",
  "src/routes/admin.payslip-templates.tsx",
  "src/routes/org.branches.tsx",
  "src/routes/org.danger.tsx",
  "src/routes/org.leave.tsx",
  "src/routes/org.onboarding.index.tsx",
  "src/routes/org.performance.tsx",
  "src/routes/org.timesheets.tsx",
]);

describe("the tenant comes from the shared cached hook", () => {
  const offenders = routeFiles().filter((p) => {
    if (p.includes(`${"api"}/public`)) return false;
    const src = readFileSync(p, "utf8");
    return src.includes('from("profiles")') && src.includes("tenant_id");
  });

  it("no NEW page hand-rolls the profiles → tenant lookup", () => {
    const unexpected = offenders.map(rel).filter((p) => !HANDROLLED_TENANT_LOOKUP.has(p));
    expect(
      unexpected,
      "These pages read profiles.tenant_id directly. useMyTenantId() already " +
        "holds that value, cached for the session with staleTime: Infinity, so " +
        "this is a round trip in series before the page's own data — and a " +
        "`null` that renders as 'no organisation' while it is in flight. Use " +
        "the hook.",
    ).toEqual([]);
  });

  it("the list only shrinks", () => {
    const stillThere = offenders.map(rel);
    const fixed = [...HANDROLLED_TENANT_LOOKUP].filter((p) => !stillThere.includes(p));
    expect(
      fixed,
      "These are recorded as hand-rolling the tenant lookup but no longer do. " +
        "Delete them from HANDROLLED_TENANT_LOOKUP so the list keeps meaning " +
        "what it says.",
    ).toEqual([]);
  });
});

describe("a page never claims 'no organisation' before it knows", () => {
  /**
   * The narrower and more important rule. A page may still hand-roll the
   * lookup — that is only slow — but it must not render the *claim* that the
   * account has no organisation while the answer is outstanding.
   *
   * Detected structurally: a negative tenant claim in JSX must be guarded by
   * something loading-shaped in the same expression.
   */
  const CLAIM =
    /(No tenant assigned|No organization|No organisation|not linked to an organization|not currently scoped to an organization)/;

  /**
   * Comments are stripped before scanning. A comment *explaining* this defect
   * necessarily quotes the sentence it is about, and a checker that cannot tell
   * prose from code fails on its own documentation — which is exactly what
   * happened the first time this test ran.
   */
  const codeOf = (p: string) =>
    readFileSync(p, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  const claimants = routeFiles().filter((p) => CLAIM.test(codeOf(p)));

  it("finds the pages that make such a claim", () => {
    expect(claimants.length).toBeGreaterThan(0);
  });

  it.each(claimants.map(rel))("%s guards the claim with a loading state", (file) => {
    const src = codeOf(join(ROOT, file));
    const idx = src.search(CLAIM);
    // The guard is nearby: the conditional that renders the claim, or the
    // early-return above it.
    const window = src.slice(Math.max(0, idx - 900), idx + 200);
    expect(
      /isLoading|tenantLoading|isPending|!loading|[Ll]oaded/.test(window),
      `${file} renders a "no organisation" claim with no nearby loading guard. ` +
        "That sentence is only true once the lookup has finished; before then " +
        "it accuses a signed-in admin of something untrue, and a refresh " +
        "appears to fix it.",
    ).toBe(true);
  });
});
