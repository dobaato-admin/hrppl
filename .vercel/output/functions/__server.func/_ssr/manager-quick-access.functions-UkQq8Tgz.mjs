import { c as createServerRpc } from "./createServerRpc-CbJDFEP-.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { a as objectType, D as arrayType, z as stringType } from "../_libs/zod.mjs";
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
const QUICK_ACCESS_REGISTRY = [{
  key: "org-console",
  label: "Org console",
  icon: "Building2",
  href: "/org",
  group: "Organization"
}, {
  key: "employees",
  label: "Employees",
  icon: "Users",
  href: "/org/employees",
  group: "Team"
}, {
  key: "team-members",
  label: "Team members",
  icon: "Users",
  href: "/admin/teams",
  group: "Team"
}, {
  key: "requests-inbox",
  label: "Requests inbox",
  icon: "Inbox",
  href: "/admin/requests",
  group: "Team"
}, {
  key: "departments",
  label: "Departments",
  icon: "Building2",
  href: "/admin/departments",
  group: "Team"
}, {
  key: "leave-mgmt",
  label: "Leave management",
  icon: "CalendarDays",
  href: "/org/leave",
  group: "Leave & time"
}, {
  key: "timesheets",
  label: "Timesheets",
  icon: "Clock",
  href: "/org/timesheets",
  group: "Leave & time"
}, {
  key: "toil-admin",
  label: "TOIL admin",
  icon: "Clock",
  href: "/admin/toil",
  group: "Leave & time"
}, {
  key: "payroll",
  label: "Run payroll",
  icon: "DollarSign",
  href: "/org/payroll",
  group: "Payroll"
}, {
  key: "expenses",
  label: "Expenses",
  icon: "Wallet",
  href: "/org/expenses",
  group: "Operations"
}, {
  key: "performance",
  label: "Performance reviews",
  icon: "Sparkles",
  href: "/org/performance",
  group: "Operations"
}, {
  key: "training",
  label: "Training",
  icon: "BookOpen",
  href: "/org/training",
  group: "Operations"
}, {
  key: "documents",
  label: "Documents",
  icon: "FileSignature",
  href: "/org/documents",
  group: "Operations"
}, {
  key: "analytics",
  label: "Analytics",
  icon: "TrendingUp",
  href: "/org/analytics",
  group: "Insights"
}, {
  key: "reports",
  label: "Reports",
  icon: "FileText",
  href: "/org/reports",
  group: "Insights"
}, {
  key: "knowledge",
  label: "Knowledge hub",
  icon: "BookOpen",
  href: "/help",
  group: "Help"
}];
const listMyQuickAccess_createServerFn_handler = createServerRpc({
  id: "4055460731e572a6d18c252379d717686ebdb67d77577a1d09ac15653646809d",
  name: "listMyQuickAccess",
  filename: "src/lib/manager-quick-access.functions.ts"
}, (opts) => listMyQuickAccess.__executeServer(opts));
const listMyQuickAccess = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyQuickAccess_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("manager_quick_access").select("*").eq("user_id", userId).order("sort_order");
  return {
    pins: data ?? [],
    registry: QUICK_ACCESS_REGISTRY
  };
});
const SaveSchema = objectType({
  keys: arrayType(stringType())
});
const setMyQuickAccess_createServerFn_handler = createServerRpc({
  id: "f98a0af4d12288c0ff622df077905011b9f7bbcaad50f7c977d68d86e29e0754",
  name: "setMyQuickAccess",
  filename: "src/lib/manager-quick-access.functions.ts"
}, (opts) => setMyQuickAccess.__executeServer(opts));
const setMyQuickAccess = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => SaveSchema.parse(d)).handler(setMyQuickAccess_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await supabase.from("manager_quick_access").delete().eq("user_id", userId);
  if (data.keys.length === 0) return {
    pins: []
  };
  const rows = data.keys.map((key, idx) => {
    const item = QUICK_ACCESS_REGISTRY.find((r) => r.key === key);
    if (!item) return null;
    return {
      user_id: userId,
      key: item.key,
      label: item.label,
      icon: item.icon,
      href: item.href,
      sort_order: idx
    };
  }).filter(Boolean);
  const {
    data: inserted,
    error
  } = await supabase.from("manager_quick_access").insert(rows).select();
  if (error) throw error;
  return {
    pins: inserted ?? []
  };
});
export {
  listMyQuickAccess_createServerFn_handler,
  setMyQuickAccess_createServerFn_handler
};
