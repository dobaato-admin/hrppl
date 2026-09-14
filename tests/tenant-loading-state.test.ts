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
const HANDROLLED_TENANT_LOOKUP = new Set<string>([
  // Empty as of 2026-09-14. All thirteen now use useMyTenantId() / useMyTenant()
  // / useMyTenantCountry(), which also made them honour the tenant switcher —
  // the same defect as Priority 1, in the route layer.
]);

describe("the tenant comes from the shared cached hook", () => {
  /**
   * Comments are stripped before scanning, for the same reason the second
   * describe below does it: a comment explaining what a page USED to do has to
   * quote the code it replaced, and a checker that cannot tell prose from code
   * fails on its own documentation. That happened here, on the very commit that
   * emptied this list.
   */
  const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  const offenders = routeFiles().filter((p) => {
    if (p.includes(`${"api"}/public`)) return false;
    const src = strip(readFileSync(p, "utf8"));
    // Only a tenant lookup counts. Reading `profiles` for something else —
    // payslip-templates resolves audit actors' emails — is not this defect.
    const m = /\.from\("profiles"\)[\s\S]{0,200}?\.select\("([^"]*)"/.exec(src);
    return !!m && m[1].includes("tenant_id");
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

/**
 * The same rule, applied to the employee-facing pages where an empty list is
 * itself a claim about the person's own record.
 *
 * "No organisation" was only the loudest instance. Each sentence below was
 * being rendered off a `useState([])` that an effect had not filled yet, so it
 * stated something false for as long as the query took — and every one of them
 * is a statement an employee would reasonably act on:
 *
 *   /leave        "No leave types configured yet."  → your employer has set up no leave
 *   /attendance   "No timesheets yet."              → attendance is the input to pay
 *   /performance  "No goals yet."                   → you have no objectives
 *   /team         "No direct reports yet."          → you manage nobody
 *   /my-payslips  "No approved payslips yet."       → you have never been paid
 *
 * They are listed explicitly rather than detected by a general rule, because
 * "No …" appears all over the codebase as a perfectly honest label — "No limit",
 * "No scopes", "No reset token found in that link" — and a checker that cannot
 * tell a claim from a label produces noise, which is how a check stops being
 * read at all.
 */
describe("an empty list is not rendered as an answer before it is one", () => {
  const PAGE_CLAIMS: Array<[string, RegExp]> = [
    ["src/routes/leave.tsx", /No leave types configured yet/],
    ["src/routes/attendance.tsx", /No timesheets yet/],
    ["src/routes/performance.tsx", /No goals yet/],
    ["src/routes/team.tsx", /No direct reports yet/],
    ["src/routes/my-payslips.tsx", /No approved payslips yet/],
  ];

  const codeOf2 = (p: string) =>
    readFileSync(p, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  it.each(PAGE_CLAIMS)("%s guards its empty state", (file, claim) => {
    const src = codeOf2(join(ROOT, file));
    const idx = src.search(claim);
    expect(idx, `${file} no longer contains the sentence this test is about`).toBeGreaterThan(-1);
    const window = src.slice(Math.max(0, idx - 600), idx + 200);
    expect(
      /isLoading|isPending|[Ll]oaded|isFetching/.test(window),
      `${file} states an empty result with no nearby loading guard. The list ` +
        "starts as [], so this sentence is rendered as the answer while the " +
        "answer is still in flight.",
    ).toBe(true);
  });
});
