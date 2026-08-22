import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
async function loadAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function loadEmailSender() {
  const {
    sendInternalEmail
  } = await import("./send-internal.server-9cG3k97B.mjs");
  return sendInternalEmail;
}
function buildSignupUrl() {
  const base = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || "https://hrppl.io";
  return `${base.replace(/\/$/, "")}/signup`;
}
async function assertSuper(context) {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!(data ?? []).some((r) => r.role === "super_admin")) throw new Error("Forbidden");
  return userId;
}
async function logAudit(admin, invitation_id, action, actor_id, metadata = {}) {
  await admin.from("org_trial_invitation_audit").insert({
    invitation_id,
    action,
    actor_id,
    metadata
  });
}
const listOrgTrialInvitations_createServerFn_handler = createServerRpc({
  id: "549b7b67aa914c962358e207fe3ee563e965bb7d761b0acdcd0b0ce6008e3f0d",
  name: "listOrgTrialInvitations",
  filename: "src/lib/super-invitations.functions.ts"
}, (opts) => listOrgTrialInvitations.__executeServer(opts));
const listOrgTrialInvitations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listOrgTrialInvitations_createServerFn_handler, async ({
  context
}) => {
  await assertSuper(context);
  const admin = await loadAdmin();
  const {
    data,
    error
  } = await admin.from("org_trial_invitations").select("*").order("created_at", {
    ascending: false
  }).limit(500);
  if (error) throw new Error(error.message);
  const {
    data: audit
  } = await admin.from("org_trial_invitation_audit").select("*").order("created_at", {
    ascending: false
  }).limit(1e3);
  return {
    invitations: data ?? [],
    audit: audit ?? []
  };
});
const createSchema = objectType({
  email: stringType().email().max(255),
  org_name: stringType().min(1).max(255),
  contact_name: stringType().max(255).optional().nullable(),
  country_code: stringType().max(8).optional().nullable(),
  trial_days: numberType().int().min(1).max(365).default(30),
  notes: stringType().max(2e3).optional().nullable()
});
const createOrgTrialInvitation_createServerFn_handler = createServerRpc({
  id: "257aca8147aa7dd6506517666f795170bf9989b99efb44afa2819e61d311f9cb",
  name: "createOrgTrialInvitation",
  filename: "src/lib/super-invitations.functions.ts"
}, (opts) => createOrgTrialInvitation.__executeServer(opts));
const createOrgTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => createSchema.parse(input)).handler(createOrgTrialInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = await assertSuper(context);
  const admin = await loadAdmin();
  const expiresAt = new Date(Date.now() + data.trial_days * 24 * 60 * 60 * 1e3).toISOString();
  const {
    data: row,
    error
  } = await admin.from("org_trial_invitations").insert({
    email: data.email.toLowerCase(),
    org_name: data.org_name,
    contact_name: data.contact_name ?? null,
    country_code: data.country_code ?? null,
    trial_days: data.trial_days,
    notes: data.notes ?? null,
    expires_at: expiresAt,
    created_by: userId
  }).select("*").single();
  if (error) throw new Error(error.message);
  await logAudit(admin, row.id, "created", userId, {
    email: row.email,
    org_name: row.org_name,
    trial_days: row.trial_days
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
        expiresAt: row.expires_at
      }
    });
  } catch (e) {
    console.error("[super-invitations] failed to send create email", e);
  }
  return {
    invitation: row
  };
});
const idSchema = objectType({
  id: stringType().uuid()
});
const revokeOrgTrialInvitation_createServerFn_handler = createServerRpc({
  id: "13c2ac19bfc110cacfd6f62d2c73a3b7ad6c340e02dac9c0c13b8a46066ea3ca",
  name: "revokeOrgTrialInvitation",
  filename: "src/lib/super-invitations.functions.ts"
}, (opts) => revokeOrgTrialInvitation.__executeServer(opts));
const revokeOrgTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => idSchema.parse(input)).handler(revokeOrgTrialInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = await assertSuper(context);
  const admin = await loadAdmin();
  const {
    data: row,
    error
  } = await admin.from("org_trial_invitations").update({
    status: "revoked"
  }).eq("id", data.id).eq("status", "pending").select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (row) await logAudit(admin, row.id, "revoked", userId);
  return {
    ok: true
  };
});
const resendSchema = objectType({
  id: stringType().uuid(),
  extend_days: numberType().int().min(0).max(365).optional()
});
const resendOrgTrialInvitation_createServerFn_handler = createServerRpc({
  id: "d04c081c85ad790202ab4d59ca4c2013da3e440947acf3112ddab0d9836a7cae",
  name: "resendOrgTrialInvitation",
  filename: "src/lib/super-invitations.functions.ts"
}, (opts) => resendOrgTrialInvitation.__executeServer(opts));
const resendOrgTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => resendSchema.parse(input)).handler(resendOrgTrialInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = await assertSuper(context);
  const admin = await loadAdmin();
  const {
    data: inv,
    error: gerr
  } = await admin.from("org_trial_invitations").select("*").eq("id", data.id).maybeSingle();
  if (gerr || !inv) throw new Error("Invitation not found");
  const extend = data.extend_days ?? inv.trial_days ?? 30;
  const newExpiry = new Date(Date.now() + extend * 24 * 60 * 60 * 1e3).toISOString();
  const reactivate = inv.status === "expired" || inv.status === "revoked";
  const {
    error
  } = await admin.from("org_trial_invitations").update(reactivate ? {
    expires_at: newExpiry,
    status: "pending"
  } : {
    expires_at: newExpiry
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAudit(admin, data.id, "resent", userId, {
    extend_days: extend
  });
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
        expiresAt: newExpiry
      }
    });
  } catch (e) {
    console.error("[super-invitations] failed to send resend email", e);
  }
  return {
    ok: true,
    expires_at: newExpiry
  };
});
const getMyTrialInvitation_createServerFn_handler = createServerRpc({
  id: "4be2cf77070da0fe2d90137016aa7f349161c398852eb117d1d5c033b4d7e0ae",
  name: "getMyTrialInvitation",
  filename: "src/lib/super-invitations.functions.ts"
}, (opts) => getMyTrialInvitation.__executeServer(opts));
const getMyTrialInvitation = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyTrialInvitation_createServerFn_handler, async ({
  context
}) => {
  const {
    claims
  } = context;
  const email = claims?.email?.toLowerCase();
  if (!email) return {
    invitation: null
  };
  const admin = await loadAdmin();
  const {
    data
  } = await admin.from("org_trial_invitations").select("*").eq("email", email).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  return {
    invitation: data ?? null
  };
});
const redeemMyTrialInvitation_createServerFn_handler = createServerRpc({
  id: "fa86559289c74a7160b2a69e965649a1d27bec26f3279805304d282039a976fe",
  name: "redeemMyTrialInvitation",
  filename: "src/lib/super-invitations.functions.ts"
}, (opts) => redeemMyTrialInvitation.__executeServer(opts));
const redeemMyTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenant_id: stringType().uuid()
}).parse(input)).handler(redeemMyTrialInvitation_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  const email = claims?.email?.toLowerCase();
  if (!email) throw new Error("No email on session");
  const {
    data: roles
  } = await supabase.from("user_roles").select("role,tenant_id").eq("user_id", userId).eq("tenant_id", data.tenant_id);
  if (!(roles ?? []).length) throw new Error("Not a member of this organization");
  const admin = await loadAdmin();
  const {
    data: inv
  } = await admin.from("org_trial_invitations").select("*").eq("email", email).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  if (!inv) return {
    ok: false,
    reason: "no_pending_invitation"
  };
  const trialEnds = new Date(Date.now() + (inv.trial_days ?? 30) * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10);
  await admin.from("tenant_subscriptions").update({
    status: "trialing",
    trial_ends_at: trialEnds
  }).eq("tenant_id", data.tenant_id);
  await admin.from("org_trial_invitations").update({
    status: "redeemed",
    redeemed_at: (/* @__PURE__ */ new Date()).toISOString(),
    redeemed_tenant_id: data.tenant_id
  }).eq("id", inv.id);
  await logAudit(admin, inv.id, "redeemed", userId, {
    tenant_id: data.tenant_id,
    trial_ends_at: trialEnds
  });
  return {
    ok: true,
    trial_ends_at: trialEnds,
    invitation_id: inv.id
  };
});
export {
  createOrgTrialInvitation_createServerFn_handler,
  getMyTrialInvitation_createServerFn_handler,
  listOrgTrialInvitations_createServerFn_handler,
  redeemMyTrialInvitation_createServerFn_handler,
  resendOrgTrialInvitation_createServerFn_handler,
  revokeOrgTrialInvitation_createServerFn_handler
};
