import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  CreditCard,
  DollarSign,
  DoorOpen,
  FileSignature,
  FileText,
  Fingerprint,
  FolderKanban,
  Gavel,
  Globe2,
  GraduationCap,
  HelpCircle,
  House,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Package,
  Palette,
  PlugZap,
  Receipt,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  UserCircle,
  UserCog,
  UserSearch,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AppRole, Feature } from "@/lib/rbac";

/**
 * The navigation tree — one registry, read by everything that needs it.
 *
 * ---------------------------------------------------------------------------
 * Why this file exists (W5 · P0-2)
 * ---------------------------------------------------------------------------
 *
 * The sidebar used to be authored inline in AppShell.tsx and *again*, by hand,
 * in GlobalSearch.tsx. They had already drifted: search knew about ten
 * /help/* pages the sidebar had never heard of, and had no entry at all for
 * anything under Compliance or Insights — ten admin destinations that simply
 * could not be found by searching for them.
 *
 * Both now read this file. Adding a destination is one edit in one place.
 *
 * `feature` is the single gate declaration. The same key is quoted by the route
 * file's `<AdminGate feature="…">`, so the sidebar and the page resolve the
 * same role set out of the same MATRIX entry and cannot disagree.
 * tests/nav-route-gate-parity.test.ts fails the build if they ever do.
 *
 * Ordering here IS the sidebar order. Keep groups and items in the sequence
 * they should render.
 */

export type NavItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  /** Monday-style coloured icon chip. */
  accent: string;
  /** If set, only roles with this feature see the item. */
  feature?: Feature;
  /**
   * Hide once a piece of work is finished, so completed tasks stop looking
   * outstanding. Role gating uses `feature`; this is for state.
   */
  hideWhen?: "onboardingComplete";
  /**
   * Render only for tenants in these ISO country codes. Omitted means every
   * country. Country-specific compliance surfaces (Australian STP2 and Payday
   * Super, Nepal payroll) are meaningless — and misleading — to a tenant
   * elsewhere, and a data field means the next country is a data change rather
   * than another hardcoded `country_code === "AU"` branch.
   */
  country?: string[];
  /**
   * Roles that may open the page but not change anything on it. The row
   * renders and the route admits them; the page hides its mutations.
   *
   * This exists because some destinations have no honest allow/deny answer.
   * Public holidays is the case that forced it: every employee has a
   * legitimate reason to look at the holiday calendar, and none to edit it.
   * Gating the page to admins made the nav row a dead link for four roles;
   * gating it to everyone would have let anyone rewrite the calendar.
   */
  readOnlyFor?: AppRole[];
  /**
   * Extra search synonyms for GlobalSearch. The sidebar shows `title`; someone
   * searching may reasonably type something else ("clock in" for Attendance,
   * "kudos" for Recognition). Carried here so search and the sidebar cannot
   * describe the same destination differently.
   */
  keywords?: string;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  accent: string;
  items: NavItem[];
};

// ---------------------------------------------------------------------------
// My workspace
// ---------------------------------------------------------------------------

/**
 * Personal navigation.
 *
 * This was a flat list of 24 links with no hierarchy. Only the two genuine
 * landing pages stay at the top level; everything else is grouped by what the
 * person is trying to do, so the list is scannable rather than exhaustive.
 *
 * Grouping is not deduplication: /performance (goals and 360 feedback) and
 * /me/reviews (scheduled KPI scorecards) look like duplicates in a flat list
 * but are different surfaces. Sitting them together under Growth makes the
 * distinction visible instead of hiding it.
 */
export const MY_ITEMS: NavItem[] = [
  {
    title: "Home",
    to: "/dashboard",
    icon: LayoutDashboard,
    accent: "bg-status-info",
    keywords: "home overview",
  },
  { title: "Me", to: "/me", icon: User, accent: "bg-primary", keywords: "personal profile" },
];

