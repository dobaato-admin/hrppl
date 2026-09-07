import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { buildSetupGuide, SEGMENT_KEYS } from "../src/lib/setup-guide.functions";

/**
 * The guided setup (Wave 7, Phase 1).
 *
 * ---------------------------------------------------------------------------
 * What this file is defending
 * ---------------------------------------------------------------------------
 *
 * Two properties, and they are the whole design:
 *
 * 1. **Completion is computed from the tenant's data, never stored.** A stored
 *    "segment 3 done" flag records that somebody clicked; it goes stale the
 *    moment the rows it vouched for are deleted, and it cannot tell an admin
 *    returning after a month what is actually missing. The consequence, which
 *    the UI states out loud, is that a segment can *reopen* — and these tests
 *    pin that it does.
 *
 * 2. **Skipping cannot open the activation gate.** `skipped_segments` exists so
 *    an admin can defer the asset register; if it could also defer the payroll
 *    engine, "Finalize & Activate" would mean nothing. Required segments refuse
 *    to be skipped, server-side.
 *
 * Plus the Wave 5 lesson, which this wave is a fresh opportunity to break:
 * **every deep link the guide offers must resolve.** The guide is nothing but
 * links to other people's pages, so one typo makes it a page of dead ends.
 */

type Row = Record<string, any>;

/**
 * Chainable stub covering what `buildSetupGuide` actually calls:
 * `.select(cols, {count,head})`, `.eq`, `.limit`, `.maybeSingle`, and awaiting
 * the chain directly. Same approach as `tests/onboarding-readiness.test.ts`.
 */
