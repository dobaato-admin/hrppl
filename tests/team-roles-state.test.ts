/**
 * T23 — "Manjeet Ghimire shows Roles: none, Branches: —, and the + Role button
 * appears inactive, while the other row assigns roles normally."
 *
 * Both halves of that screen were wrong, in the same way: something was true
 * about the data and the page declined to say it.
 *
 * 1. A role is granted to a *user*. An employee whose invitation was never
 *    accepted has no user, so the button was disabled — with a `title`
 *    tooltip as the entire explanation. That is indistinguishable from a bug,
 *    and it gave the admin nothing to do about it.
 *
 * 2. The card claimed branch-scoped roles "require one or more branches" and
 *    nothing required one. Granting HR with no branch writes no role_scope
 *    rows, which reads downstream as *every* branch — so an admin limiting
 *    someone to one branch silently gave them the organisation.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { accountState, accountStateCopy } from "@/routes/org.roles";

const HOUR = 3600_000;
const future = new Date(Date.now() + 24 * HOUR).toISOString();
const past = new Date(Date.now() - 24 * HOUR).toISOString();

describe("accountState", () => {
  it("a signed-in member is active, whatever invitation history they have", () => {
    expect(accountState({ user_id: "u1", invitation: null }).kind).toBe("active");
    expect(
      accountState({ user_id: "u1", invitation: { id: "i1", status: "pending", expires_at: past } })
        .kind,
    ).toBe("active");
  });

  it("distinguishes never-invited from invited-and-waiting", () => {
    // These need different actions — "Send invitation" vs "Resend" — so a
    // single "no account" state would be no better than the disabled button.
    expect(accountState({ user_id: null, invitation: null }).kind).toBe("never_invited");
    expect(
      accountState({ user_id: null, invitation: { id: "i1", status: "pending", expires_at: future } })
        .kind,
    ).toBe("awaiting_acceptance");
  });

  it("treats a pending invitation past its expiry as expired", () => {
    // The status column still says "pending" — expiry is enforced by the
    // expires_at comparison, not by a sweep, so reading status alone would
    // offer a Resend that the server then refuses.
    expect(
      accountState({ user_id: null, invitation: { id: "i1", status: "pending", expires_at: past } })
        .kind,
    ).toBe("invitation_expired");
  });

  it("reports a revoked invitation as revoked, not as expired", () => {
    expect(
      accountState({ user_id: null, invitation: { id: "i1", status: "revoked", expires_at: future } })
        .kind,
    ).toBe("invitation_revoked");
  });

  it("treats an accepted-but-unlinked invitation as needing a fresh one", () => {
    expect(
      accountState({ user_id: null, invitation: { id: "i1", status: "accepted", expires_at: future } })
        .kind,
    ).toBe("invitation_expired");
  });

  it("missing invitation field at all is never_invited, not a crash", () => {
    expect(accountState({ user_id: null }).kind).toBe("never_invited");
  });
});

describe("accountStateCopy", () => {
  it("every non-active state explains itself and offers an action", () => {
    const states = [
      accountState({ user_id: null, invitation: null }),
      accountState({ user_id: null, invitation: { id: "i", status: "pending", expires_at: future } }),
      accountState({ user_id: null, invitation: { id: "i", status: "pending", expires_at: past } }),
      accountState({ user_id: null, invitation: { id: "i", status: "revoked", expires_at: future } }),
    ];
    for (const s of states) {
      const copy = accountStateCopy(s);
      expect(copy.label.length).toBeGreaterThan(10);
      expect(copy.action).toBeTruthy();
    }
  });

  it("says nothing for an active member — there is nothing to explain", () => {
    expect(accountStateCopy({ kind: "active" })).toEqual({ label: "", action: null });
  });
});

describe("the roles page no longer disables the control without saying why", () => {
  const src = readFileSync("src/routes/org.roles.tsx", "utf8");

  it("does not gate the Role button on user_id with only a tooltip", () => {
    expect(src).not.toMatch(/disabled=\{!m\.user_id\}/);
    expect(src).not.toMatch(/title=\{!m\.user_id \?/);
  });

  it("refuses a branch-scoped grant with no branch while branches exist", () => {
    expect(src).toMatch(/roleMeta\?\.scoped && !newBranch && branches\.length > 0/);
  });

  it("says what an unscoped grant will mean when the org has no branches", () => {
    expect(src).toMatch(/no branches, so this role will cover the whole\s+organisation/);
  });

  it("still allows Org Admin with no branch", () => {
    // The check is conditioned on the role being scoped, and org_admin is not.
    const assignable = src.slice(src.indexOf("const ASSIGNABLE_ROLES"), src.indexOf("type Member"));
    expect(assignable).toMatch(/value: "org_admin",[\s\S]*?scoped: false/);
    expect(assignable).toMatch(/value: "employee",[\s\S]*?scoped: false/);
    expect(assignable).toMatch(/value: "hr",[\s\S]*?scoped: true/);
  });
});

describe("listTenantMembers carries the invitation that explains the row", () => {
  const src = readFileSync("src/lib/role-management.functions.ts", "utf8");

  it("looks up invitations only for employees with no user account", () => {
    expect(src).toMatch(/filter\(\(e: any\) => !e\.user_id && e\.email\)/);
  });

  it("scopes the invitation lookup to the tenant", () => {
    // An invitation is matched by email, which is not unique across tenants.
    const block = src.slice(src.indexOf("pendingEmails"), src.indexOf("return {"));
    expect(block).toMatch(/\.eq\("tenant_id", tenantId\)/);
  });

  it("takes the newest invitation when an email has several", () => {
    const block = src.slice(src.indexOf("pendingEmails"), src.indexOf("return {"));
    expect(block).toMatch(/ascending: false/);
    expect(block).toMatch(/if \(!invitationByEmail\.has\(key\)\)/);
  });
});
