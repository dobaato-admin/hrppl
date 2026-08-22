import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, C as numberType, A as booleanType } from "../_libs/zod.mjs";
const listAssets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fefed6b92333be889e22e8b290fa9f8136a4be4fbe87b46ba1f00c3f352c0f5d"));
const createAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assetTag: stringType().min(1).max(80),
  name: stringType().min(1).max(255),
  category: enumType(["laptop", "phone", "tablet", "monitor", "peripheral", "vehicle", "access_card", "sim", "uniform", "tool", "other"]).default("other"),
  brand: stringType().max(120).optional(),
  model: stringType().max(120).optional(),
  serialNumber: stringType().max(160).optional(),
  description: stringType().max(2e3).optional(),
  purchaseDate: stringType().optional(),
  purchaseCost: numberType().nonnegative().optional(),
  currencyCode: stringType().max(8).optional(),
  warrantyExpiresOn: stringType().optional()
}).parse(d)).handler(createSsrRpc("c83c0a7349ea0eec53b2b2c3bc3ea7508eec1fbef34d916fded49a5d2cfbea2d"));
const assignAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assetId: stringType().uuid(),
  employeeId: stringType().uuid(),
  expectedReturnOn: stringType().optional(),
  conditionOnIssue: stringType().max(500).optional(),
  conditionNotes: stringType().max(1e3).optional(),
  quantityIssued: numberType().int().min(1).max(999).default(1),
  notes: stringType().max(1e3).optional(),
  context: enumType(["onboarding", "employment", "offboarding"]).default("employment")
}).parse(d)).handler(createSsrRpc("604481d33c6821c5b7ed44bda1d8a6f8c485ac6b05707be0bdfb55db30115601"));
const approveAssignment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("deb372557a58ed4278941e570e5f4d2ef8181005f099f897f6519788ab47b865"));
const reportReturn = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  quantityReturned: numberType().int().min(0).max(999),
  conditionNotes: stringType().max(2e3).optional(),
  returnNotes: stringType().max(2e3).optional(),
  returnCondition: enumType(["good", "damaged", "lost"]).default("good")
}).parse(d)).handler(createSsrRpc("79cca338ffd2d45722244ffac637b587a786752886be265170492fc6b72c478c"));
const confirmReturn = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  returnCondition: enumType(["good", "damaged", "lost"]).optional(),
  confirmationNotes: stringType().max(2e3).optional(),
  disputed: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("ba7170bf365ec02491b8248f9edc17b4608295a7498e12944aa8080ad6ae1121"));
const returnAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  returnCondition: enumType(["good", "damaged", "lost"]).default("good"),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("b62569105d13ede8e99895342a9a309996693f0f91cd6a8b3d1758875132cfc4"));
const acknowledgeAsset = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignmentId: stringType().uuid(),
  notes: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("9921da9ec24ca1cf3d06b94af7110a1e3a39d802abde3aea0af0c84657f8d99c"));
const listAssignments = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional(),
  openOnly: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("8ad03a6750f03a6ac8fe43417ab08cd47f4c36681a1fc0bee4b60de212ded1a3"));
const myAssignments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fc21ae80fbf058748623fb201f6f574077ec152bdc8883b9007bf9df959f4641"));
export {
  acknowledgeAsset as a,
  assignAsset as b,
  createAsset as c,
  returnAsset as d,
  listAssignments as e,
  confirmReturn as f,
  approveAssignment as g,
  listAssets as l,
  myAssignments as m,
  reportReturn as r
};
