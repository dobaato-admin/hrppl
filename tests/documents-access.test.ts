import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { can, type AppRole, type Feature } from "@/lib/rbac";
import {
  DOCUMENT_ADMIN_ROLES,
  DOCUMENT_READ_ROLES,
  EMPLOYEE_DOCUMENT_ADMIN_ROLES,
  EMPLOYEE_DOCUMENT_READ_ROLES,
} from "@/lib/documents-guard";

/**
 * X-07's twin, in the documents module.
 *
 * ---------------------------------------------------------------------------
 * What happened
 * ---------------------------------------------------------------------------
 *
 * `/org/documents` is offered by nav and by route to six roles. Fourteen of the
 * twenty-one server functions in `documents.functions.ts` resolved their tenant
 * through a local `getOrgAdminTenant`, which admitted `org_admin` and
 * `super_admin` only and threw `"Not authorized"` for the other four.
 *
 * It rendered as emptiness. As `mia.acme` (manager), `listEnvelopes` and
 * `listTemplates` both threw and the page drew a table saying "No envelopes
 * yet." beside a "Send document" button. The 2026-09-07 QA sweep walked all
 * eight roles over 122 routes and found console errors on the three
 * `/org/documents*` pages for **manager, hr, finance and branch_admin and for
 * nobody else** — exactly `org.documents` minus `getOrgAdminTenant`.
 *
 * Wave 5 converged nav vs route vs inline check; Wave 6 closed the RLS axis for
 * training. **Nothing checked the server-fn axis**, which is why this survived
 * three waves that were each looking for it.
 *
 * ---------------------------------------------------------------------------
 * The three things this pins
 * ---------------------------------------------------------------------------
 *
 * 1. No server function in the domain resolves its tenant without going through
 *    a guard that names which roles it admits.
 * 2. The guard's role sets and `rbac.ts`'s feature keys agree — the client half
 *    and the server half of the same answer.
 * 3. The database can actually fill the pages for everyone the keys admit:
 *    `branch_admin` had no policy at all on either document table, and the
 *    detail surface (`document_signers`, `document_events`) stopped at
 *    org_admin — so finance and manager would have read an envelope with no
 *    signatories and a blank audit trail. Emptiness again, one table deeper.
 */

const ROOT = process.cwd();
const MIGRATIONS = join(ROOT, "supabase/migrations");
const FUNCTIONS = join(ROOT, "src/lib/documents.functions.ts");

const allMigrationSql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(MIGRATIONS, f), "utf8"))
  .join("\n");

const source = readFileSync(FUNCTIONS, "utf8");

/** TypeScript with `//` and block comments removed. */
function stripTsComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const code = stripTsComments(source);

const GUARDS = [
  "requireDocumentAdminTenant",
  "requireDocumentReadTenant",
  "requireEmployeeDocumentAdminTenant",
  "requireEmployeeDocumentReadTenant",
] as const;

describe("every documents server fn resolves its tenant through a named guard", () => {
  it("the blanket org-admin-only guard is gone", () => {
    // Its whole problem was that it did not say which roles the page offered,
    // so nothing could notice it disagreed with them.
    expect(code).not.toMatch(/getOrgAdminTenant/);
  });

  /**
   * Server functions that deliberately do NOT take a tenant guard, each with the
   * reason it does not. This is the allow-list discipline from Wave 5: a `skip`
   * with no reason is how a check reports nothing when one side is absent.
   */
  const UNGUARDED_BY_DESIGN: Record<string, string> = {
    myPendingEnvelopes: "the employee's own queue — scoped to their signer rows, not to a tenant",
    getSigningEnvelope: "token-authenticated signing surface; the token is the scope",
    submitSignature: "same token surface — the signer may not hold any org role",
    declineEnvelope: "same token surface",
    getCertificate: "the signed copy, readable by the parties to it",
    listStarterTemplates: "a static in-code catalogue; reads no tenant row",
    getEnvelope:
      "no tenant filter to scope — RLS decides per envelope, via can_read_document_envelope",
  };

  const serverFns = Array.from(code.matchAll(/export const (\w+) = createServerFn/g)).map(
    (m) => m[1],
  );

  it("finds the whole module", () => {
    expect(serverFns.length).toBeGreaterThanOrEqual(20);
  });

  for (const name of serverFns) {
    const reason = UNGUARDED_BY_DESIGN[name];
    it(`${name} ${reason ? `is unguarded by design (${reason})` : "calls a documents guard"}`, () => {
      // The body runs from this declaration to the next one.
      const start = code.indexOf(`export const ${name} = createServerFn`);
      const rest = code.slice(start + 1);
      const nextIdx = rest.indexOf("\nexport const ");
      const body = nextIdx === -1 ? rest : rest.slice(0, nextIdx);
      const guarded = GUARDS.some((g) => body.includes(`${g}(`));
      if (reason) expect(guarded).toBe(false);
      else expect(guarded).toBe(true);
    });
  }
});

