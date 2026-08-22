import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType, B as enumType, G as literalType } from "../_libs/zod.mjs";
const getMeOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c963549d5a7a6d6e82fbaa75d59a1551df31f9c01de99a84ff4b5c7520168a79"));
const contactSchema = objectType({
  personal_email: stringType().trim().email().max(255).or(literalType("")).nullable().optional(),
  personal_phone: stringType().trim().max(40).nullable().optional(),
  address_line1: stringType().trim().max(200).nullable().optional(),
  address_line2: stringType().trim().max(200).nullable().optional(),
  city: stringType().trim().max(120).nullable().optional(),
  region: stringType().trim().max(120).nullable().optional(),
  postal_code: stringType().trim().max(40).nullable().optional(),
  country_of_residence: stringType().trim().length(2).nullable().optional().or(literalType("")),
  emergency_contact_name: stringType().trim().max(120).nullable().optional(),
  emergency_contact_phone: stringType().trim().max(40).nullable().optional(),
  emergency_contact_relation: stringType().trim().max(60).nullable().optional(),
  marital_status: stringType().trim().max(40).nullable().optional(),
  phone: stringType().trim().max(40).nullable().optional()
  // work phone on employees row
});
const updateMyContactDetails = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => contactSchema.parse(d)).handler(createSsrRpc("a4afb90e71eabaf5a0a75e388e9bbf040a1666191e0b46ac30c834e53a6c955c"));
const bankTaxSchema = objectType({
  bank_name: stringType().trim().max(120).nullable().optional(),
  bank_account_holder: stringType().trim().max(160).nullable().optional(),
  bank_account_number: stringType().trim().max(60).nullable().optional(),
  bank_branch_code: stringType().trim().max(40).nullable().optional(),
  bank_iban: stringType().trim().max(60).nullable().optional(),
  bank_swift: stringType().trim().max(20).nullable().optional(),
  tax_identification_number: stringType().trim().max(60).nullable().optional(),
  social_security_number: stringType().trim().max(60).nullable().optional(),
  provident_fund_number: stringType().trim().max(60).nullable().optional(),
  pension_fund_number: stringType().trim().max(60).nullable().optional(),
  national_id_number: stringType().trim().max(60).nullable().optional()
});
const updateMyBankingTax = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => bankTaxSchema.parse(d)).handler(createSsrRpc("0b6c705f84eb0cc52219ea54940b7cba31fccc2a9e1512ffb7774ab2c657ad57"));
const DOC_TYPES = ["contract", "id", "passport", "visa", "certificate", "tax_form", "citizenship_certificate", "drivers_license", "other"];
const listMyDocuments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f8d4e0adcd0ceb0b5cebe3ba0f26156cde04c74de56fe9046b61d7785bd62bc6"));
const registerMyDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  doc_type: enumType(DOC_TYPES),
  file_path: stringType().min(3).max(500),
  file_name: stringType().min(1).max(255),
  mime_type: stringType().max(100).optional(),
  size_bytes: numberType().int().nonnegative().max(50 * 1024 * 1024).optional(),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("6a82e13a2e4a96f96d658fc4ba1372b4187a72f293da2bb443c1c1201d32cda9"));
const createMyDocumentDownloadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ea5e35d9f5bd88316fa9531ebbf4708a649aa831a61ea4c7fddad82c950fde35"));
const deleteMyDocument = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("73206aa8188ad1463ae0a0e7ff2704c751b0fa5a5903d2d0a20af855db0c5c1b"));
const getCompanyDirectory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  search: stringType().trim().max(120).optional(),
  departmentId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(200).default(100)
}).parse(d)).handler(createSsrRpc("12c7bd0fb0d5d2db104457f338805fb6f1b878bebedddab8dd7034b65c1a4db3"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ec6dbdedf18afd1b51e40003b9f058802097c720ca58d5d4e70cb6974a675ece"));
export {
  getMeOverview as a,
  updateMyBankingTax as b,
  createMyDocumentDownloadUrl as c,
  deleteMyDocument as d,
  getCompanyDirectory as g,
  listMyDocuments as l,
  registerMyDocument as r,
  updateMyContactDetails as u
};
