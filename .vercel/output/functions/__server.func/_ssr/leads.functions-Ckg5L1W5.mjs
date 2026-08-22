import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, C as numberType } from "../_libs/zod.mjs";
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
const submitLead = createServerFn({
  method: "POST"
}).inputValidator((data) => leadSchema.parse(data)).handler(createSsrRpc("e211e8c27eee0a1053129b7769a37cb2e31b3dc869a84a1c647eee19cfb57993"));
const listLeads = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("77acd1c20769f0aaa93fdea78adabaa9f8b27285e13363740e4c85703e8554bc"));
const updateLeadStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["new", "contacted", "qualified", "won", "lost"]),
  notes: stringType().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("21503154d15b2a6d3e78fc15fb27b4e450edac316c8cc25a3af7d59ecfd4a86e"));
export {
  listLeads as l,
  submitLead as s,
  updateLeadStatus as u
};