export const MY_SECTIONS: NavSection[] = [
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
      {
        title: "My leave",
        to: "/leave",
        icon: CalendarDays,
        accent: "bg-status-done",
        keywords: "holiday time off",
      },
      {
        title: "Attendance",
        to: "/attendance",
        icon: ClipboardCheck,
        accent: "bg-status-working",
        keywords: "check in clock",
      },
      { title: "My TOIL", to: "/me/toil", icon: Clock, accent: "bg-status-working" },
      { title: "Work from home", to: "/me/wfh", icon: House, accent: "bg-status-info" },
    ],
  },
  {
    title: "Pay & expenses",
    icon: Receipt,
    accent: "bg-primary",
    items: [
      {
        title: "My payslips",
        to: "/my-payslips",
        icon: Receipt,
        accent: "bg-primary",
        keywords: "salary pay",
      },
      {
        title: "My expenses",
        to: "/me/expenses",
        icon: Wallet,
        accent: "bg-status-done",
        keywords: "claim receipt reimbursement",
      },
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
      {
        title: "My training",
        to: "/me/training",
        icon: BookOpen,
        accent: "bg-status-info",
        keywords: "course learn",
      },
      {
        title: "Recognition",
        to: "/recognition",
        icon: Trophy,
        accent: "bg-accent",
        keywords: "award kudos",
      },
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
        keywords: "checklist new hire",
      },
      { title: "My requests", to: "/me/requests", icon: Inbox, accent: "bg-status-pending" },
      {
        title: "My documents",
        to: "/me/documents",
        icon: FileSignature,
        accent: "bg-status-info",
        keywords: "signature file",
      },
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

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------

export const PRACTICE_ITEMS: NavItem[] = [
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
];

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

/**
 * Regrouped per docs/w4-information-architecture-design.md (W4): the old shape
 * was Team/Leave & time/Payroll/Operations/Insights/Compliance, with Operations
 * alone holding 17 unrelated items in one flat, unscrollable-feeling list.
 * Every subgroup is capped at nine.
 */
export const ORG_ITEMS: NavItem[] = [
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
];

export const ORG_SECTIONS: NavSection[] = [
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
        keywords: "staff hire add",
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
      {
        // NEW — a complete, working workflow with no nav entry
        // anywhere before this wave. Its promotion/pay_change
        // types are commented out on the page itself (superseded
        // by Promotions and Pay rates); the other 5 change types
        // have no other home in the app. See
        // docs/w4-information-architecture-design.md §2.
        title: "Employment variations",
        to: "/hr/variations",
        icon: UserCog,
        accent: "bg-status-working",
        feature: "org.employmentVariations",
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
        feature: "org.leaveManagement",
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
        // RENAMED from "Holiday calendars" to match the page's
        // own title and stop reading as a near-duplicate of
        // "Public holidays" right below it. Same route.
        title: "Holiday categories",
        to: "/admin/holiday-categories",
        icon: CalendarDays,
        accent: "bg-status-info",
        feature: "org.holidayCalendars",
      },
      {
        // /admin/holidays (the flat list view) still exists and is
        // still linked from here as "List view" — this just points
        // the primary nav entry at the calendar view, which is a
        // strict superset (recurring holidays, AU sync) and was
        // previously unreachable from the sidebar at all.
        title: "Public holidays",
        to: "/admin/holiday-calendar",
        icon: CalendarDays,
        accent: "bg-status-pending",
        feature: "org.publicHolidays",
        // Everyone may read the holiday calendar; only admins may
        // change it. Gating the page to admins made this a dead
        // link for branch_admin, hr, manager AND employee — the
        // one drift that reached every role in the product.
        readOnlyFor: ["branch_admin", "hr", "manager", "employee", "regional_admin"],
      },
      {
        title: "Per-employee holidays",
        to: "/admin/employee-holidays",
        icon: CalendarDays,
        accent: "bg-accent",
        feature: "org.employeeHolidays",
      },
      {
        title: "TOIL admin",
        to: "/admin/toil",
        icon: Clock,
        accent: "bg-status-working",
        feature: "org.toilAdmin",
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
        keywords: "pay",
      },
      {
        // Moved in from the old flat Operations list — approvals
        // are compensation-adjacent, not really an "operation,"
        // and this now sits next to the config page it pairs with.
        title: "Expenses",
        to: "/org/expenses",
        icon: Wallet,
        accent: "bg-status-done",
        feature: "org.expenses",
        keywords: "approve reimburse claim",
      },
      {
        // NEW — category/policy config had no nav entry. Gated
        // narrower than Expenses on purpose (org.expenseSettings):
        // defines what counts as a valid category, not who can
        // approve a claim.
        title: "Expense categories",
        to: "/admin/expenses",
        icon: Wallet,
        accent: "bg-status-pending",
        feature: "org.expenseSettings",
      },
    ],
  },
  {
    title: "Onboarding",
    icon: GraduationCap,
    accent: "bg-status-info",
    items: [
      {
        title: "Onboarding admin",
        to: "/org/onboarding",
        icon: GraduationCap,
        accent: "bg-status-info",
        feature: "org.onboardingAdmin",
        keywords: "checklist",
      },
      {
        title: "Onboarding tracker",
        to: "/org/onboarding/tracker",
        icon: ClipboardCheck,
        accent: "bg-status-working",
        feature: "org.onboardingAdmin",
      },
      {
        // NEW — defines what an onboarding pack contains; had no
        // nav entry. Inherits its own AdminGate allow={ORG_ADMIN_ONLY}.
        title: "Onboarding packs",
        to: "/admin/onboarding-packs",
        icon: Package,
        accent: "bg-accent",
        feature: "org.onboardingPacks",
      },
    ],
  },
  {
    title: "Performance & growth",
    icon: Sparkles,
    accent: "bg-accent",
    items: [
      {
        title: "Performance reviews",
        to: "/org/performance",
        icon: Sparkles,
        accent: "bg-accent",
        feature: "org.performance",
      },
      {
        title: "Review cycles",
        to: "/admin/review-cycles",
        icon: TrendingUp,
        accent: "bg-status-pending",
        feature: "org.reviewCycles",
      },
      {
        title: "Review analytics",
        to: "/admin/review-analytics",
        icon: TrendingUp,
        accent: "bg-status-info",
        feature: "org.reviewAnalytics",
      },
      {
        title: "KPI & KRA library",
        to: "/admin/kpi-kra",
        icon: Sparkles,
        accent: "bg-accent",
        feature: "org.kpiLibrary",
      },
      {
        title: "Duties & responsibilities",
        to: "/admin/employee-duties",
        icon: ClipboardCheck,
        accent: "bg-status-working",
        feature: "org.employeeDuties",
      },
      {
        title: "Duty-based KPI review",
        to: "/admin/duty-reviews",
        icon: TrendingUp,
        accent: "bg-status-info",
        feature: "org.dutyReviews",
      },
      {
        title: "Review templates",
        to: "/admin/review-templates",
        icon: ClipboardCheck,
        accent: "bg-status-working",
        feature: "org.reviewTemplates",
        keywords: "performance",
      },
      {
        title: "Feedback templates",
        to: "/admin/feedback-templates",
        icon: Sparkles,
        accent: "bg-accent",
        feature: "org.feedbackTemplates",
        keywords: "360",
      },
      {
        // Its own system (onboarding templates, training bundles,
        // document-request templates, a review-templates
        // shortcut) — not a hub for the other four template pages
        // in this subgroup. Five things named "template" reading
        // as five different things is the actual fix here; see
        // docs/w4-information-architecture-design.md §2.
        title: "Templates Hub",
        to: "/admin/templates",
        icon: ClipboardCheck,
        accent: "bg-accent",
        feature: "org.templatesHub",
        keywords: "review onboarding training documents",
      },
    ],
  },
  {
    title: "Learning",
    icon: BookOpen,
    accent: "bg-status-info",
    items: [
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
    ],
  },
  {
    title: "Records",
    icon: FileSignature,
    accent: "bg-status-info",
    items: [
      {
        title: "Documents",
        to: "/org/documents",
        icon: FileSignature,
        accent: "bg-status-info",
        feature: "org.documents",
      },
      {
        // NEW — document-envelope templates had no nav entry.
        title: "Document templates",
        to: "/org/documents/templates",
        icon: FileSignature,
        accent: "bg-status-pending",
        feature: "org.documentTemplates",
      },
      {
        // Moved in from the old flat Operations list — a
        // regulatory audit reads as records/paperwork, not an
        // operation.
        title: "AU STP2 & Payday Super audit",
        to: "/admin/au-stp-audit",
        icon: ShieldAlert,
        accent: "bg-status-stuck",
        feature: "org.auStpAudit",
      },
      {
        title: "Missing info requests",
        to: "/admin/id-requests",
        icon: Inbox,
        accent: "bg-status-pending",
        feature: "org.idRequests",
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
    title: "Compliance & safety",
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
        // Sits beside geofences on purpose: an approval here is
        // precisely an exception to the perimeter configured there.
        title: "Work-from-home approvals",
        to: "/admin/wfh",
        icon: House,
        accent: "bg-status-info",
        feature: "org.wfhApprovals",
      },
      {
        title: "Signing geofences",
        to: "/admin/geofences",
        icon: MapPin,
        accent: "bg-status-pending",
        feature: "org.geofences",
        keywords: "google map location radius",
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
];

/** Manager group. Two destinations, each with its own feature key. */
export const MANAGER_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    to: "/team",
    icon: Users,
    accent: "bg-status-working",
    feature: "manager.team",
  },
  // "Team" link removed — it duplicates Organization → Team → Team members.
  // Managers without org_admin still reach it through the Organization flyout.
  {
    title: "Requests inbox",
    to: "/admin/requests",
    icon: Inbox,
    accent: "bg-status-pending",
    feature: "manager.requestsInbox",
  },
];

