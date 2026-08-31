import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-guard";

export type QuickAccessRegistryItem = {
  key: string;
  label: string;
  icon: string;
  href: string;
  group: string;
};

export const QUICK_ACCESS_REGISTRY: QuickAccessRegistryItem[] = [
  { key: "org-console", label: "Org console", icon: "Building2", href: "/org", group: "Organization" },
  { key: "team-dashboard", label: "Team dashboard", icon: "Users", href: "/team", group: "Team" },
  { key: "employees", label: "Employees", icon: "Users", href: "/org/employees", group: "Team" },
  { key: "team-members", label: "Team members", icon: "Users", href: "/admin/teams", group: "Team" },
  { key: "requests-inbox", label: "Requests inbox", icon: "Inbox", href: "/admin/requests", group: "Team" },
  { key: "departments", label: "Departments", icon: "Building2", href: "/admin/departments", group: "Team" },
  { key: "recruitment", label: "Recruitment", icon: "UserSearch", href: "/org/recruitment", group: "Team" },
  { key: "asset-register", label: "Asset register", icon: "Package", href: "/admin/assets", group: "Team" },
  { key: "leave-mgmt", label: "Leave management", icon: "CalendarDays", href: "/org/leave", group: "Leave & time" },
  { key: "timesheets", label: "Timesheets", icon: "Clock", href: "/org/timesheets", group: "Leave & time" },
  { key: "toil-admin", label: "TOIL admin", icon: "Clock", href: "/admin/toil", group: "Leave & time" },
  { key: "payroll", label: "Run payroll", icon: "DollarSign", href: "/org/payroll", group: "Payroll" },
  { key: "expenses", label: "Expenses", icon: "Wallet", href: "/org/expenses", group: "Operations" },
  { key: "performance", label: "Performance reviews", icon: "Sparkles", href: "/org/performance", group: "Operations" },
  { key: "onboarding-tracker", label: "Onboarding tracker", icon: "ClipboardCheck", href: "/org/onboarding/tracker", group: "Operations" },
  { key: "training", label: "Training", icon: "BookOpen", href: "/org/training", group: "Operations" },
  { key: "documents", label: "Documents", icon: "FileSignature", href: "/org/documents", group: "Operations" },
  { key: "analytics", label: "Analytics", icon: "TrendingUp", href: "/org/analytics", group: "Insights" },
  { key: "reports", label: "Reports", icon: "FileText", href: "/org/reports", group: "Insights" },
  { key: "knowledge", label: "Knowledge hub", icon: "BookOpen", href: "/help", group: "Help" },
];

export const listMyQuickAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data } = await supabase
      .from("manager_quick_access")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order");
    return { pins: data ?? [], registry: QUICK_ACCESS_REGISTRY };
  });

const SaveSchema = z.object({
  keys: z.array(z.string()),
});

export const setMyQuickAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await supabase.from("manager_quick_access").delete().eq("user_id", userId);
    if (data.keys.length === 0) return { pins: [] };
    const rows = data.keys
      .map((key, idx) => {
        const item = QUICK_ACCESS_REGISTRY.find((r) => r.key === key);
        if (!item) return null;
        return {
          user_id: userId,
          key: item.key,
          label: item.label,
          icon: item.icon,
          href: item.href,
          sort_order: idx,
        };
      })
      .filter(Boolean);
    const { data: inserted, error } = await supabase
      .from("manager_quick_access")
      .insert(rows as any[])
      .select();
    if (error) throw error;
    return { pins: inserted ?? [] };
  });
