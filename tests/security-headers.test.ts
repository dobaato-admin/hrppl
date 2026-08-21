import { describe, it, expect } from "vitest";
import { buildCsp, buildSecurityHeaders, withSecurityHeaders } from "../src/lib/security-headers";

/**
 * Regression guard for Finalization Plan §5 "General Hardening".
 *
 * The audit found zero CSP / HSTS / X-Frame-Options anywhere in the repo.
 * These assertions pin the baseline so it can't silently disappear again.
 */

const SUPABASE = "https://astbnkrrgchezumcujgv.supabase.co";

function parseCsp(csp: string): Record<string, string[]> {
  return Object.fromEntries(
    csp
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...values] = d.split(/\s+/);
        return [name, values];
      }),
  );
}

describe("buildCsp", () => {
  it("locks down the directives that stop clickjacking and injection pivots", () => {
    const d = parseCsp(buildCsp());
    expect(d["frame-ancestors"]).toEqual(["'none'"]);
    expect(d["object-src"]).toEqual(["'none'"]);
    expect(d["base-uri"]).toEqual(["'self'"]);
    expect(d["form-action"]).toEqual(["'self'"]);
    expect(d["default-src"]).toEqual(["'self'"]);
  });

  it("allows the Supabase origin over https and wss for realtime", () => {
    const d = parseCsp(buildCsp({ supabaseUrl: SUPABASE }));
    expect(d["connect-src"]).toContain(SUPABASE);
    expect(d["connect-src"]).toContain("wss://astbnkrrgchezumcujgv.supabase.co");
  });

  it("omits the Supabase origin when it is not configured", () => {
    const d = parseCsp(buildCsp({ supabaseUrl: null }));
    expect(d["connect-src"]).toEqual([
      "'self'",
      "https://maps.googleapis.com",
      "https://data.gov.au",
    ]);
  });

  it("permits exactly the third-party origins the app actually loads", () => {
    const d = parseCsp(buildCsp());
    // Google Fonts stylesheet in __root.tsx, Swagger UI css in admin.api-docs.
    expect(d["style-src"]).toContain("https://fonts.googleapis.com");
    expect(d["style-src"]).toContain("https://unpkg.com");
    expect(d["font-src"]).toContain("https://fonts.gstatic.com");
    // Google Maps picker + Swagger UI bundle.
    expect(d["script-src"]).toContain("https://maps.googleapis.com");
    expect(d["script-src"]).toContain("https://unpkg.com");
    // AU public-holiday sync.
    expect(d["connect-src"]).toContain("https://data.gov.au");
  });

  it("does not silently allow arbitrary script or connect origins", () => {
    const d = parseCsp(buildCsp({ supabaseUrl: SUPABASE }));
    expect(d["script-src"]).not.toContain("*");
    expect(d["script-src"]).not.toContain("https:");
    expect(d["connect-src"]).not.toContain("*");
    expect(d["connect-src"]).not.toContain("https:");
  });

  it("only permits 'unsafe-eval' in dev, never in production", () => {
    expect(buildCsp({ dev: true })).toContain("'unsafe-eval'");
    expect(buildCsp({ dev: false })).not.toContain("'unsafe-eval'");
  });

  it("upgrades insecure requests in production only", () => {
    expect(buildCsp({ dev: false })).toContain("upgrade-insecure-requests");
    expect(buildCsp({ dev: true })).not.toContain("upgrade-insecure-requests");
  });
});

describe("buildSecurityHeaders", () => {
  it("emits the headers the plan names as missing", () => {
    const h = buildSecurityHeaders();
    expect(h["Content-Security-Policy"]).toBeTruthy();
    expect(h["Strict-Transport-Security"]).toBe("max-age=31536000; includeSubDomains; preload");
    expect(h["X-Frame-Options"]).toBe("DENY");
  });

  it("adds the supporting hardening headers", () => {
    const h = buildSecurityHeaders();
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(h["X-Permitted-Cross-Domain-Policies"]).toBe("none");
  });

  it("keeps geolocation available — geofenced clock-in depends on it", () => {
    const pp = buildSecurityHeaders()["Permissions-Policy"];
    expect(pp).toContain("geolocation=(self)");
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
  });

  it("omits HSTS over plain http so dev and health checks are unaffected", () => {
    expect(buildSecurityHeaders({ https: false })["Strict-Transport-Security"]).toBeUndefined();
    expect(buildSecurityHeaders({ https: true })["Strict-Transport-Security"]).toBeTruthy();
  });

  it("supports report-only for staged rollout", () => {
    const h = buildSecurityHeaders({ reportOnly: true });
    expect(h["Content-Security-Policy-Report-Only"]).toBeTruthy();
    expect(h["Content-Security-Policy"]).toBeUndefined();
  });
});

describe("withSecurityHeaders", () => {
  it("adds headers while preserving status, body and existing headers", async () => {
    const original = new Response("hello", {
      status: 201,
      statusText: "Created",
      headers: { "content-type": "text/plain", "x-custom": "kept" },
    });
    const res = withSecurityHeaders(original);

    expect(res.status).toBe(201);
    expect(res.statusText).toBe("Created");
    expect(await res.text()).toBe("hello");
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(res.headers.get("x-custom")).toBe("kept");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
  });

  it("never overwrites a header the handler set deliberately", () => {
    const res = withSecurityHeaders(
      new Response("x", { headers: { "X-Frame-Options": "SAMEORIGIN" } }),
    );
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });

  it("covers error responses too", () => {
    const res = withSecurityHeaders(new Response("boom", { status: 500 }));
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });
});
