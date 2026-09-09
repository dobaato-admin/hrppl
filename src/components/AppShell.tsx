import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Settings,
  LogOut,
  Briefcase,
  User,
  ArrowLeft,
} from "lucide-react";
import { HelpMenu } from "@/components/HelpMenu";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuth } from "@/hooks/use-auth";
import { useMyTenantCountry } from "@/hooks/use-tenant";
import { ClockWidget } from "@/components/ClockWidget";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyOnboardingCompletion } from "@/lib/onboarding.functions";
import { getMyGateStatus } from "@/lib/org-signup.functions";
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
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { ActingTenantBanner } from "@/components/ActingTenantBanner";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { useState, createContext, useContext, type ReactNode } from "react";
import {
  MY_ITEMS,
  MY_SECTIONS,
  PRACTICE_ITEMS,
  MANAGER_ITEMS,
  NAV_ITEM_BY_PATH,
  roleShortcuts,
  ORG_ITEMS,
  ORG_SECTIONS,
  REGIONAL_ITEMS,
  SUPER_ADMIN_ITEMS,
  ACCOUNT_ITEMS,
  HELP_ITEMS,
  type NavItem,
  type NavSection,
} from "@/lib/nav-tree";

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

/**
 * A flat sidebar group rendered straight from the registry.
 *
 * Replaces five groups (Manager, Regional, Super admin, Account, Help) that
 * were hand-written JSX with `can()` wrapped around individual rows and, in
 * three cases, around the whole group. Those group-level wrappers were the
 * reason the Super admin group's twelve destinations carried no `feature` of
 * their own — the gate lived in the markup, so nothing that read the item
 * could see it. Every row now states its own key and the group hides itself
 * when none of them is visible, which is what FlyoutNavGroup already did.
 */
/**
 * Does this row apply to the tenant the user is in?
 *
 * A row with no `country` applies everywhere. A row that names countries
 * applies only to those — and while the answer is still loading (`undefined`)
 * or there is no tenant (`null`), it does NOT apply.
 *
 * That default is deliberate. The two ways to be wrong here are not
 * symmetrical: a country-gated row that is briefly missing corrects itself
 * when the query lands, whereas one that is briefly present is a link that
 * answers "Forbidden" if the user is quick enough to click it. Hiding until
 * certain is the only direction that cannot produce a dead link.
 */
/**
 * The three independent reasons a nav row may not be shown, in one place.
 *
 *   feature  — role visibility (`can`)
 *   hideWhen — a milestone has passed, so the row is spent
 *   country  — the tenant does not operate where this row applies
 *
 * Extracted because it had drifted: FlyoutNavGroup applied all three,
 * PlainNavGroup applied two (it never took `hidden` at all), and the
 * Organization flyout — the largest group in the product — was never passed
 * `hidden` by its caller. `hidden` being an optional prop meant every
 * `hideWhen` on an org row was silently ignored and nothing failed.
 *
 * One predicate, used by both components, so a filter added here cannot apply
 * to some groups and not others.
 */
export function isNavItemVisible(
  item: NavItem,
  roles: import("@/lib/rbac").AppRole[],
  hidden: Record<string, boolean> | undefined,
  tenantCountry: string | null | undefined,
): boolean {
  if (item.feature && !can(item.feature, roles)) return false;
  if (item.hideWhen && hidden?.[item.hideWhen]) return false;
  if (!appliesToCountry(item.country, tenantCountry)) return false;
  return true;
}

function appliesToCountry(country: string[] | undefined, tenantCountry: string | null | undefined) {
  if (!country) return true;
  if (!tenantCountry) return false;
  return country.includes(tenantCountry);
}

