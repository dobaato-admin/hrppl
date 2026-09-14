import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { getTenantAndRoles } from "@/lib/tenant-scope";

/**
 * Suspend / reinstate user accounts (Finalization Plan §1 #4, §5 "Day 1").
 *
 * Suspension is only meaningful if it takes effect immediately, so this does
 * three things rather than one:
 *   1. flips profiles.status, which requireActiveUser re-reads on every request
 *      and which has_role() consults for RLS row access;
 *   2. revokes the target's refresh tokens so the client cannot renew;
 *   3. writes an audit_log entry.
 *
 * Scoping: super_admin may act on anyone; org_admin only within their own
 * tenant. Nobody may suspend themselves (that would lock the last admin out).
 */

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type Actor = { userId: string; isSuper: boolean; tenantId: string | null };

async function resolveActor(userId: string): Promise<Actor> {
  const admin = await loadAdmin();
  const { tenantId, roles: held } = await getTenantAndRoles(admin, userId);
  if (!held.includes("super_admin") && !held.includes("org_admin")) {
    throw new Error("Forbidden");
  }
  return {
    userId,
    isSuper: held.includes("super_admin"),
    tenantId,
  };
}

/** Throws unless `actor` is allowed to change `targetUserId`'s status. */
async function assertMayGovern(actor: Actor, targetUserId: string) {
  if (actor.userId === targetUserId) {
    throw new Error("You cannot change your own account status.");
  }
  const admin = await loadAdmin();
  const { data: target } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!target) throw new Error("User not found");

  if (actor.isSuper) return;

  // org_admin is tenant-scoped.
  if (!actor.tenantId || target.tenant_id !== actor.tenantId) {
    throw new Error("Forbidden: user belongs to a different organisation.");
  }
  // An org_admin must not be able to suspend a platform admin.
  const { data: targetRoles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", targetUserId);
  const elevated = (targetRoles ?? []).some(
    (r: { role: string }) => r.role === "super_admin" || r.role === "regional_admin",
  );
  if (elevated) throw new Error("Forbidden: cannot change a platform administrator.");
}

async function audit(
  actorId: string,
  targetUserId: string,
  action: string,
  metadata: Record<string, unknown>,
) {
  const admin = await loadAdmin();
  try {
    await admin.from("audit_log").insert({
      actor_id: actorId,
      entity_type: "profile",
      entity_id: targetUserId,
      action,
      metadata,
    } as never);
  } catch {
    /* audit is best-effort; never block the security action itself */
  }
}

export const suspendAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        reason: z.string().trim().min(1).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const actor = await resolveActor((context as { userId: string }).userId);
    await assertMayGovern(actor, data.userId);

    const admin = await loadAdmin();
    const { error } = await admin
      .from("profiles")
      .update({
        status: "suspended",
        suspended_at: new Date().toISOString(),
        suspended_by: actor.userId,
        suspension_reason: data.reason,
      } as never)
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    // Kill live sessions. Best-effort: the per-request check in
    // requireActiveUser is the guarantee, this just shortens the window in
    // which a still-valid access token can be replayed against PostgREST.
    let sessionsRevoked = 0;
    try {
      const { data: revoked } = await admin.rpc(
        "revoke_user_sessions" as never,
        {
          _user_id: data.userId,
        } as never,
      );
      sessionsRevoked = Number(revoked ?? 0);
    } catch {
      /* RPC unavailable — status flip already blocks the account */
    }

    await audit(actor.userId, data.userId, "account.suspended", {
      reason: data.reason,
      sessionsRevoked,
    });
    return { ok: true, sessionsRevoked };
  });

export const reinstateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const actor = await resolveActor((context as { userId: string }).userId);
    await assertMayGovern(actor, data.userId);

    const admin = await loadAdmin();
    const { error } = await admin
      .from("profiles")
      .update({
        status: "active",
        suspended_at: null,
        suspended_by: null,
        suspension_reason: null,
      } as never)
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    await audit(actor.userId, data.userId, "account.reinstated", {});
    return { ok: true };
  });

export const listSuspendedAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const actor = await resolveActor((context as { userId: string }).userId);
    const admin = await loadAdmin();
    let q = admin
      .from("profiles")
      .select(
        "id, email, full_name, tenant_id, status, suspended_at, suspended_by, suspension_reason",
      )
      .eq("status", "suspended")
      .order("suspended_at", { ascending: false });
    if (!actor.isSuper) {
      if (!actor.tenantId) return { accounts: [] };
      q = q.eq("tenant_id", actor.tenantId);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { accounts: data ?? [] };
  });
