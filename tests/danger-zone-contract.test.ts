/**
 * Phase 5 — Static contract test for the org/danger route + danger-zone server fns.
 *
 * Verifies that every destructive server fn:
 *   - is gated by requireSupabaseAuth middleware
 *   - calls assertOrgAdmin (no anonymous destructive paths)
 *   - validates input with zod
 *
 * Also verifies the route is gated to the org.danger feature in src/lib/rbac.ts.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { NAV_DESTINATIONS } from "../src/lib/nav-tree";

const root = process.cwd();
const fnFile = readFileSync(join(root, "src/lib/danger-zone.functions.ts"), "utf8");
const routeFile = readFileSync(join(root, "src/routes/org.danger.tsx"), "utf8");
const rbacFile = readFileSync(join(root, "src/lib/rbac.ts"), "utf8");
const shellFile = readFileSync(join(root, "src/components/AppShell.tsx"), "utf8");
const confirmFile = readFileSync(join(root, "src/components/DestructiveConfirm.tsx"), "utf8");

const FNS = ["deleteTenant", "bulkDeleteEmployees", "purgePayrollHistory", "transferOwnership"];

describe("danger-zone server fns — security contract", () => {
  it("file exports all four destructive server fns", () => {
    for (const name of FNS) {
      expect(fnFile, `missing ${name}`).toMatch(new RegExp(`export const ${name}\\s*=`));
    }
  });

  it("every fn requires authenticated user via middleware", () => {
    // One global middleware import + per-fn .middleware([requireSupabaseAuth])
    expect(fnFile).toMatch(/requireSupabaseAuth/);
    const blocks = fnFile.split(/export const /).slice(1);
    const fnBlocks = blocks.filter((b) => FNS.some((n) => b.startsWith(n)));
    expect(fnBlocks.length).toBe(FNS.length);
    for (const block of fnBlocks) {
      expect(block, `block missing middleware: ${block.slice(0, 40)}`).toMatch(
        /\.middleware\(\[\s*requireSupabaseAuth\s*\]\)/,
      );
    }
  });

  it("every fn enforces assertOrgAdmin before mutating", () => {
    const blocks = fnFile.split(/export const /).slice(1);
    for (const name of FNS) {
      const block = blocks.find((b) => b.startsWith(name))!;
      expect(block, `${name} should call assertOrgAdmin`).toMatch(/assertOrgAdmin\(/);
    }
  });

  it("every fn validates input with zod", () => {
    const blocks = fnFile.split(/export const /).slice(1);
    for (const name of FNS) {
      const block = blocks.find((b) => b.startsWith(name))!;
      expect(block, `${name} should validate via z.object`).toMatch(/z\.object\(/);
    }
  });

  it("loads supabaseAdmin only inside handler bodies (never at module scope)", () => {
    // Module-top import of the server-only client would leak it into the
    // client bundle.  Must be dynamic import inside async loadAdmin().
    expect(fnFile).not.toMatch(/^import .*client\.server/m);
    expect(fnFile).toMatch(/await import\(['"]@\/integrations\/supabase\/client\.server['"]\)/);
  });
});

describe("DestructiveConfirm component contract", () => {
  it("requires typed-token match before enabling action", () => {
    expect(confirmFile).toMatch(/typed === typedToken/);
  });
  it("supports password re-auth via signInWithPassword", () => {
    expect(confirmFile).toMatch(/signInWithPassword/);
  });
});

describe("org.danger route + RBAC wiring", () => {
  it("declares the org.danger feature in rbac.ts", () => {
    expect(rbacFile).toMatch(/['"]org\.danger['"]\s*[:,|]/);
    // Allowed roles in the matrix
    const match = rbacFile.match(/['"]org\.danger['"]\s*:\s*SET\(([^)]+)\)/);
    expect(match, "org.danger row missing from MATRIX").not.toBeNull();
    const list = match![1];
    expect(list).toMatch(/super_admin/);
    expect(list).toMatch(/org_admin/);
    // Must NOT include any other role
    expect(list).not.toMatch(/employee|manager|hr|finance|branch_admin|regional_admin/);
  });

  it("route page gates rendering on can('org.danger')", () => {
    expect(routeFile).toMatch(/can\(\s*['"]org\.danger['"]/);
  });

  it("nav entry is gated on the org.danger feature", () => {
    // W5 · The nav moved out of AppShell.tsx into src/lib/nav-tree.ts, so this
    // reads the registry rather than the component. The guarantee is stronger
    // than the old regex: it checks the actual entry the sidebar renders, and
    // that its feature key is the one org.danger.tsx also quotes.
    const entry = NAV_DESTINATIONS.find((d) => d.to === "/org/danger");
    expect(entry, "no nav entry for /org/danger").toBeDefined();
    expect(entry!.feature).toBe("org.danger");
    // AppShell still resolves every entry's feature through can(). Since
    // 2026-09-09 that happens in the shared `isNavItemVisible` predicate rather
    // than inline in each group component.
    expect(shellFile).toMatch(/can\(item\.feature, roles\)/);
  });

  it("route file calls every destructive server fn through useServerFn", () => {
    expect(routeFile).toMatch(/useServerFn\(\s*deleteTenant\s*\)/);
    expect(routeFile).toMatch(/useServerFn\(\s*bulkDeleteEmployees\s*\)/);
    expect(routeFile).toMatch(/useServerFn\(\s*purgePayrollHistory\s*\)/);
    expect(routeFile).toMatch(/useServerFn\(\s*transferOwnership\s*\)/);
  });

  it("every destructive action requires password re-auth", () => {
    // Each DestructiveConfirm usage in the route should set requirePassword
    const confirmCount = (routeFile.match(/DestructiveConfirm/g) ?? []).length;
    // 1 import + 4 usages
    expect(confirmCount).toBeGreaterThanOrEqual(5);
    const requirePwCount = (routeFile.match(/requirePassword/g) ?? []).length;
    expect(requirePwCount).toBeGreaterThanOrEqual(4);
  });
});
