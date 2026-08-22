import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { C as CSV_MAX_ROWS } from "./rate-limit.functions-CFVeXiWs.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, B as enumType, C as numberType, A as booleanType, z as stringType } from "../_libs/zod.mjs";
const FilterSchema = objectType({
  source: enumType(["onboarding", "offboarding", "all"]).default("all"),
  employeeId: stringType().uuid().optional().nullable(),
  channel: stringType().trim().max(60).optional().nullable(),
  actorId: stringType().uuid().optional().nullable(),
  actorSearch: stringType().trim().max(200).optional().nullable(),
  action: stringType().trim().max(60).optional().nullable(),
  taskId: stringType().uuid().optional().nullable(),
  assignmentId: stringType().uuid().optional().nullable(),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  includeArchive: booleanType().default(false),
  limit: numberType().int().min(1).max(2e3).default(100),
  offset: numberType().int().min(0).max(1e5).default(0),
  sortBy: enumType(["created_at", "action", "source"]).default("created_at"),
  sortDir: enumType(["asc", "desc"]).default("desc")
}).partial();
const exploreAudit = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => FilterSchema.parse(d ?? {})).handler(createSsrRpc("0f0776b6c6902e3e3f577fb0e065fa475664ae5b3f3f3544bff9ce44ee1a0eb4"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => FilterSchema.extend({
  limit: numberType().int().min(1).max(CSV_MAX_ROWS).default(CSV_MAX_ROWS)
}).parse(d ?? {})).handler(createSsrRpc("97e2f5e2a53559a58d3a56c2b34751a44a0a35a82ccfda4534516299d3de984f"));
const exportOnboardingTrackerAuditCsv = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  employeeId: stringType().uuid().optional().nullable(),
  assignmentId: stringType().uuid().optional().nullable(),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  includeArchive: booleanType().default(false)
}).partial().parse(d ?? {})).handler(createSsrRpc("760d30b15466142371eb617a0a3e9308ce3f0e9f4dcafeeec112ee9da368b34c"));
export {
  exportOnboardingTrackerAuditCsv as a,
  exploreAudit as e
};
