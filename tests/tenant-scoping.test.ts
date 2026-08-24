import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, globSync } from "fs";
import { join } from "path";
import { getTenantId, getActingTenantId } from "@/lib/tenant-scope";

/**
 * Tenant scoping must be explicit in the query, not delegated to RLS.
 *
 * RLS is the security boundary and stays so. It is not, however, a *scoping*
 * boundary for every role: `super_admin`'s policy on `employees`
 * ("super admin all employees", 20260603213444:100-103) is
 * `FOR ALL USING has_role(uid,'super_admin')` with no tenant predicate at all.
 * A list query that omits `.eq("tenant_id", …)` therefore returns every
 * tenant's rows to that caller.
 *
 * This shipped, and it did more than leak. `listEmployeesForAdmin` fed the
 * offboarding employee picker with all 15 employees across all 3 tenants;
 * `createOffboarding` then copied `tenant_id` off the *selected employee*, so
 * choosing any of them built a row whose tenant did not match
 * `user_tenant_id(auth.uid())` — which WITH CHECK rejected with
 * "new row violates row-level security policy for table offboarding_cases".
 * The leak and the failure were one bug.
 *
 * These tests pin the fix and the shared primitive it introduced.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

/** Source with comments stripped, so prose about a rule never satisfies it. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

describe("the shared tenant-scope primitive", () => {
  const SRC = read("src/lib/tenant-scope.ts");

  it("exports the helpers callers need", () => {
    for (const fn of ["requireTenantId", "getTenantId", "getActingTenantId", "getMyEmployeeId"]) {
      expect(code(SRC), `${fn} must be exported`).toMatch(
        new RegExp(`export async function ${fn}\\b`),
      );
    }
  });

  it("distinguishes 'no tenant' from a failure", () => {
    // Platform accounts legitimately have profiles.tenant_id = NULL. Callers
    // must be able to tell that apart and render an empty state, because the
    // tempting alternative — dropping the filter — is the leak itself.
    expect(code(SRC)).toMatch(/class NoTenantScopeError/);
    expect(code(SRC)).toMatch(/isNoTenantScope/);
    expect(code(SRC)).toMatch(/NO_TENANT_SCOPE/);
  });

  it("requireTenantId throws rather than returning null", () => {
    const body = code(SRC).slice(code(SRC).indexOf("export async function requireTenantId"));
    expect(body).toMatch(/throw new NoTenantScopeError/);
  });
});

describe("getTenantId falls back to the acting tenant", () => {
  // Platform accounts (super_admin / regional_admin) have profiles.tenant_id
  // = NULL. getTenantId falls back to platform_acting_tenant (20260824090000)
  // so they can act as a chosen tenant instead of seeing every surface empty.

  function fakeSupabase(rows: { profileTenantId?: string | null; actingTenantId?: string | null }) {
    return {
      from(table: string) {
        const value =
          table === "profiles"
            ? rows.profileTenantId
            : table === "platform_acting_tenant"
              ? rows.actingTenantId
              : undefined;
        const builder = {
          select: () => builder,
          eq: () => builder,
          maybeSingle: async () => ({
            data: value === undefined ? null : { tenant_id: value },
          }),
        };
        return builder;
      },
    };
  }

  it("prefers the home tenant when profiles.tenant_id is set", async () => {
    const supabase = fakeSupabase({
      profileTenantId: "home-tenant",
      actingTenantId: "acting-tenant",
    });
    expect(await getTenantId(supabase, "user-1")).toBe("home-tenant");
  });

  it("falls back to the acting tenant when the home tenant is null", async () => {
    const supabase = fakeSupabase({ profileTenantId: null, actingTenantId: "acting-tenant" });
    expect(await getTenantId(supabase, "user-1")).toBe("acting-tenant");
  });

  it("returns null when neither is set", async () => {
    const supabase = fakeSupabase({ profileTenantId: null, actingTenantId: null });
    expect(await getTenantId(supabase, "user-1")).toBeNull();
  });

  it("getActingTenantId reads platform_acting_tenant directly", async () => {
    const supabase = fakeSupabase({ actingTenantId: "acting-tenant" });
    expect(await getActingTenantId(supabase, "user-1")).toBe("acting-tenant");
  });
});

describe("the employee picker is tenant-scoped", () => {
  const SRC = read("src/lib/timeline.functions.ts");
  const C = code(SRC);
  const fn = C.slice(C.indexOf("export const listEmployeesForAdmin"));

  it("filters by tenant_id explicitly", () => {
    expect(fn).toMatch(/\.eq\("tenant_id", tenantId\)/);
  });

  it("resolves the tenant from the caller, not from a request parameter", () => {
    // A tenantId supplied by the client would be trivially forgeable.
    expect(fn).toMatch(/requireTenantId\(context\.supabase, context\.userId\)/);
  });

  it("returns an empty list, never an unscoped one, when there is no tenant", () => {
    expect(fn).toMatch(/noTenantScope/);
    expect(fn).toMatch(/employees: \[\]/);
  });

  it("excludes the caller from their own picker by default", () => {
    // You should not be able to offboard or discipline yourself from a dropdown.
    expect(fn).toMatch(/includeSelf: z\.boolean\(\)\.default\(false\)/);
    expect(fn).toMatch(/getMyEmployeeId/);
  });

  it("includes hr in the role guard the function is named for", () => {
    // assertHrOrAdmin excluded 'hr', so HR users got Forbidden from the very
    // endpoints meant for them and the picker rendered empty.
    //
    // Read the role array directly — slicing to the first "}" lands inside the
    // `const { data: roles }` destructuring, not the end of the function.
    const guard = C.slice(C.indexOf("async function assertHrOrAdmin"));
    const roleList = guard.match(/\.in\("role",\s*\[([^\]]*)\]/);
    expect(roleList, "could not find the role list in assertHrOrAdmin").not.toBeNull();
    const roles = [...roleList![1].matchAll(/"(\w+)"/g)].map((m) => m[1]);
    expect(roles).toContain("hr");
  });
});

describe("createOffboarding trusts the caller's tenant, not the row it read", () => {
  const C = code(read("src/lib/offboarding.functions.ts"));
  const fn = C.slice(C.indexOf("export const createOffboarding"));
  const handler = fn.slice(0, fn.indexOf("export const", 10) === -1 ? fn.length : fn.indexOf("export const", 10));

  it("inserts the caller's tenant id", () => {
    expect(handler).toMatch(/tenant_id: callerTenantId/);
    // The regression: tenant_id taken from the selected employee.
    expect(handler).not.toMatch(/tenant_id: \(emp as any\)\.tenant_id/);
  });

  it("rejects an employee from another tenant with a readable message", () => {
    expect(handler).toMatch(/tenant_id !== callerTenantId/);
    expect(handler).toMatch(/different organization/i);
  });

  it("refuses to offboard the caller", () => {
    expect(handler).toMatch(/getMyEmployeeId/);
    expect(handler).toMatch(/cannot start an offboarding case for yourself/i);
  });
});

describe("the offboarding route gate matches the database policy", () => {
  const RBAC = code(read("src/lib/rbac.ts"));
  const ROUTE = code(read("src/routes/admin.offboarding.tsx"));
  const MIGRATION_PATH = "supabase/migrations/20260821090000_offboarding_hr_policy.sql";

  it("declares a named role set instead of reusing the permissive default", () => {
    // ADMIN_LAYOUT_ROLES admits finance, branch_admin and regional_admin, none
    // of which the RLS policy allows — so they reached the page and the
    // database rejected them.
    expect(RBAC).toMatch(/export const OFFBOARDING_ROLES/);
    expect(ROUTE).toMatch(/AdminGate allow=\{OFFBOARDING_ROLES\}/);
    expect(ROUTE).not.toMatch(/AdminGate allow=\{ADMIN_LAYOUT_ROLES\}/);
  });

  it("the role set and the policy admit exactly the same roles", () => {
    expect(existsSync(join(ROOT, MIGRATION_PATH)), `${MIGRATION_PATH} is missing`).toBe(true);
    const sql = read(MIGRATION_PATH);

    const decl = RBAC.slice(RBAC.indexOf("export const OFFBOARDING_ROLES"));
    const setBody = decl.slice(0, decl.indexOf(";") + 1);
    const uiRoles = new Set([...setBody.matchAll(/"(\w+)"/g)].map((m) => m[1]));

    const policy = sql.slice(sql.indexOf('CREATE POLICY "offb tenant admin"'));
    const withCheck = policy.slice(policy.indexOf("WITH CHECK"));
    const dbRoles = new Set([...withCheck.matchAll(/has_role\(auth\.uid\(\), '(\w+)'\)/g)].map((m) => m[1]));

    expect([...uiRoles].sort(), "UI gate and RLS policy must not drift").toEqual([...dbRoles].sort());
  });

  it("replaces the child-table policy rather than adding a second one", () => {
    const sql = read(MIGRATION_PATH);
    // Permissive policies OR together: a CREATE without a matching DROP widens
    // access instead of replacing it. The child policy name uses an underscore
    // ("offb_items"), unlike the parent's — an easy and silent mistake.
    expect(sql).toMatch(/DROP POLICY IF EXISTS "offb_items tenant admin"/);
    expect(sql).toMatch(/CREATE POLICY "offb_items tenant admin"/);
    expect(sql).toMatch(/DROP POLICY IF EXISTS "offb tenant admin"/);
  });
});

describe("the company directory works for employees without leaking", () => {
  const C = code(read("src/lib/me.functions.ts"));
  const fn = C.slice(C.indexOf("export const getCompanyDirectory"));
  const handler = fn.slice(0, fn.indexOf("export const", 10) === -1 ? fn.length : fn.indexOf("export const", 10));

  it("reads the listing through the service-role client", () => {
    // No RLS policy lets a plain `employee` read a colleague — "employee reads
    // own record" is user_id = auth.uid(), and every broader policy needs
    // hr/finance/manager/org_admin/super_admin. With the caller's own client the
    // directory returned exactly one row (themselves), so /me/directory and the
    // /recognition colleague picker were empty for ordinary staff.
    expect(handler).toMatch(/supabaseAdmin\s*$|supabaseAdmin\n/m);
    expect(handler).toMatch(/supabaseAdmin\s*\n?\s*\.from\("employees"\)/);
  });

  it("pins tenant_id to the caller's own employee row", () => {
    // Load-bearing: supabaseAdmin bypasses RLS entirely, so this filter is the
    // ONLY thing keeping the query inside one tenant. It must come from the
    // caller's own record, never from the request.
    expect(handler).toMatch(/loadMyEmployee\(supabase, userId\)/);
    expect(handler).toMatch(/\.eq\("tenant_id", me\.tenant_id\)/);
    expect(handler).not.toMatch(/\.eq\("tenant_id", data\./);
  });

  it("returns only directory-safe columns", () => {
    // The reason for the admin client rather than a tenant-wide SELECT policy
    // is that such a policy would expose every column. If the projection ever
    // grows to include compensation or identifiers, that reasoning breaks.
    const select = handler.match(/\.select\("([^"]+)"\)/);
    expect(select).not.toBeNull();
    const cols = select![1].split(",").map((c) => c.trim());
    for (const banned of ["base_salary", "national_id_number", "bank_account_number", "tax_identification_number", "date_of_birth"]) {
      expect(cols, `${banned} must not be in the directory projection`).not.toContain(banned);
    }
  });
});

describe("an empty tenant-scoped dropdown explains itself", () => {
  /**
   * Scoping the queries fixed a leak but created a new failure mode: a platform
   * account (super_admin / regional_admin) has no tenant, so every tenant-scoped
   * list correctly returns nothing — and rendered a silent empty <Select> that
   * looks exactly like a broken page. It was reported as "the category dropdown
   * still doesn't work".
   *
   * "No organization" and "organization has no categories yet" need different
   * fixes, so they must be distinguishable.
   */
  it("listExpenseCategories reports why it is empty", () => {
    const C = code(read("src/lib/expenses.functions.ts"));
    const fn = C.slice(C.indexOf("export const listExpenseCategories"));
    const handler = fn.slice(0, fn.indexOf("const CategorySchema"));
    expect(handler).toMatch(/noTenantScope: true/);
    expect(handler).toMatch(/noTenantScope: false/);
  });

  it("the claim form renders a reason instead of an empty select", () => {
    const SRC = code(read("src/routes/me.expenses.tsx"));
    expect(SRC).toMatch(/catState/);
    expect(SRC).toMatch(/"no-tenant"/);
    expect(SRC).toMatch(/"empty"/);
    // The "no categories yet" case must point somewhere actionable.
    expect(SRC).toMatch(/\/org\/expenses/);
  });
});

