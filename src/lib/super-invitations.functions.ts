import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadEmailSender() {
  const { sendInternalEmail } = await import("@/lib/email/send-internal.server");
  return sendInternalEmail;
}

function buildSignupUrl() {
  const base =
    process.env.SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    "https://hrppl.io";
  return `${base.replace(/\/$/, "")}/signup`;
}

async function assertSuper(context: any): Promise<string> {
  const { supabase, userId } = context;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!(data ?? []).some((r: any) => r.role === "super_admin")) throw new Error("Forbidden");
  return userId as string;
}

async function logAudit(
  admin: any,
  invitation_id: string,
  action: "created" | "revoked" | "redeemed" | "resent" | "expired",
  actor_id: string | null,
  metadata: Record<string, unknown> = {},
) {
  await admin
    .from("org_trial_invitation_audit")
    .insert({ invitation_id, action, actor_id, metadata });
}

export const listOrgTrialInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuper(context);
    const admin = await loadAdmin();
    const { data, error } = await admin
      .from("org_trial_invitations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const { data: audit } = await admin
      .from("org_trial_invitation_audit")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    return { invitations: data ?? [], audit: audit ?? [] };
  });

const createSchema = z.object({
  email: z.string().email().max(255),
  org_name: z.string().min(1).max(255),
  contact_name: z.string().max(255).optional().nullable(),
  country_code: z.string().max(8).optional().nullable(),
  trial_days: z.number().int().min(1).max(365).default(30),
  notes: z.string().max(2000).optional().nullable(),
});

export const createOrgTrialInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = await assertSuper(context);
    const admin = await loadAdmin();
    const expiresAt = new Date(Date.now() + data.trial_days * 24 * 60 * 60 * 1000).toISOString();
    const { data: row, error } = await admin
      .from("org_trial_invitations")
      .insert({
        email: data.email.toLowerCase(),
        org_name: data.org_name,
        contact_name: data.contact_name ?? null,
        country_code: data.country_code ?? null,
        trial_days: data.trial_days,
        notes: data.notes ?? null,
        expires_at: expiresAt,
        created_by: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logAudit(admin, row.id, "created", userId, {
      email: row.email,
      org_name: row.org_name,
      trial_days: row.trial_days,
    });
    try {
      const sendInternalEmail = await loadEmailSender();
      await sendInternalEmail({
        templateName: "org-trial-invitation",
        recipientEmail: row.email,
        idempotencyKey: `org-trial-invitation-${row.id}`,
        templateData: {
          organizationName: row.org_name,
          contactName: row.contact_name,
          trialDays: row.trial_days,
          signupUrl: buildSignupUrl(),
          expiresAt: row.expires_at,
        },
      });
    } catch (e) {
      console.error("[super-invitations] failed to send create email", e);
    }
    return { invitation: row };
  });

const idSchema = z.object({ id: z.string().uuid() });

export const revokeOrgTrialInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = await assertSuper(context);
    const admin = await loadAdmin();
    const { data: row, error } = await admin
      .from("org_trial_invitations")
      .update({ status: "revoked" })
      .eq("id", data.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (row) await logAudit(admin, row.id, "revoked", userId);
    return { ok: true };
  });

const resendSchema = z.object({
  id: z.string().uuid(),
  extend_days: z.number().int().min(0).max(365).optional(),
});

export const resendOrgTrialInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => resendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = await assertSuper(context);
    const admin = await loadAdmin();
    const { data: inv, error: gerr } = await admin
      .from("org_trial_invitations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (gerr || !inv) throw new Error("Invitation not found");
    const extend = data.extend_days ?? inv.trial_days ?? 30;
    const newExpiry = new Date(Date.now() + extend * 24 * 60 * 60 * 1000).toISOString();
    const reactivate = inv.status === "expired" || inv.status === "revoked";
    const { error } = await admin
      .from("org_trial_invitations")
      .update(
        reactivate
          ? { expires_at: newExpiry, status: "pending" as const }
          : { expires_at: newExpiry },
      )
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(admin, data.id, "resent", userId, { extend_days: extend });
    try {
      const sendInternalEmail = await loadEmailSender();
      await sendInternalEmail({
        templateName: "org-trial-invitation",
        recipientEmail: inv.email,
        idempotencyKey: `org-trial-invitation-${inv.id}-${Date.now()}`,
        templateData: {
          organizationName: inv.org_name,
          contactName: inv.contact_name,
          trialDays: extend,
          signupUrl: buildSignupUrl(),
          expiresAt: newExpiry,
        },
      });
    } catch (e) {
      console.error("[super-invitations] failed to send resend email", e);
    }
    return { ok: true, expires_at: newExpiry };
  });

// Returns the pending org-trial invitation for the authenticated caller's email, if any.
export const getMyTrialInvitation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claims } = context as any;
    const email = (claims?.email as string | undefined)?.toLowerCase();
    if (!email) return { invitation: null };
    const admin = await loadAdmin();
    const { data } = await admin
      .from("org_trial_invitations")
      .select("*")
      .eq("email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { invitation: data ?? null };
  });

// Redeems the caller's pending trial invitation against a tenant they own.
export const redeemMyTrialInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ tenant_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context as any;
    const email = (claims?.email as string | undefined)?.toLowerCase();
    if (!email) throw new Error("No email on session");

    const { data: roles } = await supabase
      .from("user_roles").select("role,tenant_id").eq("user_id", userId).eq("tenant_id", data.tenant_id);
    if (!(roles ?? []).length) throw new Error("Not a member of this organization");

    const admin = await loadAdmin();
    const { data: inv } = await admin
      .from("org_trial_invitations")
      .select("*")
      .eq("email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!inv) return { ok: false as const, reason: "no_pending_invitation" as const };

    const trialEnds = new Date(Date.now() + (inv.trial_days ?? 30) * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    await admin
      .from("tenant_subscriptions")
      .update({ status: "trialing", trial_ends_at: trialEnds })
      .eq("tenant_id", data.tenant_id);

    await admin
      .from("org_trial_invitations")
      .update({ status: "redeemed", redeemed_at: new Date().toISOString(), redeemed_tenant_id: data.tenant_id })
      .eq("id", inv.id);

    await logAudit(admin, inv.id, "redeemed", userId, { tenant_id: data.tenant_id, trial_ends_at: trialEnds });
    return { ok: true as const, trial_ends_at: trialEnds, invitation_id: inv.id };
  });
