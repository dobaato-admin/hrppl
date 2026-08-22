import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
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
async function resolveActor(userId) {
  const admin = await loadAdmin();
  const [{
    data: roles
  }, {
    data: profile
  }] = await Promise.all([admin.from("user_roles").select("role").eq("user_id", userId), admin.from("profiles").select("tenant_id").eq("id", userId).maybeSingle()]);
  const held = (roles ?? []).map((r) => r.role);
  if (!held.includes("super_admin") && !held.includes("org_admin")) {
    throw new Error("Forbidden");
  }
  return {
    userId,
    isSuper: held.includes("super_admin"),
    tenantId: profile?.tenant_id ?? null
  };
}
async function assertMayGovern(actor, targetUserId) {
  if (actor.userId === targetUserId) {
    throw new Error("You cannot change your own account status.");
  }
  const admin = await loadAdmin();
  const {
    data: target
  } = await admin.from("profiles").select("tenant_id").eq("id", targetUserId).maybeSingle();
  if (!target) throw new Error("User not found");
  if (actor.isSuper) return;
  if (!actor.tenantId || target.tenant_id !== actor.tenantId) {
    throw new Error("Forbidden: user belongs to a different organisation.");
  }
  const {
    data: targetRoles
  } = await admin.from("user_roles").select("role").eq("user_id", targetUserId);
  const elevated = (targetRoles ?? []).some((r) => r.role === "super_admin" || r.role === "regional_admin");
  if (elevated) throw new Error("Forbidden: cannot change a platform administrator.");
}
async function audit(actorId, targetUserId, action, metadata) {
  const admin = await loadAdmin();
  try {
    await admin.from("audit_log").insert({
      actor_id: actorId,
      entity_type: "profile",
      entity_id: targetUserId,
      action,
      metadata
    });
  } catch {
  }
}
const suspendAccount_createServerFn_handler = createServerRpc({
  id: "08d30269a1696e9feaa7c2cd8da97956b1d175dc2a81d08787afe168963a0f6e",
  name: "suspendAccount",
  filename: "src/lib/account-suspension.functions.ts"
}, (opts) => suspendAccount.__executeServer(opts));
const suspendAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  reason: stringType().trim().min(1).max(500)
}).parse(d)).handler(suspendAccount_createServerFn_handler, async ({
  data,
  context
}) => {
  const actor = await resolveActor(context.userId);
  await assertMayGovern(actor, data.userId);
  const admin = await loadAdmin();
  const {
    error
  } = await admin.from("profiles").update({
    status: "suspended",
    suspended_at: (/* @__PURE__ */ new Date()).toISOString(),
    suspended_by: actor.userId,
    suspension_reason: data.reason
  }).eq("id", data.userId);
  if (error) throw new Error(error.message);
  let sessionsRevoked = 0;
  try {
    const {
      data: revoked
    } = await admin.rpc("revoke_user_sessions", {
      _user_id: data.userId
    });
    sessionsRevoked = Number(revoked ?? 0);
  } catch {
  }
  await audit(actor.userId, data.userId, "account.suspended", {
    reason: data.reason,
    sessionsRevoked
  });
  return {
    ok: true,
    sessionsRevoked
  };
});
const reinstateAccount_createServerFn_handler = createServerRpc({
  id: "15bb30cc41b89437ba30ffce44df51a6e721dd1be3460699f2a099392fb6a6a8",
  name: "reinstateAccount",
  filename: "src/lib/account-suspension.functions.ts"
}, (opts) => reinstateAccount.__executeServer(opts));
const reinstateAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(reinstateAccount_createServerFn_handler, async ({
  data,
  context
}) => {
  const actor = await resolveActor(context.userId);
  await assertMayGovern(actor, data.userId);
  const admin = await loadAdmin();
  const {
    error
  } = await admin.from("profiles").update({
    status: "active",
    suspended_at: null,
    suspended_by: null,
    suspension_reason: null
  }).eq("id", data.userId);
  if (error) throw new Error(error.message);
  await audit(actor.userId, data.userId, "account.reinstated", {});
  return {
    ok: true
  };
});
const listSuspendedAccounts_createServerFn_handler = createServerRpc({
  id: "02a41e86b044cd0a583f98433a4de0142f648e58059962d01648a75396dacafb",
  name: "listSuspendedAccounts",
  filename: "src/lib/account-suspension.functions.ts"
}, (opts) => listSuspendedAccounts.__executeServer(opts));
const listSuspendedAccounts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSuspendedAccounts_createServerFn_handler, async ({
  context
}) => {
  const actor = await resolveActor(context.userId);
  const admin = await loadAdmin();
  let q = admin.from("profiles").select("id, email, full_name, tenant_id, status, suspended_at, suspended_by, suspension_reason").eq("status", "suspended").order("suspended_at", {
    ascending: false
  });
  if (!actor.isSuper) {
    if (!actor.tenantId) return {
      accounts: []
    };
    q = q.eq("tenant_id", actor.tenantId);
  }
  const {
    data,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    accounts: data ?? []
  };
});
export {
  listSuspendedAccounts_createServerFn_handler,
  reinstateAccount_createServerFn_handler,
  suspendAccount_createServerFn_handler
};
