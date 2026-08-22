import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, C as numberType, z as stringType, D as arrayType, A as booleanType, E as recordType, F as anyType, B as enumType } from "../_libs/zod.mjs";
const ListInput = objectType({
  employeeId: stringType().uuid(),
  categories: arrayType(stringType()).optional(),
  from: stringType().optional(),
  to: stringType().optional(),
  limit: numberType().int().min(1).max(500).default(200)
});
const listEmployeeTimeline = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ListInput.parse(d)).handler(createSsrRpc("052d2d56ddfbea3d8df3bf69029bb1ef83cbedde6bf27a66581e21e44f43ccc5"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fromEventId: stringType().uuid(),
  toEventId: stringType().uuid(),
  relation: stringType().min(1).max(50).default("related")
}).parse(d)).handler(createSsrRpc("d51047ee80647fcbcd1c43342b8e0127beaefea7f8711f1575a7cc34eafe2b6d"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid(),
  category: stringType().min(1),
  eventType: stringType().min(1).max(100),
  title: stringType().min(1).max(255),
  summary: stringType().max(2e3).optional(),
  severity: stringType().max(50).optional(),
  visibility: enumType(["employee", "manager", "hr", "confidential"]).default("employee"),
  occurredAt: stringType().optional(),
  metadata: recordType(stringType(), anyType()).default({})
}).parse(d)).handler(createSsrRpc("b97a74db99c229a97ea2a0b89a831b3e193861f85f50202832619a34790b6c3d"));
const listEmployeesForAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  // Off by default only where selecting yourself is meaningful. The
  // callers that must never offer self (offboarding, discipline) leave
  // this alone.
  includeSelf: booleanType().default(false),
  includeInactive: booleanType().default(false)
}).parse(d ?? {})).handler(createSsrRpc("bfca804f13447d2f0dc0da9e3cecb9e05d5551caacf9ce524ce74e10eaaaf3f7"));
const myEmployeeId = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("46133b391f80385fff9b352fdf34b66e211b4871590fc93dad68fc24d6ae42d7"));
export {
  listEmployeesForAdmin as a,
  listEmployeeTimeline as l,
  myEmployeeId as m
};
