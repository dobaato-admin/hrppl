import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Sparkles,
  GraduationCap,
  Receipt,
  Bell,
  Building2,
  Globe2,
  ShieldCheck,
  Settings,
  LogOut,
  BookOpen,
  Users,
  Briefcase,
  FolderKanban,
  ListChecks,
  Clock,
  FileText,
  PlugZap,
  Palette,
  DollarSign,
  Inbox,
  UserCircle,
  CreditCard,
  User,
  FileSignature,
  Wallet,
  UserSearch,
  Fingerprint,
  MapPin,
  Trophy,
  BadgeCheck,
  TrendingUp,
  Gavel,
  ShieldAlert,
  Package,
  DoorOpen,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { HelpMenu } from "@/components/HelpMenu";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyOnboardingCompletion } from "@/lib/onboarding.functions";
import { can, type Feature } from "@/lib/rbac";
import { supabase } from "@/integrations/supabase/client";
import hrpplIcon from "@/assets/hrppl-icon.webp";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationsBell } from "@/components/NotificationsBell";
import { MfaEnforcementBanner } from "@/components/security/MfaEnforcementBanner";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { useState, createContext, useContext, type ReactNode } from "react";

type NavItem = {
  title: string;
  to: string;
  icon: typeof LayoutDashboard;
  accent: string; // Monday-style colored icon chip
  feature?: Feature; // if set, only roles with this feature see the item
  /**
   * Hide once a piece of work is finished, so completed tasks stop looking
   * outstanding (§1 #1). Role gating uses `feature`; this is for state.
   */
  hideWhen?: "onboardingComplete";
};

type NavSection = {
  title: string;
  icon: typeof LayoutDashboard;
  accent: string;
  items: NavItem[];
};

/**
 * Personal navigation (§1 #3).
 *
 * This was a flat list of 24 links with no hierarchy — the "features listed
 * with no hierarchy" the plan describes. Only the two genuine landing pages
 * stay at the top level; everything else is grouped by what the person is
 * trying to do, so the list is scannable rather than exhaustive.
 *
 * Grouping is not deduplication: /performance (goals and 360 feedback) and
 * /me/reviews (scheduled KPI scorecards) look like duplicates in a flat list
 * but are different surfaces. Sitting them together under Growth makes the
 * distinction visible instead of hiding it.
 */
const MY_ITEMS: NavItem[] = [
  { title: "Home", to: "/dashboard", icon: LayoutDashboard, accent: "bg-status-info" },
  { title: "Me", to: "/me", icon: User, accent: "bg-primary" },
];

const MY_SECTIONS: NavSection[] = [
  {
    title: "Profile",
    icon: UserCircle,
    accent: "bg-status-info",
    items: [
      { title: "Contact details", to: "/me/contact", icon: UserCircle, accent: "bg-status-info" },
      { title: "Banking & tax", to: "/me/banking-tax", icon: DollarSign, accent: "bg-status-done" },
      { title: "Directory", to: "/me/directory", icon: Users, accent: "bg-status-working" },
      { title: "Security", to: "/me/security", icon: ShieldCheck, accent: "bg-status-stuck" },
    ],
  },
  {
    title: "Time & leave",
    icon: CalendarDays,
    accent: "bg-status-done",
    items: [
      { title: "My leave", to: "/leave", icon: CalendarDays, accent: "bg-status-done" },
      { title: "Attendance", to: "/attendance", icon: ClipboardCheck, accent: "bg-status-working" },
      { title: "My TOIL", to: "/me/toil", icon: Clock, accent: "bg-status-working" },
    ],
  },
  {
    title: "Pay & expenses",
    icon: Receipt,
    accent: "bg-primary",
    items: [
      { title: "My payslips", to: "/my-payslips", icon: Receipt, accent: "bg-primary" },
      { title: "My expenses", to: "/me/expenses", icon: Wallet, accent: "bg-status-done" },
    ],
  },
  {
    title: "Growth",
    icon: Sparkles,
    accent: "bg-accent",
    items: [
      { title: "My performance", to: "/performance", icon: Sparkles, accent: "bg-accent" },
      { title: "My scorecards", to: "/me/reviews", icon: Sparkles, accent: "bg-status-working" },
      { title: "My duties", to: "/me/duties", icon: ClipboardCheck, accent: "bg-accent" },
      {
        title: "Duty self-review",
        to: "/me/duty-self-review",
        icon: Sparkles,
        accent: "bg-status-pending",
      },
      { title: "My training", to: "/me/training", icon: BookOpen, accent: "bg-status-info" },
      { title: "Recognition", to: "/recognition", icon: Trophy, accent: "bg-accent" },
    ],
  },
  {
    title: "Records & requests",
    icon: FileText,
    accent: "bg-status-pending",
    items: [
      {
        title: "Onboarding",
        to: "/onboarding",
        icon: GraduationCap,
        accent: "bg-status-info",
        hideWhen: "onboardingComplete",
      },
      { title: "My requests", to: "/me/requests", icon: Inbox, accent: "bg-status-pending" },
      { title: "My documents", to: "/me/documents", icon: FileSignature, accent: "bg-status-info" },
      {
        title: "Signatures",
        to: "/me/signatures",
        icon: FileSignature,
        accent: "bg-status-pending",
      },
      { title: "My assets", to: "/me/assets", icon: Package, accent: "bg-status-working" },
      { title: "My record", to: "/me/timeline", icon: FileText, accent: "bg-accent" },
      { title: "Grievances", to: "/me/grievances", icon: ShieldAlert, accent: "bg-status-pending" },
    ],
  },
];

