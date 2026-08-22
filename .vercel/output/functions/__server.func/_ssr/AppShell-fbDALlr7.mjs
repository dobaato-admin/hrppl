import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, d as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { h as cn, u as useAuth, a as useServerFn, B as Button, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { R as Root2, T as Trigger, P as Portal$1, C as Content2 } from "../_libs/radix-ui__react-popover.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { _ as _e } from "../_libs/cmdk.mjs";
import { c as can } from "./rbac-BWg_Nf1T.mjs";
import { c as createSsrRpc } from "./createSsrRpc-CRedQJGY.mjs";
import { r as requireSupabaseAuth } from "./auth-guard-CkYFJuQL.mjs";
import { c as createServerFn } from "./server-BOi2EjMN.mjs";
import { g as getMyOnboardingCompletion } from "./onboarding.functions-BzLphvXk.mjs";
import { h as hrpplIcon } from "./hrppl-icon-DgSw_-Bc.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { S as Separator } from "./separator-D6YV3GQ2.mjs";
import { R as Root, P as Portal, C as Content, b as Close, a as Title, D as Description, O as Overlay } from "../_libs/radix-ui__react-dialog.mjs";
import { P as Provider, R as Root3, T as Trigger$1, a as Portal$2, C as Content2$2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { R as Root2$1, I as Item, H as Header, T as Trigger2, C as Content2$1 } from "../_libs/radix-ui__react-accordion.mjs";
import { R as Root2$2, T as Trigger$2, P as Portal2, C as Content2$3, S as SubTrigger2, a as SubContent2, I as Item2, b as CheckboxItem2, c as ItemIndicator2, d as RadioItem2, L as Label2, e as Separator2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { P as PageHeader } from "./monday-Dpwrcz0o.mjs";
import { f as CircleUser, g as DollarSign, c as Users, h as ShieldCheck, i as CalendarDays, j as ClipboardCheck, k as Clock, R as Receipt, W as Wallet, l as Sparkles, m as BookOpen, n as Trophy, G as GraduationCap, I as Inbox, o as FilePenLine, p as Package, q as FileText, r as ShieldAlert, s as LayoutDashboard, t as User, u as Briefcase, v as FolderKanban, w as ListChecks, B as Building2, x as BadgeCheck, y as UserSearch, z as TrendingUp, A as Gavel, E as DoorOpen, H as FingerprintPattern, J as MapPin, K as Palette, N as Settings, O as Earth, Q as PlugZap, V as CreditCard, X as Bell, Y as TriangleAlert, Z as CircleQuestionMark, b as LogOut, _ as ArrowLeft, $ as ChevronRight, a0 as PanelLeft, S as Search, a1 as Video, a2 as LifeBuoy, a3 as X, a4 as ChevronDown, a5 as Check, a6 as Circle } from "../_libs/lucide-react.mjs";
import { a as objectType, z as stringType, A as booleanType, D as arrayType, C as numberType, B as enumType } from "../_libs/zod.mjs";
const Popover = Root2;
const PopoverTrigger = Trigger;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2.displayName;
const CATEGORIES = [
  { value: "other", label: "General question / Other" },
  { value: "equipment", label: "Equipment" },
  { value: "stationery", label: "Stationery" },
  { value: "shift_swap", label: "Shift swap" },
  { value: "time_in_lieu", label: "Time in lieu" },
  { value: "overtime_payment", label: "Overtime payment" },
  { value: "expense_reimbursement", label: "Expense reimbursement" },
  { value: "api_access_request", label: "API access" }
];
function SupportTicketDialog({
  open,
  onOpenChange
}) {
  const { user } = useAuth();
  const [category, setCategory] = reactExports.useState("other");
  const [subject, setSubject] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [priority, setPriority] = reactExports.useState("normal");
  const [submitting, setSubmitting] = reactExports.useState(false);
  async function submit() {
    if (!user) {
      toast.error("Please sign in first.");
      return;
    }
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: emp } = await supabase.from("employees").select("id, tenant_id").eq("user_id", user.id).maybeSingle();
      if (!emp) {
        toast.error("No employee record linked to your account.");
        return;
      }
      const { error } = await supabase.from("support_tickets").insert({
        tenant_id: emp.tenant_id,
        employee_id: emp.id,
        created_by: user.id,
        category,
        subject: subject.trim(),
        description: description.trim(),
        status: "open",
        priority,
        metadata: {},
        attachments: []
      });
      if (error) throw error;
      toast.success("Support ticket submitted. We'll get back to you soon.");
      setSubject("");
      setDescription("");
      setCategory("other");
      setPriority("normal");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Raise a support ticket" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Describe your issue and we'll route it to the right team." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: setCategory, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: priority, onValueChange: setPriority, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "normal", children: "Normal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgent", children: "Urgent" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Short summary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "What happened? Steps to reproduce, screenshots links, expected behavior…",
            rows: 5
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: submitting, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: submitting, children: submitting ? "Submitting…" : "Submit ticket" })
    ] })
  ] }) });
}
function HelpMenu() {
  const [open, setOpen] = reactExports.useState(false);
  const [ticketOpen, setTicketOpen] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  const [articles, setArticles] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!open || loaded) return;
    supabase.from("knowledge_articles").select("id,slug,title,summary,category,video_url").eq("published", true).order("sort_order", { ascending: true }).limit(50).then(({ data }) => {
      setArticles(data ?? []);
      setLoaded(true);
    });
  }, [open, loaded]);
  const filtered = reactExports.useMemo(() => {
    if (!q.trim()) return articles.slice(0, 8);
    const needle = q.toLowerCase();
    return articles.filter(
      (a) => a.title.toLowerCase().includes(needle) || (a.summary ?? "").toLowerCase().includes(needle) || a.category.toLowerCase().includes(needle)
    ).slice(0, 8);
  }, [q, articles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "min-h-9 min-w-9",
          "aria-label": "Help",
          title: "Help & support",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-4 w-4" })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "end", sideOffset: 8, className: "w-[min(22rem,calc(100vw-2rem))] p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Knowledge hub" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              autoFocus: true,
              value: q,
              onChange: (e) => setQ(e.target.value),
              placeholder: "Search how-to articles…",
              className: "h-9 pl-8 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 max-h-72 overflow-y-auto", children: !loaded ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 py-4 text-center text-xs text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1 py-4 text-center text-xs text-muted-foreground", children: [
          'No articles match "',
          q,
          '".'
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-0.5", children: filtered.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/help/$slug",
            params: { slug: a.slug },
            onClick: () => setOpen(false),
            className: "flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
            children: [
              a.video_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: a.title }),
                a.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: a.summary })
              ] })
            ]
          }
        ) }, a.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-col gap-1.5 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "secondary", size: "sm", className: "justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/help", onClick: () => setOpen(false), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "mr-2 h-3.5 w-3.5" }),
            " Browse all articles"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "justify-start",
              onClick: () => {
                setOpen(false);
                setTicketOpen(true);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LifeBuoy, { className: "mr-2 h-3.5 w-3.5" }),
                " Raise a support ticket"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SupportTicketDialog, { open: ticketOpen, onOpenChange: setTicketOpen })
  ] });
}
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = _e.displayName;
const CommandDialog = ({ children, ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Command, { className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5", children }) }) });
};
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    _e.Input,
    {
      ref,
      className: cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = _e.Input.displayName;
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = _e.List.displayName;
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(_e.Empty, { ref, className: "py-6 text-center text-sm", ...props }));
CommandEmpty.displayName = _e.Empty.displayName;
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = _e.Group.displayName;
const CommandSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = _e.Separator.displayName;
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    ),
    ...props
  }
));
CommandItem.displayName = _e.Item.displayName;
const globalSearch = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  q: stringType().trim().min(2).max(100)
}).parse(d)).handler(createSsrRpc("f0242e0ea2b4f8b1ea006738b7b917138ce361b75aff7c4234eb747e886bb088"));
const ENTRIES = [
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
  { group: "How to", label: "First-time organization setup", to: "/help/admin-org-setup", feature: "settings.organization" }
];
function GlobalSearch() {
  const [open, setOpen] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  const [debouncedQ, setDebouncedQ] = reactExports.useState("");
  const { roles } = useAuth();
  const navigate = useNavigate();
  const searchFn = useServerFn(globalSearch);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const canSearchOrg = roles.some((r) => ["manager", "hr", "org_admin", "super_admin"].includes(r));
  const { data: live } = useQuery({
    queryKey: ["global-search", debouncedQ],
    queryFn: () => searchFn({ data: { q: debouncedQ } }),
    enabled: open && canSearchOrg && debouncedQ.length >= 2,
    staleTime: 15e3
  });
  const visible = reactExports.useMemo(
    () => ENTRIES.filter((e) => !e.feature || can(e.feature, roles)),
    [roles]
  );
  function go(to) {
    setOpen(false);
    setQ("");
    navigate({ to });
  }
  const grouped = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    visible.forEach((e) => {
      if (!m.has(e.group)) m.set(e.group, []);
      m.get(e.group).push(e);
    });
    return Array.from(m.entries());
  }, [visible]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "min-h-9 min-w-9",
        "aria-label": "Search",
        title: "Search (⌘K)",
        onClick: () => setOpen(true),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandDialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CommandInput,
        {
          placeholder: "Search employees, variations, tasks, timesheets, pages…",
          value: q,
          onValueChange: setQ
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No matches" }),
        canSearchOrg && live && live.employees.length + live.variations.length + live.tasks.length + live.timesheets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          live.employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: "Employees", children: live.employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { value: `emp ${e.label} ${e.sub}`, onSelect: () => go(`/org/employees/${e.id}`), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: e.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: e.sub })
          ] }) }, `emp-${e.id}`)) }),
          live.variations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: "Employment variations", children: live.variations.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { value: `var ${v.label} ${v.sub}`, onSelect: () => go("/hr/variations"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: v.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: v.sub })
            ] }) }, `var-${v.id}`)) })
          ] }),
          live.tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: "Onboarding tasks", children: live.tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { value: `task ${t.label} ${t.sub}`, onSelect: () => go(`/org/onboarding/control-room/${t.assignment_id}`), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t.sub })
            ] }) }, `task-${t.id}`)) })
          ] }),
          live.timesheets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: "Timesheets", children: live.timesheets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { value: `ts ${t.label} ${t.sub}`, onSelect: () => go("/org/timesheet-review"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t.sub })
            ] }) }, `ts-${t.id}`)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {})
        ] }),
        grouped.map(([group, items], idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          idx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: group, children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CommandItem,
            {
              value: `${it.label} ${it.keywords ?? ""}`,
              onSelect: () => go(it.to),
              children: it.label
            },
            it.to + it.label
          )) })
        ] }, group))
      ] })
    ] })
  ] });
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const Sheet = Root;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger$1;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2$2.displayName;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = reactExports.createContext(null);
function useSidebar() {
  const context = reactExports.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = reactExports.forwardRef(
  ({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = reactExports.useState(false);
    const [_open, _setOpen] = reactExports.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = reactExports.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );
    const toggleSidebar = reactExports.useCallback(() => {
      return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
    }, [isMobile, setOpen, setOpenMobile]);
    reactExports.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    const state = open ? "expanded" : "collapsed";
    const contextValue = reactExports.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style
        },
        className: cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
          className
        ),
        ref,
        ...props,
        children
      }
    ) }) });
  }
);
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = reactExports.forwardRef(
  ({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            className
          ),
          ref,
          ...props,
          children
        }
      );
    }
    if (isMobile) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        SheetContent,
        {
          "data-sidebar": "sidebar",
          "data-mobile": "true",
          className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
          style: {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
          },
          side,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "sr-only", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Sidebar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Displays the mobile sidebar." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full flex-col", children })
          ]
        }
      ) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref,
        className: "group peer hidden text-sidebar-foreground md:block",
        "data-state": state,
        "data-collapsible": state === "collapsed" ? collapsible : "",
        "data-variant": variant,
        "data-side": side,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                "group-data-[collapsible=offcanvas]:w-0",
                "group-data-[side=right]:rotate-180",
                variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
                side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                // Adjust the padding for floating and inset variants.
                variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                className
              ),
              ...props,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-sidebar": "sidebar",
                  className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                  children
                }
              )
            }
          )
        ]
      }
    );
  }
);
Sidebar.displayName = "Sidebar";
const SidebarTrigger = reactExports.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      ref,
      "data-sidebar": "trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeft, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        ref,
        "data-sidebar": "rail",
        "aria-label": "Toggle Sidebar",
        tabIndex: -1,
        onClick: toggleSidebar,
        title: "Toggle Sidebar",
        className: cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        ),
        ...props
      }
    );
  }
);
SidebarRail.displayName = "SidebarRail";
const SidebarInset = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "main",
      {
        ref,
        className: cn(
          "relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className
        ),
        ...props
      }
    );
  }
);
SidebarInset.displayName = "SidebarInset";
const SidebarInput = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      ref,
      "data-sidebar": "input",
      className: cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      ),
      ...props
    }
  );
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "header",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "footer",
        className: cn("flex flex-col gap-2 p-2", className),
        ...props
      }
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Separator,
    {
      ref,
      "data-sidebar": "separator",
      className: cn("mx-2 w-auto bg-sidebar-border", className),
      ...props
    }
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "content",
        className: cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className
        ),
        ...props
      }
    );
  }
);
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        "data-sidebar": "group",
        className: cn("relative flex w-full min-w-0 flex-col p-2", className),
        ...props
      }
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = reactExports.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-label",
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = reactExports.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "group-action",
      className: cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  )
);
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "li",
    {
      ref,
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const SidebarMenuButton = reactExports.forwardRef(
  ({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();
    const button = /* @__PURE__ */ jsxRuntimeExports.jsx(
      Comp,
      {
        ref,
        "data-sidebar": "menu-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        ...props
      }
    );
    if (!tooltip) {
      return button;
    }
    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip
      };
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: button }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TooltipContent,
        {
          side: "right",
          align: "center",
          hidden: state !== "collapsed" || isMobile,
          ...tooltip
        }
      )
    ] });
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = reactExports.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      "data-sidebar": "menu-badge",
      className: cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = reactExports.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = reactExports.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "size-4 rounded-md", "data-sidebar": "menu-skeleton-icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Skeleton,
          {
            className: "h-4 max-w-(--skeleton-width) flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": width
            }
          }
        )
      ]
    }
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu-sub",
      className: cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = reactExports.forwardRef(
  ({ ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { ref, ...props })
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = reactExports.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
const Accordion = Root2$1;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$1,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2$1.displayName;
const DropdownMenu = Root2$2;
const DropdownMenuTrigger = Trigger$2;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$3,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2$3.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
const ListInput = objectType({
  unreadOnly: booleanType().optional().default(false),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  search: stringType().trim().max(200).optional().nullable(),
  sortBy: enumType(["newest", "unread_first", "job_id"]).optional().default("newest"),
  limit: numberType().int().min(1).max(100).optional().default(25),
  offset: numberType().int().min(0).optional().default(0)
}).partial();
const listNotifications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => ListInput.parse(d ?? {})).handler(createSsrRpc("c017b24a4940a916334ff23b3f3461893d7b3f151e06bac76f968dd27c3f187b"));
const markNotificationRead = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  ids: arrayType(stringType().uuid()).max(200).optional(),
  all: booleanType().optional()
}).parse(d)).handler(createSsrRpc("385e76cdf807dd53711b6f969d894db85cf9b0ca7a6373bb34c6352adedccb64"));
const markNotificationUnread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  ids: arrayType(stringType().uuid()).min(1).max(200)
}).parse(d)).handler(createSsrRpc("607ba84c3614f5cd3696ec0b7e8d7ae11a3e99c338d06525020aa747044a3e00"));
const NOTIFICATIONS_POLL_MS = 6e4;
function NotificationsBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listNotifications);
  const mark = useServerFn(markNotificationRead);
  const [open, setOpen] = reactExports.useState(false);
  const { data } = useQuery({
    queryKey: ["notifications-bell", user?.id],
    enabled: !!user,
    queryFn: async () => (await list())?.notifications ?? [],
    // Under the poll interval, so a remount mid-cycle serves the cache instead
    // of refetching.
    staleTime: NOTIFICATIONS_POLL_MS,
    refetchInterval: NOTIFICATIONS_POLL_MS,
    refetchOnWindowFocus: true,
    retry: false
  });
  const items = data ?? [];
  const unread = items.filter((n) => !n.read_at).length;
  async function onOpenChange(next) {
    setOpen(next);
    if (!next && unread > 0) {
      try {
        await mark({ data: { all: true } });
        qc.setQueryData(
          ["notifications-bell", user?.id],
          (prev) => (prev ?? []).map((n) => n.read_at ? n : { ...n, read_at: (/* @__PURE__ */ new Date()).toISOString() })
        );
        qc.invalidateQueries({ queryKey: ["notifications-inbox"] });
      } catch {
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { open, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "relative", "aria-label": "Notifications", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
      unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          variant: "destructive",
          className: "absolute -right-2 -top-2 h-5 min-w-[1.25rem] justify-center px-1 text-[10px]",
          children: unread > 9 ? "9+" : unread
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-80 p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-3 py-2 text-sm font-medium flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/notifications", onClick: () => setOpen(false), className: "text-xs text-primary hover:underline", children: "View all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-96 overflow-auto", children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-6 text-center text-sm text-muted-foreground", children: "You're all caught up." }) : items.map((n) => {
        const content = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `px-3 py-2 text-sm ${n.read_at ? "opacity-70" : "bg-muted/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: n.title }),
          n.body && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: n.body }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground", children: new Date(n.created_at).toLocaleString() })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border last:border-0", children: n.link ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: n.link, onClick: () => setOpen(false), className: "block hover:bg-accent", children: content }) : content }, n.id);
      }) })
    ] })
  ] });
}
const ROLE_VALUES = ["super_admin", "regional_admin", "org_admin", "branch_admin", "hr", "finance", "manager", "employee"];
const getMfaPolicy = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6db7c529484f3cd5527717590dfb3f4e56ce179ee648e729755f2206ffe14cd8"));
const updateMfaPolicy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  required_roles: arrayType(enumType(ROLE_VALUES)).default([]),
  grace_period_days: numberType().int().min(0).max(90).default(7),
  is_enforced: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("00d094b0a3325038d256ab2caa727be6a0abb42d425693a754f949df1b7e890e"));
const getMyMfaStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("be0039ba06064dee76b74eb28049bc3495089845cc02db64ee956c240ff36699"));
function MfaEnforcementBanner() {
  const { user, rolesLoaded } = useAuth();
  const fn = useServerFn(getMyMfaStatus);
  const { data } = useQuery({
    queryKey: ["my-mfa-status", user?.id],
    queryFn: () => fn(),
    enabled: !!user && rolesLoaded,
    staleTime: 6e4,
    retry: false
  });
  if (!data?.required || data.enrolled) return null;
  const isBlocking = data.blocking;
  const days = data.grace_remaining_days;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      role: "alert",
      className: `flex items-center gap-3 border-b px-4 py-3 text-sm ${isBlocking ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: isBlocking ? "MFA required for your role." : "MFA required soon." }),
          " ",
          isBlocking ? "Configure multi-factor authentication to continue accessing sensitive areas." : `Set up MFA within ${days} day${days === 1 ? "" : "s"} to keep access.`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/settings/notifications",
            className: "font-medium underline underline-offset-4",
            children: "Set up MFA"
          }
        )
      ]
    }
  );
}
const MY_ITEMS = [
  { title: "Home", to: "/dashboard", icon: LayoutDashboard, accent: "bg-status-info" },
  { title: "Me", to: "/me", icon: User, accent: "bg-primary" }
];
const MY_SECTIONS = [
  {
    title: "Profile",
    icon: CircleUser,
    accent: "bg-status-info",
    items: [
      { title: "Contact details", to: "/me/contact", icon: CircleUser, accent: "bg-status-info" },
      { title: "Banking & tax", to: "/me/banking-tax", icon: DollarSign, accent: "bg-status-done" },
      { title: "Directory", to: "/me/directory", icon: Users, accent: "bg-status-working" },
      { title: "Security", to: "/me/security", icon: ShieldCheck, accent: "bg-status-stuck" }
    ]
  },
  {
    title: "Time & leave",
    icon: CalendarDays,
    accent: "bg-status-done",
    items: [
      { title: "My leave", to: "/leave", icon: CalendarDays, accent: "bg-status-done" },
      { title: "Attendance", to: "/attendance", icon: ClipboardCheck, accent: "bg-status-working" },
      { title: "My TOIL", to: "/me/toil", icon: Clock, accent: "bg-status-working" }
    ]
  },
  {
    title: "Pay & expenses",
    icon: Receipt,
    accent: "bg-primary",
    items: [
      { title: "My payslips", to: "/my-payslips", icon: Receipt, accent: "bg-primary" },
      { title: "My expenses", to: "/me/expenses", icon: Wallet, accent: "bg-status-done" }
    ]
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
        accent: "bg-status-pending"
      },
      { title: "My training", to: "/me/training", icon: BookOpen, accent: "bg-status-info" },
      { title: "Recognition", to: "/recognition", icon: Trophy, accent: "bg-accent" }
    ]
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
        hideWhen: "onboardingComplete"
      },
      { title: "My requests", to: "/me/requests", icon: Inbox, accent: "bg-status-pending" },
      { title: "My documents", to: "/me/documents", icon: FilePenLine, accent: "bg-status-info" },
      {
        title: "Signatures",
        to: "/me/signatures",
        icon: FilePenLine,
        accent: "bg-status-pending"
      },
      { title: "My assets", to: "/me/assets", icon: Package, accent: "bg-status-working" },
      { title: "My record", to: "/me/timeline", icon: FileText, accent: "bg-accent" },
      { title: "Grievances", to: "/me/grievances", icon: ShieldAlert, accent: "bg-status-pending" }
    ]
  }
];
function NavLinkButton({ item, onNavigate }) {
  const Icon = item.icon;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === item.to || pathname.startsWith(item.to + "/");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuButton, { asChild: true, isActive: active, tooltip: item.title, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.to, className: "group", onClick: onNavigate, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${item.accent}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: item.title })
  ] }) }) });
}
function FlyoutNavGroup({
  label,
  icon: GroupIcon,
  accent,
  items,
  sections,
  roles,
  hidden
}) {
  const [open, setOpen] = reactExports.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isVisible = (i) => (!i.feature || can(i.feature, roles)) && !(i.hideWhen && hidden?.[i.hideWhen]);
  const visibleItems = items.filter(isVisible);
  const visibleSections = (sections ?? []).map((s) => ({ ...s, items: s.items.filter(isVisible) })).filter((s) => s.items.length > 0);
  if (visibleItems.length === 0 && visibleSections.length === 0) return null;
  const active = visibleItems.some((i) => pathname === i.to || pathname.startsWith(i.to + "/")) || visibleSections.some(
    (section) => section.items.some((item) => pathname === item.to || pathname.startsWith(item.to + "/"))
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenu, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenuButton, { isActive: active, tooltip: label, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${accent}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupIcon, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 opacity-60" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        PopoverContent,
        {
          side: "right",
          align: "start",
          sideOffset: 8,
          collisionPadding: 12,
          className: "w-[min(20rem,calc(100vw-2rem))] max-w-[20rem] p-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[75vh] space-y-1 overflow-y-auto pr-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5", children: items.map((item) => {
                const Icon = item.icon;
                const itemActive = pathname === item.to || pathname.startsWith(item.to + "/");
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: item.to,
                    onClick: () => setOpen(false),
                    className: `group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${itemActive ? "bg-accent/60 font-medium" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${item.accent}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.title })
                    ]
                  },
                  item.to
                );
              }) }),
              sections?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                Accordion,
                {
                  type: "multiple",
                  defaultValue: sections.filter(
                    (section) => section.items.some(
                      (item) => pathname === item.to || pathname.startsWith(item.to + "/")
                    )
                  ).map((section) => section.title),
                  className: "rounded-md border bg-background",
                  children: sections.map((section) => {
                    const SectionIcon = section.icon;
                    const sectionActive = section.items.some(
                      (item) => pathname === item.to || pathname.startsWith(item.to + "/")
                    );
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      AccordionItem,
                      {
                        value: section.title,
                        className: "border-border/70 px-1",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AccordionTrigger,
                            {
                              className: `rounded-md px-2 py-2 text-sm hover:bg-accent/40 hover:no-underline ${sectionActive ? "bg-accent/40" : ""}`,
                              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "span",
                                  {
                                    className: `inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${section.accent}`,
                                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionIcon, { className: "h-3.5 w-3.5" })
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: section.title })
                              ] })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5 pl-2", children: section.items.map((item) => {
                            const Icon = item.icon;
                            const itemActive = pathname === item.to || pathname.startsWith(item.to + "/");
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              Link,
                              {
                                to: item.to,
                                onClick: () => setOpen(false),
                                className: `group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${itemActive ? "bg-accent/60 font-medium" : ""}`,
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "span",
                                    {
                                      className: `inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-sm ${item.accent}`,
                                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" })
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.title })
                                ]
                              },
                              item.to
                            );
                          }) }) })
                        ]
                      },
                      section.title
                    );
                  })
                }
              ) : null
            ] })
          ]
        }
      )
    ] }) }) }) })
  ] });
}
function CrumbsAndTitle({ title, subtitle }) {
  if (!title) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display truncate text-base font-semibold leading-tight tracking-tight md:text-lg", children: title }),
    subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] text-muted-foreground", children: subtitle }) : null
  ] });
}
function HeaderUserChip({
  email,
  roles,
  rolesLoaded
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-2 md:flex", children: [
    !rolesLoaded ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-muted-foreground", children: "Loading role…" }) : roles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-status-stuck text-status-stuck", children: "No role" }) : roles.slice(0, 2).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        className: "border-0 bg-accent text-accent-foreground capitalize",
        variant: "secondary",
        children: r.replace("_", " ")
      },
      r
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[14rem] truncate text-xs text-muted-foreground", children: email })
  ] });
}
function ShellInner({ title, subtitle, actions, children }) {
  const { user, roles, rolesLoaded } = useAuth();
  const fetchOnboarding = useServerFn(getMyOnboardingCompletion);
  const { data: onboarding } = useQuery({
    queryKey: ["nav-onboarding-completion", user?.id],
    queryFn: () => fetchOnboarding(),
    enabled: !!user,
    staleTime: 5 * 6e4
  });
  const hiddenNavItems = { onboardingComplete: !!onboarding?.complete };
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBackToDashboard = pathname !== "/dashboard" && pathname !== "/";
  async function signOut() {
    try {
      const { clearMfaSessionVerified } = await import("./router-CLxirH5A.mjs").then((n) => n.bd);
      clearMfaSessionVerified();
    } catch {
    }
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Sidebar, { collapsible: "icon", className: "border-r", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarHeader, { className: "border-b border-sidebar-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-2 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: hrpplIcon,
            alt: "hrppl",
            width: 36,
            height: 36,
            className: "h-full w-full object-cover"
          }
        ) }),
        !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-base font-semibold tracking-tight text-sidebar-foreground", children: "hrppl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/60", children: "Empower your people" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FlyoutNavGroup,
          {
            label: "My workspace",
            icon: User,
            accent: "bg-primary",
            roles,
            items: MY_ITEMS,
            sections: MY_SECTIONS,
            hidden: hiddenNavItems
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FlyoutNavGroup,
          {
            label: "Practice",
            icon: Briefcase,
            accent: "bg-status-working",
            roles,
            items: [
              {
                title: "My time",
                to: "/practice/time",
                icon: Clock,
                accent: "bg-status-info",
                feature: "practice.console"
              },
              {
                title: "Clients",
                to: "/practice/clients",
                icon: Briefcase,
                accent: "bg-primary",
                feature: "practice.console"
              },
              {
                title: "Projects",
                to: "/practice/projects",
                icon: FolderKanban,
                accent: "bg-status-working",
                feature: "practice.console"
              },
              {
                title: "Jobs",
                to: "/practice/jobs",
                icon: ListChecks,
                accent: "bg-status-info",
                feature: "practice.console"
              },
              {
                title: "Invoices",
                to: "/practice/invoices",
                icon: FileText,
                accent: "bg-status-done",
                feature: "practice.console"
              }
            ]
          }
        ),
        (can("manager.team", roles) || can("manager.requestsInbox", roles)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "Manager" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenu, { children: [
            can("manager.team", roles) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Dashboard",
                  to: "/team",
                  icon: Users,
                  accent: "bg-status-working"
                }
              }
            ),
            can("manager.requestsInbox", roles) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Requests inbox",
                  to: "/admin/requests",
                  icon: Inbox,
                  accent: "bg-status-pending"
                }
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FlyoutNavGroup,
          {
            label: "Organization",
            icon: Building2,
            accent: "bg-status-working",
            roles,
            items: [
              {
                title: "Org console",
                to: "/org",
                icon: Building2,
                accent: "bg-status-working",
                feature: "org.console"
              },
              {
                title: "Setup wizard",
                to: "/org/setup",
                icon: Settings,
                accent: "bg-status-pending",
                feature: "org.setup"
              },
              {
                title: "Branches",
                to: "/org/branches",
                icon: Building2,
                accent: "bg-status-info",
                feature: "org.branches"
              }
            ],
            sections: [
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
                    feature: "org.employees"
                  },
                  {
                    title: "Team members",
                    to: "/admin/teams",
                    icon: Users,
                    accent: "bg-primary",
                    feature: "org.teams"
                  },
                  {
                    title: "Invite staff",
                    to: "/org/invitations",
                    icon: Users,
                    accent: "bg-status-info",
                    feature: "org.invitations"
                  },
                  {
                    title: "Roles & permissions",
                    to: "/org/roles",
                    icon: Users,
                    accent: "bg-primary",
                    feature: "org.roles"
                  },
                  {
                    title: "Team assignments",
                    to: "/admin/team-assignments",
                    icon: Users,
                    accent: "bg-status-working",
                    feature: "org.teamAssignments"
                  },
                  {
                    title: "Departments",
                    to: "/admin/departments",
                    icon: Building2,
                    accent: "bg-status-info",
                    feature: "org.departments"
                  },
                  {
                    title: "Designations",
                    to: "/admin/designations",
                    icon: BadgeCheck,
                    accent: "bg-status-pending",
                    feature: "org.designations"
                  },
                  {
                    title: "Recruitment",
                    to: "/org/recruitment",
                    icon: UserSearch,
                    accent: "bg-accent",
                    feature: "org.recruitment"
                  }
                ]
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
                    feature: "org.leaveTypes"
                  },
                  {
                    title: "Timesheets",
                    to: "/org/timesheets",
                    icon: Clock,
                    accent: "bg-status-working",
                    feature: "org.requests"
                  },
                  {
                    title: "Leave types",
                    to: "/admin/leave-types",
                    icon: CalendarDays,
                    accent: "bg-status-done",
                    feature: "org.leaveTypes"
                  },
                  {
                    title: "Holiday calendars",
                    to: "/admin/holiday-categories",
                    icon: CalendarDays,
                    accent: "bg-status-info",
                    feature: "org.holidayCalendars"
                  },
                  {
                    title: "Public holidays",
                    to: "/admin/holidays",
                    icon: CalendarDays,
                    accent: "bg-status-pending",
                    feature: "org.publicHolidays"
                  },
                  {
                    title: "TOIL admin",
                    to: "/admin/toil",
                    icon: Clock,
                    accent: "bg-status-working",
                    feature: "org.leaveTypes"
                  }
                ]
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
                    feature: "org.payroll"
                  },
                  {
                    title: "Pay rates",
                    to: "/org/pay-rates",
                    icon: DollarSign,
                    accent: "bg-primary",
                    feature: "org.payRates"
                  },
                  {
                    title: "Overtime rates",
                    to: "/admin/overtime-rates",
                    icon: Clock,
                    accent: "bg-status-working",
                    feature: "org.overtimeRates"
                  },
                  {
                    title: "Promotions",
                    to: "/org/promotions",
                    icon: TrendingUp,
                    accent: "bg-status-done",
                    feature: "org.promotions"
                  },
                  {
                    title: "Payroll setup",
                    to: "/admin/payroll-setup",
                    icon: DollarSign,
                    accent: "bg-status-done",
                    feature: "org.payrollSetup"
                  },
                  {
                    title: "Payroll settings",
                    to: "/admin/payroll-settings",
                    icon: DollarSign,
                    accent: "bg-primary",
                    feature: "org.payrollSettings"
                  },
                  {
                    title: "Payslip templates",
                    to: "/admin/payslip-templates",
                    icon: Receipt,
                    accent: "bg-status-info",
                    feature: "org.payslipTemplates"
                  }
                ]
              },
              {
                title: "Operations",
                icon: FilePenLine,
                accent: "bg-status-info",
                items: [
                  {
                    title: "Onboarding admin",
                    to: "/org/onboarding",
                    icon: GraduationCap,
                    accent: "bg-status-info",
                    feature: "org.console"
                  },
                  {
                    title: "Onboarding tracker",
                    to: "/org/onboarding/tracker",
                    icon: ClipboardCheck,
                    accent: "bg-status-working",
                    feature: "org.console"
                  },
                  {
                    title: "AU STP2 & Payday Super audit",
                    to: "/admin/au-stp-audit",
                    icon: ShieldAlert,
                    accent: "bg-status-stuck",
                    feature: "org.console"
                  },
                  {
                    title: "Performance reviews",
                    to: "/org/performance",
                    icon: Sparkles,
                    accent: "bg-accent",
                    feature: "org.performance"
                  },
                  {
                    title: "Missing info requests",
                    to: "/admin/id-requests",
                    icon: Inbox,
                    accent: "bg-status-pending",
                    feature: "org.idRequests"
                  },
                  {
                    title: "Documents",
                    to: "/org/documents",
                    icon: FilePenLine,
                    accent: "bg-status-info",
                    feature: "org.documents"
                  },
                  {
                    title: "Expenses",
                    to: "/org/expenses",
                    icon: Wallet,
                    accent: "bg-status-done",
                    feature: "org.expenses"
                  },
                  {
                    title: "Training",
                    to: "/org/training",
                    icon: BookOpen,
                    accent: "bg-status-info",
                    feature: "org.training"
                  },
                  {
                    title: "Training catalog",
                    to: "/admin/training",
                    icon: GraduationCap,
                    accent: "bg-accent",
                    feature: "org.trainingCatalog"
                  },
                  {
                    title: "Feedback templates",
                    to: "/admin/feedback-templates",
                    icon: Sparkles,
                    accent: "bg-accent",
                    feature: "org.feedbackTemplates"
                  },
                  {
                    title: "Review templates",
                    to: "/admin/review-templates",
                    icon: ClipboardCheck,
                    accent: "bg-status-working",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "KPI & KRA library",
                    to: "/admin/kpi-kra",
                    icon: Sparkles,
                    accent: "bg-accent",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "Duties & responsibilities",
                    to: "/admin/employee-duties",
                    icon: ClipboardCheck,
                    accent: "bg-status-working",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "Duty-based KPI review",
                    to: "/admin/duty-reviews",
                    icon: TrendingUp,
                    accent: "bg-status-info",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "Review cycles",
                    to: "/admin/review-cycles",
                    icon: TrendingUp,
                    accent: "bg-status-pending",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "Per-employee holidays",
                    to: "/admin/employee-holidays",
                    icon: ClipboardCheck,
                    accent: "bg-accent",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "Review analytics",
                    to: "/admin/review-analytics",
                    icon: TrendingUp,
                    accent: "bg-status-info",
                    feature: "org.reviewTemplates"
                  },
                  {
                    title: "Templates Hub",
                    to: "/admin/templates",
                    icon: ClipboardCheck,
                    accent: "bg-accent",
                    feature: "org.reviewTemplates"
                  }
                ]
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
                    feature: "org.analytics"
                  },
                  {
                    title: "Reports",
                    to: "/org/reports",
                    icon: FileText,
                    accent: "bg-status-info",
                    feature: "org.reports"
                  }
                ]
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
                    feature: "org.discipline"
                  },
                  {
                    title: "Medical incidents",
                    to: "/admin/medical",
                    icon: ShieldAlert,
                    accent: "bg-status-stuck",
                    feature: "org.medical"
                  },
                  {
                    title: "Asset register",
                    to: "/admin/assets",
                    icon: Package,
                    accent: "bg-status-working",
                    feature: "org.assets"
                  },
                  {
                    title: "Exit & offboarding",
                    to: "/admin/offboarding",
                    icon: DoorOpen,
                    accent: "bg-status-pending",
                    feature: "org.offboarding"
                  },
                  {
                    title: "Biometric devices",
                    to: "/admin/biometric",
                    icon: FingerprintPattern,
                    accent: "bg-status-working",
                    feature: "org.biometric"
                  },
                  {
                    title: "Signing geofences",
                    to: "/admin/geofences",
                    icon: MapPin,
                    accent: "bg-status-pending",
                    feature: "org.geofences"
                  },
                  {
                    title: "White-label",
                    to: "/org/white-label",
                    icon: Palette,
                    accent: "bg-accent",
                    feature: "org.whiteLabel"
                  }
                ]
              }
            ]
          }
        ),
        can("regional.console", roles) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "Regional" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenu, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            NavLinkButton,
            {
              item: {
                title: "Regional console",
                to: "/regional",
                icon: Earth,
                accent: "bg-status-info"
              }
            }
          ) }) })
        ] }),
        can("platform.admin", roles) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "Super admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Platform admin",
                  to: "/admin",
                  icon: ShieldCheck,
                  accent: "bg-status-stuck"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Tenants",
                  to: "/platform/tenants",
                  icon: Building2,
                  accent: "bg-status-info"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "FX rates",
                  to: "/platform/fx",
                  icon: DollarSign,
                  accent: "bg-status-done"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Leads",
                  to: "/platform/leads",
                  icon: Inbox,
                  accent: "bg-status-working"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Trial invitations",
                  to: "/platform/invitations",
                  icon: CircleUser,
                  accent: "bg-status-pending"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "API reference",
                  to: "/admin/api-docs",
                  icon: BookOpen,
                  accent: "bg-primary"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Blog CMS",
                  to: "/admin/blog",
                  icon: FileText,
                  accent: "bg-status-info"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Blog API & webhooks",
                  to: "/admin/blog-integrations",
                  icon: PlugZap,
                  accent: "bg-accent"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Security findings",
                  to: "/admin/security",
                  icon: ShieldCheck,
                  accent: "bg-status-stuck"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Diagnostics",
                  to: "/admin/diagnostics",
                  icon: Sparkles,
                  accent: "bg-status-working"
                }
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Profile",
                  to: "/settings/profile",
                  icon: CircleUser,
                  accent: "bg-status-info"
                }
              }
            ),
            can("settings.organization", roles) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Organization",
                  to: "/settings/organization",
                  icon: Building2,
                  accent: "bg-primary"
                }
              }
            ),
            can("settings.billing", roles) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Billing",
                  to: "/settings/billing",
                  icon: CreditCard,
                  accent: "bg-status-done"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Notifications",
                  to: "/settings/notifications",
                  icon: Bell,
                  accent: "bg-status-pending"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Account & sign-in",
                  to: "/settings/account",
                  icon: CircleUser,
                  accent: "bg-status-working"
                }
              }
            ),
            can("org.danger", roles) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Danger zone",
                  to: "/org/danger",
                  icon: TriangleAlert,
                  accent: "bg-destructive"
                }
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupLabel, { children: "Help" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Knowledge hub",
                  to: "/help",
                  icon: CircleQuestionMark,
                  accent: "bg-accent"
                }
              }
            ),
            can("platform.admin", roles) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              NavLinkButton,
              {
                item: {
                  title: "Knowledge editor",
                  to: "/admin/knowledge",
                  icon: BookOpen,
                  accent: "bg-status-info"
                }
              }
            )
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarFooter, { className: "border-t border-sidebar-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuButton, { asChild: true, tooltip: "Account", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/settings/account", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Account" })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarMenuButton, { onClick: signOut, tooltip: "Sign out", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-6 w-6 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign out" })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 border-b bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 w-full bg-gradient-brand" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-14 items-center gap-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, { className: "min-h-9 min-w-9" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-border" }),
          showBackToDashboard ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              asChild: true,
              className: "h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground",
              "data-testid": "back-to-dashboard",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", "aria-label": "Back to dashboard", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Dashboard" })
              ] })
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(CrumbsAndTitle, { title, subtitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
            actions,
            /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HelpMenu, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsBell, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderUserChip, { email: user?.email ?? "", roles, rolesLoaded }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "min-h-9 min-w-9 md:hidden",
                onClick: signOut,
                "aria-label": "Sign out",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                asChild: true,
                className: "hidden min-h-9 min-w-9 md:inline-flex",
                "aria-label": "Settings",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }) })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MfaEnforcementBanner, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-w-0", children })
    ] })
  ] });
}
const InsideAppShell = reactExports.createContext(false);
function AppShell(props) {
  const alreadyInsideShell = reactExports.useContext(InsideAppShell);
  if (alreadyInsideShell) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      props.title ? /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: props.title, subtitle: props.subtitle, actions: props.actions }) : null,
      props.children
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(InsideAppShell.Provider, { value: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShellInner, { ...props }) }) });
}
export {
  AppShell as A,
  Popover as P,
  SupportTicketDialog as S,
  markNotificationUnread as a,
  PopoverTrigger as b,
  PopoverContent as c,
  Skeleton as d,
  getMfaPolicy as g,
  listNotifications as l,
  markNotificationRead as m,
  updateMfaPolicy as u
};
