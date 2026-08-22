import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, E as recordType, F as anyType, z as stringType, C as numberType, B as enumType, A as booleanType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
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
const createSupportTicket_createServerFn_handler = createServerRpc({
  id: "0b5282aca31a1d767e13c24f658d89e703676ba9c078f8744c3a270e95466366",
  name: "createSupportTicket",
  filename: "src/lib/support-tickets.functions.ts"
}, (opts) => createSupportTicket.__executeServer(opts));
const createSupportTicket = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => createSchema.parse(d)).handler(createSupportTicket_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp,
    error: ee
  } = await supabase.from("employees").select("id, tenant_id, manager_id").eq("user_id", userId).maybeSingle();
  if (ee) throw new Error(ee.message);
  if (!emp) throw new Error("No employee record on file. Contact your HR admin.");
  let assigned_to = null;
  if (emp.manager_id) {
    const {
      data: mgr
    } = await supabase.from("employees").select("user_id").eq("id", emp.manager_id).maybeSingle();
    assigned_to = mgr?.user_id ?? null;
  }
  const {
    data: ticket,
    error
  } = await supabase.from("support_tickets").insert({
    tenant_id: emp.tenant_id,
    employee_id: emp.id,
    created_by: userId,
    category: data.category,
    subject: data.subject,
    description: data.description,
    priority: data.priority,
    requested_amount: data.requested_amount ?? null,
    currency_code: data.currency_code ?? null,
    requested_for_date: data.requested_for_date ?? null,
    metadata: data.metadata ?? {},
    assigned_to
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: ticket.id
  };
});
const listMyTickets_createServerFn_handler = createServerRpc({
  id: "fe997652390cfcb14fb1971b8fa25db964aa0a977bdd606e32b3d67b180cdd7a",
  name: "listMyTickets",
  filename: "src/lib/support-tickets.functions.ts"
}, (opts) => listMyTickets.__executeServer(opts));
const listMyTickets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyTickets_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id").eq("user_id", userId).maybeSingle();
  if (!emp) return {
    tickets: []
  };
  const {
    data,
    error
  } = await supabase.from("support_tickets").select("id, subject, category, status, priority, requested_amount, currency_code, requested_for_date, created_at, decided_at, decision_notes").eq("employee_id", emp.id).order("created_at", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return {
    tickets: data ?? []
  };
});
const listInboxTickets_createServerFn_handler = createServerRpc({
  id: "cefbeacd2a2228987fae1cf6b14c4de86a243d2874e4bf0051d156c976a51a09",
  name: "listInboxTickets",
  filename: "src/lib/support-tickets.functions.ts"
}, (opts) => listInboxTickets.__executeServer(opts));
const listInboxTickets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listInboxTickets_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("support_tickets").select("id, subject, category, status, priority, requested_amount, currency_code, requested_for_date, created_at, decided_at, decision_notes, assigned_to, employee_id, employees!support_tickets_employee_id_fkey(first_name,last_name,job_title)").order("created_at", {
    ascending: false
  }).limit(500);
  if (error) throw new Error(error.message);
  return {
    tickets: data ?? []
  };
});
const decisionSchema = objectType({
  ticket_id: stringType().uuid(),
  status: enumType(["in_review", "approved", "rejected", "fulfilled", "closed"]),
  decision_notes: stringType().trim().max(2e3).optional().nullable()
});
const updateTicketStatus_createServerFn_handler = createServerRpc({
  id: "e8dc933efa46d994fe0783c59e49d32d3afb61379495a1549e8e278e2edcedcd",
  name: "updateTicketStatus",
  filename: "src/lib/support-tickets.functions.ts"
}, (opts) => updateTicketStatus.__executeServer(opts));
const updateTicketStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => decisionSchema.parse(d)).handler(updateTicketStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const patch = {
    status: data.status,
    decision_notes: data.decision_notes ?? null
  };
  if (["approved", "rejected"].includes(data.status)) {
    patch.approver_id = userId;
    patch.decided_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const {
    error
  } = await supabase.from("support_tickets").update(patch).eq("id", data.ticket_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const commentSchema = objectType({
  ticket_id: stringType().uuid(),
  body: stringType().trim().min(1).max(2e3),
  is_internal: booleanType().default(false)
});
const addTicketComment_createServerFn_handler = createServerRpc({
  id: "1e1572f243a904bd9daa9285583017cc9de6797880039f6e1dce35b0ed9f6271",
  name: "addTicketComment",
  filename: "src/lib/support-tickets.functions.ts"
}, (opts) => addTicketComment.__executeServer(opts));
const addTicketComment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => commentSchema.parse(d)).handler(addTicketComment_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: t,
    error: te
  } = await supabase.from("support_tickets").select("tenant_id").eq("id", data.ticket_id).maybeSingle();
  if (te) throw new Error(te.message);
  if (!t) throw new Error("Ticket not found");
  const {
    error
  } = await supabase.from("support_ticket_comments").insert({
    ticket_id: data.ticket_id,
    tenant_id: t.tenant_id,
    author_id: userId,
    body: data.body,
    is_internal: data.is_internal
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listTicketComments_createServerFn_handler = createServerRpc({
  id: "c41664165ed31b44d7bd6d12a64d858dcc73c57e927511b6329a007f3e288fd9",
  name: "listTicketComments",
  filename: "src/lib/support-tickets.functions.ts"
}, (opts) => listTicketComments.__executeServer(opts));
const listTicketComments = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ticket_id: stringType().uuid()
}).parse(d)).handler(listTicketComments_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("support_ticket_comments").select("id, body, is_internal, author_id, created_at").eq("ticket_id", data.ticket_id).order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return {
    comments: rows ?? []
  };
});
export {
  addTicketComment_createServerFn_handler,
  createSupportTicket_createServerFn_handler,
  listInboxTickets_createServerFn_handler,
  listMyTickets_createServerFn_handler,
  listTicketComments_createServerFn_handler,
  updateTicketStatus_createServerFn_handler
};