function NavLinkButton({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === item.to || pathname.startsWith(item.to + "/");
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
        <Link to={item.to} className="group" onClick={onNavigate}>
          <span
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${item.accent}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function FlyoutNavGroup({
  label,
  icon: GroupIcon,
  accent,
  items,
  sections,
  roles,
  hidden,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  accent: string;
  items: NavItem[];
  sections?: NavSection[];
  roles: import("@/lib/rbac").AppRole[];
  hidden?: Record<string, boolean>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Two independent filters: `feature` is role visibility, `hideWhen` is
  // completion state. An item must pass both.
  const isVisible = (i: NavItem) =>
    (!i.feature || can(i.feature, roles)) && !(i.hideWhen && hidden?.[i.hideWhen]);

  const visibleItems = items.filter(isVisible);
  const visibleSections = (sections ?? [])
    .map((s) => ({ ...s, items: s.items.filter(isVisible) }))
    .filter((s) => s.items.length > 0);

  // Hide the whole group if nothing in it is visible to this user.
  if (visibleItems.length === 0 && visibleSections.length === 0) return null;

  const active =
    visibleItems.some((i) => pathname === i.to || pathname.startsWith(i.to + "/")) ||
    visibleSections.some((section) =>
      section.items.some((item) => pathname === item.to || pathname.startsWith(item.to + "/")),
    );
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <SidebarMenuButton isActive={active} tooltip={label}>
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${accent}`}
                  >
                    <GroupIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 font-medium">{label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="start"
                sideOffset={8}
                collisionPadding={12}
                className="w-[min(20rem,calc(100vw-2rem))] max-w-[20rem] p-1.5"
              >
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="max-h-[75vh] space-y-1 overflow-y-auto pr-1">
                  <div className="flex flex-col gap-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const itemActive = pathname === item.to || pathname.startsWith(item.to + "/");
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
                            itemActive ? "bg-accent/60 font-medium" : ""
                          }`}
                        >
                          <span
                            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${item.accent}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {sections?.length ? (
                    <Accordion
                      type="multiple"
                      defaultValue={sections
                        .filter((section) =>
                          section.items.some(
                            (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
                          ),
                        )
                        .map((section) => section.title)}
                      className="rounded-md border bg-background"
                    >
                      {sections.map((section) => {
                        const SectionIcon = section.icon;
                        const sectionActive = section.items.some(
                          (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
                        );

                        return (
                          <AccordionItem
                            key={section.title}
                            value={section.title}
                            className="border-border/70 px-1"
                          >
                            <AccordionTrigger
                              className={`rounded-md px-2 py-2 text-sm hover:bg-accent/40 hover:no-underline ${
                                sectionActive ? "bg-accent/40" : ""
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${section.accent}`}
                                >
                                  <SectionIcon className="h-3.5 w-3.5" />
                                </span>
                                <span className="font-medium">{section.title}</span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-2">
                              <div className="flex flex-col gap-0.5 pl-2">
                                {section.items.map((item) => {
                                  const Icon = item.icon;
                                  const itemActive =
                                    pathname === item.to || pathname.startsWith(item.to + "/");

                                  return (
                                    <Link
                                      key={item.to}
                                      to={item.to}
                                      onClick={() => setOpen(false)}
                                      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
                                        itemActive ? "bg-accent/60 font-medium" : ""
                                      }`}
                                    >
                                      <span
                                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${item.accent}`}
                                      >
                                        <Icon className="h-3 w-3" />
                                      </span>
                                      <span className="truncate">{item.title}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function CrumbsAndTitle({ title, subtitle }: { title?: string; subtitle?: string }) {
  // A layout-level shell has no title of its own; render nothing rather than an
  // empty heading, which screen readers announce as a blank level-1.
  if (!title) return null;
  return (
    <div className="flex min-w-0 flex-col">
      <h1 className="font-display truncate text-base font-semibold leading-tight tracking-tight md:text-lg">
        {title}
      </h1>
      {subtitle ? <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function HeaderUserChip({
  email,
  roles,
  rolesLoaded,
}: {
  email: string;
  roles: string[];
  rolesLoaded: boolean;
}) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      {!rolesLoaded ? (
        <Badge variant="outline" className="text-muted-foreground">
          Loading role…
        </Badge>
      ) : roles.length === 0 ? (
        <Badge variant="outline" className="border-status-stuck text-status-stuck">
          No role
        </Badge>
      ) : (
        roles.slice(0, 2).map((r) => (
          <Badge
            key={r}
            className="border-0 bg-accent text-accent-foreground capitalize"
            variant="secondary"
          >
            {r.replace("_", " ")}
          </Badge>
        ))
      )}
      <span className="max-w-[14rem] truncate text-xs text-muted-foreground">{email}</span>
    </div>
  );
}

export interface AppShellProps {
  /**
   * Optional so a LAYOUT route can provide the chrome without claiming a title
   * of its own — org.tsx wraps eight different pages, none of which is "the org
   * page". The page supplies the title; passing "" instead rendered an empty
   * <h1> in the top bar.
   */
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function ShellInner({ title, subtitle, actions, children }: AppShellProps) {
  const { user, roles, rolesLoaded } = useAuth();

  // Drives `hideWhen` on nav items. Cached for five minutes because the shell
  // re-renders on every navigation and this answer changes rarely.
  const fetchOnboarding = useServerFn(getMyOnboardingCompletion);
  const { data: onboarding } = useQuery({
    queryKey: ["nav-onboarding-completion", user?.id],
    queryFn: () => fetchOnboarding(),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
  const hiddenNavItems = { onboardingComplete: !!onboarding?.complete };
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBackToDashboard = pathname !== "/dashboard" && pathname !== "/";

  // (Section visibility is driven by can(); raw role booleans no longer needed.)

  async function signOut() {
    try {
      const { clearMfaSessionVerified } = await import("@/lib/mfa-session");
      clearMfaSessionVerified();
    } catch {
      /* ignore */
    }
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-glow">
              <img
                src={hrpplIcon}
                alt="hrppl"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </span>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
                  hrppl
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/60">
                  Empower your people
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <FlyoutNavGroup
            label="My workspace"
            icon={User}
            accent="bg-primary"
            roles={roles}
            items={MY_ITEMS}
            sections={MY_SECTIONS}
            hidden={hiddenNavItems}
          />

          <FlyoutNavGroup
            label="Practice"
            icon={Briefcase}
            accent="bg-status-working"
            roles={roles}
            items={[
              {
                title: "My time",
                to: "/practice/time",
                icon: Clock,
                accent: "bg-status-info",
                feature: "practice.console",
              },
              {
                title: "Clients",
                to: "/practice/clients",
                icon: Briefcase,
                accent: "bg-primary",
                feature: "practice.console",
              },
              {
                title: "Projects",
                to: "/practice/projects",
                icon: FolderKanban,
                accent: "bg-status-working",
                feature: "practice.console",
              },
              {
                title: "Jobs",
                to: "/practice/jobs",
                icon: ListChecks,
                accent: "bg-status-info",
                feature: "practice.console",
              },
              {
                title: "Invoices",
                to: "/practice/invoices",
                icon: FileText,
                accent: "bg-status-done",
                feature: "practice.console",
              },
            ]}
          />

          {(can("manager.team", roles) || can("manager.requestsInbox", roles)) && (
            <SidebarGroup>
              <SidebarGroupLabel>Manager</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {can("manager.team", roles) && (
                    <NavLinkButton
                      item={{
                        title: "Dashboard",
                        to: "/team",
                        icon: Users,
                        accent: "bg-status-working",
                      }}
                    />
                  )}
                  {/* "Team" link removed — it duplicates Organization → Team → Team members.
                      Managers without org_admin still reach it through the Organization flyout. */}
                  {can("manager.requestsInbox", roles) && (
                    <NavLinkButton
                      item={{
                        title: "Requests inbox",
                        to: "/admin/requests",
                        icon: Inbox,
                        accent: "bg-status-pending",
                      }}
                    />
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <FlyoutNavGroup
            label="Organization"
            icon={Building2}
            accent="bg-status-working"
            roles={roles}
            items={[
              {
                title: "Org console",
                to: "/org",
                icon: Building2,
                accent: "bg-status-working",
                feature: "org.console",
              },
              {
                title: "Setup wizard",
                to: "/org/setup",
                icon: Settings,
                accent: "bg-status-pending",
                feature: "org.setup",
              },
              {
                title: "Branches",
                to: "/org/branches",
                icon: Building2,
                accent: "bg-status-info",
                feature: "org.branches",
              },
            ]}
            sections={[
              {
                title: "Team",
                icon: Users,
                accent: "bg-primary",
                items: [
                  {
                    title: "Employees",
                    to: "/org/employees",
                    icon: Users,
                    accent: "bg-primary",
                    feature: "org.employees",
                  },
                  {
                    title: "Team members",
                    to: "/admin/teams",
                    icon: Users,
                    accent: "bg-primary",
                    feature: "org.teams",
                  },
                  {
                    title: "Invite staff",
                    to: "/org/invitations",
                    icon: Users,
                    accent: "bg-status-info",
                    feature: "org.invitations",
                  },
                  {
                    title: "Roles & permissions",
                    to: "/org/roles",
                    icon: Users,
                    accent: "bg-primary",
                    feature: "org.roles",
                  },
                  {
                    title: "Team assignments",
                    to: "/admin/team-assignments",
                    icon: Users,
                    accent: "bg-status-working",
                    feature: "org.teamAssignments",
                  },
                  {
                    title: "Departments",
                    to: "/admin/departments",
                    icon: Building2,
                    accent: "bg-status-info",
                    feature: "org.departments",
                  },
                  {
                    title: "Designations",
                    to: "/admin/designations",
                    icon: BadgeCheck,
                    accent: "bg-status-pending",
                    feature: "org.designations",
                  },
                  {
                    title: "Recruitment",
                    to: "/org/recruitment",
                    icon: UserSearch,
                    accent: "bg-accent",
                    feature: "org.recruitment",
                  },
                ],
              },
              {
                title: "Leave & time",
                icon: CalendarDays,
                accent: "bg-status-done",
                items: [
                  {
                    title: "Leave management",
                    to: "/org/leave",
                    icon: CalendarDays,
                    accent: "bg-status-done",
                    feature: "org.leaveTypes",
                  },
                  {
                    title: "Timesheets",
                    to: "/org/timesheets",
                    icon: Clock,
                    accent: "bg-status-working",
                    feature: "org.requests",
                  },
                  {
                    title: "Leave types",
                    to: "/admin/leave-types",
                    icon: CalendarDays,
                    accent: "bg-status-done",
                    feature: "org.leaveTypes",
                  },
                  {
                    title: "Holiday calendars",
                    to: "/admin/holiday-categories",
                    icon: CalendarDays,
                    accent: "bg-status-info",
                    feature: "org.holidayCalendars",
                  },
                  {
                    title: "Public holidays",
                    to: "/admin/holidays",
                    icon: CalendarDays,
                    accent: "bg-status-pending",
                    feature: "org.publicHolidays",
                  },
                  {
                    title: "TOIL admin",
                    to: "/admin/toil",
                    icon: Clock,
                    accent: "bg-status-working",
                    feature: "org.leaveTypes",
                  },
                ],
              },
              {
                title: "Payroll",
                icon: DollarSign,
                accent: "bg-primary",
                items: [
                  {
                    title: "Run payroll",
                    to: "/org/payroll",
                    icon: DollarSign,
                    accent: "bg-primary",
                    feature: "org.payroll",
                  },
                  {
                    title: "Pay rates",
                    to: "/org/pay-rates",
                    icon: DollarSign,
                    accent: "bg-primary",
                    feature: "org.payRates",
                  },
                  {
                    title: "Overtime rates",
                    to: "/admin/overtime-rates",
                    icon: Clock,
                    accent: "bg-status-working",
                    feature: "org.overtimeRates",
                  },
                  {
                    title: "Promotions",
                    to: "/org/promotions",
                    icon: TrendingUp,
                    accent: "bg-status-done",
                    feature: "org.promotions",
                  },
                  {
                    title: "Payroll setup",
                    to: "/admin/payroll-setup",
                    icon: DollarSign,
                    accent: "bg-status-done",
                    feature: "org.payrollSetup",
                  },
                  {
                    title: "Payroll settings",
                    to: "/admin/payroll-settings",
                    icon: DollarSign,
                    accent: "bg-primary",
                    feature: "org.payrollSettings",
                  },
                  {
                    title: "Payslip templates",
                    to: "/admin/payslip-templates",
                    icon: Receipt,
                    accent: "bg-status-info",
                    feature: "org.payslipTemplates",
                  },
                ],
              },
              {
                title: "Operations",
                icon: FileSignature,
                accent: "bg-status-info",
                items: [
                  {
                    title: "Onboarding admin",
                    to: "/org/onboarding",
                    icon: GraduationCap,
                    accent: "bg-status-info",
                    feature: "org.console",
                  },
                  {
                    title: "Onboarding tracker",
                    to: "/org/onboarding/tracker",
                    icon: ClipboardCheck,
                    accent: "bg-status-working",
                    feature: "org.console",
                  },
                  {
                    title: "AU STP2 & Payday Super audit",
                    to: "/admin/au-stp-audit",
                    icon: ShieldAlert,
                    accent: "bg-status-stuck",
                    feature: "org.console",
                  },
                  {
                    title: "Performance reviews",
                    to: "/org/performance",
                    icon: Sparkles,
                    accent: "bg-accent",
                    feature: "org.performance",
                  },
                  {
                    title: "Missing info requests",
                    to: "/admin/id-requests",
                    icon: Inbox,
                    accent: "bg-status-pending",
                    feature: "org.idRequests",
                  },
                  {
                    title: "Documents",
                    to: "/org/documents",
                    icon: FileSignature,
                    accent: "bg-status-info",
                    feature: "org.documents",
                  },
                  {
                    title: "Expenses",
                    to: "/org/expenses",
                    icon: Wallet,
                    accent: "bg-status-done",
                    feature: "org.expenses",
                  },
                  {
                    title: "Training",
                    to: "/org/training",
                    icon: BookOpen,
                    accent: "bg-status-info",
                    feature: "org.training",
                  },
                  {
                    title: "Training catalog",
                    to: "/admin/training",
                    icon: GraduationCap,
                    accent: "bg-accent",
                    feature: "org.trainingCatalog",
                  },
                  {
                    title: "Feedback templates",
                    to: "/admin/feedback-templates",
                    icon: Sparkles,
                    accent: "bg-accent",
                    feature: "org.feedbackTemplates",
                  },
                  {
                    title: "Review templates",
                    to: "/admin/review-templates",
                    icon: ClipboardCheck,
                    accent: "bg-status-working",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "KPI & KRA library",
                    to: "/admin/kpi-kra",
                    icon: Sparkles,
                    accent: "bg-accent",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "Duties & responsibilities",
                    to: "/admin/employee-duties",
                    icon: ClipboardCheck,
                    accent: "bg-status-working",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "Duty-based KPI review",
                    to: "/admin/duty-reviews",
                    icon: TrendingUp,
                    accent: "bg-status-info",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "Review cycles",
                    to: "/admin/review-cycles",
                    icon: TrendingUp,
                    accent: "bg-status-pending",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "Per-employee holidays",
                    to: "/admin/employee-holidays",
                    icon: ClipboardCheck,
                    accent: "bg-accent",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "Review analytics",
                    to: "/admin/review-analytics",
                    icon: TrendingUp,
                    accent: "bg-status-info",
                    feature: "org.reviewTemplates",
                  },
                  {
                    title: "Templates Hub",
                    to: "/admin/templates",
                    icon: ClipboardCheck,
                    accent: "bg-accent",
                    feature: "org.reviewTemplates",
                  },
                ],
              },
              {
                title: "Insights",
                icon: TrendingUp,
                accent: "bg-status-working",
                items: [
                  {
                    title: "Analytics",
                    to: "/org/analytics",
                    icon: TrendingUp,
                    accent: "bg-status-working",
                    feature: "org.analytics",
                  },
                  {
                    title: "Reports",
                    to: "/org/reports",
                    icon: FileText,
                    accent: "bg-status-info",
                    feature: "org.reports",
                  },
                ],
              },
              {
                title: "Compliance",
                icon: ShieldAlert,
                accent: "bg-status-stuck",
                items: [
                  {
                    title: "Discipline & grievances",
                    to: "/admin/discipline",
                    icon: Gavel,
                    accent: "bg-status-stuck",
                    feature: "org.discipline",
                  },
                  {
                    title: "Medical incidents",
                    to: "/admin/medical",
                    icon: ShieldAlert,
                    accent: "bg-status-stuck",
                    feature: "org.medical",
                  },
                  {
                    title: "Asset register",
                    to: "/admin/assets",
                    icon: Package,
                    accent: "bg-status-working",
                    feature: "org.assets",
                  },
                  {
                    title: "Exit & offboarding",
                    to: "/admin/offboarding",
                    icon: DoorOpen,
                    accent: "bg-status-pending",
                    feature: "org.offboarding",
                  },
                  {
                    title: "Biometric devices",
                    to: "/admin/biometric",
                    icon: Fingerprint,
                    accent: "bg-status-working",
                    feature: "org.biometric",
                  },
                  {
                    title: "Signing geofences",
                    to: "/admin/geofences",
                    icon: MapPin,
                    accent: "bg-status-pending",
                    feature: "org.geofences",
                  },
                  {
                    title: "White-label",
                    to: "/org/white-label",
                    icon: Palette,
                    accent: "bg-accent",
                    feature: "org.whiteLabel",
                  },
                ],
              },
            ]}
          />

          {can("regional.console", roles) && (
            <SidebarGroup>
              <SidebarGroupLabel>Regional</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavLinkButton
                    item={{
                      title: "Regional console",
                      to: "/regional",
                      icon: Globe2,
                      accent: "bg-status-info",
                    }}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {can("platform.admin", roles) && (
            <SidebarGroup>
              <SidebarGroupLabel>Super admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavLinkButton
                    item={{
                      title: "Platform admin",
                      to: "/admin",
                      icon: ShieldCheck,
                      accent: "bg-status-stuck",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Tenants",
                      to: "/platform/tenants",
                      icon: Building2,
                      accent: "bg-status-info",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "FX rates",
                      to: "/platform/fx",
                      icon: DollarSign,
                      accent: "bg-status-done",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Leads",
                      to: "/platform/leads",
                      icon: Inbox,
                      accent: "bg-status-working",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Trial invitations",
                      to: "/platform/invitations",
                      icon: UserCircle,
                      accent: "bg-status-pending",
                    }}
                  />

                  <NavLinkButton
                    item={{
                      title: "API reference",
                      to: "/admin/api-docs",
                      icon: BookOpen,
                      accent: "bg-primary",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Blog CMS",
                      to: "/admin/blog",
                      icon: FileText,
                      accent: "bg-status-info",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Blog API & webhooks",
                      to: "/admin/blog-integrations",
                      icon: PlugZap,
                      accent: "bg-accent",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Security findings",
                      to: "/admin/security",
                      icon: ShieldCheck,
                      accent: "bg-status-stuck",
                    }}
                  />
                  <NavLinkButton
                    item={{
                      title: "Diagnostics",
                      to: "/admin/diagnostics",
                      icon: Sparkles,
                      accent: "bg-status-working",
                    }}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavLinkButton
                  item={{
                    title: "Profile",
                    to: "/settings/profile",
                    icon: UserCircle,
                    accent: "bg-status-info",
                  }}
                />
                {can("settings.organization", roles) && (
                  <NavLinkButton
                    item={{
                      title: "Organization",
                      to: "/settings/organization",
                      icon: Building2,
                      accent: "bg-primary",
                    }}
                  />
                )}
                {can("settings.billing", roles) && (
                  <NavLinkButton
                    item={{
                      title: "Billing",
                      to: "/settings/billing",
                      icon: CreditCard,
                      accent: "bg-status-done",
                    }}
                  />
                )}

                <NavLinkButton
                  item={{
                    title: "Notifications",
                    to: "/settings/notifications",
                    icon: Bell,
                    accent: "bg-status-pending",
                  }}
                />
                <NavLinkButton
                  item={{
                    title: "Account & sign-in",
                    to: "/settings/account",
                    icon: UserCircle,
                    accent: "bg-status-working",
                  }}
                />
                {can("org.danger", roles) && (
                  <NavLinkButton
                    item={{
                      title: "Danger zone",
                      to: "/org/danger",
                      icon: AlertTriangle,
                      accent: "bg-destructive",
                    }}
                  />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Help</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavLinkButton
                  item={{
                    title: "Knowledge hub",
                    to: "/help",
                    icon: HelpCircle,
                    accent: "bg-accent",
                  }}
                />
                {can("platform.admin", roles) && (
                  <NavLinkButton
                    item={{
                      title: "Knowledge editor",
                      to: "/admin/knowledge",
                      icon: BookOpen,
                      accent: "bg-status-info",
                    }}
                  />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Account">
                <Link to="/settings/account">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                    <Settings className="h-3.5 w-3.5" />
                  </span>
                  <span>Account</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} tooltip="Sign out">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </span>
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
          <div className="h-0.5 w-full bg-gradient-brand" />
          <div className="flex h-14 items-center gap-3 px-4">
            <SidebarTrigger className="min-h-9 min-w-9" />
            <div className="h-6 w-px bg-border" />
            {showBackToDashboard ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                data-testid="back-to-dashboard"
              >
                <Link to="/dashboard" aria-label="Back to dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
            ) : null}
            <CrumbsAndTitle title={title} subtitle={subtitle} />
            <div className="ml-auto flex items-center gap-1.5">
              {actions}
              <GlobalSearch />
              <HelpMenu />
              <NotificationsBell />
              <HeaderUserChip email={user?.email ?? ""} roles={roles} rolesLoaded={rolesLoaded} />
              <Button
                variant="ghost"
                size="icon"
                className="min-h-9 min-w-9 md:hidden"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hidden min-h-9 min-w-9 md:inline-flex"
                aria-label="Settings"
              >
                <Link to="/settings/notifications">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <MfaEnforcementBanner />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

/**
 * True once an AppShell is already rendering above us.
 *
 * Layout routes (me.tsx, org.tsx, org.documents.tsx, org.recruitment.tsx) render
 * an AppShell around their <Outlet />, and roughly half their child pages
 * render one too. That produced a full second chrome — sidebar, header, search,
 * notification bell, role chips — stacked inside the first, which is the
 * "dashboard inside a dashboard" in §1 #10.
 *
 * Fixing it by deleting <AppShell> from the children would silently drop each
 * page's title, and the split is close to 50/50 so there is no safe bulk edit.
 * Making the shell aware of its own nesting fixes every case at once and stops
 * the bug returning the next time a page is moved under a layout.
 */
const InsideAppShell = createContext(false);

export function AppShell(props: AppShellProps) {
  const alreadyInsideShell = useContext(InsideAppShell);

  // Nested: the chrome is already on screen. Contribute only the page heading,
  // so the child keeps its title, subtitle and actions.
  if (alreadyInsideShell) {
    return (
      <>
        {props.title ? (
          <PageHeader title={props.title} subtitle={props.subtitle} actions={props.actions} />
        ) : null}
        {props.children}
      </>
    );
  }

  return (
    <InsideAppShell.Provider value={true}>
      <SidebarProvider>
        <ShellInner {...props} />
      </SidebarProvider>
    </InsideAppShell.Provider>
  );
}
