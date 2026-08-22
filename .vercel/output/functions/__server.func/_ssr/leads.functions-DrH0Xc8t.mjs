import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, C as numberType, B as enumType } from "../_libs/zod.mjs";
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
const leadSchema = objectType({
  full_name: stringType().trim().min(1).max(120),
  work_email: stringType().trim().email().max(255),
  company: stringType().trim().min(1).max(200),
  country: stringType().trim().max(100).optional().nullable(),
  phone: stringType().trim().max(40).optional().nullable(),
  role: stringType().trim().max(120).optional().nullable(),
  company_size: stringType().trim().max(40).optional().nullable(),
  employee_count: numberType().int().min(0).max(1e7).optional().nullable(),
  current_payroll_system: stringType().trim().max(160).optional().nullable(),
  message: stringType().trim().max(2e3).optional().nullable(),
  source: stringType().trim().max(80).optional().nullable(),
  utm_source: stringType().trim().max(120).optional().nullable(),
  utm_medium: stringType().trim().max(120).optional().nullable(),
  utm_campaign: stringType().trim().max(120).optional().nullable()
});
const submitLead_createServerFn_handler = createServerRpc({
  id: "e211e8c27eee0a1053129b7769a37cb2e31b3dc869a84a1c647eee19cfb57993",
  name: "submitLead",
  filename: "src/lib/leads.functions.ts"
}, (opts) => submitLead.__executeServer(opts));
const submitLead = createServerFn({
  method: "POST"
}).inputValidator((data) => leadSchema.parse(data)).handler(submitLead_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    error
  } = await supabaseAdmin.from("leads").insert({
    ...data,
    status: "new"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listLeads_createServerFn_handler = createServerRpc({
  id: "77acd1c20769f0aaa93fdea78adabaa9f8b27285e13363740e4c85703e8554bc",
  name: "listLeads",
  filename: "src/lib/leads.functions.ts"
}, (opts) => listLeads.__executeServer(opts));
const listLeads = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listLeads_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roleRow
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!roleRow) throw new Error("Forbidden");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("leads").select("*").order("created_at", {
    ascending: false
  }).limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const updateLeadStatus_createServerFn_handler = createServerRpc({
  id: "21503154d15b2a6d3e78fc15fb27b4e450edac316c8cc25a3af7d59ecfd4a86e",
  name: "updateLeadStatus",
  filename: "src/lib/leads.functions.ts"
}, (opts) => updateLeadStatus.__executeServer(opts));
const updateLeadStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["new", "contacted", "qualified", "won", "lost"]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(updateLeadStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roleRow
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!roleRow) throw new Error("Forbidden");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    error
  } = await supabaseAdmin.from("leads").update({
    status: data.status,
    notes: data.notes ?? null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  listLeads_createServerFn_handler,
  submitLead_createServerFn_handler,
  updateLeadStatus_createServerFn_handler
};
