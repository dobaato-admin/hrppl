import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, C as numberType, z as stringType, B as enumType, G as literalType } from "../_libs/zod.mjs";
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
function assertSuper(context) {
  return context.userId;
}
const listAllTenants_createServerFn_handler = createServerRpc({
  id: "38a059c7c56f258ecf0fd577322fab7ea1dab989c245970924220bbdf9b9cf35",
  name: "listAllTenants",
  filename: "src/lib/super-admin.functions.ts"
}, (opts) => listAllTenants.__executeServer(opts));
const listAllTenants = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAllTenants_createServerFn_handler, async ({
  context
}) => {
  const userId = assertSuper(context);
  const admin = await loadAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "super_admin")) {
    throw new Error("Forbidden");
  }
  const {
    data: tenants
  } = await admin.from("tenants").select("id, name, slug, country_code, currency_code, plan, status, created_at").order("created_at", {
    ascending: false
  });
  const {
    data: governance
  } = await admin.from("tenant_governance").select("*");
  return {
    tenants: tenants ?? [],
    governance: governance ?? []
  };
});
const govSchema = objectType({
  tenant_id: stringType().uuid(),
  health_status: enumType(["healthy", "warning", "at_risk", "suspended"]),
  internal_notes: stringType().trim().max(2e3).optional().nullable(),
  risk_score: numberType().int().min(0).max(100).default(0)
});
const upsertTenantGovernance_createServerFn_handler = createServerRpc({
  id: "755946e7bb339b2600bfd3aef35c331bfd91856ad9d5990989de03990fde30bb",
  name: "upsertTenantGovernance",
  filename: "src/lib/super-admin.functions.ts"
}, (opts) => upsertTenantGovernance.__executeServer(opts));
const upsertTenantGovernance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => govSchema.parse(d)).handler(upsertTenantGovernance_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = assertSuper(context);
  const admin = await loadAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "super_admin")) throw new Error("Forbidden");
  const payload = {
    ...data,
    last_reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_reviewed_by: userId
  };
  const {
    error
  } = await admin.from("tenant_governance").upsert(payload, {
    onConflict: "tenant_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyWhiteLabel_createServerFn_handler = createServerRpc({
  id: "7ccf3bd7107ee265ddf1c8ec032e58be400ca0026d0036d09b92fb4b57a4f9b1",
  name: "getMyWhiteLabel",
  filename: "src/lib/super-admin.functions.ts"
}, (opts) => getMyWhiteLabel.__executeServer(opts));
const getMyWhiteLabel = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMyWhiteLabel_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "super_admin")) {
    throw new Error("Forbidden");
  }
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) return {
    settings: null
  };
  const {
    data
  } = await supabase.from("white_label_settings").select("*").eq("tenant_id", prof.tenant_id).maybeSingle();
  return {
    settings: data
  };
});
const wlSchema = objectType({
  brand_name: stringType().trim().max(120).optional().nullable(),
  logo_url: stringType().trim().max(500).optional().nullable().or(literalType("")),
  primary_color: stringType().trim().max(20).optional().nullable(),
  accent_color: stringType().trim().max(20).optional().nullable(),
  email_from_name: stringType().trim().max(120).optional().nullable(),
  email_from_address: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
  support_email: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
  footer_html: stringType().trim().max(4e3).optional().nullable(),
  custom_domain: stringType().trim().max(255).optional().nullable()
});
const upsertMyWhiteLabel_createServerFn_handler = createServerRpc({
  id: "e0636e952288b6d5b75b2dd10da807b0a09a7dead31f3f47bc78c6ff8fc62fe6",
  name: "upsertMyWhiteLabel",
  filename: "src/lib/super-admin.functions.ts"
}, (opts) => upsertMyWhiteLabel.__executeServer(opts));
const upsertMyWhiteLabel = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wlSchema.parse(d)).handler(upsertMyWhiteLabel_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roles
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "super_admin")) throw new Error("Forbidden");
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organization");
  const admin = await loadAdmin();
  const payload = {
    ...data,
    tenant_id: prof.tenant_id
  };
  for (const k of ["logo_url", "email_from_address", "support_email"]) if (payload[k] === "") payload[k] = null;
  const {
    error
  } = await admin.from("white_label_settings").upsert(payload, {
    onConflict: "tenant_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listFxRates_createServerFn_handler = createServerRpc({
  id: "9781fb47a04c324365096d3f513c71bbaff9523ec99923a005dc4708ba01df4d",
  name: "listFxRates",
  filename: "src/lib/super-admin.functions.ts"
}, (opts) => listFxRates.__executeServer(opts));
const listFxRates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listFxRates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("fx_rates").select("*").order("rate_date", {
    ascending: false
  }).order("base_currency").limit(500);
  if (error) throw new Error(error.message);
  return {
    rates: data ?? []
  };
});
const fxSchema = objectType({
  base_currency: stringType().trim().length(3),
  quote_currency: stringType().trim().length(3),
  rate: numberType().positive(),
  rate_date: stringType()
});
const upsertFxRate_createServerFn_handler = createServerRpc({
  id: "3cd89f9467e2a897ead219d6e39a927b95a828619daba021e10faa299424853f",
  name: "upsertFxRate",
  filename: "src/lib/super-admin.functions.ts"
}, (opts) => upsertFxRate.__executeServer(opts));
const upsertFxRate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => fxSchema.parse(d)).handler(upsertFxRate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    userId
  } = context;
  const admin = await loadAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "super_admin")) throw new Error("Forbidden");
  const payload = {
    base_currency: data.base_currency.toUpperCase(),
    quote_currency: data.quote_currency.toUpperCase(),
    rate: data.rate,
    rate_date: data.rate_date,
    source: "manual",
    created_by: userId
  };
  const {
    error
  } = await admin.from("fx_rates").upsert(payload, {
    onConflict: "base_currency,quote_currency,rate_date"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  getMyWhiteLabel_createServerFn_handler,
  listAllTenants_createServerFn_handler,
  listFxRates_createServerFn_handler,
  upsertFxRate_createServerFn_handler,
  upsertMyWhiteLabel_createServerFn_handler,
  upsertTenantGovernance_createServerFn_handler
};
