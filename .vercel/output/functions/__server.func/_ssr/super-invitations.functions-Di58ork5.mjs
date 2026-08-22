import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType } from "../_libs/zod.mjs";
const listOrgTrialInvitations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("549b7b67aa914c962358e207fe3ee563e965bb7d761b0acdcd0b0ce6008e3f0d"));
const createSchema = objectType({
  email: stringType().email().max(255),
  org_name: stringType().min(1).max(255),
  contact_name: stringType().max(255).optional().nullable(),
  country_code: stringType().max(8).optional().nullable(),
  trial_days: numberType().int().min(1).max(365).default(30),
  notes: stringType().max(2e3).optional().nullable()
});
const createOrgTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => createSchema.parse(input)).handler(createSsrRpc("257aca8147aa7dd6506517666f795170bf9989b99efb44afa2819e61d311f9cb"));
const idSchema = objectType({
  id: stringType().uuid()
});
const revokeOrgTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => idSchema.parse(input)).handler(createSsrRpc("13c2ac19bfc110cacfd6f62d2c73a3b7ad6c340e02dac9c0c13b8a46066ea3ca"));
const resendSchema = objectType({
  id: stringType().uuid(),
  extend_days: numberType().int().min(0).max(365).optional()
});
const resendOrgTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => resendSchema.parse(input)).handler(createSsrRpc("d04c081c85ad790202ab4d59ca4c2013da3e440947acf3112ddab0d9836a7cae"));
const getMyTrialInvitation = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4be2cf77070da0fe2d90137016aa7f349161c398852eb117d1d5c033b4d7e0ae"));
const redeemMyTrialInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenant_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("fa86559289c74a7160b2a69e965649a1d27bec26f3279805304d282039a976fe"));
export {
  resendOrgTrialInvitation as a,
  redeemMyTrialInvitation as b,
  createOrgTrialInvitation as c,
  getMyTrialInvitation as g,
  listOrgTrialInvitations as l,
  revokeOrgTrialInvitation as r
};
