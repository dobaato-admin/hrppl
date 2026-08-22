import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, B as enumType, z as stringType, A as booleanType, D as arrayType } from "../_libs/zod.mjs";
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
const ListInput = objectType({
  unreadOnly: booleanType().optional().default(false),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  search: stringType().trim().max(200).optional().nullable(),
  sortBy: enumType(["newest", "unread_first", "job_id"]).optional().default("newest"),
  limit: numberType().int().min(1).max(100).optional().default(25),
  offset: numberType().int().min(0).optional().default(0)
}).partial();
function escLike(s) {
  return s.replace(/[\\%,()]/g, (m) => `\\${m}`);
}
const listNotifications_createServerFn_handler = createServerRpc({
  id: "c017b24a4940a916334ff23b3f3461893d7b3f151e06bac76f968dd27c3f187b",
  name: "listNotifications",
  filename: "src/lib/notifications.functions.ts"
}, (opts) => listNotifications.__executeServer(opts));
const listNotifications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ListInput.parse(d ?? {})).handler(listNotifications_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const limit = data.limit ?? 25;
  const offset = data.offset ?? 0;
  const sortBy = data.sortBy ?? "newest";
  let q = supabase.from("in_app_notifications").select("*", {
    count: "exact"
  }).eq("user_id", userId);
  if (sortBy === "unread_first") {
    q = q.order("read_at", {
      ascending: true,
      nullsFirst: true
    }).order("created_at", {
      ascending: false
    });
  } else if (sortBy === "job_id") {
    q = q.order("link", {
      ascending: true,
      nullsFirst: false
    }).order("created_at", {
      ascending: false
    });
  } else {
    q = q.order("created_at", {
      ascending: false
    });
  }
  q = q.range(offset, offset + limit - 1);
  if (data.unreadOnly) q = q.is("read_at", null);
  if (data.startDate) q = q.gte("created_at", `${data.startDate}T00:00:00Z`);
  if (data.endDate) q = q.lte("created_at", `${data.endDate}T23:59:59Z`);
  if (data.search) {
    const term = `%${escLike(data.search)}%`;
    q = q.or(`title.ilike.${term},body.ilike.${term},kind.ilike.${term},link.ilike.${term}`);
  }
  const {
    data: rows,
    error,
    count
  } = await q;
  if (error) throw new Error(error.message);
  const {
    count: unreadCount
  } = await supabase.from("in_app_notifications").select("id", {
    count: "exact",
    head: true
  }).eq("user_id", userId).is("read_at", null);
  return {
    notifications: rows ?? [],
    total: count ?? 0,
    unreadTotal: unreadCount ?? 0,
    limit,
    offset
  };
});
const markNotificationRead_createServerFn_handler = createServerRpc({
  id: "385e76cdf807dd53711b6f969d894db85cf9b0ca7a6373bb34c6352adedccb64",
  name: "markNotificationRead",
  filename: "src/lib/notifications.functions.ts"
}, (opts) => markNotificationRead.__executeServer(opts));
const markNotificationRead = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  ids: arrayType(stringType().uuid()).max(200).optional(),
  all: booleanType().optional()
}).parse(d)).handler(markNotificationRead_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let q = supabase.from("in_app_notifications").update({
    read_at: now
  }).eq("user_id", userId);
  if (data.id) q = q.eq("id", data.id);
  else if (data.ids && data.ids.length > 0) q = q.in("id", data.ids);
  else q = q.is("read_at", null);
  const {
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const markNotificationUnread_createServerFn_handler = createServerRpc({
  id: "607ba84c3614f5cd3696ec0b7e8d7ae11a3e99c338d06525020aa747044a3e00",
  name: "markNotificationUnread",
  filename: "src/lib/notifications.functions.ts"
}, (opts) => markNotificationUnread.__executeServer(opts));
const markNotificationUnread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ids: arrayType(stringType().uuid()).min(1).max(200)
}).parse(d)).handler(markNotificationUnread_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("in_app_notifications").update({
    read_at: null
  }).eq("user_id", userId).in("id", data.ids);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    count: data.ids.length
  };
});
export {
  listNotifications_createServerFn_handler,
  markNotificationRead_createServerFn_handler,
  markNotificationUnread_createServerFn_handler
};
