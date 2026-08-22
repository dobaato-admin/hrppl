import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType, G as literalType, B as enumType } from "../_libs/zod.mjs";
const listAllTenants = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("38a059c7c56f258ecf0fd577322fab7ea1dab989c245970924220bbdf9b9cf35"));
const govSchema = objectType({
  tenant_id: stringType().uuid(),
  health_status: enumType(["healthy", "warning", "at_risk", "suspended"]),
  internal_notes: stringType().trim().max(2e3).optional().nullable(),
  risk_score: numberType().int().min(0).max(100).default(0)
});
const upsertTenantGovernance = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => govSchema.parse(d)).handler(createSsrRpc("755946e7bb339b2600bfd3aef35c331bfd91856ad9d5990989de03990fde30bb"));
const getMyWhiteLabel = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7ccf3bd7107ee265ddf1c8ec032e58be400ca0026d0036d09b92fb4b57a4f9b1"));
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
const upsertMyWhiteLabel = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wlSchema.parse(d)).handler(createSsrRpc("e0636e952288b6d5b75b2dd10da807b0a09a7dead31f3f47bc78c6ff8fc62fe6"));
const listFxRates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9781fb47a04c324365096d3f513c71bbaff9523ec99923a005dc4708ba01df4d"));
const fxSchema = objectType({
  base_currency: stringType().trim().length(3),
  quote_currency: stringType().trim().length(3),
  rate: numberType().positive(),
  rate_date: stringType()
});
const upsertFxRate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => fxSchema.parse(d)).handler(createSsrRpc("3cd89f9467e2a897ead219d6e39a927b95a828619daba021e10faa299424853f"));
export {
  listFxRates as a,
  upsertFxRate as b,
  upsertMyWhiteLabel as c,
  getMyWhiteLabel as g,
  listAllTenants as l,
  upsertTenantGovernance as u
};
