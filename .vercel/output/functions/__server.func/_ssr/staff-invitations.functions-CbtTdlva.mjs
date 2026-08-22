import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, G as literalType, D as arrayType, B as enumType, C as numberType } from "../_libs/zod.mjs";
const listTenantInvitations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4f6fbd45edcb117fec1c70cf749babd1003e48ca426a536091b64d291aee815d"));
const dutyItemSchema = objectType({
  title: stringType().trim().min(1).max(200),
  description: stringType().trim().max(2e3).optional().or(literalType("")),
  weight: numberType().min(0).max(100),
  kpi_target: stringType().trim().max(500).optional().or(literalType(""))
});
const inviteSchema = objectType({
  email: stringType().trim().email().max(255),
  first_name: stringType().trim().max(80).optional().or(literalType("")),
  last_name: stringType().trim().max(80).optional().or(literalType("")),
  job_title: stringType().trim().max(120).optional().or(literalType("")),
  department_id: stringType().uuid().optional().nullable(),
  country_code: stringType().trim().length(2).optional().or(literalType("")),
  role: enumType(["employee", "manager", "org_admin", "branch_admin", "hr", "finance"]).default("employee"),
  state_region: stringType().trim().max(10).optional().or(literalType("")),
  duties: arrayType(dutyItemSchema).max(50).optional().default([])
});
const inviteStaff = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => inviteSchema.parse(data)).handler(createSsrRpc("a9239ef5daac8dddedc280577c76a3753b09a1218e6ee80aff16ee8a2a3238ee"));
const resendInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  id: stringType().uuid()
}).parse(data)).handler(createSsrRpc("87e36ca08358a7227cfc910a4c1f8332c2ccb450676a61ae8bdd17a563c985b3"));
const revokeInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  id: stringType().uuid()
}).parse(data)).handler(createSsrRpc("fe8d3bad88fc7c31ce6824aa94300542579a52d2a40a82d8dd1ee8d42b22d271"));
const getInvitationByToken = createServerFn({
  method: "GET"
}).inputValidator((data) => objectType({
  token: stringType().min(20).max(128).regex(/^[a-f0-9]+$/i)
}).parse(data)).handler(createSsrRpc("19f515a6b7800389dfe5431779c7ff86d680a4606c99a413225a7fa6fab130a1"));
const acceptSchema = objectType({
  token: stringType().min(20).max(128).regex(/^[a-f0-9]+$/i),
  details: objectType({
    contact_number: stringType().trim().max(40).optional().or(literalType("")),
    bank_name: stringType().trim().max(120).optional().or(literalType("")),
    bank_bsb: stringType().trim().max(20).optional().or(literalType("")),
    bank_account_number: stringType().trim().max(40).optional().or(literalType("")),
    bank_account_name: stringType().trim().max(120).optional().or(literalType("")),
    tfn: stringType().trim().max(20).optional().or(literalType("")),
    super_fund_name: stringType().trim().max(120).optional().or(literalType("")),
    super_member_number: stringType().trim().max(60).optional().or(literalType("")),
    next_of_kin_name: stringType().trim().max(120).optional().or(literalType("")),
    next_of_kin_relationship: stringType().trim().max(60).optional().or(literalType("")),
    next_of_kin_phone: stringType().trim().max(40).optional().or(literalType(""))
  }).optional()
});
const acceptInvitation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => acceptSchema.parse(data)).handler(createSsrRpc("a56337699d832b351c042f89f479c3a70280d7f81ecc52d7371d971e6a61cc02"));
export {
  acceptInvitation as a,
  revokeInvitation as b,
  getInvitationByToken as g,
  inviteStaff as i,
  listTenantInvitations as l,
  resendInvitation as r
};