/** Regional group. */
export const REGIONAL_ITEMS: NavItem[] = [
  {
    title: "Regional console",
    to: "/regional",
    icon: Globe2,
    accent: "bg-status-info",
    feature: "regional.console",
  },
];

/**
 * Super admin group.
 *
 * Every item carries `platform.admin` rather than the group being wrapped in a
 * single `can()`. Same visibility, but each destination now states its own gate,
 * so the registry below is complete and the parity test can see these rows.
 */
export const SUPER_ADMIN_ITEMS: NavItem[] = [
  {
    title: "Platform admin",
    to: "/admin",
    icon: ShieldCheck,
    accent: "bg-status-stuck",
    feature: "platform.admin",
  },
  {
    title: "Tenants",
    to: "/platform/tenants",
    icon: Building2,
    accent: "bg-status-info",
    feature: "platform.admin",
  },
  {
    title: "FX rates",
    to: "/platform/fx",
    icon: DollarSign,
    accent: "bg-status-done",
    feature: "platform.admin",
  },
  {
    title: "Leads",
    to: "/platform/leads",
    icon: Inbox,
    accent: "bg-status-working",
    feature: "platform.admin",
  },
  {
    title: "Trial invitations",
    to: "/platform/invitations",
    icon: UserCircle,
    accent: "bg-status-pending",
    feature: "platform.admin",
  },
  // W4 IA: both billing pages were orphans with AdminGate imported but never
  // rendered. Platform-internal — distinct from settings.billing, which is the
  // tenant's own subscription page.
  {
    title: "Billing — direct debit",
    to: "/admin/billing",
    icon: CreditCard,
    accent: "bg-status-done",
    feature: "platform.admin",
  },
  {
    title: "Billing — internal ops",
    to: "/admin/billing-ops",
    icon: CreditCard,
    accent: "bg-status-info",
    feature: "platform.admin",
  },
  {
    title: "API reference",
    to: "/admin/api-docs",
    icon: BookOpen,
    accent: "bg-primary",
    feature: "platform.admin",
  },
  {
    title: "Blog CMS",
    to: "/admin/blog",
    icon: FileText,
    accent: "bg-status-info",
    feature: "platform.admin",
  },
  {
    title: "Blog API & webhooks",
    to: "/admin/blog-integrations",
    icon: PlugZap,
    accent: "bg-accent",
    feature: "platform.admin",
  },
  {
    title: "Security findings",
    to: "/admin/security",
    icon: ShieldCheck,
    accent: "bg-status-stuck",
    feature: "platform.admin",
  },
  {
    title: "Diagnostics",
    to: "/admin/diagnostics",
    icon: Sparkles,
    accent: "bg-status-working",
    feature: "platform.admin",
  },
];

