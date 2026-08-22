import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
const getToilSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("efb0cd057ad4bb9847b226e4a310e6193b6bc58eacbe542794b93e785df79cdf"));
const SettingsSchema = objectType({
  enabled: booleanType().default(true),
  overtime_multiplier: numberType().min(0).default(1),
  shift_swap_multiplier: numberType().min(0).default(1),
  penalty_multiplier: numberType().min(0).default(1.5),
  max_balance_hours: numberType().min(0).nullable().optional(),
  expiry_months: numberType().int().min(0).default(12),
  allow_overtime_to_toil: booleanType().default(true),
  allow_toil_to_overtime: booleanType().default(false),
  min_request_hours: numberType().min(0).default(1),
  require_approval: booleanType().default(true)
});
const updateToilSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SettingsSchema.parse(d)).handler(createSsrRpc("9778b76ca2160bcf041d0b6a1c661dfe0b791f335171ee829534d0d539e7dd90"));
const getMyToilBalance = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("93e4f54591ff5c472854f827e078523f1b496f638a6b68c6cfd802e0a70daa4f"));
const RequestSchema = objectType({
  start_date: stringType(),
  end_date: stringType(),
  hours: numberType().positive(),
  reason: stringType().max(500).optional().nullable()
});
const submitToilRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RequestSchema.parse(d)).handler(createSsrRpc("5cf00bd0a0060e5a88be9d1768e50e136c7d013aa0406d52caa3207497669fbc"));
const cancelToilRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("eaaef50a43920100fbc59206c5651924cb9724abecb07098fee6ca23cc8ce687"));
const listPendingToilApprovals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d288e3fc866f1811066947ba7cd44902b75d47d8eba535b948ff6a4d6a762d62"));
const DecisionSchema = objectType({
  id: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(500).optional().nullable()
});
const decideToilRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DecisionSchema.parse(d)).handler(createSsrRpc("b7543b5778c4ebd6516882bb98777a9729d3b755df6e4eed4c5ebfbe9a6767f5"));
const AccrualSchema = objectType({
  employee_id: stringType().uuid(),
  source: enumType(["overtime", "shift_swap", "penalty", "manual", "adjustment"]),
  hours: numberType(),
  accrued_on: stringType().optional(),
  expires_on: stringType().nullable().optional(),
  notes: stringType().max(500).optional().nullable()
});
const addToilAccrual = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => AccrualSchema.parse(d)).handler(createSsrRpc("bdb7bf50713b3cfbda9eb659028788a7926bd6d30934fc65b494f33400697517"));
const getToilReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4cb97f9251606316942a48a418cae55d6972633e8458d8eaf5bebb76b30a61e6"));
export {
  getToilReport as a,
  addToilAccrual as b,
  cancelToilRequest as c,
  decideToilRequest as d,
  getToilSettings as e,
  getMyToilBalance as g,
  listPendingToilApprovals as l,
  submitToilRequest as s,
  updateToilSettings as u
};
