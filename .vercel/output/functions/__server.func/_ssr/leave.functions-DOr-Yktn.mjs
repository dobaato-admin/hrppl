import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, A as booleanType, C as numberType } from "../_libs/zod.mjs";
const submitLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  leaveTypeId: stringType().uuid(),
  startDate: stringType(),
  endDate: stringType(),
  days: numberType().positive().max(366),
  halfDayStart: booleanType().optional(),
  halfDayEnd: booleanType().optional(),
  reason: stringType().max(2e3).optional()
}).parse(d)).handler(createSsrRpc("51dc49f9f5fa2d4880620c24ceb97b55255cc14c1d3e473e99af061851cf699d"));
const cancelLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b52994b4c73f413d7cfb4e1546af79359c94a09044a87eb847e2ebb546df7a10"));
const approveLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("4b098ff8304ccf4f65a4522ea2009394eac5aed196f330a2be6a8de2e821ed95"));
const rejectLeaveRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  reason: stringType().max(2e3).optional()
}).parse(d)).handler(createSsrRpc("99fe582eafb1895c99f5deecf27c7774bc76bcddc7cf45c04504ec0a4ff2ca33"));
export {
  approveLeaveRequest as a,
  cancelLeaveRequest as c,
  rejectLeaveRequest as r,
  submitLeaveRequest as s
};
