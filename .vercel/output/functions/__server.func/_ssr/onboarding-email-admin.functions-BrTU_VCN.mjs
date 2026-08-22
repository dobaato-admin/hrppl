import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, z as stringType, B as enumType } from "../_libs/zod.mjs";
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
const previewOnboardingOverdueEmail_createServerFn_handler = createServerRpc({
  id: "e8298c3f0194ade51ced9d03ad46e58d333b22abc223b091010cdfa195147a3f",
  name: "previewOnboardingOverdueEmail",
  filename: "src/lib/onboarding-email-admin.functions.ts"
}, (opts) => previewOnboardingOverdueEmail.__executeServer(opts));
const previewOnboardingOverdueEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  audience: enumType(["employee", "manager"]).default("employee"),
  employeeId: stringType().uuid().optional(),
  checklistId: stringType().uuid().optional(),
  assignmentId: stringType().uuid().optional()
}).parse(d)).handler(previewOnboardingOverdueEmail_createServerFn_handler, async ({
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
  if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden");
  }
  let employeeName;
  let recipientName;
  let checklistName;
  let dueDate;
  let daysOverdue;
  if (data.assignmentId) {
    const {
      data: a
    } = await supabase.from("onboarding_assignments").select("employee_id,checklist_id,due_date").eq("id", data.assignmentId).maybeSingle();
    if (a) {
      data.employeeId = data.employeeId ?? a.employee_id;
      data.checklistId = data.checklistId ?? a.checklist_id;
      dueDate = a.due_date ?? void 0;
    }
  }
  if (data.employeeId) {
    const {
      data: emp
    } = await supabase.from("employees").select("first_name,last_name,user_id,manager_id").eq("id", data.employeeId).maybeSingle();
    if (emp) {
      employeeName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || void 0;
      if (data.audience === "employee" && emp.user_id) {
        const {
          data: p
        } = await supabase.from("profiles").select("full_name").eq("id", emp.user_id).maybeSingle();
        recipientName = p?.full_name ?? employeeName;
      } else if (data.audience === "manager" && emp.manager_id) {
        const {
          data: mgr
        } = await supabase.from("employees").select("first_name,last_name,user_id").eq("id", emp.manager_id).maybeSingle();
        if (mgr) {
          if (mgr.user_id) {
            const {
              data: p
            } = await supabase.from("profiles").select("full_name").eq("id", mgr.user_id).maybeSingle();
            recipientName = p?.full_name ?? (`${mgr.first_name ?? ""} ${mgr.last_name ?? ""}`.trim() || void 0);
          } else {
            recipientName = `${mgr.first_name ?? ""} ${mgr.last_name ?? ""}`.trim() || void 0;
          }
        }
      }
    }
  }
  if (data.checklistId) {
    const {
      data: cl
    } = await supabase.from("onboarding_checklists").select("name").eq("id", data.checklistId).maybeSingle();
    checklistName = cl?.name;
  }
  if (!dueDate) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 5);
    dueDate = d.toISOString().slice(0, 10);
  }
  daysOverdue = Math.max(0, Math.floor((Date.now() - (/* @__PURE__ */ new Date(dueDate + "T00:00:00Z")).getTime()) / 864e5));
  const React = (await import("../_libs/react.mjs").then(function(n) {
    return n.R;
  })).default;
  const {
    render
  } = await import("../_libs/react-email__render.mjs");
  const {
    TEMPLATES
  } = await import("./registry-Y5CZHtkF.mjs");
  const entry = TEMPLATES["onboarding-overdue"];
  if (!entry) throw new Error("Template not found");
  const templateData = {
    audience: data.audience,
    recipientName,
    employeeName,
    checklistName,
    dueDate,
    daysOverdue,
    appUrl: data.audience === "manager" ? "https://hrppl.io/org/onboarding" : "https://hrppl.io/onboarding"
  };
  const html = await render(React.createElement(entry.component, templateData));
  const subject = typeof entry.subject === "function" ? entry.subject(templateData) : entry.subject;
  return {
    html,
    subject,
    templateData
  };
});
const sendTestOnboardingOverdueEmail_createServerFn_handler = createServerRpc({
  id: "6472faeb0eae3c6157e0b651f13f4789fafaab0e752cfd5dbae20545c7796627",
  name: "sendTestOnboardingOverdueEmail",
  filename: "src/lib/onboarding-email-admin.functions.ts"
}, (opts) => sendTestOnboardingOverdueEmail.__executeServer(opts));
const sendTestOnboardingOverdueEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  audience: enumType(["employee", "manager"]).default("employee"),
  employeeId: stringType().uuid().optional(),
  checklistId: stringType().uuid().optional(),
  assignmentId: stringType().uuid().optional(),
  // Optional override; defaults to resolved recipient email
  overrideEmail: stringType().email().optional()
}).parse(d)).handler(sendTestOnboardingOverdueEmail_createServerFn_handler, async ({
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
  if (!roles.includes("org_admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden");
  }
  let employeeName;
  let recipientName;
  let recipientEmail = data.overrideEmail;
  let checklistName;
  let dueDate;
  if (data.assignmentId) {
    const {
      data: a
    } = await supabase.from("onboarding_assignments").select("employee_id,checklist_id,due_date").eq("id", data.assignmentId).maybeSingle();
    if (a) {
      data.employeeId = data.employeeId ?? a.employee_id;
      data.checklistId = data.checklistId ?? a.checklist_id;
      dueDate = a.due_date ?? void 0;
    }
  }
  if (data.employeeId) {
    const {
      data: emp
    } = await supabase.from("employees").select("first_name,last_name,user_id,manager_id,email").eq("id", data.employeeId).maybeSingle();
    if (emp) {
      employeeName = `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || void 0;
      if (data.audience === "employee") {
        if (emp.user_id) {
          const {
            data: p
          } = await supabase.from("profiles").select("email,full_name").eq("id", emp.user_id).maybeSingle();
          recipientEmail = recipientEmail ?? p?.email ?? emp.email;
          recipientName = p?.full_name ?? employeeName;
        } else {
          recipientEmail = recipientEmail ?? emp.email;
          recipientName = employeeName;
        }
      } else if (data.audience === "manager" && emp.manager_id) {
        const {
          data: mgr
        } = await supabase.from("employees").select("first_name,last_name,user_id,email").eq("id", emp.manager_id).maybeSingle();
        if (mgr) {
          if (mgr.user_id) {
            const {
              data: p
            } = await supabase.from("profiles").select("email,full_name").eq("id", mgr.user_id).maybeSingle();
            recipientEmail = recipientEmail ?? p?.email ?? mgr.email;
            recipientName = p?.full_name ?? `${mgr.first_name ?? ""} ${mgr.last_name ?? ""}`.trim();
          } else {
            recipientEmail = recipientEmail ?? mgr.email;
            recipientName = `${mgr.first_name ?? ""} ${mgr.last_name ?? ""}`.trim();
          }
        }
      }
    }
  }
  if (data.checklistId) {
    const {
      data: cl
    } = await supabase.from("onboarding_checklists").select("name").eq("id", data.checklistId).maybeSingle();
    checklistName = cl?.name;
  }
  if (!recipientEmail) throw new Error("Could not resolve a recipient email");
  if (!dueDate) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 5);
    dueDate = d.toISOString().slice(0, 10);
  }
  const daysOverdue = Math.max(0, Math.floor((Date.now() - (/* @__PURE__ */ new Date(dueDate + "T00:00:00Z")).getTime()) / 864e5));
  const {
    sendInternalEmail
  } = await import("./send-internal.server-9cG3k97B.mjs");
  await sendInternalEmail({
    templateName: "onboarding-overdue",
    recipientEmail,
    idempotencyKey: `onboarding-overdue-test-${data.assignmentId ?? data.employeeId ?? "manual"}-${Date.now()}`,
    // Intentionally omit preferenceKey so admin test sends are not silently suppressed
    templateData: {
      audience: data.audience,
      recipientName,
      employeeName,
      checklistName,
      dueDate,
      daysOverdue,
      appUrl: data.audience === "manager" ? "https://hrppl.io/org/onboarding" : "https://hrppl.io/onboarding"
    }
  });
  return {
    ok: true,
    recipientEmail
  };
});
export {
  previewOnboardingOverdueEmail_createServerFn_handler,
  sendTestOnboardingOverdueEmail_createServerFn_handler
};
