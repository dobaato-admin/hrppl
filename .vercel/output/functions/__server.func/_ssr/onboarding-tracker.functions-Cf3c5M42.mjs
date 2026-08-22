import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, A as booleanType, z as stringType } from "../_libs/zod.mjs";
const listOnboardingTrackerRows = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: stringType().max(40).optional(),
  country: stringType().max(8).optional(),
  branchId: stringType().uuid().optional(),
  onlyOverdue: booleanType().optional()
}).partial().parse(d ?? {})).handler(createSsrRpc("72825e9b46a5c885c77a75525373e1faedc10ed8ec47887547b564bdec7fde41"));
const attestControlRoomTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  signature: stringType().trim().min(2).max(200),
  evidence_url: stringType().url().max(1e3).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("af257575dd4616160fc9c895f390ab6f221faae2bd8523de8121f0e8040d8f8c"));
const toggleTaskAttestationRequired = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  required: booleanType()
}).parse(d)).handler(createSsrRpc("756f51b013ce24ca31145c63d7fafa7fa86faac2691c3426362700c0358a970d"));
const acknowledgeCountryMerge = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  assignment_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ea2ed1576d6d3267dd471a669a2877f0c575f98d01e1ec3370e3103fdf265f9b"));
export {
  acknowledgeCountryMerge as a,
  attestControlRoomTask as b,
  listOnboardingTrackerRows as l,
  toggleTaskAttestationRequired as t
};
