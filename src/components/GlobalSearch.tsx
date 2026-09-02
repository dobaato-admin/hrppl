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
import { NAV_DESTINATIONS } from "@/lib/nav-tree";

type Entry = {
  label: string;
  to: string;
  group: "Pages" | "How to";
  keywords?: string;
  feature?: Feature;
};

/**
 * The "Pages" group is generated from src/lib/nav-tree.ts — the same registry
 * the sidebar renders.
 *
 * W5 · It used to be a second, hand-maintained list of ~24 destinations with
 * its own gates, and the two had already drifted in both directions. Search
 * knew about ten /help/* how-to pages the sidebar had never heard of, and had
 * no entry at all for anything under Compliance or Insights — discipline,
 * medical, assets, offboarding, biometric, WFH approvals, geofences, analytics
 * and reports were all unsearchable. Where both did list a page they sometimes
 * disagreed about who could see it: Geofences was gated `settings.organization`
 * here and `org.geofences` in the nav, so HR saw the sidebar link and then
 * could not find the same page by searching for it.
 *
 * Generating the group removes the second registry rather than re-syncing it.
 */
const PAGE_ENTRIES: Entry[] = NAV_DESTINATIONS.map((d) => ({
  group: "Pages" as const,
  // Disambiguate rows whose titles only make sense beside their group in the
  // sidebar — "Dashboard" under Manager, "Organization" under Account.
  label: d.section ? `${d.title} — ${d.section}` : d.title,
  to: d.to,
  keywords: [d.keywords, d.group, d.section].filter(Boolean).join(" "),
  feature: d.feature,
}));

/**
 * How-to articles stay hand-authored: they are task-based help content, not
 * destinations in the tree, and there is nowhere else for them to come from.
 * Their parent, Knowledge hub, is in the generated group above.
 */
const HOWTO_ENTRIES: Entry[] = [
  {
    group: "How to",
    label: "Submit an expense claim",
    to: "/help/expense-claims",
    keywords: "receipt reimburse",
  },
  { group: "How to", label: "Apply for leave", to: "/help/apply-for-leave" },
  { group: "How to", label: "View and download payslips", to: "/help/view-payslips" },
  { group: "How to", label: "Complete your onboarding", to: "/help/complete-onboarding" },
  {
    group: "How to",
    label: "Invite a new employee",
    to: "/help/invite-employee",
    feature: "org.employees",
  },
  { group: "How to", label: "Approve leave & expense requests", to: "/help/manager-approvals" },
  {
    group: "How to",
    label: "Run a payroll cycle",
    to: "/help/run-payroll",
    feature: "settings.organization",
  },
  { group: "How to", label: "Run performance reviews", to: "/help/performance-reviews" },
  { group: "How to", label: "Reset your password", to: "/help/reset-password" },
  { group: "How to", label: "Use hrppl on your phone", to: "/help/mobile-access" },
  { group: "How to", label: "Raise a support ticket", to: "/help/raise-support-ticket" },
  {
    group: "How to",
    label: "First-time organization setup",
    to: "/help/admin-org-setup",
    feature: "settings.organization",
  },
  // Reachable only from search — it has no nav row and never had one.
  {
    group: "How to",
    label: "Org admin manual",
    to: "/help/org-admin-manual",
    keywords: "guide reference pdf",
  },
];

const ENTRIES: Entry[] = [...PAGE_ENTRIES, ...HOWTO_ENTRIES];

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

          {canSearchOrg &&
            live &&
            live.employees.length +
              live.variations.length +
              live.tasks.length +
              live.timesheets.length >
              0 && (
              <>
                {live.employees.length > 0 && (
                  <CommandGroup heading="Employees">
                    {live.employees.map((e) => (
                      <CommandItem
                        key={`emp-${e.id}`}
                        value={`emp ${e.label} ${e.sub}`}
                        onSelect={() => go(`/org/employees/${e.id}` as any)}
                      >
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
                        <CommandItem
                          key={`var-${v.id}`}
                          value={`var ${v.label} ${v.sub}`}
                          onSelect={() => go("/hr/variations")}
                        >
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
                        <CommandItem
                          key={`task-${t.id}`}
                          value={`task ${t.label} ${t.sub}`}
                          onSelect={() =>
                            go(`/org/onboarding/control-room/${t.assignment_id}` as any)
                          }
                        >
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
                        <CommandItem
                          key={`ts-${t.id}`}
                          value={`ts ${t.label} ${t.sub}`}
                          onSelect={() => go("/org/timesheet-review")}
                        >
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
