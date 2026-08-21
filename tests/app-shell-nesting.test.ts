import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Finalization Plan §1 #10 — the "dashboard inside a dashboard" rendering bug.
 *
 * Four layout routes render <AppShell> around their <Outlet />. Roughly half of
 * their child pages render one too, producing a second full chrome — sidebar,
 * header, search, notification bell, role chips — stacked inside the first.
 *
 * The split is close to 50/50, so there is no safe bulk edit: deleting
 * <AppShell> from the children would drop each page's title, and deleting it
 * from the layouts would strip the shell from the other half. AppShell is
 * therefore nesting-aware — a nested instance contributes only a PageHeader.
 *
 * These tests pin that behaviour and record the nesting that exists, so the
 * fix cannot be undone without something failing.
 */

const root = process.cwd();
const routesDir = join(root, "src/routes");
const SHELL = readFileSync(join(root, "src/components/AppShell.tsx"), "utf8");

const routeFiles = readdirSync(routesDir).filter((f) => f.endsWith(".tsx"));
const readRoute = (f: string) => readFileSync(join(routesDir, f), "utf8");

/**
 * Source with comments stripped.
 *
 * Load-bearing: several page files now carry a comment explaining that
 * `admin.tsx` is a bare `<Outlet />` and that is why they render their own
 * shell. Matching raw source counted that prose as code and mis-classified
 * twelve ordinary pages as layout routes.
 */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

/** Layout routes: render an <Outlet /> AND wrap it in an <AppShell>. */
const shellLayouts = routeFiles.filter((f) => {
  const src = stripComments(readRoute(f));
  return /<Outlet/.test(src) && /<AppShell/.test(src);
});

describe("AppShell is nesting-aware", () => {
  it("tracks whether a shell is already rendering above it", () => {
    expect(SHELL).toMatch(/const InsideAppShell = createContext\(false\)/);
    expect(SHELL).toMatch(/useContext\(InsideAppShell\)/);
    expect(SHELL).toMatch(/<InsideAppShell\.Provider value=\{true\}>/);
  });

  it("renders only a page header when nested, never a second chrome", () => {
    const nestedBranch = SHELL.slice(
      SHELL.indexOf("if (alreadyInsideShell)"),
      SHELL.indexOf("<InsideAppShell.Provider"),
    );
    expect(nestedBranch).toMatch(/<PageHeader/);
    // The things that were visibly duplicated in the bug report.
    expect(nestedBranch).not.toMatch(/SidebarProvider|ShellInner/);
  });

  it("keeps the nested page's title, subtitle and actions", () => {
    // Deleting <AppShell> from children would have silently lost these.
    const nestedBranch = SHELL.slice(
      SHELL.indexOf("if (alreadyInsideShell)"),
      SHELL.indexOf("<InsideAppShell.Provider"),
    );
    expect(nestedBranch).toMatch(/title=\{props\.title\}/);
    expect(nestedBranch).toMatch(/subtitle=\{props\.subtitle\}/);
    expect(nestedBranch).toMatch(/actions=\{props\.actions\}/);
  });

  it("still renders the full chrome at the top level", () => {
    expect(SHELL).toMatch(/<SidebarProvider>\s*<ShellInner \{\.\.\.props\} \/>/);
  });
});

describe("the nesting this protects against is real", () => {
  it("identifies the layout routes that wrap Outlet in a shell", () => {
    expect(shellLayouts.sort()).toEqual(
      ["me.tsx", "org.documents.tsx", "org.recruitment.tsx", "org.tsx"].sort(),
    );
  });

  it("finds child pages that would otherwise double up", () => {
    // Not asserting an exact count — pages come and go. Asserting that the
    // condition still exists, so the guard above stays necessary.
    const doubled: string[] = [];
    for (const layout of shellLayouts) {
      const prefix = layout.replace(/\.tsx$/, "") + ".";
      for (const f of routeFiles) {
        if (f === layout || !f.startsWith(prefix)) continue;
        if (/<AppShell/.test(readRoute(f))) doubled.push(f);
      }
    }
    expect(doubled.length).toBeGreaterThan(10);
  });

  it("covers the triple-nested case", () => {
    // org.documents.envelope.$id.tsx sits inside org.documents.tsx, which
    // sits inside org.tsx — three shells without the guard.
    const f = "org.documents.envelope.$id.tsx";
    expect(routeFiles).toContain(f);
    expect(readRoute(f)).toMatch(/<AppShell/);
    expect(readRoute("org.documents.tsx")).toMatch(/<AppShell/);
    expect(readRoute("org.tsx")).toMatch(/<AppShell/);
  });
});
