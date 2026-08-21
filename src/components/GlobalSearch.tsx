import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/use-auth";
import { can, type Feature } from "@/lib/rbac";
import { globalSearch } from "@/lib/global-search.functions";

type Entry = {
  label: string;
  to: string;
  group: "Pages" | "How to";
  keywords?: string;
  feature?: Feature;
};

const ENTRIES: Entry[] = [
  // Pages
  { group: "Pages", label: "Dashboard", to: "/dashboard", keywords: "home overview" },
  { group: "Pages", label: "My profile", to: "/me", keywords: "personal" },
  { group: "Pages", label: "My leave", to: "/leave", keywords: "holiday time off" },
  { group: "Pages", label: "My payslips", to: "/my-payslips", keywords: "salary pay" },
  { group: "Pages", label: "My expenses", to: "/me/expenses", keywords: "claim receipt reimbursement" },
  { group: "Pages", label: "My training", to: "/me/training", keywords: "course learn" },
  { group: "Pages", label: "My documents", to: "/me/documents", keywords: "signature file" },
  { group: "Pages", label: "Attendance", to: "/attendance", keywords: "check in clock" },
  { group: "Pages", label: "Recognition", to: "/recognition", keywords: "award kudos" },
  { group: "Pages", label: "Onboarding", to: "/onboarding", keywords: "checklist new hire" },

  { group: "Pages", label: "Employees", to: "/org/employees", keywords: "staff hire add", feature: "org.employees" },
  { group: "Pages", label: "Onboarding (org)", to: "/org/onboarding", keywords: "checklist", feature: "org.employees" },
  { group: "Pages", label: "Expenses (approvals)", to: "/org/expenses", keywords: "approve reimburse claim", feature: "org.expenses" },
  { group: "Pages", label: "Templates Hub", to: "/admin/templates", keywords: "review onboarding training documents", feature: "settings.organization" },
  { group: "Pages", label: "Review templates", to: "/admin/review-templates", keywords: "performance", feature: "settings.organization" },
  { group: "Pages", label: "Feedback templates", to: "/admin/feedback-templates", keywords: "360", feature: "settings.organization" },
  { group: "Pages", label: "Payslip templates", to: "/admin/payslip-templates", keywords: "pay", feature: "settings.organization" },
  { group: "Pages", label: "Geofences", to: "/admin/geofences", keywords: "google map location radius", feature: "settings.organization" },
  { group: "Pages", label: "Knowledge editor", to: "/admin/knowledge", keywords: "articles cms", feature: "platform.admin" },
  { group: "Pages", label: "Knowledge hub", to: "/help", keywords: "articles help" },
  { group: "Pages", label: "Org admin manual", to: "/help/org-admin-manual", keywords: "guide reference pdf" },
  { group: "Pages", label: "Settings — Notifications", to: "/settings/notifications" },
  { group: "Pages", label: "Settings — Organization", to: "/settings/organization", feature: "settings.organization" },
  { group: "Pages", label: "Settings — Billing", to: "/settings/billing", feature: "settings.billing" },

  // How-to articles (slug-based)
  { group: "How to", label: "Submit an expense claim", to: "/help/expense-claims", keywords: "receipt reimburse" },
  { group: "How to", label: "Apply for leave", to: "/help/apply-for-leave" },
  { group: "How to", label: "View and download payslips", to: "/help/view-payslips" },
  { group: "How to", label: "Complete your onboarding", to: "/help/complete-onboarding" },
  { group: "How to", label: "Invite a new employee", to: "/help/invite-employee", feature: "org.employees" },
  { group: "How to", label: "Approve leave & expense requests", to: "/help/manager-approvals" },
  { group: "How to", label: "Run a payroll cycle", to: "/help/run-payroll", feature: "settings.organization" },
  { group: "How to", label: "Run performance reviews", to: "/help/performance-reviews" },
  { group: "How to", label: "Reset your password", to: "/help/reset-password" },
  { group: "How to", label: "Use hrppl on your phone", to: "/help/mobile-access" },
  { group: "How to", label: "Raise a support ticket", to: "/help/raise-support-ticket" },
  { group: "How to", label: "First-time organization setup", to: "/help/admin-org-setup", feature: "settings.organization" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const { roles } = useAuth();
  const navigate = useNavigate();
  const searchFn = useServerFn(globalSearch);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const canSearchOrg = roles.some((r) => ["manager", "hr", "org_admin", "super_admin"].includes(r));
  const { data: live } = useQuery({
    queryKey: ["global-search", debouncedQ],
    queryFn: () => searchFn({ data: { q: debouncedQ } }),
    enabled: open && canSearchOrg && debouncedQ.length >= 2,
    staleTime: 15_000,
  });

  const visible = useMemo(
    () => ENTRIES.filter((e) => !e.feature || can(e.feature, roles)),
    [roles],
  );

  function go(to: string) {
    setOpen(false);
    setQ("");
    navigate({ to });
  }

  const grouped = useMemo(() => {
    const m = new Map<string, Entry[]>();
    visible.forEach((e) => {
      if (!m.has(e.group)) m.set(e.group, []);
      m.get(e.group)!.push(e);
    });
    return Array.from(m.entries());
  }, [visible]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="min-h-9 min-w-9"
        aria-label="Search"
        title="Search (⌘K)"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search employees, variations, tasks, timesheets, pages…"
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          <CommandEmpty>No matches</CommandEmpty>

          {canSearchOrg && live && (live.employees.length + live.variations.length + live.tasks.length + live.timesheets.length > 0) && (
            <>
              {live.employees.length > 0 && (
                <CommandGroup heading="Employees">
                  {live.employees.map((e) => (
                    <CommandItem key={`emp-${e.id}`} value={`emp ${e.label} ${e.sub}`} onSelect={() => go(`/org/employees/${e.id}` as any)}>
                      <div className="flex flex-col">
                        <span>{e.label}</span>
                        <span className="text-xs text-muted-foreground">{e.sub}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {live.variations.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Employment variations">
                    {live.variations.map((v) => (
                      <CommandItem key={`var-${v.id}`} value={`var ${v.label} ${v.sub}`} onSelect={() => go("/hr/variations")}>
                        <div className="flex flex-col">
                          <span>{v.label}</span>
                          <span className="text-xs text-muted-foreground">{v.sub}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
              {live.tasks.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Onboarding tasks">
                    {live.tasks.map((t) => (
                      <CommandItem key={`task-${t.id}`} value={`task ${t.label} ${t.sub}`} onSelect={() => go(`/org/onboarding/control-room/${t.assignment_id}` as any)}>
                        <div className="flex flex-col">
                          <span>{t.label}</span>
                          <span className="text-xs text-muted-foreground">{t.sub}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
              {live.timesheets.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Timesheets">
                    {live.timesheets.map((t) => (
                      <CommandItem key={`ts-${t.id}`} value={`ts ${t.label} ${t.sub}`} onSelect={() => go("/org/timesheet-review")}>
                        <div className="flex flex-col">
                          <span>{t.label}</span>
                          <span className="text-xs text-muted-foreground">{t.sub}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
              <CommandSeparator />
            </>
          )}

          {grouped.map(([group, items], idx) => (
            <div key={group}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((it) => (
                  <CommandItem
                    key={it.to + it.label}
                    value={`${it.label} ${it.keywords ?? ""}`}
                    onSelect={() => go(it.to)}
                  >
                    {it.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

