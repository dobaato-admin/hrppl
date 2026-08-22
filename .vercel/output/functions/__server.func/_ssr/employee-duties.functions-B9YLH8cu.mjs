import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
const listEmployeeDuties = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("aa6a8ca16df5c97718881ac1665d5141f202ddddd84079808cbc1c383670aaf9"));
const listMyDuties = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3cf80544dfcb4a7e89107071e525b2361d675e3a78c169a1dc06665dc7e2d026"));
const Upsert = objectType({
  id: stringType().uuid().optional(),
  employee_id: stringType().uuid(),
  title: stringType().trim().min(1).max(200),
  description: stringType().trim().max(2e3).nullable().optional(),
  weight: numberType().min(0).max(100),
  kpi_target: stringType().trim().max(500).nullable().optional(),
  sort_order: numberType().int().min(0).max(1e3).optional(),
  is_active: booleanType().optional(),
  /** If true, skip the strict weight-tolerance assertion for this single save. */
  allow_partial: booleanType().optional()
});
const upsertEmployeeDuty = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => Upsert.parse(d)).handler(createSsrRpc("47a18cf59d482a0f227fde352983cacf613d5fd5fec4f98f1288c3e3a121624d"));
const deleteEmployeeDuty = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("75d02fd99b5d6a2e0335e2fd5fd35918ef3333b2fff3b7337b8ff544f53e29bb"));
const listEmployeesForDuties = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7f05b3feee6402491dd7bc548ccb8b88ec6bdb1bdcf47fc8e12ceff6cb826c89"));
export {
  listEmployeesForDuties as a,
  listEmployeeDuties as b,
  deleteEmployeeDuty as d,
  listMyDuties as l,
  upsertEmployeeDuty as u
};
