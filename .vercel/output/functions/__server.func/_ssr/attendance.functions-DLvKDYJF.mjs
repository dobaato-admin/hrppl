import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, C as numberType } from "../_libs/zod.mjs";
const ClockInSchema = objectType({
  latitude: numberType().min(-90).max(90).optional(),
  longitude: numberType().min(-180).max(180).optional(),
  locationError: stringType().max(200).optional()
}).optional();
const clockIn = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ClockInSchema.parse(d ?? {})).handler(createSsrRpc("214a77e62f12e4e764f58fbba19b652fa5b3066d4ff5de816fa577df84a65b5c"));
const clockOut = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  breakMinutes: numberType().int().min(0).max(720).optional()
}).parse(d)).handler(createSsrRpc("ab60a0940ed93c286890a4c4e055753b6088799ab6e7f9af78567bd07091fa7d"));
const upsertAttendanceEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockIn: stringType().optional().nullable(),
  clockOut: stringType().optional().nullable(),
  breakMinutes: numberType().int().min(0).max(720).default(0),
  notes: stringType().max(1e3).optional().nullable()
}).parse(d)).handler(createSsrRpc("fa087c682e4f5d034e776a3d554cdcafd77cad98d9f600402ad0c876eb4b57af"));
const submitTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  periodStart: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("357947bb533d1c692665e58b6a7d498a31d843958095241b000630b16afec5c3"));
const approveTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  timesheetId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("997f66817090c248bcdcf087eea62e3408dc29a51e5b29bfc263ec9e3ec8ba16"));
const rejectTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  timesheetId: stringType().uuid(),
  reason: stringType().max(1e3).optional()
}).parse(d)).handler(createSsrRpc("a192dc79fa5b24d95e3addf72707b62be53254f6f26b0c07c4784fd7213029bb"));
export {
  approveTimesheet as a,
  clockOut as b,
  clockIn as c,
  rejectTimesheet as r,
  submitTimesheet as s,
  upsertAttendanceEntry as u
};
