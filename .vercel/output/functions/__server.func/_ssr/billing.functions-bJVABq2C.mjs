import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, A as booleanType, D as arrayType, B as enumType, C as numberType, z as stringType } from "../_libs/zod.mjs";
const DEBIT_REGIONS = ["ach", "becs", "sepa", "bacs"];
const listPlans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4823694e81cc628243ce310a62814ff9f72b20b4e8fa308dbbe9cf84860215c5"));
const getMyBilling = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6bad32af0e31b7572f177d7091dc654cec925dff506e01bc18378bfda76ca5c8"));
const changePlanSchema = objectType({
  plan_code: stringType().min(1).max(40),
  billing_interval: enumType(["monthly", "annual"])
});
const changeMyPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => changePlanSchema.parse(d)).handler(createSsrRpc("5a84c843e1e0327816d1cd280d2324c703184fe899c526aa06e6294208d7e392"));
const cancelMyPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0fecd8c9bcd50441bd48f1a05583b3ab9a4c5effa14c058075aa600bb39414a0"));
const resumeMyPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("220592c9aac99e25d1110a8f24aa98663b19bd1e29a4a7976f4e013429848ab2"));
const startTenantSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  planCode: enumType(["starter_v2", "pro_v2"]),
  addAuPayrollAddon: booleanType().optional().default(false),
  debitRegions: arrayType(enumType(DEBIT_REGIONS)).optional().default([...DEBIT_REGIONS]),
  allowCardFallback: booleanType().optional().default(true)
}).parse(input)).handler(createSsrRpc("0927b2916a315fddf86b55e3fd93ce3f84d757e2936cb3de510f7fe719af3446"));
const createBillingSetupLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("acec9810c09fe9304bcd76ddcb4ea35d766b86016561451ef285d48d7f7ee1ab"));
const reportMonthlyUsageForTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  tenantId: stringType().uuid(),
  year: numberType().int().min(2024).max(2100),
  month: numberType().int().min(1).max(12),
  dryRun: booleanType().optional().default(false)
}).parse(input)).handler(createSsrRpc("e24c5fc507076f6fa09115878246ddf7f869912451c6f62ba1139e8077f3169d"));
const previewTenantHeadcount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  year: numberType().int().optional(),
  month: numberType().int().min(1).max(12).optional()
}).parse(input)).handler(createSsrRpc("d93e92de1459204136fbc82c7513cd6b8173025afea2fe04d3d02d4ba55e0d73"));
const listTenantBillingSnapshots = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("13aa229a7d5ca150d6b72f2da8147624eb2e3430f362730f013eaddc7f0cfa8e"));
export {
  cancelMyPlan as a,
  listTenantBillingSnapshots as b,
  changeMyPlan as c,
  createBillingSetupLink as d,
  reportMonthlyUsageForTenant as e,
  getMyBilling as g,
  listPlans as l,
  previewTenantHeadcount as p,
  resumeMyPlan as r,
  startTenantSubscription as s
};
