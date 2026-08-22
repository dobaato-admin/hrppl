import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
const getOrgSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f6e3cc495382a24f45693bbd680a8a88f57733ba49cb209cfa2148c066e1bdeb"));
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
const updateOrgSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpdateSchema.parse(d)).handler(createSsrRpc("90a1561e6353e3126cfb4b356a8417d23a77747b30727d834168c736bc7de765"));
export {
  getOrgSettings as g,
  updateOrgSettings as u
};