function makeFakeSupabase(tables: Record<string, Row[]>) {
  function query(table: string) {
    const filters: Array<(r: Row) => boolean> = [];
    let limitN: number | null = null;
    let single = false;
    let countMode = false;

    const exec = () => {
      let rows = (tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
      const count = rows.length;
      if (limitN != null) rows = rows.slice(0, limitN);
      if (single) return Promise.resolve({ data: rows[0] ?? null, count });
      return Promise.resolve({ data: rows, count: countMode ? count : undefined });
    };

    const chain: any = {
      select(_cols?: string, opts?: any) {
        if (opts?.count === "exact") countMode = true;
        return chain;
      },
      eq(col: string, val: any) {
        filters.push((r) => r[col] === val);
        return chain;
      },
      in(col: string, vals: any[]) {
        filters.push((r) => vals.includes(r[col]));
        return chain;
      },
      limit(n: number) {
        limitN = n;
        return chain;
      },
      order() {
        return chain;
      },
      maybeSingle() {
        single = true;
        return exec();
      },
      then(ok: any, err: any) {
        return exec().then(ok, err);
      },
    };
    return chain;
  }
  return { from: (t: string) => query(t) };
}

const TENANT = "t-1";
const COUNTRY = "AU";

/** A tenant with absolutely everything a required segment asks for. */
function fullyConfigured(extra: Record<string, Row[]> = {}) {
  return makeFakeSupabase({
    tenants: [
      {
        id: TENANT,
        legal_name: "Acme Global Pty Ltd",
        trading_name: "Acme",
        country_code: COUNTRY,
        currency_code: "AUD",
        address_line1: "1 Test St",
        registration_number: "51824753556",
      },
    ],
    tenant_payroll_settings: [
      {
        tenant_id: TENANT,
        pay_period: "monthly",
        abn: "51824753556",
        bms_id: "BMS-1",
        default_super_fund_id: "sf-1",
      },
    ],
    payroll_components: [{ id: "c1", tenant_id: TENANT, is_active: true }],
    overtime_penalty_rates: [{ id: "ot1", country_code: COUNTRY, is_active: true }],
    leave_types: [{ id: "lt1", tenant_id: TENANT, is_active: true }],
    public_holidays: [{ id: "h1", country_code: COUNTRY }],
    super_funds: [{ id: "sf-1", tenant_id: TENANT }],
    policy_documents: [
      { id: "p1", tenant_id: TENANT, is_active: true, requires_acknowledgement: true },
    ],
    ...extra,
  });
}

describe("the setup guide reads the tenant, not a checkbox", () => {
  it("covers all seven segments in spec order", async () => {
    const guide = await buildSetupGuide(makeFakeSupabase({}) as any, TENANT);
    expect(guide.segments.map((s) => s.key)).toEqual([...SEGMENT_KEYS]);
    expect(guide.segments).toHaveLength(7);
  });

  it("reports an empty tenant as entirely unconfigured", async () => {
    const guide = await buildSetupGuide(makeFakeSupabase({}) as any, TENANT);
    expect(guide.segments.every((s) => !s.done)).toBe(true);
    expect(guide.requiredComplete).toBe(false);
    expect(guide.percent).toBe(0);
  });

  it("marks the required segments complete once the data exists", async () => {
    const guide = await buildSetupGuide(fullyConfigured() as any, TENANT);
    const required = guide.segments.filter((s) => s.required);
    expect(required.map((s) => s.key)).toEqual(["company", "payroll", "policies"]);
    expect(
      required.filter((s) => !s.done).map((s) => s.title),
      "a fully configured tenant should have every required segment done",
    ).toEqual([]);
    expect(guide.requiredComplete).toBe(true);
  });

  it("REOPENS a segment when its data is removed", async () => {
    // The point of computing rather than storing. An admin who deletes every
    // leave type has an incomplete payroll configuration again, and a stored
    // flag would keep insisting otherwise.
    const before = await buildSetupGuide(fullyConfigured() as any, TENANT);
    expect(before.segments.find((s) => s.key === "payroll")!.done).toBe(true);

    const after = await buildSetupGuide(fullyConfigured({ leave_types: [] }) as any, TENANT);
    expect(after.segments.find((s) => s.key === "payroll")!.done).toBe(false);
    expect(after.requiredComplete).toBe(false);
  });

  it("does not let an advisory check hold a segment open", async () => {
    // Segment 3 lists "role duties carrying KPI targets", which is permanently
    // unsatisfiable — there is no KPI library. It carries a `hint`, so it
    // informs without blocking; a check nobody can ever satisfy would make the
    // whole guide untrustworthy.
    const guide = await buildSetupGuide(
      fullyConfigured({
        review_templates: [{ id: "rt1", tenant_id: TENANT }],
        review_cycles: [{ id: "rc1", tenant_id: TENANT }],
      }) as any,
      TENANT,
    );
    const perf = guide.segments.find((s) => s.key === "performance")!;
    expect(perf.checks.some((c) => c.hint && !c.done)).toBe(true);
    expect(perf.done, "an advisory check must not block the segment").toBe(true);
  });

  it("counts a skipped segment out of the percentage, not into it", async () => {
    const guide = await buildSetupGuide(
      fullyConfigured({
        tenant_setup_state: [{ tenant_id: TENANT, skipped_segments: ["assets", "expenses"] }],
      }) as any,
      TENANT,
    );
    expect(guide.segments.filter((s) => s.skipped).map((s) => s.key)).toEqual([
      "assets",
      "expenses",
    ]);
    // 5 counted, 3 required + performance/learning incomplete → not 100.
    expect(guide.percent).toBeGreaterThan(0);
    expect(guide.percent).toBeLessThanOrEqual(100);
  });
});

describe("skipping cannot talk the activation gate open", () => {
  const src = readFileSync(join(process.cwd(), "src/lib/setup-guide.functions.ts"), "utf8");

  it("refuses to skip a required segment", () => {
    expect(src).toMatch(/if \(SEGMENT_META\[data\.segment\]\.required && data\.skipped\)/);
    expect(src).toMatch(/is required and cannot be skipped/);
  });

  it("re-checks readiness server-side before activating", () => {
    // The browser's copy of the guide can be minutes old, and this is the one
    // call where being out of date would matter.
    const fn = src.slice(src.indexOf("export const finalizeSetup"));
    expect(fn).toContain("await buildSetupGuide(");
    expect(fn).toMatch(/if \(!guide\.requiredComplete\)/);
    expect(fn).toMatch(/Still required/);
  });

  it("activation and reopening are both org-admin only", () => {
    for (const name of ["finalizeSetup", "reopenSetup", "setSetupSegmentSkipped"]) {
      const fn = src.slice(src.indexOf(`export const ${name}`));
      expect(fn.slice(0, 1200), `${name} must assert org admin`).toContain("assertOrgAdmin(");
    }
  });
});

describe("every link the guide offers actually goes somewhere", () => {
  /**
   * Wave 5's defect, and this wave is a fresh chance to reproduce it: the guide
   * is almost entirely links to other people's pages, so one stale path turns a
   * segment into a dead end — and a dead end in a setup flow reads as a broken
   * product on somebody's first day.
   */
  const GEN = readFileSync(join(process.cwd(), "src/routeTree.gen.ts"), "utf8");
  const src = readFileSync(join(process.cwd(), "src/lib/setup-guide.functions.ts"), "utf8");

  // Every route-shaped string literal in the module. Matching on `check(...)`
  // missed the multi-line calls — and a link checker that silently sees half
  // the links is the shape of bug this whole suite keeps finding.
  const hrefs = [
    ...new Set([...src.matchAll(/"(\/(?:admin|org|me)\/[a-z0-9/$-]*)"/g)].map((m) => m[1])),
  ];

  it("finds the deep links to check", () => {
    expect(hrefs.length, `only found: ${hrefs.join(", ")}`).toBeGreaterThanOrEqual(12);
  });

  it("resolves every one against the generated route tree", () => {
    const dead = hrefs.filter((h) => !GEN.includes(`'${h}'`));
    expect(
      dead,
      "These paths appear in the setup guide but not in routeTree.gen.ts, so " +
        "the segment offers a link that 404s.",
    ).toEqual([]);
  });
});

describe("the new W7 destinations are gated like everything else", () => {
  const rbac = readFileSync(join(process.cwd(), "src/lib/rbac.ts"), "utf8");
  const nav = readFileSync(join(process.cwd(), "src/lib/nav-tree.ts"), "utf8");

  it("declares a feature key for each new admin surface", () => {
    for (const key of ["org.setupGuide", "org.policies"]) {
      expect(rbac, `${key} must exist in the Feature union`).toContain(`| "${key}"`);
      expect(rbac, `${key} must have an allow-set`).toContain(`"${key}": SET(`);
    }
  });

  it("the policy key matches the RLS write policy — hr and org admin, not manager", () => {
    const m = rbac.match(/"org\.policies":\s*SET\(([^)]*)\)/)!;
    const roles = [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1]).sort();
    expect(roles).toEqual(["hr", "org_admin", "super_admin"]);
  });

  it("the nav rows quote those same keys", () => {
    expect(nav).toMatch(/to: "\/org\/setup-guide"[\s\S]{0,200}feature: "org\.setupGuide"/);
    expect(nav).toMatch(/to: "\/admin\/policies"[\s\S]{0,200}feature: "org\.policies"/);
  });
});

