import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, B as enumType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
const listCycles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("361b18249109298692958d5705e73c32f7c0000e1cbcf949f43a7fdd14a482a4"));
const listOpenCyclesForMe = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4e5b4c57436dc33cd06914494e442cbddab33d398e915acc1aaea5b79b4990be"));
const UpsertCycle = objectType({
  id: stringType().uuid().optional(),
  label: stringType().trim().min(1).max(60),
  starts_on: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_on: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminder_days_before: numberType().int().min(0).max(60).optional()
});
const upsertCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertCycle.parse(d)).handler(createSsrRpc("ee9e994f44ae3fcd2eea64a5b5209808bbbd804e6adf90e2401c50636da507ef"));
const setCycleStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["draft", "open", "closed"])
}).parse(d)).handler(createSsrRpc("972bc4ca31856bab91740ca5ece74800427f7a6f00697fac06a1f28ad53463fa"));
const deleteCycle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("9e8b7f78a3747aa36dc86125d673c90f069c99cedc54e0b641818bb209e9da1c"));
const getCycleSubmissionStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  cycleLabel: stringType().trim().min(1).max(60)
}).parse(d)).handler(createSsrRpc("34f508a4852fc8ebb38c6537eba77f6092b1bc1a01d549cf5b9b66d40cd70b95"));
const getKpiWeightSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5bf2fff50878a89e2f005c6950c9c43845d6f2aa79f137d97c2de9737cdcd144"));
const updateKpiWeightSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tolerance: numberType().min(0).max(25),
  strict: booleanType()
}).parse(d)).handler(createSsrRpc("2731f50b96dae24899bc75c832271f5ce776768d06dd35c873a5c585bb2824de"));
export {
  listCycles as a,
  updateKpiWeightSettings as b,
  getCycleSubmissionStatus as c,
  deleteCycle as d,
  getKpiWeightSettings as g,
  listOpenCyclesForMe as l,
  setCycleStatus as s,
  upsertCycle as u
};
