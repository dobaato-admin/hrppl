/**
 * Every deep link the requests inbox produces must resolve to a real route.
 *
 * The inbox is a router: it normalises six tables and then hands each row an
 * `href` into the page that owns it. A wrong one is invisible in review and
 * lands the user on a 404 from a list that otherwise looks correct — which is
 * exactly what happened on the first pass, where the support-ticket rows
 * pointed at `/admin/support`, a route that has never existed.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const inboxSrc = readFileSync(join(ROOT, "src/lib/requests-inbox.functions.ts"), "utf8");
const routeTree = readFileSync(join(ROOT, "src/routeTree.gen.ts"), "utf8");

/** Every `href: "/…"` literal the inbox can emit. */
function inboxHrefs(): string[] {
  return [...inboxSrc.matchAll(/href:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
}

/**
 * The set of full, navigable paths.
 *
 * Deliberately NOT the `path:` literals — those are stored relative to the
 * parent route, so `/me/wfh` appears there only as `'/wfh'` and a naive scan
 * reports every nested route as dead. `FileRoutesByFullPath` is the generated
 * map of complete paths, which is what a link actually has to match.
 */
function knownRoutes(): Set<string> {
  const block = routeTree.match(/export interface FileRoutesByFullPath \{([\s\S]*?)\n\}/);
  if (!block) throw new Error("FileRoutesByFullPath not found in routeTree.gen.ts");
  return new Set([...block[1].matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]));
}

describe("requests inbox deep links", () => {
  const hrefs = inboxHrefs();
  const routes = knownRoutes();

  it("emits links at all", () => {
    // If the extraction breaks, every assertion below passes vacuously.
    expect(hrefs.length).toBeGreaterThan(8);
    expect(routes.size).toBeGreaterThan(50);
  });

  it("every link resolves to a generated route", () => {
    const dead = [...new Set(hrefs)].filter((h) => !routes.has(h));
    expect(dead, `Dead links in requests-inbox.functions.ts: ${dead.join(", ")}`).toEqual([]);
  });

  it("covers both the personal and the organisation side", () => {
    // Rows in "my requests" point at the employee's own page; rows in the
    // approval queue point at the page where the decision is actually made.
    // If one side lost its links the list would silently become one-sided.
    expect(hrefs.some((h) => h.startsWith("/me/"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("/admin/") || h.startsWith("/org/"))).toBe(true);
  });
});
