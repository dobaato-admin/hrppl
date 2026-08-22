import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, z as stringType } from "../_libs/zod.mjs";
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
async function assertSuperAdmin(userId) {
  const admin = await loadAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "super_admin")) {
    throw new Error("Forbidden");
  }
  return admin;
}
const getRecentEmailLog_createServerFn_handler = createServerRpc({
  id: "572e11fcab03a07d652c1e7da6f334e0d2d2e8b9734e808c71fee21767020f3e",
  name: "getRecentEmailLog",
  filename: "src/lib/diagnostics.functions.ts"
}, (opts) => getRecentEmailLog.__executeServer(opts));
const getRecentEmailLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  recipientEmail: stringType().email().optional(),
  templateName: stringType().max(120).optional(),
  sinceMinutes: numberType().int().min(1).max(1440).default(60),
  limit: numberType().int().min(1).max(100).default(20)
}).parse(d)).handler(getRecentEmailLog_createServerFn_handler, async ({
  data,
  context
}) => {
  const admin = await assertSuperAdmin(context.userId);
  const since = new Date(Date.now() - data.sinceMinutes * 6e4).toISOString();
  let q = admin.from("email_send_log").select("id, recipient_email, template_name, status, error_message, created_at, message_id").gte("created_at", since).order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.recipientEmail) q = q.eq("recipient_email", data.recipientEmail);
  if (data.templateName) q = q.eq("template_name", data.templateName);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    rows: rows ?? []
  };
});
export {
  getRecentEmailLog_createServerFn_handler
};
