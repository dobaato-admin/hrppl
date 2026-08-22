import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, C as numberType, B as enumType } from "../_libs/zod.mjs";
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
const TABLES = ["onboarding_control_room_audit", "offboarding_comms_removal_audit"];
const listRetentionPolicies_createServerFn_handler = createServerRpc({
  id: "0faecac0cabbcc0106f44db547ad455fb9f25c13889f86b682811daaa7d1cb3c",
  name: "listRetentionPolicies",
  filename: "src/lib/audit-retention.functions.ts"
}, (opts) => listRetentionPolicies.__executeServer(opts));
const listRetentionPolicies = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listRetentionPolicies_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: me
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!me?.tenant_id) return {
    rows: []
  };
  const {
    data,
    error
  } = await supabase.from("audit_retention_policies").select("*").eq("tenant_id", me.tenant_id);
  if (error) throw new Error(error.message);
  const byTable = new Map((data ?? []).map((r) => [r.table_name, r]));
  const rows = TABLES.map((t) => byTable.get(t) ?? {
    tenant_id: me.tenant_id,
    table_name: t,
    archive_after_days: 365,
    delete_after_days: 2555,
    is_active: true
  });
  return {
    rows
  };
});
const upsertRetentionPolicy_createServerFn_handler = createServerRpc({
  id: "a2a3945f6d6ee03312526405cdd3440ed8d4ff0846418420a6dc4375dde14730",
  name: "upsertRetentionPolicy",
  filename: "src/lib/audit-retention.functions.ts"
}, (opts) => upsertRetentionPolicy.__executeServer(opts));
const upsertRetentionPolicy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  table_name: enumType(TABLES),
  archive_after_days: numberType().int().min(30).max(3650),
  delete_after_days: numberType().int().min(365).max(36500),
  is_active: booleanType().default(true)
}).parse(d)).handler(upsertRetentionPolicy_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: me
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!me?.tenant_id) throw new Error("No tenant");
  if (data.delete_after_days < data.archive_after_days) {
    throw new Error("delete_after_days must be >= archive_after_days");
  }
  const {
    error
  } = await supabase.from("audit_retention_policies").upsert({
    tenant_id: me.tenant_id,
    ...data
  }, {
    onConflict: "tenant_id,table_name"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const runRetentionNow_createServerFn_handler = createServerRpc({
  id: "abbcea8fac19abf2457725a529dfb32089108315cbb6a95a626d079b7f7ba71f",
  name: "runRetentionNow",
  filename: "src/lib/audit-retention.functions.ts"
}, (opts) => runRetentionNow.__executeServer(opts));
const runRetentionNow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(runRetentionNow_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: me
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!me?.tenant_id) throw new Error("No tenant");
  const {
    data: isAdmin
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });
  if (!isAdmin) throw new Error("Only admins can run retention.");
  const {
    data,
    error
  } = await supabase.rpc("run_audit_retention_for_tenant", {
    _tenant_id: me.tenant_id
  });
  if (error) throw new Error(error.message);
  return {
    results: data ?? []
  };
});
export {
  listRetentionPolicies_createServerFn_handler,
  runRetentionNow_createServerFn_handler,
  upsertRetentionPolicy_createServerFn_handler
};