/** Account group. The three ungated rows are personal settings anyone may reach. */
export const ACCOUNT_ITEMS: NavItem[] = [
  { title: "Profile", to: "/settings/profile", icon: UserCircle, accent: "bg-status-info" },
  {
    title: "Organization",
    to: "/settings/organization",
    icon: Building2,
    accent: "bg-primary",
    feature: "settings.organization",
  },
  {
    title: "Billing",
    to: "/settings/billing",
    icon: CreditCard,
    accent: "bg-status-done",
    feature: "settings.billing",
  },
  {
    title: "Notifications",
    to: "/settings/notifications",
    icon: Bell,
    accent: "bg-status-pending",
  },
  {
    title: "Account & sign-in",
    to: "/settings/account",
    icon: UserCircle,
    accent: "bg-status-working",
  },
  {
    title: "Danger zone",
    to: "/org/danger",
    icon: AlertTriangle,
    accent: "bg-destructive",
    feature: "org.danger",
  },
];

/** Help group. */
export const HELP_ITEMS: NavItem[] = [
  {
    title: "Knowledge hub",
    to: "/help",
    icon: HelpCircle,
    accent: "bg-accent",
    keywords: "articles help",
  },
  {
    title: "Knowledge editor",
    to: "/admin/knowledge",
    icon: BookOpen,
    accent: "bg-status-info",
    feature: "platform.admin",
    keywords: "articles cms",
  },
];

