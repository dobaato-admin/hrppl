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
async function getCallerTenantAndRole(supabase, userId) {
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = prof?.tenant_id ?? null;
  const {
    data: roleRows
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r) => r.role);
  return {
    tenantId,
    roles
  };
}
const getOrgSettings_createServerFn_handler = createServerRpc({
  id: "f6e3cc495382a24f45693bbd680a8a88f57733ba49cb209cfa2148c066e1bdeb",
  name: "getOrgSettings",
  filename: "src/lib/org-settings.functions.ts"
}, (opts) => getOrgSettings.__executeServer(opts));
const getOrgSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getOrgSettings_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    tenantId,
    roles
  } = await getCallerTenantAndRole(supabase, userId);
  if (!tenantId) return {
    tenant: null,
    countries: [],
    payrollDefaults: null,
    canEdit: false
  };
  const canEdit = roles.includes("org_admin") || roles.includes("super_admin");
  const [{
    data: tenant
  }, {
    data: countries
  }] = await Promise.all([supabase.from("tenants").select("id,name,legal_name,primary_contact_name,slug,country_code,currency_code,status,plan,contact_email,contact_phone,address_line1,address_line2,city,region,postal_code,website,tagline,registration_number,tax_id_number").eq("id", tenantId).maybeSingle(), supabase.from("countries").select("code,name,currency_code,region_code").order("name")]);
  let payrollDefaults = null;
  if (tenant?.country_code) {
    const {
      data: d
    } = await supabase.from("country_payroll_settings").select("country_code,pay_frequency,workweek_hours,overtime_multiplier,fiscal_year_start_month,rounding_mode,rounding_decimals,notes").eq("country_code", tenant.country_code).maybeSingle();
    payrollDefaults = d;
  }
  return {
    tenant,
    countries: countries ?? [],
    payrollDefaults,
    canEdit
  };
});
const UpdateSchema = objectType({
  name: stringType().trim().min(1).max(160),
  legal_name: stringType().trim().max(160).optional().nullable(),
  primary_contact_name: stringType().trim().max(160).optional().nullable(),
  country_code: stringType().trim().length(2),
  currency_code: stringType().trim().length(3),
  contact_email: stringType().trim().email().max(160),
  contact_phone: stringType().trim().max(40).optional().nullable(),
  address_line1: stringType().trim().max(160).optional().nullable(),
  address_line2: stringType().trim().max(160).optional().nullable(),
  city: stringType().trim().max(120).optional().nullable(),
  region: stringType().trim().max(120).optional().nullable(),
  postal_code: stringType().trim().max(32).optional().nullable(),
  website: stringType().trim().max(255).optional().nullable(),
  tagline: stringType().trim().max(160).optional().nullable(),
  registration_number: stringType().trim().max(80).optional().nullable(),
  tax_id_number: stringType().trim().max(80).optional().nullable()
});
const updateOrgSettings_createServerFn_handler = createServerRpc({
  id: "90a1561e6353e3126cfb4b356a8417d23a77747b30727d834168c736bc7de765",
  name: "updateOrgSettings",
  filename: "src/lib/org-settings.functions.ts"
}, (opts) => updateOrgSettings.__executeServer(opts));
const updateOrgSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpdateSchema.parse(d)).handler(updateOrgSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    tenantId,
    roles
  } = await getCallerTenantAndRole(supabase, userId);
  if (!tenantId) throw new Error("No organization found for this user.");
  if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
    throw new Error("Only organization admins can update these settings.");
  }
  const admin = await loadAdmin();
  const {
    data: country
  } = await admin.from("countries").select("code,currency_code").eq("code", data.country_code.toUpperCase()).maybeSingle();
  if (!country) throw new Error("Unknown country code.");
  const {
    error
  } = await admin.from("tenants").update({
    name: data.name,
    legal_name: data.legal_name?.trim() || null,
    primary_contact_name: data.primary_contact_name?.trim() || null,
    country_code: country.code,
    currency_code: data.currency_code.toUpperCase(),
    contact_email: data.contact_email,
    contact_phone: data.contact_phone || null,
    address_line1: data.address_line1?.trim() || null,
    address_line2: data.address_line2?.trim() || null,
    city: data.city?.trim() || null,
    region: data.region?.trim() || null,
    postal_code: data.postal_code?.trim() || null,
    website: data.website?.trim() || null,
    tagline: data.tagline?.trim() || null,
    registration_number: data.registration_number?.trim() || null,
    tax_id_number: data.tax_id_number?.trim() || null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", tenantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  getOrgSettings_createServerFn_handler,
  updateOrgSettings_createServerFn_handler
};
