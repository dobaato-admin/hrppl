import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { globSync } from "glob";

/**
 * Every server module resolves the caller's tenant through `tenant-scope.ts`.
 *
 * ---------------------------------------------------------------------------
 * Why
 * ---------------------------------------------------------------------------
 *
 * `TenantSwitcher`, `ActingTenantBanner` and `platform_acting_tenant` all exist
 * and work. Only the modules calling `requireTenantId()` / `getTenantId()`
 * honoured them — 14 of 97. The rest read `profiles.tenant_id` directly, which
 * is **NULL for a platform account**, so `sam.platform` acting as Acme got
 * `/org/payroll` working and `/org/analytics` saying "No tenant". Same
 * switcher, same account, two different answers page by page.
 *
 * It was never a leak — the direct read is still tenant-bound. It was a
 * correctness and UX gap, and the largest architectural inconsistency left.
 *
 * ---------------------------------------------------------------------------
 * What counts as a violation
 * ---------------------------------------------------------------------------
 *
 * A `.from("profiles")` that selects `tenant_id` **and filters on the caller's
 * own user id**. Reading somebody *else's* profile is a different operation and
 * is not affected: `assertMayGovern` must know the tenant of the user being
 * suspended, not the tenant of the admin doing it, and an acting-tenant
 * fallback there would be a bug rather than a fix. The test draws the line at
 * the id being filtered on, which is where the semantic difference actually is.
 *
 * ---------------------------------------------------------------------------
 * The allow-list is the point
 * ---------------------------------------------------------------------------
 *
 * Per the Wave 5 rule — "a skip is a failure unless it is written down" — every
 * entry below names the reason it is exempt. This list may shrink; a new entry
 * needs a reason that survives being read out loud.
 */

const ROOT = process.cwd();

/**
 * Modules that read the caller's own `profiles.tenant_id` on purpose, and why.
 *
 * Note what is NOT here: "it was too hard to convert". All 92 of those are done.
 */
const ALLOWED: Record<string, string> = {
  "src/lib/tenant-scope.ts":
    "the helper itself — this is the one place the read is supposed to live",
  "src/lib/profile.functions.ts":
    "returns the profile row to the caller as data; tenant_id is a field of the thing being fetched, not a scope being resolved",
  "src/lib/org-signup.functions.ts":
    "needs the RAW home tenant to answer 'do you already belong to an org?'. An acting tenant must NOT answer yes, or a platform admin acting as Acme could never create a second org. Both call sites already fall back to getActingTenantId explicitly, which is the documented split in tenant-scope.ts's own header for getMyOrgStatus / getMyGateStatus.",
};

/** Identifiers that denote the authenticated caller in this codebase. */
const CALLER_IDS = ["userId", "uid", "ctx.userId", "context.userId", "user.id", "callerId"];

type Site = { file: string; line: number; who: string | null; select: string };

function scan(): Site[] {
  const files = globSync("src/lib/**/*.ts", { cwd: ROOT }).sort();
  const chain = /\.from\(\s*"profiles"\s*\)\s*((?:\.\w+\([^()]*(?:\([^()]*\))?[^()]*\)\s*){1,6})/gs;
  const sites: Site[] = [];
  for (const rel of files) {
    const src = readFileSync(join(ROOT, rel), "utf8");
    for (const m of src.matchAll(chain)) {
      const sel = /\.select\(\s*"([^"]*)"/.exec(m[1]);
      if (!sel || !sel[1].includes("tenant_id")) continue;
      const eq = /\.eq\(\s*"id"\s*,\s*([^)]+?)\s*\)/.exec(m[1]);
      const who = eq ? eq[1].trim() : null;
      sites.push({
        file: rel.split("\\").join("/"),
        line: src.slice(0, m.index).split("\n").length,
        who,
        select: sel[1],
      });
    }
  }
  return sites;
}

const SITES = scan();

