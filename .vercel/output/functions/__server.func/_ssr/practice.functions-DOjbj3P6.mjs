import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType, A as booleanType, G as literalType, B as enumType, D as arrayType } from "../_libs/zod.mjs";
const listClients = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("822f4aa8da65749a2d19d0e7a7af1e75dff4b996eb0c1199b6163306c7055346"));
const clientSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(160),
  contact_name: stringType().trim().max(160).optional().nullable(),
  contact_email: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
  contact_phone: stringType().trim().max(40).optional().nullable(),
  billing_address: stringType().trim().max(500).optional().nullable(),
  country_code: stringType().trim().length(2).optional().nullable().or(literalType("")),
  currency_code: stringType().trim().length(3).optional().nullable().or(literalType("")),
  tax_number: stringType().trim().max(60).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable(),
  status: enumType(["active", "archived"]).default("active")
});
const upsertClient = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => clientSchema.parse(d)).handler(createSsrRpc("7c9a494933082b870351313e7179d9a44f02f3d9bd53a45ba222db9563e69926"));
const listProjects = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0a7ff2ac066f445f4e21e3dc6176ac4d06420eaa9ae363abc40e5a8262286c34"));
const projectSchema = objectType({
  id: stringType().uuid().optional(),
  client_id: stringType().uuid(),
  code: stringType().trim().max(40).optional().nullable(),
  name: stringType().trim().min(1).max(160),
  description: stringType().trim().max(2e3).optional().nullable(),
  status: enumType(["active", "on_hold", "completed", "cancelled"]).default("active"),
  billing_type: enumType(["fixed", "time_and_materials", "retainer", "non_billable"]).default("time_and_materials"),
  budget_amount: numberType().optional().nullable(),
  budget_hours: numberType().optional().nullable(),
  hourly_rate: numberType().optional().nullable(),
  currency_code: stringType().trim().length(3).optional().nullable().or(literalType("")),
  start_date: stringType().optional().nullable().or(literalType("")),
  end_date: stringType().optional().nullable().or(literalType("")),
  manager_id: stringType().uuid().optional().nullable()
});
const upsertProject = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => projectSchema.parse(d)).handler(createSsrRpc("72b0fccf6f2dd0e559c99a1d0ef7220790ef399fe11663cfc7b6e8ba2cdabc97"));
const listJobs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  project_id: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("21a7040ae70d1835dd1979e661fd20f7d46d0451001cf4a05e02573412644369"));
const jobSchema = objectType({
  id: stringType().uuid().optional(),
  project_id: stringType().uuid(),
  name: stringType().trim().min(1).max(160),
  description: stringType().trim().max(2e3).optional().nullable(),
  status: enumType(["open", "in_progress", "review", "completed", "cancelled"]).default("open"),
  priority: enumType(["low", "normal", "high", "urgent"]).default("normal"),
  due_date: stringType().optional().nullable().or(literalType("")),
  assignee_id: stringType().uuid().optional().nullable(),
  estimated_hours: numberType().optional().nullable()
});
const upsertJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => jobSchema.parse(d)).handler(createSsrRpc("eea7c7bfc0382a635d079f2fee91f083e60ceba3a0e93b479bc95b9c32d61bf3"));
const listMyTimeEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b25c806ae12822410b4cc0a295a47679e8367a43e2f7b07d01bf916faf9b0c37"));
const timeEntrySchema = objectType({
  id: stringType().uuid().optional(),
  project_id: stringType().uuid(),
  job_id: stringType().uuid().optional().nullable(),
  work_date: stringType().min(8),
  hours: numberType().min(0.01).max(24),
  description: stringType().trim().max(500).optional().nullable(),
  billable: booleanType().default(true),
  hourly_rate: numberType().optional().nullable()
});
const upsertMyTimeEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => timeEntrySchema.parse(d)).handler(createSsrRpc("b57c5cf5e8154ff04d80f837ef22d22dabd9661743987c3970a0103aa7079446"));
const deleteMyTimeEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d8d41365d34236cc48697102c4ae69be53bd3c016a135ea6156cd8f43e4a4293"));
const listInvoices = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5c46d6231af1b16cd9a5d2cd5ec3100c125c0f32d5c2f300720153fb07503e7d"));
const invoiceLineSchema = objectType({
  description: stringType().trim().min(1).max(300),
  quantity: numberType().min(0),
  unit_price: numberType().min(0),
  tax_rate: numberType().min(0).max(100).default(0),
  project_id: stringType().uuid().optional().nullable()
});
const invoiceSchema = objectType({
  id: stringType().uuid().optional(),
  client_id: stringType().uuid(),
  invoice_number: stringType().trim().min(1).max(40),
  status: enumType(["draft", "sent", "paid", "overdue", "void"]).default("draft"),
  issue_date: stringType(),
  due_date: stringType().optional().nullable().or(literalType("")),
  currency_code: stringType().trim().length(3),
  notes: stringType().trim().max(2e3).optional().nullable(),
  terms: stringType().trim().max(2e3).optional().nullable(),
  lines: arrayType(invoiceLineSchema).min(1).max(100)
});
const upsertInvoice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => invoiceSchema.parse(d)).handler(createSsrRpc("efe6ea08a2364c51e6f3dbd4c7c66ff0bb56ece308697b1ef9ab66d7618e7504"));
const getInvoice = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5ace03deafe9fb94ced3ac8bf485a411f455311764fdbe8f097267cc7c9cd273"));
const markInvoicePaid = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("4a8350adb476ce3da86a6791bbd6a4e802b8c802a539273801ac6630472aac1a"));
export {
  listProjects as a,
  listJobs as b,
  listClients as c,
  deleteMyTimeEntry as d,
  upsertProject as e,
  upsertJob as f,
  listInvoices as g,
  getInvoice as h,
  upsertInvoice as i,
  upsertClient as j,
  listMyTimeEntries as l,
  markInvoicePaid as m,
  upsertMyTimeEntry as u
};
