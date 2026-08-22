import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, z as stringType, A as booleanType, B as enumType, D as arrayType, C as numberType } from "../_libs/zod.mjs";
const allocationSchema = objectType({
  id: stringType().uuid().optional(),
  project_id: stringType().uuid().nullable().optional(),
  job_id: stringType().uuid().nullable().optional(),
  department_id: stringType().uuid().nullable().optional(),
  cost_centre_code: stringType().trim().max(40).nullable().optional(),
  percentage: numberType().min(1e-3).max(100),
  hours: numberType().min(0),
  notes: stringType().trim().max(500).nullable().optional()
});
const saveAllocationsInput = objectType({
  time_entry_id: stringType().uuid(),
  allocations: arrayType(allocationSchema).max(20)
});
const listAllocationsForEntry = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  time_entry_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7f51a5219fc8951df81476267af25843fd475a7c1df5168a60c7e4fe6a240f94"));
const saveAllocations = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => saveAllocationsInput.parse(d)).handler(createSsrRpc("757b057c01942415843dc531ebba6101972e3ffb8e632f65d2ad7e8de3d502a6"));
const listVarianceQueue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().optional(),
  to: stringType().optional(),
  only_flagged: booleanType().optional()
}).parse(d ?? {})).handler(createSsrRpc("486023faba105228bd375162a25cd818628e1d735a081b932251b1915b3f244f"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  from: stringType().optional(),
  to: stringType().optional()
}).parse(d ?? {})).handler(createSsrRpc("6b87c57029cc93f0a04881ab18c960ee70b6836ec0dd50248495fde164f3755b"));
const dateStr = stringType().regex(/^\d{4}-\d{2}-\d{2}$/);
const submitMyTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  period_start: dateStr,
  period_end: dateStr,
  notes: stringType().trim().max(1e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("c0fd210c433caf14a752547f1fb4ae2176ab9f043dc2285a5f6f59a856f4efe4"));
const listMyTimesheets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("34384cbaf14a51d4cee13db4d484801476ba2bf38ddbdf2b8da7a5c9e3f3b5a7"));
const listPendingTimesheets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  status: enumType(["submitted", "approved", "rejected", "all"]).default("submitted")
}).partial().parse(d ?? {})).handler(createSsrRpc("88b97621fabcdf3c9c46d80908d710dc8e0ce4afc294a8e77734fd40571615a1"));
const approveTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("69f6ae2536a2e4826c69427822bb9e033c36cfeb436770cd7f415598bf4fef01"));
const rejectTimesheet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  reason: stringType().trim().min(3).max(1e3)
}).parse(d)).handler(createSsrRpc("057fccf1556f97bfef2151cb27957d15638fa490daffcc4ccd27a1d7cd11c961"));
export {
  listAllocationsForEntry as a,
  saveAllocations as b,
  listVarianceQueue as c,
  listPendingTimesheets as d,
  approveTimesheet as e,
  listMyTimesheets as l,
  rejectTimesheet as r,
  submitMyTimesheet as s
};