// ---------------------------------------------------------------------------
// The flat registry
// ---------------------------------------------------------------------------

/** A single destination, flattened out of the tree above. */
export type NavDestination = {
  title: string;
  to: string;
  feature?: Feature;
  /** Top-level group label, e.g. "Organization". */
  group: string;
  /** Subgroup label where the tree has one, e.g. "Payroll". */
  section?: string;
  country?: string[];
  readOnlyFor?: AppRole[];
  keywords?: string;
};

function flatten(group: string, items: NavItem[], section?: string): NavDestination[] {
  return items.map((i) => ({
    title: i.title,
    to: i.to,
    feature: i.feature,
    group,
    section,
    country: i.country,
    readOnlyFor: i.readOnlyFor,
    keywords: i.keywords,
  }));
}

/**
 * Every navigable destination in the authenticated app, in sidebar order.
 *
 * This is what makes the tree above a registry rather than markup. It is
 * consumed by GlobalSearch (so search and the sidebar cannot drift), and
 * scanned by tests/nav-integrity.test.ts and
 * tests/nav-route-gate-parity.test.ts.
 */
export const NAV_DESTINATIONS: NavDestination[] = [
  ...flatten("My workspace", MY_ITEMS),
  ...MY_SECTIONS.flatMap((s) => flatten("My workspace", s.items, s.title)),
  ...flatten("Practice", PRACTICE_ITEMS),
  ...flatten("Manager", MANAGER_ITEMS),
  ...flatten("Organization", ORG_ITEMS),
  ...ORG_SECTIONS.flatMap((s) => flatten("Organization", s.items, s.title)),
  ...flatten("Regional", REGIONAL_ITEMS),
  ...flatten("Super admin", SUPER_ADMIN_ITEMS),
  ...flatten("Account", ACCOUNT_ITEMS),
  ...flatten("Help", HELP_ITEMS),
];