const ALL_ROLES: AppRole[] = [
  "super_admin",
  "regional_admin",
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
];

/** The roles a feature key admits, recovered through the public `can`. */
function admits(feature: Feature): string[] {
  return ALL_ROLES.filter((r) => can(feature, [r])).sort();
}

describe("the guard and the feature keys are the same answer", () => {
  it("org.documents admits exactly the envelope readers", () => {
    expect(admits("org.documents")).toEqual([...DOCUMENT_READ_ROLES].sort());
  });

  it("org.documentTemplates admits the same set", () => {
    expect(admits("org.documentTemplates")).toEqual([...DOCUMENT_READ_ROLES].sort());
  });

  it("org.documentVerification admits exactly the employee-document readers", () => {
    expect(admits("org.documentVerification")).toEqual([...EMPLOYEE_DOCUMENT_READ_ROLES].sort());
  });

  it("finance may read envelopes but never employee identity documents", () => {
    // The two surfaces sit under the same URL prefix and answer differently.
    // Collapsing them is how a passport scan reaches a payroll accountant.
    expect(DOCUMENT_READ_ROLES).toContain("finance");
    expect(EMPLOYEE_DOCUMENT_READ_ROLES).not.toContain("finance");
  });

  it("the read-only roles are read-only", () => {
    for (const role of ["finance", "manager", "branch_admin"] as const) {
      expect(DOCUMENT_ADMIN_ROLES as readonly string[]).not.toContain(role);
    }
    expect(EMPLOYEE_DOCUMENT_ADMIN_ROLES as readonly string[]).not.toContain("finance");
    expect(EMPLOYEE_DOCUMENT_ADMIN_ROLES as readonly string[]).not.toContain("manager");
  });
});

describe("the database can fill the pages the keys offer", () => {
  it("branch_admin can read published templates", () => {
    expect(allMigrationSql).toMatch(/CREATE POLICY "tpl_branch_admin_read"/);
  });

  it("branch_admin can read its branches' envelopes", () => {
    expect(allMigrationSql).toMatch(/CREATE POLICY "env_branch_admin_read"/);
  });

  it("the detail surface follows the envelope rather than stopping at org_admin", () => {
    // Without these, /org/documents/envelope/$id shows finance and manager a
    // document with no signatories and no history — which looks like a finished
    // answer and is not one.
    expect(allMigrationSql).toMatch(/CREATE POLICY "sgn_envelope_reader_read"/);
    expect(allMigrationSql).toMatch(/CREATE POLICY "evt_envelope_reader_read"/);
  });

  it("envelope read visibility is defined once, not restated per table", () => {
    expect(allMigrationSql).toMatch(
      /CREATE OR REPLACE FUNCTION public\.can_read_document_envelope/,
    );
    // A SECURITY DEFINER helper reachable by anon would be a read of every
    // envelope in the platform, one id at a time.
    expect(allMigrationSql).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.can_read_document_envelope\(uuid, uuid\) FROM anon, public/,
    );
  });
});
