import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, B as enumType, z as stringType, G as literalType, C as numberType, A as booleanType, D as arrayType } from "../_libs/zod.mjs";
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
const listClients_createServerFn_handler = createServerRpc({
  id: "822f4aa8da65749a2d19d0e7a7af1e75dff4b996eb0c1199b6163306c7055346",
  name: "listClients",
  filename: "src/lib/practice.functions.ts"
}, (opts) => listClients.__executeServer(opts));
const listClients = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listClients_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("clients").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    clients: data ?? []
  };
});
const clientSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(160),
  contact_name: stringType().trim().max(160).optional().nullable(),
  contact_email: stringType().trim().email().max(255).optional().nullable().or(literalType("")),
  contact_phone: stringType().trim().max(40).optional().nullable(),
  billing_address: stringType().trim().max(500).optional().nullable(),
  country_code: stringType().trim().length(2).optional().nullable().or(literalType("")),
  currency_code: stringType().trim().length(3).optional().nullable().or(literalType("")),
  tax_number: stringType().trim().max(60).optional().nullable(),
  notes: stringType().trim().max(2e3).optional().nullable(),
  status: enumType(["active", "archived"]).default("active")
});
const upsertClient_createServerFn_handler = createServerRpc({
  id: "7c9a494933082b870351313e7179d9a44f02f3d9bd53a45ba222db9563e69926",
  name: "upsertClient",
  filename: "src/lib/practice.functions.ts"
}, (opts) => upsertClient.__executeServer(opts));
const upsertClient = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => clientSchema.parse(d)).handler(upsertClient_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = prof?.tenant_id;
  if (!tenantId) throw new Error("No organization");
  const payload = {
    ...data,
    tenant_id: tenantId,
    created_by: userId
  };
  if (payload.contact_email === "") payload.contact_email = null;
  if (payload.country_code === "") payload.country_code = null;
  if (payload.currency_code === "") payload.currency_code = null;
  const {
    data: row,
    error
  } = await supabase.from("clients").upsert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return {
    client: row
  };
});
const listProjects_createServerFn_handler = createServerRpc({
  id: "0a7ff2ac066f445f4e21e3dc6176ac4d06420eaa9ae363abc40e5a8262286c34",
  name: "listProjects",
  filename: "src/lib/practice.functions.ts"
}, (opts) => listProjects.__executeServer(opts));
const listProjects = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listProjects_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("projects").select("*, clients(name)").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return {
    projects: data ?? []
  };
});
const UNIQUE_VIOLATION = "23505";
async function writeRow(supabase, table, payload) {
  const id = payload.id;
  if (id) {
    const {
      data: existing
    } = await supabase.from(table).select("id").eq("id", id).maybeSingle();
    if (existing) {
      const {
        data: row2,
        error: error2
      } = await supabase.from(table).update(payload).eq("id", id).select("*").single();
      if (error2) throw new Error(error2.message);
      return row2;
    }
  }
  const {
    data: row,
    error
  } = await supabase.from(table).insert(payload).select("*").single();
  if (error) {
    if (error.code === UNIQUE_VIOLATION && id) {
      const {
        data: won
      } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (won) return won;
    }
    throw new Error(error.message);
  }
  return row;
}
const projectSchema = objectType({
  id: stringType().uuid().optional(),
  client_id: stringType().uuid(),
  code: stringType().trim().max(40).optional().nullable(),
  name: stringType().trim().min(1).max(160),
  description: stringType().trim().max(2e3).optional().nullable(),
  status: enumType(["active", "on_hold", "completed", "cancelled"]).default("active"),
  billing_type: enumType(["fixed", "time_and_materials", "retainer", "non_billable"]).default("time_and_materials"),
  budget_amount: numberType().optional().nullable(),
  budget_hours: numberType().optional().nullable(),
  hourly_rate: numberType().optional().nullable(),
  currency_code: stringType().trim().length(3).optional().nullable().or(literalType("")),
  start_date: stringType().optional().nullable().or(literalType("")),
  end_date: stringType().optional().nullable().or(literalType("")),
  manager_id: stringType().uuid().optional().nullable()
});
const upsertProject_createServerFn_handler = createServerRpc({
  id: "72b0fccf6f2dd0e559c99a1d0ef7220790ef399fe11663cfc7b6e8ba2cdabc97",
  name: "upsertProject",
  filename: "src/lib/practice.functions.ts"
}, (opts) => upsertProject.__executeServer(opts));
const upsertProject = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => projectSchema.parse(d)).handler(upsertProject_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organization");
  const payload = {
    ...data,
    tenant_id: prof.tenant_id
  };
  for (const k of ["currency_code", "start_date", "end_date"]) if (payload[k] === "") payload[k] = null;
  return {
    project: await writeRow(supabase, "projects", payload)
  };
});
const listJobs_createServerFn_handler = createServerRpc({
  id: "21a7040ae70d1835dd1979e661fd20f7d46d0451001cf4a05e02573412644369",
  name: "listJobs",
  filename: "src/lib/practice.functions.ts"
}, (opts) => listJobs.__executeServer(opts));
const listJobs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  project_id: stringType().uuid().optional()
}).parse(d ?? {})).handler(listJobs_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("client_jobs").select("*, projects(name, client_id, clients(name))").order("created_at", {
    ascending: false
  });
  if (data.project_id) q = q.eq("project_id", data.project_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    jobs: rows ?? []
  };
});
const jobSchema = objectType({
  id: stringType().uuid().optional(),
  project_id: stringType().uuid(),
  name: stringType().trim().min(1).max(160),
  description: stringType().trim().max(2e3).optional().nullable(),
  status: enumType(["open", "in_progress", "review", "completed", "cancelled"]).default("open"),
  priority: enumType(["low", "normal", "high", "urgent"]).default("normal"),
  due_date: stringType().optional().nullable().or(literalType("")),
  assignee_id: stringType().uuid().optional().nullable(),
  estimated_hours: numberType().optional().nullable()
});
const upsertJob_createServerFn_handler = createServerRpc({
  id: "eea7c7bfc0382a635d079f2fee91f083e60ceba3a0e93b479bc95b9c32d61bf3",
  name: "upsertJob",
  filename: "src/lib/practice.functions.ts"
}, (opts) => upsertJob.__executeServer(opts));
const upsertJob = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => jobSchema.parse(d)).handler(upsertJob_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organization");
  const payload = {
    ...data,
    tenant_id: prof.tenant_id
  };
  if (payload.due_date === "") payload.due_date = null;
  return {
    job: await writeRow(supabase, "client_jobs", payload)
  };
});
const listMyTimeEntries_createServerFn_handler = createServerRpc({
  id: "b25c806ae12822410b4cc0a295a47679e8367a43e2f7b07d01bf916faf9b0c37",
  name: "listMyTimeEntries",
  filename: "src/lib/practice.functions.ts"
}, (opts) => listMyTimeEntries.__executeServer(opts));
const listMyTimeEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyTimeEntries_createServerFn_handler, async ({
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
    entries: []
  };
  const {
    data,
    error
  } = await supabase.from("time_entries").select("*, projects(name, currency_code), client_jobs(name)").eq("employee_id", emp.id).order("work_date", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return {
    entries: data ?? []
  };
});
const timeEntrySchema = objectType({
  id: stringType().uuid().optional(),
  project_id: stringType().uuid(),
  job_id: stringType().uuid().optional().nullable(),
  work_date: stringType().min(8),
  hours: numberType().min(0.01).max(24),
  description: stringType().trim().max(500).optional().nullable(),
  billable: booleanType().default(true),
  hourly_rate: numberType().optional().nullable()
});
const upsertMyTimeEntry_createServerFn_handler = createServerRpc({
  id: "b57c5cf5e8154ff04d80f837ef22d22dabd9661743987c3970a0103aa7079446",
  name: "upsertMyTimeEntry",
  filename: "src/lib/practice.functions.ts"
}, (opts) => upsertMyTimeEntry.__executeServer(opts));
const upsertMyTimeEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => timeEntrySchema.parse(d)).handler(upsertMyTimeEntry_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: emp
  } = await supabase.from("employees").select("id, tenant_id").eq("user_id", userId).maybeSingle();
  if (!emp) throw new Error("No employee record");
  const payload = {
    ...data,
    employee_id: emp.id,
    tenant_id: emp.tenant_id
  };
  const {
    data: row,
    error
  } = await supabase.from("time_entries").upsert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return {
    entry: row
  };
});
const deleteMyTimeEntry_createServerFn_handler = createServerRpc({
  id: "d8d41365d34236cc48697102c4ae69be53bd3c016a135ea6156cd8f43e4a4293",
  name: "deleteMyTimeEntry",
  filename: "src/lib/practice.functions.ts"
}, (opts) => deleteMyTimeEntry.__executeServer(opts));
const deleteMyTimeEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteMyTimeEntry_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("time_entries").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listInvoices_createServerFn_handler = createServerRpc({
  id: "5c46d6231af1b16cd9a5d2cd5ec3100c125c0f32d5c2f300720153fb07503e7d",
  name: "listInvoices",
  filename: "src/lib/practice.functions.ts"
}, (opts) => listInvoices.__executeServer(opts));
const listInvoices = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listInvoices_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("invoices").select("*, clients(name)").order("issue_date", {
    ascending: false
  }).limit(200);
  if (error) throw new Error(error.message);
  return {
    invoices: data ?? []
  };
});
const invoiceLineSchema = objectType({
  description: stringType().trim().min(1).max(300),
  quantity: numberType().min(0),
  unit_price: numberType().min(0),
  tax_rate: numberType().min(0).max(100).default(0),
  project_id: stringType().uuid().optional().nullable()
});
const invoiceSchema = objectType({
  id: stringType().uuid().optional(),
  client_id: stringType().uuid(),
  invoice_number: stringType().trim().min(1).max(40),
  status: enumType(["draft", "sent", "paid", "overdue", "void"]).default("draft"),
  issue_date: stringType(),
  due_date: stringType().optional().nullable().or(literalType("")),
  currency_code: stringType().trim().length(3),
  notes: stringType().trim().max(2e3).optional().nullable(),
  terms: stringType().trim().max(2e3).optional().nullable(),
  lines: arrayType(invoiceLineSchema).min(1).max(100)
});
const upsertInvoice_createServerFn_handler = createServerRpc({
  id: "efe6ea08a2364c51e6f3dbd4c7c66ff0bb56ece308697b1ef9ab66d7618e7504",
  name: "upsertInvoice",
  filename: "src/lib/practice.functions.ts"
}, (opts) => upsertInvoice.__executeServer(opts));
const upsertInvoice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => invoiceSchema.parse(d)).handler(upsertInvoice_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  if (!prof?.tenant_id) throw new Error("No organization");
  const subtotal = data.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const taxTotal = data.lines.reduce((s, l) => s + l.quantity * l.unit_price * (l.tax_rate / 100), 0);
  const total = subtotal + taxTotal;
  const invoicePayload = {
    id: data.id,
    tenant_id: prof.tenant_id,
    client_id: data.client_id,
    invoice_number: data.invoice_number,
    status: data.status,
    issue_date: data.issue_date,
    due_date: data.due_date || null,
    currency_code: data.currency_code,
    notes: data.notes ?? null,
    terms: data.terms ?? null,
    subtotal,
    tax_total: taxTotal,
    total,
    created_by: userId
  };
  const {
    data: inv,
    error: invErr
  } = await supabase.from("invoices").upsert(invoicePayload).select("*").single();
  if (invErr) throw new Error(invErr.message);
  await supabase.from("invoice_lines").delete().eq("invoice_id", inv.id);
  const lineRows = data.lines.map((l, i) => ({
    tenant_id: prof.tenant_id,
    invoice_id: inv.id,
    project_id: l.project_id ?? null,
    description: l.description,
    quantity: l.quantity,
    unit_price: l.unit_price,
    tax_rate: l.tax_rate,
    line_total: l.quantity * l.unit_price * (1 + l.tax_rate / 100),
    sort_order: i
  }));
  const {
    error: lErr
  } = await supabase.from("invoice_lines").insert(lineRows);
  if (lErr) throw new Error(lErr.message);
  return {
    invoice: inv
  };
});
const getInvoice_createServerFn_handler = createServerRpc({
  id: "5ace03deafe9fb94ced3ac8bf485a411f455311764fdbe8f097267cc7c9cd273",
  name: "getInvoice",
  filename: "src/lib/practice.functions.ts"
}, (opts) => getInvoice.__executeServer(opts));
const getInvoice = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getInvoice_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const [{
    data: inv
  }, {
    data: lines
  }] = await Promise.all([supabase.from("invoices").select("*, clients(name, billing_address, contact_email)").eq("id", data.id).maybeSingle(), supabase.from("invoice_lines").select("*").eq("invoice_id", data.id).order("sort_order")]);
  return {
    invoice: inv,
    lines: lines ?? []
  };
});
const markInvoicePaid_createServerFn_handler = createServerRpc({
  id: "4a8350adb476ce3da86a6791bbd6a4e802b8c802a539273801ac6630472aac1a",
  name: "markInvoicePaid",
  filename: "src/lib/practice.functions.ts"
}, (opts) => markInvoicePaid.__executeServer(opts));
const markInvoicePaid = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(markInvoicePaid_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: roleRows
  } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (roleRows ?? []).map((r) => r.role);
  if (!roles.some((r) => ["org_admin", "super_admin"].includes(r))) {
    throw new Error("Forbidden");
  }
  const {
    data: prof
  } = await supabase.from("profiles").select("tenant_id").eq("id", userId).maybeSingle();
  const tenantId = prof?.tenant_id;
  if (!tenantId && !roles.includes("super_admin")) {
    throw new Error("No organization");
  }
  let q = supabase.from("invoices").update({
    status: "paid",
    paid_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (!roles.includes("super_admin")) q = q.eq("tenant_id", tenantId);
  const {
    error,
    count
  } = await q.select("id", {
    count: "exact"
  });
  if (error) throw new Error(error.message);
  if (!count) throw new Error("Invoice not found");
  return {
    ok: true
  };
});
export {
  deleteMyTimeEntry_createServerFn_handler,
  getInvoice_createServerFn_handler,
  listClients_createServerFn_handler,
  listInvoices_createServerFn_handler,
  listJobs_createServerFn_handler,
  listMyTimeEntries_createServerFn_handler,
  listProjects_createServerFn_handler,
  markInvoicePaid_createServerFn_handler,
  upsertClient_createServerFn_handler,
  upsertInvoice_createServerFn_handler,
  upsertJob_createServerFn_handler,
  upsertMyTimeEntry_createServerFn_handler,
  upsertProject_createServerFn_handler
};
