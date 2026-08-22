import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, A as booleanType, C as numberType, D as arrayType } from "../_libs/zod.mjs";
const listExpenseCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("df248d70e7ba472a204ac737aac4b82ab72dd79f3bd65cf11d8486174c3c3c56"));
const CategorySchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(120),
  code: stringType().max(40).optional().nullable(),
  description: stringType().max(500).optional().nullable(),
  requires_receipt: booleanType().default(true),
  max_amount: numberType().nonnegative().optional().nullable(),
  daily_limit: numberType().nonnegative().optional().nullable(),
  monthly_limit: numberType().nonnegative().optional().nullable(),
  tax_rate: numberType().min(0).max(1).optional().nullable(),
  tax_code: stringType().max(40).optional().nullable(),
  is_active: booleanType().default(true)
});
const upsertExpenseCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => CategorySchema.parse(d)).handler(createSsrRpc("f4de4516b2c1547cbb0dc602c6aaf3aec76d5b9414886c376e7e4e57214afe06"));
const deleteExpenseCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("16010eda1bf207b64d842c5c9a391470b3f5f10676314c4e7b0b376083924165"));
const ApprovalRuleSchema = objectType({
  id: stringType().uuid().optional(),
  department_id: stringType().uuid().nullable().optional(),
  min_amount: numberType().nonnegative().default(0),
  max_amount: numberType().positive().nullable().optional(),
  approver_id: stringType().uuid(),
  priority: numberType().int().min(0).max(1e3).default(100),
  is_active: booleanType().default(true),
  notes: stringType().max(500).optional().nullable()
});
const listApprovalRules = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("69776eba036ece29abe3c9a7737d90b05f2544744c64833c087d157f1518de64"));
const upsertApprovalRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ApprovalRuleSchema.parse(d)).handler(createSsrRpc("1924a592c52c343422451709e61ac8ea767e5aad86d972d183f47eac467fb545"));
const deleteApprovalRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("90e5b8211985a8957045e1b46fa6c8376112ed077e88bad97c5bf618b69abb58"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  amount: numberType().nonnegative()
}).parse(d)).handler(createSsrRpc("4d743ffecd340f7024df319a87c52897639c9ef5b5f89cfd7330003f418a3e65"));
const listExpenseClaims = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  scope: enumType(["mine", "team", "all"]).default("mine"),
  status: stringType().optional()
}).parse(d)).handler(createSsrRpc("ddfcbcbe194e1dfa9949b021727ae6d89ddd50ae1ecb9f18f2a4553b36c2497c"));
const getExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("54a90270c9a8fd84751fd2b4bebcb481ce82c4c4621bd6effc247b2474b94f0e"));
const LineSchema = objectType({
  id: stringType().uuid().optional(),
  category_id: stringType().uuid().nullable().optional(),
  expense_date: stringType(),
  amount: numberType().positive(),
  currency: stringType().default("AUD"),
  merchant: stringType().max(200).optional().nullable(),
  description: stringType().max(500).optional().nullable(),
  receipt_path: stringType().optional().nullable(),
  mileage_km: numberType().nonnegative().optional().nullable(),
  tax_amount: numberType().nonnegative().optional().nullable()
});
const ClaimSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  currency: stringType().default("AUD"),
  lines: arrayType(LineSchema).min(1).max(100),
  submit: booleanType().default(false)
});
const saveExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ClaimSchema.parse(d)).handler(createSsrRpc("540b5df087f4237dc47c0be6959abc1e8f1b0a2104c0790909bd8f7523b9cf25"));
const DecisionSchema = objectType({
  id: stringType().uuid(),
  action: enumType(["recommend", "withdraw_recommendation", "approve", "reject", "pay"]),
  comment: stringType().max(1e3).optional(),
  payment_reference: stringType().max(200).optional()
});
const decideExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => DecisionSchema.parse(d)).handler(createSsrRpc("16adaf98fff2071248d3c45daba2b6e12d9d6b24584dc2cc94dce2d2a1398be3"));
const deleteExpenseClaim = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c93b449e2879fee347404c21adff5aad2323e3b3695820f175b387b86b882324"));
const getReceiptSignedUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  path: stringType().min(1)
}).parse(d)).handler(createSsrRpc("1485f882bb6917f22e1e0d6ffe335b359de2a870f7b308fef6ac2fbd1eaa8337"));
const getReimbursementSummary = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional(),
  from: stringType().optional(),
  to: stringType().optional()
}).parse(d ?? {})).handler(createSsrRpc("ee609298f5c3d2e25d65cd6f74b822627fdf4d27737fe07fe0b6a9e2d4ce325a"));
export {
  listExpenseCategories as a,
  getReceiptSignedUrl as b,
  deleteExpenseClaim as c,
  decideExpenseClaim as d,
  getReimbursementSummary as e,
  deleteExpenseCategory as f,
  getExpenseClaim as g,
  listApprovalRules as h,
  upsertApprovalRule as i,
  deleteApprovalRule as j,
  listExpenseClaims as l,
  saveExpenseClaim as s,
  upsertExpenseCategory as u
};
