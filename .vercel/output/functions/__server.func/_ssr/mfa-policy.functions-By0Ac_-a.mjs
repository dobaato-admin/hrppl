import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, A as booleanType, C as numberType, D as arrayType, B as enumType } from "../_libs/zod.mjs";
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
const ROLE_VALUES = ["super_admin", "regional_admin", "org_admin", "branch_admin", "hr", "finance", "manager", "employee"];
const getMfaPolicy_createServerFn_handler = createServerRpc({
  id: "6db7c529484f3cd5527717590dfb3f4e56ce179ee648e729755f2206ffe14cd8",
  name: "getMfaPolicy",
  filename: "src/lib/mfa-policy.functions.ts"
}, (opts) => getMfaPolicy.__executeServer(opts));
const getMfaPolicy = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMfaPolicy_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp?.tenant_id) return {
    policy: null
  };
  const {
    data,
    error
  } = await supabase.from("tenant_mfa_policy").select("*").eq("tenant_id", emp.tenant_id).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    policy: data,
    tenant_id: emp.tenant_id
  };
});
const updateMfaPolicy_createServerFn_handler = createServerRpc({
  id: "00d094b0a3325038d256ab2caa727be6a0abb42d425693a754f949df1b7e890e",
  name: "updateMfaPolicy",
  filename: "src/lib/mfa-policy.functions.ts"
}, (opts) => updateMfaPolicy.__executeServer(opts));
const updateMfaPolicy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  required_roles: arrayType(enumType(ROLE_VALUES)).default([]),
  grace_period_days: numberType().int().min(0).max(90).default(7),
  is_enforced: booleanType().default(false)
}).parse(d)).handler(updateMfaPolicy_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp?.tenant_id) throw new Error("Tenant not found");
  const payload = {
    tenant_id: emp.tenant_id,
    required_roles: data.required_roles,
    grace_period_days: data.grace_period_days,
    is_enforced: data.is_enforced,
    updated_by: userId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    error
  } = await supabase.from("tenant_mfa_policy").upsert(payload, {
    onConflict: "tenant_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyMfaStatus_createServerFn_handler = createServerRpc({
  id: "be0039ba06064dee76b74eb28049bc3495089845cc02db64ee956c240ff36699",
  name: "getMyMfaStatus",
  filename: "src/lib/mfa-policy.functions.ts"
}, (opts) => getMyMfaStatus.__executeServer(opts));
const getMyMfaStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyMfaStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const userRoles = (roles ?? []).map((r) => r.role);
  const {
    data: emp
  } = await supabase.from("employees").select("tenant_id, created_at").eq("user_id", userId).maybeSingle();
  let policy = null;
  if (emp?.tenant_id) {
    const {
      data: p
    } = await supabase.from("tenant_mfa_policy").select("*").eq("tenant_id", emp.tenant_id).maybeSingle();
    policy = p;
  }
  const {
    data: factorData
  } = await supabase.auth.mfa.listFactors();
  const verifiedFactors = (factorData?.all ?? []).filter((f) => f.status === "verified") ?? [];
  const enrolled = verifiedFactors.length > 0;
  const requiredRoles = policy?.required_roles ?? [];
  const required = !!policy?.is_enforced && userRoles.some((r) => requiredRoles.includes(r));
  const graceDays = policy?.grace_period_days ?? 0;
  const accountCreated = emp?.created_at ? new Date(emp.created_at) : /* @__PURE__ */ new Date();
  const elapsed = Math.floor((Date.now() - accountCreated.getTime()) / 864e5);
  const graceRemaining = Math.max(0, graceDays - elapsed);
  return {
    required,
    enrolled,
    grace_remaining_days: graceRemaining,
    blocking: required && !enrolled && graceRemaining <= 0
  };
});
export {
  getMfaPolicy_createServerFn_handler,
  getMyMfaStatus_createServerFn_handler,
  updateMfaPolicy_createServerFn_handler
};
