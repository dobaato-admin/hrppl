import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Static SEO regression: assert that every key public route declares
 * title, description, og:title, og:description, og:type, og:url,
 * twitter:card, and a self-referential canonical link.
 *
 * Uses source-text scanning so we don't have to bootstrap the full
 * TanStack runtime in unit tests. CI fails before deploy if any of
 * the required tags drift.
 */

const ROOT = join(process.cwd(), "src", "routes");

interface RouteCase {
  file: string;
  canonical: string;
}

const PUBLIC_ROUTES: RouteCase[] = [
  { file: "index.tsx", canonical: "https://hrppl.io" },
  { file: "pricing.tsx", canonical: "https://hrppl.io/pricing" },
  { file: "terms.tsx", canonical: "https://hrppl.io/terms" },
  { file: "privacy.tsx", canonical: "https://hrppl.io/privacy" },
  { file: "contact.tsx", canonical: "https://hrppl.io/contact" },
  { file: "careers.index.tsx", canonical: "https://hrppl.io/careers" },
];

function read(file: string) {
  return readFileSync(join(ROOT, file), "utf8");
}

describe("SEO meta tags on public routes", () => {
  for (const route of PUBLIC_ROUTES) {
    describe(route.file, () => {
      const src = read(route.file);

      it("declares a <title>", () => {
        expect(src).toMatch(/\{\s*title:\s*\S/);
      });
      it("declares a meta description", () => {
        expect(src).toMatch(/name:\s*["']description["']/);
      });
      it("declares og:title", () => {
        expect(src).toMatch(/property:\s*["']og:title["']/);
      });
      it("declares og:description", () => {
        expect(src).toMatch(/property:\s*["']og:description["']/);
      });
      it("declares og:type", () => {
        expect(src).toMatch(/property:\s*["']og:type["']/);
      });
      it("declares og:url pointing at canonical", () => {
        expect(src).toMatch(/property:\s*["']og:url["']/);
        expect(src).toContain(route.canonical);
      });
      it("declares twitter:card", () => {
        expect(src).toMatch(/name:\s*["']twitter:card["']/);
      });
      it("declares a self-referential canonical link", () => {
        expect(src).toMatch(/rel:\s*["']canonical["']/);
        expect(src).toContain(route.canonical);
      });
    });
  }
});

describe("Root layout structured data", () => {
  const root = readFileSync(join(ROOT, "__root.tsx"), "utf8");

  it("includes WebSite JSON-LD", () => {
    expect(root).toContain('"@type": "WebSite"');
    expect(root).toMatch(/application\/ld\+json/);
  });

  it("includes Organization JSON-LD", () => {
    expect(root).toContain('"@type": "Organization"');
  });

  it("declares og:site_name", () => {
    expect(root).toMatch(/property:\s*["']og:site_name["']/);
  });

  it("does not declare a sitewide canonical (canonicals are per-leaf)", () => {
    expect(root).not.toMatch(/rel:\s*["']canonical["']/);
  });
});

describe("Sitemap & robots", () => {
  it("sitemap lists every key public route", () => {
    const sitemap = readFileSync(join(ROOT, "sitemap[.]xml.ts"), "utf8");
    for (const path of ["/", "/pricing", "/blog", "/careers", "/contact", "/help", "/terms", "/privacy"]) {
      expect(sitemap).toContain(`path: "${path}"`);
    }
  });

  it("robots.txt allows crawling and references the sitemap", () => {
    const robots = readFileSync(join(process.cwd(), "public", "robots.txt"), "utf8");
    expect(robots).toMatch(/User-agent:\s*\*/);
    expect(robots).toMatch(/Allow:\s*\//);
    expect(robots).toContain("Sitemap: https://hrppl.io/sitemap.xml");
  });
});
