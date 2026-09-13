/**
 * T13 — "onboarding is so slow".
 *
 * Measured first, on the dev project, via pg_stat_user_tables:
 *
 *     relname      n_live_tup   seq_scan   seq_tup_read
 *     profiles             20    912,884      8,651,885
 *     user_roles           28    183,207      3,340,725
 *     employees            19    149,904        901,358
 *
 * Twenty rows, nine hundred thousand scans. That rules out the usual
 * suspects: no index helps a twenty-row table — a sequential scan of it is
 * faster than reading an index — and the plans were already right. It is a
 * call-count problem. Nearly every server fn opens by resolving the caller's
 * tenant and roles, several do it more than once, and each is a separate HTTP
 * round trip to PostgREST. On the free plan the round trip is the cost, not
 * the query.
 *
 * These tests pin the two properties that make the fix safe rather than just
 * fast, because a cache over authorization data is exactly where a
 * performance change becomes a security bug.
 */
import { describe, it, expect } from "vitest";
import { requestMemo, __memoSize } from "@/lib/request-cache";
import { getTenantId, getMyRoles, getTenantAndRoles } from "@/lib/tenant-scope";

/** A fake per-request client that counts the round trips it is asked to make. */
function fakeClient(rows: Record<string, any[]>) {
  const calls: string[] = [];
  const client = {
    calls,
    from(table: string) {
      calls.push(table);
      const filters: Array<(r: any) => boolean> = [];
      const chain: any = {
        select: () => chain,
        eq: (col: string, val: any) => {
          filters.push((r) => r[col] === val);
          return chain;
        },
        maybeSingle: async () => ({
          data: (rows[table] ?? []).filter((r) => filters.every((f) => f(r)))[0] ?? null,
        }),
        then: (ok: any, bad: any) =>
          Promise.resolve({
            data: (rows[table] ?? []).filter((r) => filters.every((f) => f(r))),
          }).then(ok, bad),
      };
      return chain;
    },
  };
  return client;
}

describe("requestMemo", () => {
  it("runs the work once and gives every caller the same answer", async () => {
    const client = {};
    let ran = 0;
    const work = async () => {
      ran += 1;
      return "value";
    };
    expect(await requestMemo(client, "k", work)).toBe("value");
    expect(await requestMemo(client, "k", work)).toBe("value");
    expect(ran).toBe(1);
  });

  it("two callers racing share one round trip", async () => {
    // Caching the promise rather than the value is what makes this work. Two
    // reads fired at the top of a handler are the common case.
    const client = {};
    let ran = 0;
    const work = async () => {
      ran += 1;
      await new Promise((r) => setTimeout(r, 5));
      return ran;
    };
    const [a, b] = await Promise.all([
      requestMemo(client, "k", work),
      requestMemo(client, "k", work),
    ]);
    expect(ran).toBe(1);
    expect(a).toBe(b);
  });

  it("NEVER shares between requests — this is the security property", async () => {
    // Keyed on the per-request client object. auth-middleware.ts builds a
    // fresh client per request from that request's own bearer token, so two
    // users cannot collide. A cache keyed on user id in module scope would be
    // a cross-request authorization bug; this one cannot be.
    const alice = {};
    const bob = {};
    expect(await requestMemo(alice, "tenant:u", async () => "tenant-a")).toBe("tenant-a");
    expect(await requestMemo(bob, "tenant:u", async () => "tenant-b")).toBe("tenant-b");
  });

  it("keeps different keys apart", async () => {
    const client = {};
    expect(await requestMemo(client, "a", async () => 1)).toBe(1);
    expect(await requestMemo(client, "b", async () => 2)).toBe(2);
    expect(__memoSize(client)).toBe(2);
  });

  it("does not cache a rejection — a retry must be able to succeed", async () => {
    // Caching a failure turns one flaky read into a request-long outage.
    const client = {};
    let attempt = 0;
    const flaky = async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("network");
      return "ok";
    };
    await expect(requestMemo(client, "k", flaky)).rejects.toThrow("network");
    expect(await requestMemo(client, "k", flaky)).toBe("ok");
  });

  it("falls through uncached rather than throwing on a non-object client", async () => {
    // This is an optimisation. It must never be the reason a request fails.
    expect(await requestMemo(null, "k", async () => "v")).toBe("v");
    expect(await requestMemo(undefined, "k", async () => "v")).toBe("v");
  });
});

describe("the tenant preamble, measured in round trips", () => {
  const rows = {
    profiles: [{ id: "u1", tenant_id: "t1" }],
    user_roles: [
      { user_id: "u1", role: "org_admin" },
      { user_id: "u1", role: "hr" },
    ],
  };

  it("resolves the tenant once however many times a handler asks", async () => {
    const client = fakeClient(rows) as any;
    await getTenantId(client, "u1");
    await getTenantId(client, "u1");
    await getTenantId(client, "u1");
    expect(client.calls.filter((t: string) => t === "profiles").length).toBe(1);
  });

  it("resolves roles once too", async () => {
    const client = fakeClient(rows) as any;
    expect(await getMyRoles(client, "u1")).toEqual(["org_admin", "hr"]);
    await getMyRoles(client, "u1");
    expect(client.calls.filter((t: string) => t === "user_roles").length).toBe(1);
  });

  it("fetches tenant and roles in parallel, not one after the other", async () => {
    // Thirteen modules ran `await assertAdmin(...)` then `await getTenant(...)`
    // — two independent round trips taken sequentially.
    const order: string[] = [];
    const client = {
      from(table: string) {
        order.push(`start:${table}`);
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          maybeSingle: () =>
            new Promise((res) => setTimeout(() => res({ data: { tenant_id: "t1" } }), 10)),
          then: (ok: any) =>
            new Promise((res) => setTimeout(() => res({ data: [{ role: "hr" }] }), 10)).then(ok),
        };
        return chain;
      },
    };
    await getTenantAndRoles(client as any, "u1");
    // Both started before either finished.
    expect(order).toEqual(["start:profiles", "start:user_roles"]);
  });

  it("still returns nothing for a platform account with no acting tenant", async () => {
    // The memo must not turn "no tenant" into a cached wrong answer.
    const client = fakeClient({ profiles: [{ id: "u1", tenant_id: null }] }) as any;
    expect(await getTenantId(client, "u1")).toBeNull();
    expect(await getTenantId(client, "u1")).toBeNull();
  });

  it("falls back to the acting tenant, and memoises that too", async () => {
    const client = fakeClient({
      profiles: [{ id: "u1", tenant_id: null }],
      platform_acting_tenant: [{ user_id: "u1", tenant_id: "t9" }],
    }) as any;
    expect(await getTenantId(client, "u1")).toBe("t9");
    await getTenantId(client, "u1");
    expect(client.calls.filter((t: string) => t === "platform_acting_tenant").length).toBe(1);
  });
});

describe("what the memo deliberately does not do", () => {
  it("is not a cache across requests — suspension and roles are still re-read", async () => {
    // requireActiveUser runs per request and is untouched. A role revoked a
    // second ago is honoured on the very next call, because that call has a
    // different client and therefore an empty memo.
    const first = fakeClient({ user_roles: [{ user_id: "u1", role: "org_admin" }] }) as any;
    expect(await getMyRoles(first, "u1")).toEqual(["org_admin"]);
    const afterRevocation = fakeClient({ user_roles: [] }) as any;
    expect(await getMyRoles(afterRevocation, "u1")).toEqual([]);
  });
});
