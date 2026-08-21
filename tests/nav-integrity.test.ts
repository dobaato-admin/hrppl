import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Finalization Plan §1 #3 — "Multiple navigation entries lead to the same
 * destination; features listed with no hierarchy."
 *
 * Two properties are asserted:
 *   1. no two nav entries point at the same route (the literal complaint);
 *   2. every nav destination is a route that actually exists.
 *
 * (2) is not in the original issue but is the same class of defect and is
 * cheap to hold: the security pass found `<Link to="/admin/organization">` in
 * admin.payroll-wizard.tsx pointing at a route that has never existed. A dead
 * nav link is indistinguishable from a broken feature to the person clicking
 * it.
 */

const root = process.cwd();
const APPSHELL = readFileSync(join(root, "src/components/AppShell.tsx"), "utf8");
const ROUTE_TREE = readFileSync(join(root, "src/routeTree.gen.ts"), "utf8");

/** Every `to: "/…"` in the nav definitions. */
function navDestinations(): string[] {
  return [...APPSHELL.matchAll(/\bto:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
}

/** Paths the generated route tree knows about. */
function knownRoutes(): Set<string> {
  const paths = new Set<string>();
  for (const m of ROUTE_TREE.matchAll(/^\s*path:\s*'([^']+)'/gm)) paths.add(m[1]);
  for (const m of ROUTE_TREE.matchAll(/'(\/[^']*)':\s*typeof/g)) paths.add(m[1]);
  return paths;
}

describe("navigation destinations are unique", () => {
  it("no two entries lead to the same place", () => {
    const seen = new Map<string, number>();
    for (const to of navDestinations()) seen.set(to, (seen.get(to) ?? 0) + 1);

    const duplicated = [...seen.entries()]
      .filter(([, n]) => n > 1)
      .map(([to, n]) => `${to} (x${n})`);

    expect(duplicated).toEqual([]);
  });
});

describe("navigation destinations exist", () => {
  it("every nav link resolves to a real route", () => {
    const known = knownRoutes();
    // Index routes are emitted as "/x/" in some of the generated tables.
    const dead = navDestinations().filter((to) => !known.has(to) && !known.has(to + "/"));
    expect(dead).toEqual([]);
  });
});

describe("personal navigation has hierarchy", () => {
  it("is grouped into sections rather than one flat list", () => {
    // The original was 24 flat entries under a single heading.
    expect(APPSHELL).toMatch(/const MY_SECTIONS: NavSection\[\]/);
    expect(APPSHELL).toMatch(/sections=\{MY_SECTIONS\}/);
  });

  it("keeps only true landing pages at the top level", () => {
    const block = APPSHELL.slice(
      APPSHELL.indexOf("const MY_ITEMS: NavItem[]"),
      APPSHELL.indexOf("const MY_SECTIONS"),
    );
    const tops = [...block.matchAll(/\bto:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
    expect(tops).toEqual(["/dashboard", "/me"]);
  });

  it("groups every remaining personal link under a named section", () => {
    const block = APPSHELL.slice(
      APPSHELL.indexOf("const MY_SECTIONS"),
      APPSHELL.indexOf("function NavLinkButton"),
    );
    const titles = [...block.matchAll(/^\s{4}title:\s*"([^"]+)"/gm)].map((m) => m[1]);
    expect(titles).toEqual([
      "Profile",
      "Time & leave",
      "Pay & expenses",
      "Growth",
      "Records & requests",
    ]);
  });

  it("keeps the two performance surfaces adjacent so they read as distinct", () => {
    // /performance (goals + 360) and /me/reviews (scheduled scorecards) are
    // different pages that looked like duplicates in the old flat list.
    const growth = APPSHELL.slice(APPSHELL.indexOf('title: "Growth"'));
    const perf = growth.indexOf('to: "/performance"');
    const scorecards = growth.indexOf('to: "/me/reviews"');
    expect(perf).toBeGreaterThan(-1);
    expect(scorecards).toBeGreaterThan(perf);
  });
});
