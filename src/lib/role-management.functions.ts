import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";
import { requireTenantId } from "@/lib/tenant-scope";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const MANAGEABLE_ROLES = [
  "org_admin",
  "branch_admin",
  "hr",
  "finance",
  "manager",
  "employee",
] as const;

/**
 * End every live session for a user whose permissions just changed (§1 #5).
 *
 * To be precise about what this does and does not buy: server-side
 * authorization is already correct the instant the role row changes, because
 * every server fn and every RLS policy reads user_roles live rather than
 * trusting role claims in the JWT. This is NOT closing an authorization hole.
 *
 * What it fixes is the client half. The route gate caches status for two
 * minutes and the nav is rendered from rbac.ts, so without this a user keeps
 * seeing — and clicking — controls for permissions they no longer hold, and
 * every click fails confusingly. Forcing re-authentication resyncs them.
 * It is also defence in depth against any future code that reads roles from
 * claims instead of the database.
 *
 * Best-effort by design: the role row is already committed by the time this
 * runs, so a failure here must never roll back the permission change.
 */
async function revokeSessionsForRoleChange(admin: any, targetUserId: string): Promise<number> {
  try {
    const { data } = await admin.rpc("revoke_user_sessions", { _user_id: targetUserId });
    return Number(data ?? 0);
  } catch {
    return 0;
  }
}

async function assertOrgAdmin(supabase: any, userId: string): Promise<string> {
  const tenantId = await requireTenantId(supabase, userId);
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const has = (roles ?? []).some((r: any) => r.role === "org_admin" || r.role === "super_admin");
  if (!has) throw new Error("Not authorized — Org Admin required");
  return tenantId as string;
}

// ---------- listTenantMembers ----------
export const listTenantMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const admin = await loadAdmin();

    // All employees in tenant (those with user_id are active members)
    const { data: emps } = await admin
      .from("employees")
      .select("id,user_id,first_name,last_name,email,job_title,branch_id,status")
      .eq("tenant_id", tenantId)
      .order("first_name", { ascending: true });

    const userIds = (emps ?? []).map((e: any) => e.user_id).filter(Boolean);
    let rolesByUser: Record<string, string[]> = {};
    let scopeByUser: Record<string, { branch_id: string | null; country_code: string | null }[]> = {};

    if (userIds.length > 0) {
      const { data: rls } = await admin.from("user_roles").select("user_id,role").in("user_id", userIds);
      (rls ?? []).forEach((r: any) => {
        (rolesByUser[r.user_id] ||= []).push(r.role);
      });
      const { data: scs } = await admin
        .from("role_scope")
        .select("user_id,branch_id,country_code")
        .in("user_id", userIds);
      (scs ?? []).forEach((s: any) => {
        (scopeByUser[s.user_id] ||= []).push({ branch_id: s.branch_id, country_code: s.country_code });
      });
    }

    const { data: branches } = await admin
      .from("tenant_branches")
      .select("id,name,code")
      .eq("tenant_id", tenantId)
      .order("name");

    // T23 · Why a row cannot be given a role.
    //
    // A role is granted to a *user*, and an employee whose invitation was
    // never accepted has no user to grant it to. The page used to express that
    // as a disabled button with a tooltip, which reads as a broken control —
    // the reported symptom was "the + Role button appears inactive" with no
    // explanation and nothing to do about it. Carrying the invitation here
    // lets the row say which of the three states it is in (never invited,
    // invited and waiting, invitation expired) and act on it in place.
    const pendingEmails = (emps ?? [])
      .filter((e: any) => !e.user_id && e.email)
      .map((e: any) => String(e.email).toLowerCase());
    const invitationByEmail = new Map<string, { id: string; status: string; expires_at: string | null }>();
    if (pendingEmails.length > 0) {
      const { data: invites } = await admin
        .from("staff_invitations")
        .select("id,email,status,expires_at,created_at")
        .eq("tenant_id", tenantId)
        .in("email", pendingEmails)
        .order("created_at", { ascending: false });
      for (const inv of invites ?? []) {
        const key = String(inv.email).toLowerCase();
        // Ordered newest-first, so the first one seen is the current one.
        if (!invitationByEmail.has(key)) {
          invitationByEmail.set(key, {
            id: inv.id as string,
            status: inv.status as string,
            expires_at: (inv.expires_at as string | null) ?? null,
          });
        }
      }
    }

    return {
      members: (emps ?? []).map((e: any) => ({
        ...e,
        roles: e.user_id ? rolesByUser[e.user_id] ?? [] : [],
        scopes: e.user_id ? scopeByUser[e.user_id] ?? [] : [],
        invitation:
          !e.user_id && e.email
            ? invitationByEmail.get(String(e.email).toLowerCase()) ?? null
            : null,
      })),
      branches: branches ?? [],
    };
  });

