import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { isAuthorizedCronRequest, __resetCronAuthWarning } from "../src/lib/cron-auth.server";

/**
 * Integration-level guard: every cron hook under /api/public/hooks that performs
 * privileged work MUST gate with isAuthorizedCronRequest(). Bare requests, junk
 * Bearer tokens, or tokens that don't match CRON_SECRET / service role must be
 * rejected with 401. This file is the static + behavioural counterpart of the
 * runtime check — if either route file regresses to a weaker auth scheme, the
 * static assertion below catches it before deploy.
 *
 * The service-role fallback is off by default (it put the service-role key in
 * Authorization headers on public endpoints); it is only honoured behind an
 * explicit CRON_ALLOW_SERVICE_ROLE_FALLBACK=1 opt-in.
 */

const root = process.cwd();

const CRON_HOOKS = [
  "src/routes/api/public/hooks/monthly-billing-cycle.ts",
  "src/routes/api/public/hooks/auto-retry-alerts.ts",
  "src/routes/api/public/hooks/review-instance-reminders.ts",
];

describe("cron hooks use isAuthorizedCronRequest()", () => {
  for (const rel of CRON_HOOKS) {
    it(`${rel} imports and calls isAuthorizedCronRequest and returns 401 on failure`, () => {
      const src = readFileSync(join(root, rel), "utf8");
      expect(src).toMatch(/from\s+['"]@\/lib\/cron-auth\.server['"]/);
      expect(src).toMatch(/isAuthorizedCronRequest\(\s*request\s*\)/);
      // Must early-return 401 when authorization fails.
      expect(src).toMatch(/status:\s*401/);
      // Must not fall back to ad-hoc header schemes (no x-cron-secret, no
      // SUPABASE_PUBLISHABLE_KEY checks inside the handler).
      expect(src).not.toMatch(/x-cron-secret/i);
      expect(src).not.toMatch(/SUPABASE_PUBLISHABLE_KEY/);
    });
  }
});

describe("isAuthorizedCronRequest() behaviour", () => {
  const ORIG_CRON = process.env.CRON_SECRET;
  const ORIG_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ORIG_FALLBACK = process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK;

  beforeEach(() => {
    delete process.env.CRON_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK;
    __resetCronAuthWarning();
  });
  afterEach(() => {
    if (ORIG_CRON === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = ORIG_CRON;
    if (ORIG_SVC === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = ORIG_SVC;
    if (ORIG_FALLBACK === undefined) delete process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK;
    else process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK = ORIG_FALLBACK;
  });

  const req = (headers: Record<string, string> = {}) =>
    new Request("https://example.com/api/public/hooks/x", {
      method: "POST",
      headers,
    });

  it("rejects requests with no Authorization header", () => {
    process.env.CRON_SECRET = "expected-secret";
    expect(isAuthorizedCronRequest(req())).toBe(false);
  });

  it("rejects malformed Authorization (no Bearer prefix)", () => {
    process.env.CRON_SECRET = "expected-secret";
    expect(isAuthorizedCronRequest(req({ Authorization: "expected-secret" }))).toBe(false);
  });

  it("rejects empty Bearer token", () => {
    process.env.CRON_SECRET = "expected-secret";
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer " }))).toBe(false);
  });

  it("rejects wrong token", () => {
    process.env.CRON_SECRET = "expected-secret";
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer wrong" }))).toBe(false);
  });

  it("accepts matching CRON_SECRET", () => {
    process.env.CRON_SECRET = "expected-secret";
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer expected-secret" }))).toBe(true);
  });

  it("rejects the service role key by default when CRON_SECRET is unset", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc-role-key";
    // No opt-in flag: fail closed rather than accept the service-role key.
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer svc-role-key" }))).toBe(false);
  });

  it("accepts the service role key only behind the explicit opt-in flag", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc-role-key";
    process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK = "1";
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer svc-role-key" }))).toBe(true);
  });

  it("ignores the opt-in flag once CRON_SECRET is configured", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc-role-key";
    process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK = "1";
    process.env.CRON_SECRET = "expected-secret";
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer svc-role-key" }))).toBe(false);
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer expected-secret" }))).toBe(true);
  });

  it("warns once when the fallback is actually used", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc-role-key";
    process.env.CRON_ALLOW_SERVICE_ROLE_FALLBACK = "1";
    isAuthorizedCronRequest(req({ Authorization: "Bearer svc-role-key" }));
    isAuthorizedCronRequest(req({ Authorization: "Bearer svc-role-key" }));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/rotate the service-role key/);
    warn.mockRestore();
  });

  it("rejects everything when neither secret is configured", () => {
    expect(isAuthorizedCronRequest(req({ Authorization: "Bearer anything" }))).toBe(false);
  });
});
