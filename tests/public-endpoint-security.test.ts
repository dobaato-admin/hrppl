import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * A server function is a public HTTP endpoint.
 *
 * ---------------------------------------------------------------------------
 * What the 2026-09-03 audit found
 * ---------------------------------------------------------------------------
 *
 * `countOpenHighSeverityFindings` shipped with **no `.middleware()` at all** and
 * read through the service-role client. Every other function in its module gates
 * on `assertSuperAdmin`. The page that renders it is gated, so from inside the
 * app it looked fine — but the endpoint itself answered anyone on the internet
 * with a live count of the platform's open critical security findings.
 *
 * That is the shape this file exists to catch: an omitted middleware is
 * invisible in review, invisible in the browser, and passes every other test,
 * because a missing guard is not a wrong guard.
 *
 * ---------------------------------------------------------------------------
 * How to read a failure
 * ---------------------------------------------------------------------------
 *
 * A new unauthenticated server function must be listed in PUBLIC below with a
 * reason. Being on that list is a claim that the endpoint is SAFE to expose to
 * the internet with no session — which for a write endpoint also means it is
 * rate limited, asserted separately.
 */

const ROOT = process.cwd();
const LIB = join(ROOT, "src/lib");

/**
 * Server functions that are deliberately reachable without a session, each with
 * the reason it is safe.
 */
const PUBLIC: Record<string, string> = {
  // Marketing / public content.
  listCategories: "public blog taxonomy",
  listPublishedPosts: "public blog index",
  getPublishedPost: "public blog article",
  listPublicJobs: "public careers board",
  getPublicJob: "public job advert",
  getCareersByTenantSlug: "public careers site for a tenant",
  getJobBySlug: "public job advert by slug",
  // Public writes — each rate limited, asserted below.
  applyToJob: "a candidate applies without an account; rate limited",
  createResumeUploadUrl: "mints a scoped upload URL for an open job; rate limited",
  submitLead: "marketing lead capture; rate limited",
  trackCareersEvent: "careers-page analytics; rate limited",
  // Capability URLs — the token IS the credential.
  getCertificate:
    "signed-document certificate fetched by a long random token; returns only completed envelopes",
  getInvitationByToken: "invitation accepted by long random token; rate limited against enumeration",
};

/** Public functions that WRITE, or that a brute-forcer would enumerate. */
const MUST_RATE_LIMIT = [
  "applyToJob",
  "createResumeUploadUrl",
  "submitLead",
  "trackCareersEvent",
  "getInvitationByToken",
];

type Fn = { name: string; module: string; body: string };

function serverFns(): Fn[] {
  const out: Fn[] = [];
  for (const file of readdirSync(LIB)) {
    if (!file.endsWith(".functions.ts")) continue;
    const src = readFileSync(join(LIB, file), "utf8");
    const starts = [...src.matchAll(/^export const (\w+) = createServerFn/gm)];
    for (let i = 0; i < starts.length; i++) {
      const from = starts[i].index!;
      const to = i + 1 < starts.length ? starts[i + 1].index! : src.length;
      out.push({ name: starts[i][1], module: file, body: src.slice(from, to) });
    }
  }
  return out;
}

const FNS = serverFns();
const unauthenticated = FNS.filter((f) => !f.body.includes(".middleware("));

describe("no server function is unauthenticated by accident", () => {
  it("finds the server functions to check", () => {
    expect(FNS.length).toBeGreaterThan(500);
  });

  it("every endpoint without auth middleware is a declared public one", () => {
    const undeclared = unauthenticated
      .filter((f) => !PUBLIC[f.name])
      .map((f) => `${f.module} → ${f.name}`);
    expect(
      undeclared,
      "These server functions carry no .middleware(), so they answer anyone on " +
        "the internet with no session. If that is intended, add the name to " +
        "PUBLIC with the reason it is safe to expose; otherwise add " +
        "[requireSupabaseAuth] and the role check its siblings use.",
    ).toEqual([]);
  });

  it("keeps the public surface from growing quietly", () => {
    // 13 at the time of the audit. A jump means someone exposed something.
    expect(unauthenticated.length).toBeLessThanOrEqual(14);
  });

  it("every declared public endpoint still exists and carries a reason", () => {
    for (const [name, reason] of Object.entries(PUBLIC)) {
      expect(reason.length, `${name} needs a real reason`).toBeGreaterThan(10);
      expect(
        FNS.some((f) => f.name === name),
        `${name} is declared public but is no longer a server fn — drop the entry`,
      ).toBe(true);
    }
  });
});

describe("public write endpoints are rate limited", () => {
  /**
   * `enforceRateLimit` cannot do this job: `check_rate_limit` opens with
   * `IF v_user IS NULL THEN RETURN true`, and `rate_limit_buckets.user_id` has
   * an FK to `auth.users`. Anonymous callers were waved through by design, so
   * every public endpoint was unlimited — including an unauthenticated mint of
   * a storage upload credential.
   */
  it.each(MUST_RATE_LIMIT)("%s calls enforcePublicRateLimit", (name) => {
    const fn = FNS.find((f) => f.name === name);
    expect(fn, `${name} not found`).toBeDefined();
    expect(
      fn!.body,
      `${name} takes no session and writes (or is enumerable), so it must call ` +
        "enforcePublicRateLimit — enforceRateLimit does nothing for an " +
        "anonymous caller.",
    ).toContain("enforcePublicRateLimit(");
  });

  it("the public limiter fails open, never closed", () => {
    // A limiter that fails closed on a careers page takes the page offline for
    // real applicants. Spam is the smaller problem.
    const src = readFileSync(join(LIB, "rate-limit.functions.ts"), "utf8");
    const from = src.indexOf("export async function enforcePublicRateLimit");
    expect(from).toBeGreaterThan(-1);
    const body = src.slice(from);
    expect(body).toMatch(/if \(!clientKey\) return;/);
    expect(body).toMatch(/console\.warn\("\[public-rate-limit\]/);
  });

  it("keys on a hashed IP, never a stored one", () => {
    // The counter table is service-role readable; a raw list of every IP that
    // viewed a careers page is personal data with no reason to exist.
    const sql = readFileSync(
      join(ROOT, "supabase/migrations/20260903120000_public_rate_limit.sql"),
      "utf8",
    );
    expect(sql).toMatch(/extensions\.digest\(/);
    expect(sql).not.toMatch(/ip_address|raw_ip/);
  });
});

describe("the security-findings count is not world-readable", () => {
  it("countOpenHighSeverityFindings authenticates and checks super_admin", () => {
    const src = readFileSync(join(LIB, "security-findings.functions.ts"), "utf8");
    const from = src.indexOf("export const countOpenHighSeverityFindings");
    expect(from).toBeGreaterThan(-1);
    const body = src.slice(from);
    expect(body).toContain("requireSupabaseAuth");
    expect(body).toContain("assertSuperAdmin");
    // And reads through the caller's client, so RLS applies as a second layer.
    expect(body).not.toMatch(/supabaseAdmin[\s\S]{0,200}security_findings_log/);
  });
});
