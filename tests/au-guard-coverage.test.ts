import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Every server function in the Australian compliance domain must authorize.
 *
 * ---------------------------------------------------------------------------
 * What this exists to stop
 * ---------------------------------------------------------------------------
 *
 * `super.functions.ts` shipped with **eight exported server functions and not
 * one role check**. It was not obvious from reading it: the module is careful
 * in every other respect — zod validators on every input, tenant ids derived
 * from the run rather than trusted from the caller — so the absence read as
 * deliberate rather than missing. Two of its list queries also selected
 * without a `tenant_id` filter, which CLAUDE.md documents as the defect class
 * that has already leaked data in this product.
 *
 * Two more modules had a guard that had quietly lost its country check
 * (`awards`, `super-sla`), because each module kept a private copy.
 *
 * The domain is now fronted by `src/lib/au-guard.ts`, one exported guard per
 * RLS write policy. This test asserts the coverage rather than the mechanism:
 * every exported `createServerFn` in an AU module reaches one of those guards.
 *
 * ---------------------------------------------------------------------------
 * Reading a failure
 * ---------------------------------------------------------------------------
 *
 * A new AU server function fails here until it calls a guard. Pick the guard
 * whose comment names the RLS policy on the table you are writing — not the
 * one that makes the test pass. Widening a guard past its policy converts a
 * clean "Forbidden" into "new row violates row-level security policy".
 */

const ROOT = process.cwd();
const LIB = join(ROOT, "src/lib");

/** The modules that make up the AU compliance domain. */
const AU_MODULES = [
  "super.functions.ts",
  "stp.functions.ts",
  "eofy.functions.ts",
  "awards.functions.ts",
  "minimum-wage-audit.functions.ts",
  "super-sla.functions.ts",
  "payroll-au.functions.ts",
];

const GUARDS = [
  "assertAuOrgAdmin",
  "assertAuOrgAdminOrHr",
  "assertAuPayroll",
  "assertAuPayrollOrHr",
];

/**
 * Functions that authorize by a rule the shared guards do not express, each
 * with the reason. Kept explicit so an exemption is an argument someone made,
 * not a silence.
 */
const EXEMPT: Record<string, string> = {
  // The award catalogue is country-level reference data, not tenant data:
  // "awards readable by all" grants SELECT to every authenticated user, the
  // same shape as FX rates. Writes go through assertCatalogueAdmin, which is
  // a country-scope check (super_admin or scoped regional_admin) rather than
  // a tenant-role check, so it cannot use these guards.
  listAwards: "reads the shared catalogue; RLS grants select to all authenticated",
  upsertAward: "assertCatalogueAdmin — country scope, not tenant role",
  upsertAwardClassification: "assertCatalogueAdmin — country scope, not tenant role",
  upsertAwardRate: "assertCatalogueAdmin — country scope, not tenant role",
  // Authorizes self-or-privileged inline, because an employee is allowed to
  // see their own award rate and no shared guard admits "the subject".
  getEffectiveAwardRate: "self, or org_admin/hr — checked inline against the employee row",
};

type Fn = { name: string; module: string; body: string };

/** Every exported createServerFn in the AU modules, with its handler body. */
function auServerFns(): Fn[] {
  const out: Fn[] = [];
  for (const module of AU_MODULES) {
    const path = join(LIB, module);
    if (!existsSync(path)) continue;
    const src = readFileSync(path, "utf8");
    // Split on each export; the body runs to the next export or end of file.
    const starts = [...src.matchAll(/^export const (\w+) = createServerFn/gm)];
    for (let i = 0; i < starts.length; i++) {
      const name = starts[i][1];
      const from = starts[i].index!;
      const to = i + 1 < starts.length ? starts[i + 1].index! : src.length;
      out.push({ name, module, body: src.slice(from, to) });
    }
  }
  return out;
}

const FNS = auServerFns();

describe("the AU compliance domain authorizes every entry point", () => {
  it("finds the server functions to check", () => {
    // Guards against the scan silently matching nothing after a refactor.
    expect(FNS.length).toBeGreaterThanOrEqual(20);
    expect(FNS.map((f) => f.name)).toContain("buildSuperBatch");
  });

  it("every exported AU server fn calls a shared guard", () => {
    const unguarded = FNS.filter(
      (f) => !EXEMPT[f.name] && !GUARDS.some((g) => f.body.includes(`${g}(`)),
    ).map((f) => `${f.module} → ${f.name}`);
    expect(
      unguarded,
      "These AU server functions authorize nothing, so any authenticated user " +
        "can invoke them and only RLS stands behind them. Call the guard from " +
        "src/lib/au-guard.ts whose comment names the RLS policy on the table " +
        "you are touching, or add an entry to EXEMPT explaining the rule you " +
        "are using instead.",
    ).toEqual([]);
  });

  it("keeps every guard definition in one place", () => {
    // Five modules each kept a private copy, and two of those copies had lost
    // the AU country check. A local re-definition is how that happens.
    const offenders: string[] = [];
    for (const module of AU_MODULES) {
      const path = join(LIB, module);
      if (!existsSync(path)) continue;
      const src = readFileSync(path, "utf8");
      for (const g of GUARDS) {
        if (new RegExp(`(async )?function ${g}\\s*\\(`).test(src)) {
          offenders.push(`${module} redefines ${g}`);
        }
      }
    }
    expect(offenders, "Import from @/lib/au-guard instead of redeclaring.").toEqual([]);
  });

  it("every exemption carries a reason", () => {
    for (const [name, reason] of Object.entries(EXEMPT)) {
      expect(reason.length, `${name} needs a real reason`).toBeGreaterThan(20);
      // A stale exemption is worse than none: it silences a check for a
      // function that no longer exists in that shape.
      expect(
        FNS.some((f) => f.name === name),
        `${name} is exempt but is no longer an AU server fn — drop the entry`,
      ).toBe(true);
    }
  });
});

describe("AU list queries scope by tenant themselves", () => {
  /**
   * `listSuperFunds` and `listSuperBatches` selected with no tenant predicate.
   * Both tables' read policies are `tenant_id = user_tenant_id(auth.uid()) OR
   * has_role(auth.uid(),'super_admin')` — that second clause has no tenant
   * predicate at all, so a super_admin caller received every tenant's rows.
   */
  it("the two that were unscoped now filter tenant_id", () => {
    const src = readFileSync(join(LIB, "super.functions.ts"), "utf8");
    for (const [fn, table] of [
      ["listSuperFunds", "super_funds"],
      ["listSuperBatches", "super_batches"],
    ] as const) {
      const from = src.indexOf(`export const ${fn} =`);
      expect(from, `${fn} not found`).toBeGreaterThan(-1);
      const body = src.slice(from, from + 1400);
      expect(body, `${fn} must select from ${table}`).toContain(`.from("${table}")`);
      expect(
        body,
        `${fn} must filter tenant_id itself — RLS does not narrow it for super_admin`,
      ).toContain('.eq("tenant_id", tenant_id)');
    }
  });
});

describe("a super batch cannot be marked paid before it is lodged", () => {
  it("markSuperBatchPaid requires the submitted state", () => {
    // Without this, a draft batch could go straight to paid and its
    // contributions with it — the SLA sweep would then report all-clear on
    // money that was never sent to the clearing house.
    const src = readFileSync(join(LIB, "super.functions.ts"), "utf8");
    const from = src.indexOf("export const markSuperBatchPaid =");
    const body = src.slice(from, from + 1600);
    expect(body).toContain('!== "submitted"');
  });
});
