import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Hard-delete the calling user's account.
 * - Unlinks the user from employees / tenant creator / audit references (so FK constraints don't block deletion).
 * - Deletes the auth.users row, which cascades to profiles, user_roles, role_scope.
 * - After this completes, the same email can sign up again as a fresh account.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const admin = await loadAdmin();

    // Detach references that don't cascade
    await admin.from("employees").update({ user_id: null as any }).eq("user_id", userId);
    await admin.from("tenants").update({ created_by: null as any }).eq("created_by", userId);
    await admin.from("tenants").update({ approved_by: null as any }).eq("approved_by", userId);
    await admin.from("audit_log").update({ actor_id: null as any }).eq("actor_id", userId);
    await admin
      .from("subscription_confirmations")
      .update({ confirmed_by: null as any })
      .eq("confirmed_by", userId);

    // Remove any pending invitations addressed to the same email so re-signup is clean.
    // (Best-effort; ignore if column shape differs.)
    try {
      const { data: u } = await admin.auth.admin.getUserById(userId);
      const email = u?.user?.email;
      if (email) {
        await admin.from("staff_invitations").delete().ilike("email", email);
      }
    } catch {
      /* ignore */
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
