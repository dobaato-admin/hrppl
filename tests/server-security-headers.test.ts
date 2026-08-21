import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * End-to-end wiring check for src/server.ts.
 *
 * tests/security-headers.test.ts proves the header *builder* is correct. This
 * proves the builder is actually reached: a Request goes through the real
 * exported fetch handler and the Response comes back carrying the headers —
 * including on the catastrophic-error path, which bypasses the framework and
 * was the easiest place to forget them.
 */

const innerFetch = vi.fn();

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: { fetch: (...args: unknown[]) => innerFetch(...args) },
}));

const server = (await import("../src/server")).default;

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  innerFetch.mockReset();
  process.env = { ...ORIGINAL_ENV };
  process.env.NODE_ENV = "production";
  process.env.SUPABASE_URL = "https://astbnkrrgchezumcujgv.supabase.co";
  delete process.env.CSP_REPORT_ONLY;
});

const httpsReq = (path = "/") => new Request(`https://hrppl.io${path}`);

describe("src/server.ts security headers", () => {
  it("attaches the headers to a normal SSR response", async () => {
    innerFetch.mockResolvedValue(new Response("<html>ok</html>", { status: 200 }));

    const res = await server.fetch(httpsReq(), {}, {});

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<html>ok</html>");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("attaches them to API route responses too", async () => {
    innerFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const res = await server.fetch(httpsReq("/api/v1/employees"), {}, {});

    expect(res.headers.get("content-type")).toBe("application/json");
    expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
  });

  it("still attaches them when the handler throws — the 500 bypasses the framework", async () => {
    innerFetch.mockRejectedValue(new Error("boom"));
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await server.fetch(httpsReq(), {}, {});

    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    err.mockRestore();
  });

  it("includes the configured Supabase origin so the app can still call it", async () => {
    innerFetch.mockResolvedValue(new Response("ok"));

    const csp = (await server.fetch(httpsReq(), {}, {})).headers.get("Content-Security-Policy")!;

    expect(csp).toContain("https://astbnkrrgchezumcujgv.supabase.co");
    expect(csp).toContain("wss://astbnkrrgchezumcujgv.supabase.co");
  });

  it("omits HSTS over plain http", async () => {
    innerFetch.mockResolvedValue(new Response("ok"));

    const res = await server.fetch(new Request("http://localhost:5173/"), {}, {});

    expect(res.headers.get("Strict-Transport-Security")).toBeNull();
    // CSP is still applied.
    expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
  });

  it("honours CSP_REPORT_ONLY for staged rollout", async () => {
    process.env.CSP_REPORT_ONLY = "1";
    innerFetch.mockResolvedValue(new Response("ok"));

    const res = await server.fetch(httpsReq(), {}, {});

    expect(res.headers.get("Content-Security-Policy-Report-Only")).toBeTruthy();
    expect(res.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("does not leak 'unsafe-eval' into production responses", async () => {
    innerFetch.mockResolvedValue(new Response("ok"));

    const csp = (await server.fetch(httpsReq(), {}, {})).headers.get("Content-Security-Policy")!;

    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("upgrade-insecure-requests");
  });
});