describe("no server module resolves the caller's tenant by hand", () => {
  it("the scanner still finds the reads it is supposed to police", () => {
    // If a refactor renames the table or the client, this test would pass by
    // finding nothing — the exact way a comparison check reports success when
    // one side is missing. tenant-scope.ts is guaranteed to contain one.
    expect(SITES.length).toBeGreaterThan(0);
    expect(SITES.some((s) => s.file === "src/lib/tenant-scope.ts")).toBe(true);
  });

  const callerSites = SITES.filter((s) => s.who !== null && CALLER_IDS.includes(s.who!));

  it("every caller-side read is either in tenant-scope.ts or documented", () => {
    const offenders = callerSites.filter((s) => !(s.file in ALLOWED));
    expect(
      offenders.map((s) => `${s.file}:${s.line} (select "${s.select}")`),
      "Resolve the caller's tenant through requireTenantId/getTenantId in " +
        "src/lib/tenant-scope.ts. A direct profiles.tenant_id read is NULL for a " +
        "platform account, so the page silently stops honouring the tenant switcher. " +
        "If the read is genuinely about something else, add it to ALLOWED with a reason.",
    ).toEqual([]);
  });

  it("reads of OTHER users' profiles are untouched by this rule", () => {
    // Stated as a test so nobody "fixes" them into the acting tenant later:
    // account-suspension and role-management both need the tenant of the user
    // being acted ON, which is not the caller's and never follows the switcher.
    const otherSites = SITES.filter((s) => s.who !== null && !CALLER_IDS.includes(s.who!));
    expect(otherSites.length).toBeGreaterThan(0);
    for (const s of otherSites) {
      expect(CALLER_IDS).not.toContain(s.who);
    }
  });
});

describe("the allow-list stays honest", () => {
  it("every allow-list entry still has a read to justify it", () => {
    const filesWithReads = new Set(SITES.map((s) => s.file));
    const stale = Object.keys(ALLOWED).filter((f) => !filesWithReads.has(f));
    expect(
      stale,
      "These files no longer read profiles.tenant_id — delete the allow-list entry.",
    ).toEqual([]);
  });

  it("every allow-list entry carries a reason", () => {
    for (const [file, reason] of Object.entries(ALLOWED)) {
      expect(reason.length, `${file} needs a real reason`).toBeGreaterThan(30);
    }
  });
});

describe("a resolved tenant never reaches a write as null", () => {
  /**
   * `getTenantId` returns `string | null` — that is the whole point of it
   * existing alongside `requireTenantId`. But TypeScript does not catch the
   * null flowing into a Supabase payload, because these payloads are built with
   * spreads and land on loosely-typed `.insert()` calls. Eight sites were in
   * that state after the conversion, and the symptom would have been a Postgres
   * NOT NULL violation naming a column, on a page that had worked a moment
   * earlier for a different account.
   *
   * If a handler writes `tenant_id`, the caller must HAVE a tenant: use
   * `requireTenantId`, which says so in its name and throws the typed
   * NoTenantScopeError the UI can render as an empty state.
   */
  it("no getTenantId result is written as tenant_id without a guard", () => {
    const offenders: string[] = [];
    for (const rel of globSync("src/lib/**/*.ts", { cwd: ROOT }).sort()) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const m of src.matchAll(/const (\w+) = await getTenantId\(/g)) {
        const v = m[1];
        let depth = 0;
        let i = m.index! + m[0].length;
        let end = src.length;
        for (; i < src.length; i++) {
          if (src[i] === "{") depth++;
          else if (src[i] === "}") {
            if (depth === 0) {
              end = i;
              break;
            }
            depth--;
          }
        }
        const body = src.slice(m.index! + m[0].length, end);
        const guarded = new RegExp(`if \\([^)]*!${v}\\b`).test(body);
        const writes = new RegExp(`tenant_id:\\s*${v}\\b`).test(body);
        if (writes && !guarded) {
          offenders.push(`${rel}:${src.slice(0, m.index).split("\n").length} ($${v})`);
        }
      }
    }
    expect(
      offenders,
      "These write tenant_id from a nullable getTenantId result. Use requireTenantId.",
    ).toEqual([]);
  });
});

describe("the conversion actually happened", () => {
  it("tenant-scope is the common path across the server layer", () => {
    const modules = globSync("src/lib/*.functions.ts", { cwd: ROOT });
    const using = modules.filter((rel) =>
      /from "@\/lib\/tenant-scope"/.test(readFileSync(join(ROOT, rel), "utf8")),
    );
    // Was 14 of 97 when this was written down as Priority 1. Every module that
    // needs a tenant now goes through one helper; the rest legitimately do not
    // need one (public hooks, pure computation, per-employee surfaces).
    expect(using.length).toBeGreaterThanOrEqual(60);
  });
});
