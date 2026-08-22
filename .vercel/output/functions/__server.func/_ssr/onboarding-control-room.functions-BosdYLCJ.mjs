import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, B as enumType, D as arrayType, C as numberType } from "../_libs/zod.mjs";
const OwnerRole = enumType(["hr", "it", "manager", "employee", "finance"]);
const TaskStatus = enumType(["pending", "in_progress", "completed", "blocked", "skipped"]);
const listControlRooms = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  search: stringType().trim().max(200).optional(),
  owner_role: OwnerRole.optional(),
  task_status: TaskStatus.optional(),
  due_before: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  assignment_status: stringType().max(40).optional()
}).partial().parse(d ?? {})).handler(createSsrRpc("79ec2f52cf05ac10e7748ca4e7abb48239d96c75682c9071bd96ab7534435a84"));
const getControlRoom = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignment_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("050245a3abd428191c8a287d4e85f1371caef767528f5d0316a29c4cc2c5ebb1"));
const listControlRoomAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignment_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("611afe185334706c008b04315266c98a3c7af2b07e1c5fd17cd12767140152e5"));
const upsertControlRoomTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  assignment_id: stringType().uuid(),
  owner_role: OwnerRole,
  title: stringType().trim().min(1).max(200),
  description: stringType().trim().max(2e3).nullable().optional(),
  due_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  assigned_to: stringType().uuid().nullable().optional(),
  sort_order: numberType().int().default(0)
}).parse(d)).handler(createSsrRpc("3675ef2152abe6c054acbeea7c9a143c906a38660cc76384acb62d57a79c329c"));
const completeControlRoomTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: TaskStatus
}).parse(d)).handler(createSsrRpc("d14aca7eff3ff191530a3060246faeab2548e0246edd4713ce10e507c6b293f0"));
const deleteControlRoomTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d1bf6f938552af8e86a607216a02dd78c91a115dc94042a852d9438f4dc4c5bf"));
const bulkUpdateAssignmentStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ids: arrayType(stringType().uuid()).min(1).max(200),
  decision: enumType(["approve", "reject"]),
  notes: stringType().trim().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("66cea45061c4a45496b1969ce1cad0af494bff50e556a74fa3067060e9372e97"));
export {
  listControlRoomAudit as a,
  bulkUpdateAssignmentStatus as b,
  completeControlRoomTask as c,
  deleteControlRoomTask as d,
  getControlRoom as g,
  listControlRooms as l,
  upsertControlRoomTask as u
};
