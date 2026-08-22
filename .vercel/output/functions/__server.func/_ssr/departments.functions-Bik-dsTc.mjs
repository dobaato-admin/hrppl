import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType } from "../_libs/zod.mjs";
const listDepartments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("083bc60e25d313798d8e4aafc4d1a4f079432eb9e2240b2ff6e7483f3dabfcee"));
const UpsertSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(120),
  parent_id: stringType().uuid().nullable().optional(),
  manager_id: stringType().uuid().nullable().optional()
});
const upsertDepartment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpsertSchema.parse(d)).handler(createSsrRpc("bd4955b78082526ef9e1592320b5b397176cee778a80df4a1a46f54ee889be54"));
const deleteDepartment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("41c6d55e5c6a8c5bdd2d7aa91c98fb664d017c91e899b8f45c91a818c28d0a0a"));
export {
  deleteDepartment as d,
  listDepartments as l,
  upsertDepartment as u
};
