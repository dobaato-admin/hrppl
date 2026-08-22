import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
const deleteMyAccount_createServerFn_handler = createServerRpc({
  id: "27301031363e284184ead21ac910c33ebfbe9159435c975f26319c6a65fade88",
  name: "deleteMyAccount",
  filename: "src/lib/account.functions.ts"
}, (opts) => deleteMyAccount.__executeServer(opts));
const deleteMyAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(deleteMyAccount_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const admin = await loadAdmin();
  await admin.from("employees").update({
    user_id: null
  }).eq("user_id", userId);
  await admin.from("tenants").update({
    created_by: null
  }).eq("created_by", userId);
  await admin.from("tenants").update({
    approved_by: null
  }).eq("approved_by", userId);
  await admin.from("audit_log").update({
    actor_id: null
  }).eq("actor_id", userId);
  await admin.from("subscription_confirmations").update({
    confirmed_by: null
  }).eq("confirmed_by", userId);
  try {
    const {
      data: u
    } = await admin.auth.admin.getUserById(userId);
    const email = u?.user?.email;
    if (email) {
      await admin.from("staff_invitations").delete().ilike("email", email);
    }
  } catch {
  }
  const {
    error
  } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteMyAccount_createServerFn_handler
};