// ---------- grantRole ----------
const grantSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(MANAGEABLE_ROLES),
  branch_id: z.string().uuid().optional().nullable(),
});

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => grantSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const admin = await loadAdmin();

    // Verify target user is in this tenant
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", data.user_id)
      .maybeSingle();
    if (!targetProfile || targetProfile.tenant_id !== tenantId) {
      throw new Error("User is not a member of your organization");
    }

    // Branch validation when scoping
    if (data.branch_id) {
      const { data: br } = await admin
        .from("tenant_branches")
        .select("id,tenant_id")
        .eq("id", data.branch_id)
        .maybeSingle();
      if (!br || br.tenant_id !== tenantId) throw new Error("Branch not in your organization");
    }

    // Insert role (idempotent via unique constraint)
    const { error: rErr } = await admin
      .from("user_roles")
      .upsert({ user_id: data.user_id, role: data.role, tenant_id: tenantId }, { onConflict: "user_id,role,tenant_id" });
    if (rErr) throw new Error(rErr.message);

    // Insert scope row when branch-scoped (branch_admin/hr/finance/manager)
    const scopedRoles = new Set(["branch_admin", "hr", "finance", "manager"]);
    if (scopedRoles.has(data.role) && data.branch_id) {
      const { error: sErr } = await admin
        .from("role_scope")
        .insert({ user_id: data.user_id, tenant_id: tenantId, branch_id: data.branch_id });
      if (sErr && !sErr.message.includes("duplicate")) throw new Error(sErr.message);
    }

    const sessionsRevoked = await revokeSessionsForRoleChange(admin, data.user_id);
    return { ok: true, sessionsRevoked };
  });

// ---------- revokeRole ----------
const revokeSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(MANAGEABLE_ROLES),
});

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => revokeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const admin = await loadAdmin();

    // Verify target user is in this tenant
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", data.user_id)
      .maybeSingle();
    if (!targetProfile || targetProfile.tenant_id !== tenantId) {
      throw new Error("User is not a member of your organization");
    }

    // Don't allow removing your own org_admin (could lock yourself out)
    if (data.user_id === userId && data.role === "org_admin") {
      throw new Error("You cannot remove your own Org Admin role");
    }

    const { error } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role);
    if (error) throw new Error(error.message);

    // Revoking is the case that actually matters: without this the user keeps
    // the removed role until their token expires.
    const sessionsRevoked = await revokeSessionsForRoleChange(admin, data.user_id);
    return { ok: true, sessionsRevoked };
  });

// ---------- updateBranchScope ----------
const scopeSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["branch_admin", "hr", "finance", "manager"]),
  branch_ids: z.array(z.string().uuid()).max(50),
});

export const setBranchScope = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => scopeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const tenantId = await assertOrgAdmin(supabase, userId);
    const admin = await loadAdmin();

    // Wipe existing branch scopes for this user within the tenant
    await admin
      .from("role_scope")
      .delete()
      .eq("user_id", data.user_id)
      .eq("tenant_id", tenantId)
      .not("branch_id", "is", null);

    if (data.branch_ids.length > 0) {
      // Validate branches belong to tenant
      const { data: brs } = await admin
        .from("tenant_branches")
        .select("id,tenant_id")
        .in("id", data.branch_ids);
      const allValid = (brs ?? []).every((b: any) => b.tenant_id === tenantId);
      if (!allValid) throw new Error("One or more branches are not in your organization");

      const rows = data.branch_ids.map((bid) => ({
        user_id: data.user_id,
        tenant_id: tenantId,
        branch_id: bid,
      }));
      const { error } = await admin.from("role_scope").insert(rows);
      if (error) throw new Error(error.message);
    }

    // Narrowing a branch scope is a permission reduction just like revoking a
    // role, so it gets the same treatment.
    const sessionsRevoked = await revokeSessionsForRoleChange(admin, data.user_id);
    return { ok: true, sessionsRevoked };
  });