function PlainNavGroup({
  label,
  items,
  roles,
  hidden,
  tenantCountry,
}: {
  label: string;
  items: NavItem[];
  roles: import("@/lib/rbac").AppRole[];
  hidden?: Record<string, boolean>;
  tenantCountry?: string | null;
}) {
  const visible = items.filter((i) => isNavItemVisible(i, roles, hidden, tenantCountry));
  if (visible.length === 0) return null;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visible.map((item) => (
            <NavLinkButton key={item.to} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/**
 * "Your work" — the destinations this user's roles are actually for.
 *
 * Rendered from ROLE_PRIMARY, resolved against the canonical nav tree, and
 * filtered by the same can() every other row uses. A shortcut to a page the
 * caller cannot open is dropped rather than shown, so this surface cannot
 * reintroduce a dead link.
 */
function RoleShortcuts({ roles }: { roles: import("@/lib/rbac").AppRole[] }) {
  const items = roleShortcuts(roles, can);
  if (items.length === 0) return null;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Your work</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((d) => {
            const canonical = NAV_ITEM_BY_PATH[d.to];
            if (!canonical) return null;
            return <NavLinkButton key={`shortcut-${d.to}`} item={canonical} />;
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
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
  tenantCountry,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  accent: string;
  items: NavItem[];
  sections?: NavSection[];
  roles: import("@/lib/rbac").AppRole[];
  hidden?: Record<string, boolean>;
  tenantCountry?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // The same predicate PlainNavGroup uses. It was duplicated here, and the copy
  // drifted — see isNavItemVisible.
  const isVisible = (i: NavItem) => isNavItemVisible(i, roles, hidden, tenantCountry);

  // These two are what the popover renders. They used to be computed and then
  // used only for "should this group appear at all" and the active highlight,
  // while the popover body mapped over the RAW `items` and `sections` props —
  // so every row in every flyout was offered to every role, whatever its
  // feature key said. The gate on the page then refused. That is the dead-link
  // shape W5 spent two waves removing, hiding one level below the nav DATA the
  // tests read. tests/nav-render-filter.test.ts pins it now.
  const visibleItems = items.filter(isVisible);
  const visibleSections = (sections ?? [])
    // A subgroup can be country-scoped as a whole, which is how "Australian
    // compliance" is absent rather than empty for a Nepali tenant. Checked
    // before the items so the heading disappears with its contents.
    .filter((s) => appliesToCountry(s.country, tenantCountry))
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
                    {visibleItems.map((item) => {
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

                  {visibleSections.length ? (
                    <Accordion
                      type="multiple"
                      defaultValue={visibleSections
                        .filter((section) =>
                          section.items.some(
                            (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
                          ),
                        )
                        .map((section) => section.title)}
                      className="rounded-md border bg-background"
                    >
                      {visibleSections.map((section) => {
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
  // Same five-minute cache and the same reason: the shell re-renders on every
  // navigation and these answers change roughly once in an organisation's life.
  const fetchGate = useServerFn(getMyGateStatus);
  const { data: gate } = useQuery({
    queryKey: ["nav-gate-status", user?.id],
    queryFn: () => fetchGate(),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
  const hiddenNavItems = {
    onboardingComplete: !!onboarding?.complete,
    orgCreated: !!gate?.orgCreated,
    orgActivated: !!gate?.orgActivated,
  };
  // Drives `country` on nav items and sections. Follows the acting tenant for
  // platform accounts, so switching tenant switches which compliance domain
  // the sidebar offers.
  const { country: tenantCountry } = useMyTenantCountry();
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
            tenantCountry={tenantCountry}
          />

          <FlyoutNavGroup
            label="Practice"
            icon={Briefcase}
            accent="bg-status-working"
            roles={roles}
            items={PRACTICE_ITEMS}
            hidden={hiddenNavItems}
            tenantCountry={tenantCountry}
          />

          {/* W5 · Was a hardcoded "Manager" group serving exactly one role.
              Every role now gets the four or so destinations it actually works
              in, at the top level instead of three deep inside a flyout —
              "Run payroll" was Organization -> Payroll -> Run payroll for the
              role whose whole job it is. */}
          <RoleShortcuts roles={roles} />

          {/*
            Regrouped per docs/w4-information-architecture-design.md (W4):
            the old shape was Team/Leave & time/Payroll/Operations/Insights/
            Compliance, with Operations alone holding 17 unrelated items in
            one flat, unscrollable-feeling list. Nothing here changes who can
            already reach a page that already had a nav entry — only which
            subgroup lists it, plus a handful of newly-added rows for pages
            that had no nav entry at all (each marked below).
          */}
          <FlyoutNavGroup
            label="Organization"
            icon={Building2}
            accent="bg-status-working"
            roles={roles}
            items={ORG_ITEMS}
            sections={ORG_SECTIONS}
            hidden={hiddenNavItems}
            tenantCountry={tenantCountry}
          />

          <PlainNavGroup
            label="Regional"
            items={REGIONAL_ITEMS}
            roles={roles}
            hidden={hiddenNavItems}
            tenantCountry={tenantCountry}
          />
          <PlainNavGroup
            label="Super admin"
            items={SUPER_ADMIN_ITEMS}
            roles={roles}
            hidden={hiddenNavItems}
            tenantCountry={tenantCountry}
          />
          <PlainNavGroup
            label="Account"
            items={ACCOUNT_ITEMS}
            roles={roles}
            hidden={hiddenNavItems}
            tenantCountry={tenantCountry}
          />
          <PlainNavGroup
            label="Help"
            items={HELP_ITEMS}
            roles={roles}
            hidden={hiddenNavItems}
            tenantCountry={tenantCountry}
          />
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
              <TenantSwitcher />
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
        <ActingTenantBanner />
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Clocking in is the first thing most people do each day and the one
          action every downstream number depends on, so it lives here rather
          than three navigation steps into a 101-item sidebar. Rendered inside
          ShellInner, which runs exactly once per page even when child routes
          nest their own AppShell, so there is never a second widget. It hides
          itself for accounts with no employee record. */}
      <ClockWidget />
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
