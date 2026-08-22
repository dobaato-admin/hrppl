import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { a as objectType, E as recordType, F as anyType, z as stringType, C as numberType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
const CATEGORIES = ["stationery", "equipment", "shift_swap", "time_in_lieu", "overtime_payment", "expense_reimbursement", "api_access_request", "other"];
const createSchema = objectType({
  category: enumType(CATEGORIES),
  subject: stringType().trim().min(2).max(200),
  description: stringType().trim().min(1).max(4e3),
  priority: enumType(["low", "normal", "high", "urgent"]).default("normal"),
  requested_amount: numberType().nonnegative().max(1e6).optional().nullable(),
  currency_code: stringType().trim().length(3).optional().nullable(),
  requested_for_date: stringType().optional().nullable(),
  metadata: recordType(anyType()).optional().default({})
});
const createSupportTicket = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => createSchema.parse(d)).handler(createSsrRpc("0b5282aca31a1d767e13c24f658d89e703676ba9c078f8744c3a270e95466366"));
const listMyTickets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fe997652390cfcb14fb1971b8fa25db964aa0a977bdd606e32b3d67b180cdd7a"));
const listInboxTickets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("cefbeacd2a2228987fae1cf6b14c4de86a243d2874e4bf0051d156c976a51a09"));
const decisionSchema = objectType({
  ticket_id: stringType().uuid(),
  status: enumType(["in_review", "approved", "rejected", "fulfilled", "closed"]),
  decision_notes: stringType().trim().max(2e3).optional().nullable()
});
const updateTicketStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => decisionSchema.parse(d)).handler(createSsrRpc("e8dc933efa46d994fe0783c59e49d32d3afb61379495a1549e8e278e2edcedcd"));
const commentSchema = objectType({
  ticket_id: stringType().uuid(),
  body: stringType().trim().min(1).max(2e3),
  is_internal: booleanType().default(false)
});
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => commentSchema.parse(d)).handler(createSsrRpc("1e1572f243a904bd9daa9285583017cc9de6797880039f6e1dce35b0ed9f6271"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ticket_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c41664165ed31b44d7bd6d12a64d858dcc73c57e927511b6329a007f3e288fd9"));
export {
  listInboxTickets as a,
  createSupportTicket as c,
  listMyTickets as l,
  updateTicketStatus as u
};
