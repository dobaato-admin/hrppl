/**
 * T14 — the super admin "Your work" group.
 *
 * "Platform admin / Tenants / Employees / Run payroll" sat under one heading
 * with no indication of which organisation the org-scoped items acted on.
 *
 * For a platform account the answer was usually "none". A platform admin has
 * no tenant of their own — `profiles.tenant_id` is NULL — so every
 * tenant-scoped query returns nothing until they select one through the
 * TenantSwitcher. Two of the four rows therefore opened empty pages, and the
 * grouping was what made that look like a bug rather than a missing choice.
 *
 * The ticket's open question — "should super admins manage employees and run
 * payroll directly, or only after entering a tenant context?" — is settled
 * here as **only within a tenant context**. `createPayrollRun` takes a tenant
 * id and every employees read is tenant-scoped; acting as a tenant is how a
 * platform admin says which one.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { can } from "@/lib/rbac";
import {
  roleShortcuts,
  ROLE_PRIMARY,
  ROLE_PRIMARY_ORG_SCOPED,
  NAV_DESTINATIONS,
} from "@/lib/nav-tree";
import type { AppRole } from "@/lib/rbac";

const SUPER: AppRole[] = ["super_admin"];
const ORG_ADMIN: AppRole[] = ["org_admin"];

describe("platform scope and org scope are separate lists", () => {
  it("super_admin's primary shortcuts are platform-only", () => {
    const paths = roleShortcuts(SUPER, can).map((d) => d.to);
    expect(paths).toContain("/admin");
    expect(paths).toContain("/platform/tenants");
    expect(paths).not.toContain("/org/employees");
    expect(paths).not.toContain("/org/payroll");
  });

  it("the org-scoped ones still exist, in their own list", () => {
    const paths = roleShortcuts(SUPER, can, "orgScoped").map((d) => d.to);
    expect(paths).toEqual(["/org/employees", "/org/payroll"]);
  });

  it("no path appears in both lists", () => {
    for (const [role, paths] of Object.entries(ROLE_PRIMARY)) {
      const scoped = ROLE_PRIMARY_ORG_SCOPED[role as AppRole] ?? [];
      expect(paths.filter((p) => scoped.includes(p))).toEqual([]);
    }
  });

  it("only roles without a tenant of their own have an org-scoped list", () => {
    // An org_admin IS in an organisation, so their shortcuts need no
    // disambiguation and must not be hidden behind a tenant choice.
    expect(Object.keys(ROLE_PRIMARY_ORG_SCOPED).sort()).toEqual([
      "regional_admin",
      "super_admin",
    ]);
    expect(roleShortcuts(ORG_ADMIN, can, "orgScoped")).toEqual([]);
    expect(roleShortcuts(ORG_ADMIN, can).map((d) => d.to)).toContain("/org/employees");
  });

  it("every org-scoped shortcut still resolves to a real destination", () => {
    // Same guarantee the primary list has had since W5: a shortcut is a second
    // way to reach a page, never a second page, and never a dead link.
    for (const paths of Object.values(ROLE_PRIMARY_ORG_SCOPED)) {
      for (const to of paths) {
        expect(NAV_DESTINATIONS.some((d) => d.to === to), `${to} must be a destination`).toBe(true);
      }
    }
  });

  it("drops an org-scoped shortcut the role cannot actually open", () => {
    const denyAll = () => false;
    expect(roleShortcuts(SUPER, denyAll, "orgScoped")).toEqual([]);
  });
});

/**
 * Comments stripped before scanning. Three of these assertions describe what
 * the code must NOT say, and the code's own comment explaining why says
 * exactly those words — a scan over raw source matches the explanation and
 * reports the opposite of the truth.
 */
function codeOf(src: string): string {
  return src
    .split("\n")
    .map((l) => l.replace(/^\s*\/\/.*$/, ""))
    .join("\n");
}

describe("the sidebar says which organisation, or that there isn't one", () => {
  const shell = codeOf(readFileSync("src/components/AppShell.tsx", "utf8"));

  it("labels the platform group 'Platform', not 'Your work'", () => {
    expect(shell).toMatch(/orgScoped\.length > 0 \? "Platform" : "Your work"/);
  });

  it("names the acting organisation in the group heading", () => {
    expect(shell).toMatch(/`In \$\{actingTenant\.name\}`/);
  });

  it("does not render org-scoped rows with no organisation selected", () => {
    expect(shell).toMatch(/No organisation selected/);
    expect(shell).toMatch(/Choose one from the switcher above/);
  });

  it("explains rather than disabling", () => {
    // A disabled link says "you may not". The truth is "we do not know which
    // organisation yet", and those call for different words — so the branch
    // renders prose, not greyed-out rows.
    // The else-branch only: from the ternary's `) : (` up to the prose. The
    // truthy branch above it legitimately renders NavLinkButtons.
    const proseAt = shell.indexOf("Choose one from the switcher above");
    const elseAt = shell.lastIndexOf(") : (", proseAt);
    const block = shell.slice(elseAt, proseAt);
    expect(block).not.toMatch(/disabled/);
    expect(block).not.toMatch(/NavLinkButton/);
    expect(block).toMatch(/<p /);
  });

  it("reuses the acting-tenant query the banner already makes", () => {
    // Same key, same staleTime — one request, two readers.
    const banner = readFileSync("src/components/ActingTenantBanner.tsx", "utf8");
    expect(banner).toMatch(/\["platform-acting-tenant-options", user\?\.id\]/);
    expect(shell).toMatch(/\["platform-acting-tenant-options", user\?\.id\]/);
  });
});
