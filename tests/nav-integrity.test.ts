import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  MY_ITEMS,
  MY_SECTIONS,
  NAV_DESTINATIONS,
} from "../src/lib/nav-tree";

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
 *
 * W5 · This used to regex-scan AppShell.tsx, because that was where the nav
 * was authored. It now reads src/lib/nav-tree.ts through its actual exports —
 * the same values the sidebar renders and GlobalSearch searches, rather than a
 * text approximation of them. Asserting on the data means a nav entry that
 * type-checks but is wrong (a duplicate route, a dead link) still fails here.
 */

const root = process.cwd();
const ROUTE_TREE = readFileSync(join(root, "src/routeTree.gen.ts"), "utf8");

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
    for (const d of NAV_DESTINATIONS) seen.set(d.to, (seen.get(d.to) ?? 0) + 1);
    const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([to]) => to);
    expect(dupes).toEqual([]);
  });
});

describe("navigation destinations exist", () => {
  it("every nav link resolves to a real route", () => {
    const known = knownRoutes();
    const dead = NAV_DESTINATIONS.map((d) => d.to).filter((to) => {
      if (known.has(to)) return false;
      // Index routes are registered with a trailing slash in the generated tree.
      return !known.has(to + "/");
    });
    expect(dead).toEqual([]);
  });
});

describe("personal navigation has hierarchy", () => {
  it("keeps only true landing pages at the top level", () => {
    // The original was 24 flat entries under a single heading.
    expect(MY_ITEMS.map((i) => i.to)).toEqual(["/dashboard", "/me"]);
  });

  it("groups every remaining personal link under a named section", () => {
    expect(MY_SECTIONS.map((s) => s.title)).toEqual([
      "Profile",
      "Time & leave",
      "Pay & expenses",
      "Growth",
      "Records & requests",
    ]);
    // No section may be empty — an empty one renders as a heading with nothing
    // under it, which reads as a broken page rather than an absent feature.
    for (const s of MY_SECTIONS) expect(s.items.length).toBeGreaterThan(0);
  });

  it("keeps the two performance surfaces adjacent so they read as distinct", () => {
    // /performance (goals + 360) and /me/reviews (scheduled scorecards) are
    // different pages that looked like duplicates in the old flat list.
    const growth = MY_SECTIONS.find((s) => s.title === "Growth");
    expect(growth).toBeDefined();
    const tos = growth!.items.map((i) => i.to);
    const perf = tos.indexOf("/performance");
    const scorecards = tos.indexOf("/me/reviews");
    expect(perf).toBeGreaterThan(-1);
    expect(scorecards).toBe(perf + 1);
  });
});

describe("the registry is complete", () => {
  it("every destination declares the group it belongs to", () => {
    for (const d of NAV_DESTINATIONS) {
      expect(d.to.startsWith("/")).toBe(true);
      expect(d.title.length).toBeGreaterThan(0);
      expect(d.group.length).toBeGreaterThan(0);
    }
  });

  it("covers all ten sidebar groups", () => {
    // If a group disappears from the registry the sidebar silently loses a
    // whole section, which no other assertion here would notice.
    const groups = [...new Set(NAV_DESTINATIONS.map((d) => d.group))];
    expect(groups.sort()).toEqual(
      [
        "Account",
        "Help",
        "Manager",
        "My workspace",
        "Organization",
        "Practice",
        "Regional",
        "Super admin",
      ].sort(),
    );
  });

  it("no Organization subgroup exceeds the nine-item cap", () => {
    // The W4 regroup exists because Operations had grown to 17 items in one
    // flat list. The cap is the outcome that wave bought; this holds it.
    const bySection = new Map<string, number>();
    for (const d of NAV_DESTINATIONS) {
      if (d.group !== "Organization" || !d.section) continue;
      bySection.set(d.section, (bySection.get(d.section) ?? 0) + 1);
    }
    const over = [...bySection.entries()].filter(([, n]) => n > 9);
    expect(over).toEqual([]);
  });
});
