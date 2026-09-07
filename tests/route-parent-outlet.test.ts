import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, globSync } from "fs";
import { join } from "path";

/**
 * A parent route that renders a component but no <Outlet /> silently swallows
 * every child route beneath it.
 *
 * TanStack matches the child (its `head` even applies, so the browser tab is
 * right) but the child component has nowhere to render — the parent's own page
 * renders in its place. Nothing throws and nothing warns.
 *
 * This shipped: `onboarding.tsx` was a full page AND the parent of
 * `onboarding.profile.tsx`, so /onboarding/profile rendered the onboarding
 * checklist instead of the profile form. Because the checklist auto-redirects
 * to /dashboard on completion, and /dashboard redirects back to
 * /onboarding/profile until the profile is submitted — a profile the user could
 * never reach, let alone submit — the two bounced forever.
 *
 * Three more parents had the same shape (org.onboarding, its control-room, and
 * careers.$tenantSlug), making /org/onboarding/tracker,
 * /org/onboarding/control-room/$id and every public job detail page
 * unreachable. All four are now split into `<name>.index.tsx` siblings, the
 * convention already used by admin/me/org.documents/org.recruitment/careers.
 *
 * Pure server routes (`server: { handlers }`, no component) are exempt: they
 * have no component tree, so nesting does not run through an <Outlet />.
 */

const ROOT = process.cwd();
const GEN = readFileSync(join(ROOT, "src/routeTree.gen.ts"), "utf8");

/** Route symbol -> source file, from the generated import block. */
const IMPORTS = new Map<string, string>(
  [...GEN.matchAll(/import \{ Route as (\w+) \} from '\.\/routes\/([^']+)'/g)].map((m) => [
    m[1],
    m[2],
  ]),
);

/** Every symbol some other route names as its parent. */
const PARENT_SYMBOLS = new Set(
  [...GEN.matchAll(/parentRoute:\s*typeof\s+(\w+)/g)].map((m) => m[1]),
);

function sourceFor(routeSymbol: string): { path: string; src: string } | null {
  const file = IMPORTS.get(`${routeSymbol}Import`);
  if (!file) return null; // rootRouteImport, or a generated virtual parent
  for (const ext of [".tsx", ".ts"]) {
    const p = join(ROOT, "src/routes", file + ext);
    if (existsSync(p)) return { path: `src/routes/${file}${ext}`, src: readFileSync(p, "utf8") };
  }
  return null;
}

