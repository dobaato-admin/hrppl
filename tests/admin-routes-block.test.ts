import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Every src/routes/admin.*.tsx MUST gate non-admin users. We accept either:
 *  - a direct role check (`roles.includes(...)`, `hasRole(...)`, `super_admin`,
 *    `org_admin`, `regional_admin`)
 *  - wrapping the page in <AdminGate>
 *
 * This is the static counterpart to the Playwright E2E that exercises real
 * navigation. If this assertion ever fails, a privileged admin page has
 * regressed to public access and the E2E may not catch it before deploy.
 */
const root = process.cwd();
const routesDir = join(root, "src/routes");
const adminRouteFiles = readdirSync(routesDir)
  .filter((f) => f.startsWith("admin.") && f.endsWith(".tsx"))
  .filter((f) => f !== "admin.tsx");

describe("every admin route enforces an RBAC gate", () => {
  for (const file of adminRouteFiles) {
    it(`${file} blocks non-admins`, () => {
      const src = readFileSync(join(routesDir, file), "utf8");
      // A route that only redirects renders nothing, so it has nothing to
      // gate. /admin/security-findings is one: retired in W5 P2 after its
      // richer edit fields were ported to /admin/security. Requiring a gate
      // here would mean gating a page that cannot display data.
      const redirectOnly =
        /beforeLoad:\s*\(\)\s*=>\s*\{\s*throw redirect\(/.test(src) &&
        !/component:/.test(src);
      if (redirectOnly) return;

      const gated =
        /AdminGate/.test(src) ||
        // W5 · The preferred form: the page resolves its own access through the
        // same feature key its nav row uses, so the two cannot disagree. This
        // replaced hand-rolled role lists on ~20 pages, several of which had
        // drifted from the sidebar and were refusing roles it offered them to.
        /\bcan\(\s*["'`][\w.]+["'`]\s*,\s*roles\s*\)/.test(src) ||
        /roles\.includes\(['"`](?:super_admin|org_admin|regional_admin|hr|manager)['"`]\)/.test(src) ||
        /\b(isSuper|isOrg|isRegional|isAdmin|hasRole)\b/.test(src);
      expect(gated, `${file} has no detectable role gate`).toBe(true);
    });
  }
});

describe("admin gating is standardized on <AdminGate> (§1 #10)", () => {
  it("no admin route hand-rolls a bare 'Forbidden.' guard any more", () => {
    // The old pattern let the page component mount and run all its hooks and
    // data fetches, then rendered a dead-end string with no way back. Gating at
    // the route means the component never mounts and the user is redirected.
    const offenders = adminRouteFiles.filter((f) =>
      /Forbidden\./.test(readFileSync(join(routesDir, f), "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("gates at the route level, not inside the page body", () => {
    // `component: () => (<AdminGate …><Page /></AdminGate>)` is the contract;
    // wrapping the returned JSX instead would still mount the page first.
    const notRouteLevel = adminRouteFiles.filter((f) => {
      const src = readFileSync(join(routesDir, f), "utf8");
      if (!/<AdminGate/.test(src)) return false; // direct role checks still allowed
      return !/component:\s*\(\)\s*=>\s*\(\s*<AdminGate/.test(src);
    });
    expect(notRouteLevel).toEqual([]);
  });

  it("every AdminGate names its allow-set explicitly", () => {
    // A bare <AdminGate> admits all of ADMIN_LAYOUT_ROLES. That is right for a
    // page that genuinely admits any admin, but it must be a decision, not a
    // default someone fell into. tests/admin-gate-role-sets.test.ts pins the
    // actual sets.
    const bare = adminRouteFiles.filter((f) => {
      const src = readFileSync(join(routesDir, f), "utf8");
      return /<AdminGate\s*>/.test(src);
    });
    expect(bare).toEqual([]);
  });
});

describe("AdminGate component contract", () => {
  it("uses useAuth and redirects when user lacks an admin role", () => {
    const src = readFileSync(join(root, "src/components/AdminGate.tsx"), "utf8");
    expect(src).toMatch(/useAuth\(\)/);
    expect(src).toMatch(/navigate\(\{\s*to:\s*['"]\/dashboard['"]/);
    expect(src).toMatch(/navigate\(\{\s*to:\s*['"]\/auth['"]/);
  });

  it("has NO default allow-set — one of `feature` or `allow` is required", () => {
    // W5 · This assertion replaces two that checked AdminGate's source for the
    // literals "super_admin"/"org_admin", which were there only because the
    // component imported ADMIN_LAYOUT_ROLES as its default allow-set.
    //
    // That default is deliberately gone. It admitted seven roles, so a gate
    // written without thinking granted far more than its author usually meant —
    // and 36 nav/route gate drifts had accumulated behind exactly that kind of
    // implicit choice. The prop is now a discriminated union, so omitting both
    // is a type error rather than a silently permissive gate.
    const src = readFileSync(join(root, "src/components/AdminGate.tsx"), "utf8");
    expect(src).not.toMatch(/allow\s*=\s*ADMIN_ROLES/);
    expect(src).not.toMatch(/const ADMIN_ROLES/);
    // Both declaration styles are supported, and the union makes one mandatory.
    expect(src).toMatch(/feature\??:\s*Feature/);
    expect(src).toMatch(/allow\??:\s*ReadonlySet<string>/);
    expect(src).toMatch(/allow\?:\s*never/);
    expect(src).toMatch(/feature\?:\s*never/);
    // `feature` resolves through the same matrix the sidebar reads.
    expect(src).toMatch(/can\(feature,/);
  });

  it("admin parent route is a pure layout that renders child admin pages via Outlet", () => {
    const src = readFileSync(join(root, "src/routes/admin.tsx"), "utf8");
    expect(src).toMatch(/function AdminLayout/);
    expect(src).toMatch(/return <Outlet \/>/);
    expect(src).toMatch(/createFileRoute\(["']\/admin["']\)/);
  });
});
