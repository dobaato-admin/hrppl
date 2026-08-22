import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, G as literalType, B as enumType } from "../_libs/zod.mjs";
const listSecurityFindings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("84b76b421f303fd36d3d8516f553cae1c66717315aa2640e650c474426069888"));
const RecordSchema = objectType({
  scanner_name: stringType().min(1).max(80),
  internal_id: stringType().min(1).max(200),
  title: stringType().min(1).max(255),
  severity: enumType(["error", "warn", "info"]),
  status: enumType(["open", "fixed", "ignored", "accepted_risk"]).default("open"),
  description: stringType().max(8e3).optional(),
  remediation: stringType().max(8e3).optional(),
  scanned_at: stringType().optional()
});
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => RecordSchema.parse(d)).handler(createSsrRpc("55630717fb199814372660828ad3f15c4fe1d56499e6def30733cbfd09634f2c"));
const UpdateSchema = objectType({
  id: stringType().uuid(),
  status: enumType(["open", "fixed", "ignored", "accepted_risk"]),
  remediation: stringType().max(8e3).optional(),
  ticket_url: stringType().url().max(500).optional().or(literalType("")),
  fixed_in_commit: stringType().max(500).optional().or(literalType(""))
});
const updateSecurityFindingStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => UpdateSchema.parse(d)).handler(createSsrRpc("48eff560eb518d23570caa8ae0919e66e0b297193a894a546a7f0ebe69b501c5"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("d940dd41ade46aca14a26c02992a9fe9c02a4433ad6aa71c9748f62fd2099049"));
export {
  listSecurityFindings as l,
  updateSecurityFindingStatus as u
};