/** A route file with `server:` handlers and no `component:` renders nothing. */
function isPureServerRoute(src: string): boolean {
  return /\bserver:\s*\{/.test(src) && !/\bcomponent:/.test(src);
}

describe("every parent route can render its children", () => {
  const parents = [...PARENT_SYMBOLS]
    .map((sym) => ({ sym, file: sourceFor(sym) }))
    .filter((p): p is { sym: string; file: { path: string; src: string } } => !!p.file);

  it("finds parent routes to check (guards against the scan silently matching nothing)", () => {
    expect(parents.length).toBeGreaterThan(5);
  });

  it.each(parents.map((p) => [p.file.path, p.sym] as const))(
    "%s renders an <Outlet />",
    (path, sym) => {
      const { src } = sourceFor(sym)!;
      if (isPureServerRoute(src)) return; // no component tree to nest into
      expect(
        src.includes("<Outlet"),
        `${path} is the parent of at least one child route but renders no <Outlet />. ` +
          `Its children will never mount — the browser will show this page instead. ` +
          `Split it: move the page body to the sibling "<name>.index.tsx" and either ` +
          `drop this file or reduce it to a layout that renders <Outlet />.`,
      ).toBe(true);
    },
  );

  it("has no dangling parent references", () => {
    // A partially-regenerated tree can name a parent whose file was deleted.
    // That is a TypeScript error, but it has reached disk before (two dev
    // servers writing routeTree.gen.ts at once), so check it directly.
    for (const sym of PARENT_SYMBOLS) {
      if (sym === "rootRouteImport") continue;
      const declared = new RegExp(`const ${sym} = `).test(GEN) || IMPORTS.has(`${sym}Import`);
      expect(declared, `routeTree.gen.ts names ${sym} as a parent but never defines it`).toBe(true);
    }
  });
});

describe("the routes that regressed stay reachable", () => {
  // Pinned by full path: each must be its own route, not nested under a
  // page-rendering parent.
  const MUST_BE_SIBLINGS = [
    "/onboarding/profile",
    "/org/onboarding/tracker",
    "/org/onboarding/control-room/$id",
    "/careers/$tenantSlug/$jobSlug",
  ];

  // Assert on fullPath, not path: a route nested under a layout (org.tsx)
  // carries a path relative to that layout, so `path` differs between the
  // root-parented and org-parented cases while fullPath is uniform.
  it.each(MUST_BE_SIBLINGS)("%s is declared with its full path", (fullPath) => {
    expect(GEN).toContain(`fullPath: '${fullPath}'`);
  });

  it.each([
    "src/routes/onboarding.index.tsx",
    "src/routes/org.onboarding.index.tsx",
    "src/routes/org.onboarding.control-room.index.tsx",
    "src/routes/careers.$tenantSlug.index.tsx",
  ])("%s exists as an index route", (f) => {
    expect(existsSync(join(ROOT, f)), `${f} is missing`).toBe(true);
  });

  it.each([
    "src/routes/onboarding.tsx",
    "src/routes/org.onboarding.tsx",
    "src/routes/org.onboarding.control-room.tsx",
    "src/routes/careers.$tenantSlug.tsx",
  ])("%s must not come back as a page", (f) => {
    // Re-adding these as page components silently re-nests the siblings above.
    // If a layout is genuinely wanted here, it must render <Outlet />, which
    // the suite above enforces.
    const p = join(ROOT, f);
    if (!existsSync(p)) return;
    expect(readFileSync(p, "utf8")).toContain("<Outlet");
  });
});

describe("every authenticated page renders inside the app chrome", () => {
  /**
   * A page with no AppShell above it has no sidebar and no top bar. Nothing
   * errors — it just renders bare, and the user's only way out is the browser
   * back button.
   *
   * Twenty routes shipped like that. `admin.tsx` is a bare <Outlet /> by design
   * (pinned above), so every /admin page must render its own shell; `org.tsx`
   * was ALSO a bare <Outlet /> by accident, which silently orphaned eight
   * first-class destinations including Employees, Run payroll and Reports.
   *
   * A route is covered if it renders AppShell itself, or if some ancestor
   * layout route does.
   */
  const LAYOUT_PROVIDERS = ["me", "org", "org.documents", "org.recruitment"];

  /** Components that render an AppShell themselves, on every return path. */
  const CHROME_WRAPPERS = ["AuComplianceShell"];

  /** Public, pre-auth, or gate destinations — chrome would be wrong on these. */
  const EXEMPT_EXACT = new Set([
    "__root",
    "index",
    "auth",
    "signup",
    "forgot-password",
    "reset-password",
    "welcome",
    "suspended",
    "org.setup",
    "onboarding.profile",
    "dev-session",
    "unsubscribe",
    "developers",
    "contact",
    "pricing",
    "privacy",
    "terms",
    "admin", // the bare layout itself
  ]);
  const EXEMPT_PREFIX = ["api.", "blog", "careers", "invite.", "sign.", "email.", "[.", "help.$"];

  const routeFiles = globSync("src/routes/**/*.tsx", { cwd: ROOT }).map((f) =>
    f
      .replace(/\\/g, "/")
      .replace("src/routes/", "")
      .replace(/\.tsx$/, ""),
  );

  function ancestorsOf(name: string): string[] {
    // "org.onboarding.tracker" -> ["org.onboarding", "org"]
    const parts = name.split(".");
    const out: string[] = [];
    for (let i = parts.length - 1; i > 0; i--) out.push(parts.slice(0, i).join("."));
    return out;
  }

  /**
   * True when the route's component tree is nothing but an <Outlet /> (plus,
   * optionally, a gate wrapper). Anything with real markup — a heading, a nav,
   * a <div> of its own — is a page and must answer for its chrome.
   */
  function isPureLayout(src: string): boolean {
    if (!src.includes("<Outlet")) return false;
    const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    // Any JSX tag that is not Outlet, a gate, or a fragment makes this a page.
    const tags = [...stripped.matchAll(/<([A-Za-z][\w.]*)/g)].map((m) => m[1]);
    return tags.every((t) => t === "Outlet" || /Gate$/.test(t));
  }

  const uncovered: string[] = [];
  for (const name of routeFiles) {
    const base = name.replace(/\.index$/, "");
    if (EXEMPT_EXACT.has(base) || EXEMPT_EXACT.has(name)) continue;
    if (EXEMPT_PREFIX.some((p) => name.startsWith(p))) continue;

    const own = readFileSync(join(ROOT, "src/routes", `${name}.tsx`), "utf8");
    if (own.includes("<AppShell")) continue;
    // A component that wraps AppShell in every branch counts. AuComplianceShell
    // is the only one: the five Australian pages share it because they all need
    // the same tenant / country / loading answers before they can render, and
    // writing that out five times is five chances to get one subtly different.
    // The suite below pins that it really does provide chrome on every path.
    if (CHROME_WRAPPERS.some((w) => own.includes(`<${w}`))) continue;
    // A redirect-only route renders nothing at all, so it cannot render
    // chrome-less. It has no component; the user is sent elsewhere before
    // anything paints. Retired duplicates are kept in this form rather than
    // deleted, so a bookmarked URL still lands somewhere sensible.
    if (/throw redirect\(/.test(own) && !/component:/.test(own)) continue;
    // A pure layout route renders only its children — an <Outlet /> and at most
    // a gate around it, with no markup of its own. It cannot appear
    // chrome-less because it never paints anything; the child underneath it is
    // the page, and the page is checked on its own line above. `admin.tsx` has
    // always had this shape (it is why every /admin page carries its own
    // AppShell) and `admin.training.tsx` took it when the course builder was
    // added. Detected rather than listed, so the next one does not have to be
    // remembered.
    if (isPureLayout(own)) continue;
    // For an index route the provider is the segment itself: me.index.tsx sits
    // under me.tsx, not under a further ancestor.
    if (name.endsWith(".index") && LAYOUT_PROVIDERS.includes(base)) continue;
    if (ancestorsOf(base).some((a) => LAYOUT_PROVIDERS.includes(a))) continue;
    uncovered.push(name);
  }

  it("scans a realistic number of route files", () => {
    expect(routeFiles.length).toBeGreaterThan(100);
  });

  it("leaves no authenticated page without chrome", () => {
    expect(
      uncovered,
      "These render no AppShell and have no layout ancestor that does, so they " +
        "show with no sidebar and no top bar. Wrap the page in <AppShell>, or " +
        "add its parent to LAYOUT_PROVIDERS if that layout now supplies chrome.",
    ).toEqual([]);
  });

  it("org.tsx supplies chrome to its children", () => {
    // The regression: org.tsx returned a bare <Outlet /> on the path every real
    // user takes, so /org/employees, /org/payroll, /org/reports and five more
    // rendered with no navigation.
    const org = readFileSync(join(ROOT, "src/routes/org.tsx"), "utf8");
    expect(org).toMatch(/<AppShell>\s*<Outlet \/>/);
    // ...but not to the pre-tenant setup wizard, which is reachable before the
    // user has an org at all.
    expect(org).toMatch(/isSetupWizard/);
  });

  it("admin.tsx stays a bare Outlet", () => {
    // tests/admin-routes-block.test.ts depends on this; the /admin pages each
    // carry their own shell instead.
    const admin = readFileSync(join(ROOT, "src/routes/admin.tsx"), "utf8");
    expect(admin).not.toMatch(/<AppShell/);
  });
});

describe("the completion redirect fires once, not on every visit", () => {
  const SRC = readFileSync(join(ROOT, "src/routes/onboarding.index.tsx"), "utf8");

  it("persists the redirect flag beyond the component lifetime", () => {
    // useState alone resets on unmount, and navigating to /dashboard unmounts
    // this page — so every subsequent visit re-fired the toast and bounced the
    // user out before they could read the completed-summary block below it.
    expect(SRC).toMatch(/sessionStorage\.setItem\(/);
    expect(SRC).toMatch(/onboarding-welcomed/);
  });

  it("clears the flag when the checklist stops being complete", () => {
    // HR rejecting an item reopens the checklist; completing it again should
    // redirect again.
    expect(SRC).toMatch(/sessionStorage\.removeItem\(/);
  });
});

describe("AuComplianceShell really is a chrome provider", () => {
  /**
   * The chrome scan above accepts this component in place of a literal
   * <AppShell>. That is only safe while every one of its return paths renders
   * one — it has four (loading, no tenant, wrong country, content), and an
   * early return that forgot the shell would put a page on screen with no
   * sidebar and nothing would error to say so.
   */
  const SRC = readFileSync(join(ROOT, "src/components/AuComplianceShell.tsx"), "utf8");

  it("renders an AppShell on every return path", () => {
    const returns = SRC.match(/return \(/g) ?? [];
    const shells = SRC.match(/<AppShell/g) ?? [];
    expect(returns.length).toBeGreaterThanOrEqual(4);
    expect(
      shells.length,
      "Every return in AuComplianceShell must render an <AppShell>; the chrome " +
        "scan trusts it in place of one.",
    ).toBe(returns.length);
  });

  it("does not gate — that belongs at the route", () => {
    // Authorization lives in <AdminGate feature="…"> on the route so the page
    // never mounts for the wrong role and the parity test can read the gate.
    // A second gate in here would double-gate every AU page.
    expect(SRC).not.toMatch(/<AdminGate/);
  });
});
