import { describe, it, expect } from "vitest";
import { branchFilter, resolveBranchScope } from "@/lib/tenant-scope";

/**
 * Branch scoping, and the one rule that decides whether it fixes a page or
 * empties it.
 *
 * `branch_admin` is admitted by `org.teams`, `org.idRequests`, `org.assets` and
 * `org.employees`, and was refused by every one of those pages' first read.
 * `timeline.functions.ts` said why: those endpoints are tenant-wide and a branch
 * admin is not. Rather than widen the guards and ignore that, the endpoints now
 * narrow their rows — so the correctness of every one of those pages rests on
 * the filter this file pins.
 *
 * **The rule is that an untagged row stays visible.** `has_branch_access`
 * returns true when `_branch_id IS NULL` — "row not yet branch-tagged; defer to
 * the tenant check" — and in this database almost nothing is tagged: all 19
 * seeded employees have `branch_id = NULL`. A plain `.in("branch_id", ids)`
 * matches no NULL in Postgres, so it would have hidden every employee from every
 * branch admin and turned a scoping fix into precisely the empty page the whole
 * exercise exists to stop.
 */
describe("branchFilter", () => {
  it("is null when the caller may see the whole tenant", () => {
    // null means "do not filter at all", which is different from "filter to
    // nothing" — a caller that confuses them leaks or empties.
    expect(branchFilter(null)).toBeNull();
  });

  it("keeps untagged rows visible when a scope is set", () => {
    const f = branchFilter(["b1", "b2"]);
    expect(f).toContain("branch_id.is.null");
    expect(f).toContain("branch_id.in.(b1,b2)");
  });

  it("still keeps untagged rows when the scope is empty", () => {
    // A branch admin with no role_scope row at all. Verified against the live
    // database: bruce.acme has none, every employee is untagged, and he
    // therefore sees all nine of his tenant's — matching has_branch_access.
    expect(branchFilter([])).toBe("branch_id.is.null");
  });
});

/** Minimal stand-in for the supabase client, shaped to what the helper calls. */
function fakeClient(roles: string[], scopeRows: Array<{ branch_id: string | null }>) {
  return {
    from(table: string) {
      const rows = table === "user_roles" ? roles.map((role) => ({ role })) : scopeRows;
      const q: any = {
        select: () => q,
        eq: () => q,
        then: (res: (v: { data: unknown }) => unknown) => Promise.resolve({ data: rows }).then(res),
      };
      return q;
    },
  } as never;
}

describe("resolveBranchScope", () => {
  const T = "tenant-1";

  it.each([["super_admin"], ["org_admin"], ["hr"], ["manager"], ["finance"]])(
    "%s sees the whole tenant",
    async (role) => {
      // These roles are not branch-scoped in this product: their limits are
      // which surfaces and which columns, not which branches.
      expect(await resolveBranchScope(fakeClient([role], []), "u", T)).toBeNull();
    },
  );

  it("a branch admin is limited to the branches named in role_scope", async () => {
    const client = fakeClient(["branch_admin"], [{ branch_id: "b1" }, { branch_id: "b2" }]);
    expect(await resolveBranchScope(client, "u", T)).toEqual(["b1", "b2"]);
  });

  it("a tenant-wide scope row lifts the restriction entirely", async () => {
    // `rs.branch_id IS NULL` in has_branch_access means "every branch of this
    // tenant", not "no branch" — the opposite reading would lock the person out
    // of their own tenant.
    const client = fakeClient(["branch_admin"], [{ branch_id: null }, { branch_id: "b1" }]);
    expect(await resolveBranchScope(client, "u", T)).toBeNull();
  });

  it("a branch admin who also holds org_admin is not restricted", async () => {
    // Roles are additive in this product, so the broadest one has to win.
    const client = fakeClient(["branch_admin", "org_admin"], [{ branch_id: "b1" }]);
    expect(await resolveBranchScope(client, "u", T)).toBeNull();
  });
});