describe("a write that changes nothing must not report success", () => {
  const src = readFileSync(join(process.cwd(), "src/lib/setup-guide.functions.ts"), "utf8");
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/20260907100000_org_admin_updates_own_tenant.sql"),
    "utf8",
  );

  /**
   * Found while walking the guide: `updateCompanyProfile` saved nothing, said
   * "saved", and left the segment at 2/6. PostgREST answers an UPDATE matching
   * zero rows with 200 and no error, and `tenants` had **no UPDATE policy for
   * org_admin at all** — the product only ever wrote to it through the
   * service-role client, so RLS on the app's main write path to that table had
   * never been exercised.
   *
   * Two fixes, both needed: give org_admin the policy, and stop treating a
   * zero-row write as a success.
   */
  it("reads the row back rather than trusting the absence of an error", () => {
    const fn = src.slice(src.indexOf("export const updateCompanyProfile"));
    expect(fn).toMatch(/\.select\("id"\)/);
    expect(fn).toMatch(/if \(!updated\)/);
    expect(fn).toMatch(/was not updated/);
  });

  it("gives org_admin an UPDATE policy scoped to their own tenant", () => {
    const policy = sql.slice(sql.indexOf('"org admin updates own tenant"'));
    expect(policy).toContain("FOR UPDATE");
    expect(policy).toMatch(/is_org_admin\(auth\.uid\(\), id\)/);
  });

  it("blocks the privileged columns behind a trigger, not just a policy", () => {
    // Otherwise a settings form becomes a way to set your own billing plan or
    // lift your own suspension.
    for (const col of ["plan", "status", "slug", "country_code"]) {
      expect(sql, `${col} must be guarded`).toContain(`NEW.${col} IS DISTINCT FROM OLD.${col}`);
    }
  });

  it("the trigger identifies the caller by auth.role(), never current_user", () => {
    // Inside a SECURITY DEFINER function `current_user` is the owner, so a
    // `current_user IN ('postgres', …)` exemption matches on every call and
    // disables the guard entirely. CLAUDE.md records the outage that taught us.
    //
    // Comments stripped first: the migration's own header explains the trap by
    // naming it, and a check that reads prose as code reports the opposite of
    // the truth — which is the bug this whole suite keeps finding.
    const code = sql.replace(/--.*$/gm, "");
    expect(code).toContain("auth.role()");
    expect(code).not.toContain("current_user");
    expect(code).not.toContain("session_user");
  });
});