describe("no list-style employees query reads across tenants", () => {
  /**
   * The sweep. Individual fixes handle today's leaks; this is what stops the
   * pattern coming back.
   *
   * Only multi-row reads matter. A lookup narrowed by `id`, `user_id`,
   * `employee_id` or `manager_id` cannot enumerate a tenant, so those are
   * excluded. What is flagged is a `.select()` that orders or limits without a
   * `tenant_id` predicate — the shape that returns every tenant's rows to a
   * super_admin.
   *
   * To exempt a genuinely global query, put the word `tenant-scope-exempt` in a
   * comment on the same statement and say why.
   */
  const files = globSync("src/**/*.{ts,tsx}", { cwd: ROOT }).filter(
    (f) => !f.endsWith(".d.ts") && !f.includes("integrations/supabase/types"),
  );

  const NARROWING = /\.eq\(\s*["'](id|user_id|employee_id|manager_id|tenant_id)["']/;

  const offenders: string[] = [];
  for (const rel of files) {
    const src = code(read(rel));
    // Split on the query root so each statement is examined on its own.
    const parts = src.split(/\.from\(\s*["']employees["']\s*\)/);
    for (let i = 1; i < parts.length; i++) {
      // A statement ends at the first semicolon that closes the chain.
      const stmt = parts[i].slice(0, parts[i].indexOf(";") + 1);
      if (!/\.select\(/.test(stmt)) continue;          // insert/update/delete
      if (!/\.order\(|\.limit\(/.test(stmt)) continue; // not a list read
      if (NARROWING.test(stmt)) continue;              // narrowed to a row or a tenant
      if (/tenant-scope-exempt/.test(parts[i].slice(0, 400))) continue;
      const line = src.slice(0, src.indexOf(parts[i])).split("\n").length;
      offenders.push(`${rel}:~${line}`);
    }
  }

  it("scans a meaningful number of files (guards against matching nothing)", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("finds no unscoped list reads of employees", () => {
    expect(
      offenders,
      "These read `employees` as a list with no tenant predicate. RLS does not " +
        "narrow that for super_admin. Add .eq(\"tenant_id\", …) — see " +
        "src/lib/tenant-scope.ts (server) or src/hooks/use-tenant.ts (client).",
    ).toEqual([]);
  });
});

describe("the errorComponent is a real component", () => {
  it("does not call hooks inside an inline arrow on the route options", () => {
    // TanStack renders errorComponent as a component so useRouter() worked, but
    // react-hooks/rules-of-hooks cannot verify a lowercase inline arrow.
    const SRC = code(read("src/routes/admin.offboarding.tsx"));
    expect(SRC).toMatch(/function OffboardingError\(/);
    expect(SRC).not.toMatch(/errorComponent: \(\{ error, reset \}\) => \{\s*const router = useRouter\(\)/);
  });
});
