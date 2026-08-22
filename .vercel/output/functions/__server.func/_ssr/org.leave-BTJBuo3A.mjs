import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, w as runMonthlyLeaveAccrual, x as runYearEndCarryOver, y as adjustLeaveBalance, B as Button, C as Card, b as CardHeader, c as CardTitle, e as CardContent, d as CardDescription, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CuOXr1L0.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as approveLeaveRequest, r as rejectLeaveRequest } from "./leave.functions-DOr-Yktn.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-CRedQJGY.mjs";
import "./server-BOi2EjMN.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-guard-CkYFJuQL.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./registry-Y5CZHtkF.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./send-internal.server-9cG3k97B.mjs";
import "./client.server-D5ro3rAQ.mjs";
import "./geofences.functions-C8KvPefL.mjs";
import "../_libs/zod.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
function OrgLeave() {
  const {
    user,
    roles,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = reactExports.useState(null);
  const [requests, setRequests] = reactExports.useState([]);
  const [types, setTypes] = reactExports.useState({});
  const [employees, setEmployees] = reactExports.useState({});
  const [balances, setBalances] = reactExports.useState([]);
  const [logs, setLogs] = reactExports.useState([]);
  const [rejectOpen, setRejectOpen] = reactExports.useState(null);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [year, setYear] = reactExports.useState((/* @__PURE__ */ new Date()).getUTCFullYear());
  const [adjOpen, setAdjOpen] = reactExports.useState(false);
  const [adj, setAdj] = reactExports.useState({
    employeeId: "",
    leaveTypeId: "",
    field: "accrued_days",
    delta: 0,
    reason: ""
  });
  const approve = useServerFn(approveLeaveRequest);
  const reject = useServerFn(rejectLeaveRequest);
  const runAccrual = useServerFn(runMonthlyLeaveAccrual);
  const runCarry = useServerFn(runYearEndCarryOver);
  const adjustFn = useServerFn(adjustLeaveBalance);
  const canAccess = roles.includes("org_admin") || roles.includes("manager") || roles.includes("super_admin");
  const isOrgAdmin = roles.includes("org_admin") || roles.includes("super_admin");
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const {
        data
      } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (data?.tenant_id) setTenantId(data.tenant_id);
    })();
  }, [user]);
  async function loadAll() {
    if (!tenantId) return;
    const [rRes, tRes, eRes, bRes, lRes] = await Promise.all([supabase.from("leave_requests").select("*").eq("tenant_id", tenantId).order("created_at", {
      ascending: false
    }), supabase.from("leave_types").select("id,name,color").eq("tenant_id", tenantId), supabase.from("employees").select("id,first_name,last_name,employee_number").eq("tenant_id", tenantId).eq("status", "active"), supabase.from("leave_balances").select("*").eq("tenant_id", tenantId).eq("year", year), supabase.from("leave_accrual_log").select("*").eq("tenant_id", tenantId).order("created_at", {
      ascending: false
    }).limit(100)]);
    setRequests(rRes.data ?? []);
    const tMap = {};
    (tRes.data ?? []).forEach((t) => {
      tMap[t.id] = t;
    });
    setTypes(tMap);
    const eMap = {};
    (eRes.data ?? []).forEach((e) => {
      eMap[e.id] = e;
    });
    setEmployees(eMap);
    setBalances(bRes.data ?? []);
    setLogs(lRes.data ?? []);
  }
  reactExports.useEffect(() => {
    loadAll();
  }, [tenantId, year]);
  async function onApprove(id) {
    setBusy(true);
    try {
      await approve({
        data: {
          requestId: id
        }
      });
      toast.success("Approved");
      await loadAll();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onReject() {
    if (!rejectOpen) return;
    setBusy(true);
    try {
      await reject({
        data: {
          requestId: rejectOpen.id,
          reason: rejectReason || void 0
        }
      });
      toast.success("Rejected");
      setRejectOpen(null);
      setRejectReason("");
      await loadAll();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onRunAccrual() {
    if (!confirm("Run monthly accrual for the current month? This is idempotent — duplicate runs are skipped.")) return;
    setBusy(true);
    try {
      const r = await runAccrual({
        data: {}
      });
      toast.success(`Accrual: ${r.processed} processed, ${r.skipped} skipped, ${r.failed} failed`);
      await loadAll();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onRunCarryOver() {
    if (!confirm(`Run year-end carry-over from ${year - 1} into ${year}?`)) return;
    setBusy(true);
    try {
      const r = await runCarry({
        data: {
          fromYear: year - 1
        }
      });
      toast.success(`Carry-over: ${r.processed} processed, ${r.skipped} skipped, ${r.failed} failed`);
      await loadAll();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function onAdjust() {
    if (!adj.employeeId || !adj.leaveTypeId || !adj.reason || !adj.delta) {
      toast.error("Fill all fields");
      return;
    }
    setBusy(true);
    try {
      await adjustFn({
        data: {
          ...adj,
          year
        }
      });
      toast.success("Balance adjusted");
      setAdjOpen(false);
      setAdj({
        employeeId: "",
        leaveTypeId: "",
        field: "accrued_days",
        delta: 0,
        reason: ""
      });
      await loadAll();
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  const typesList = reactExports.useMemo(() => Object.values(types), [types]);
  const empsList = reactExports.useMemo(() => Object.values(employees), [employees]);
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  if (!canAccess) return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center text-muted-foreground", children: "Forbidden." });
  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");
  const Row = ({
    r,
    actions
  }) => {
    const t = types[r.leave_type_id];
    const e = employees[r.employee_id];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: e ? `${e.first_name} ${e.last_name}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: e?.employee_number })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
          background: t?.color ?? "#94a3b8"
        } }),
        t?.name ?? "—"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
        r.start_date,
        " → ",
        r.end_date
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(r.days).toFixed(1) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-xs truncate", title: r.reason ?? "", children: r.reason || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status }) }),
      actions && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right space-x-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "default", disabled: busy, onClick: () => onApprove(r.id), children: "Approve" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => {
          setRejectOpen(r);
          setRejectReason("");
        }, children: "Reject" })
      ] })
    ] }, r.id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Leave management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Approve requests, manage balances, and run accruals." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-24", value: year, onChange: (e) => setYear(Number(e.target.value) || year) }),
        isOrgAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/leave-types", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Leave types" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", children: "Back" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-6 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "pending", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", children: [
          "Pending (",
          pending.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", children: [
          "History (",
          history.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "balances", children: "Balances" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "log", children: "Accrual log" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pending", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Awaiting decision" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            pending.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r, actions: true }, r.id)),
            pending.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground", children: "No pending requests." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "All decided / cancelled requests" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dates" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            history.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { r }, r.id)),
            history.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: "No history yet." }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "balances", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
              "Balances · ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
              balances.length,
              " record(s)"
            ] })
          ] }),
          isOrgAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: onRunAccrual, children: "Run monthly accrual" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: onRunCarryOver, children: "Run year-end carry-over" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: () => setAdjOpen(true), children: "Adjust balance" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Accrued" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Carried" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Pending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Available" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            balances.map((b) => {
              const t = types[b.leave_type_id];
              const e = employees[b.employee_id];
              const available = Number(b.accrued_days) + Number(b.carried_over_days) - Number(b.used_days) - Number(b.pending_days);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e ? `${e.first_name} ${e.last_name}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
                    background: t?.color ?? "#94a3b8"
                  } }),
                  t?.name ?? "—"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(b.accrued_days).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(b.carried_over_days).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(b.used_days).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(b.pending_days).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-semibold", children: available.toFixed(2) })
              ] }, b.id);
            }),
            balances.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 7, className: "text-center text-muted-foreground", children: [
              "No balances for ",
              year,
              "."
            ] }) })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "log", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Recent accrual activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Last 100 entries (accruals, carry-over, adjustments)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "When" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kind" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Employee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reason" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            logs.map((l) => {
              const e = employees[l.employee_id];
              const t = types[l.leave_type_id];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: new Date(l.created_at).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: l.kind }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e ? `${e.first_name} ${e.last_name}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t?.name ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: l.period_key }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right font-medium", children: [
                  Number(l.amount) > 0 ? "+" : "",
                  Number(l.amount).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-xs truncate", title: l.reason ?? "", children: l.reason ?? "—" })
              ] }, l.id);
            }),
            logs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground", children: "No activity yet." }) })
          ] })
        ] }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!rejectOpen, onOpenChange: (o) => {
      if (!o) setRejectOpen(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reject leave request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Optional reason will be visible to the employee." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, placeholder: "Reason (optional)", value: rejectReason, onChange: (e) => setRejectReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRejectOpen(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: onReject, disabled: busy, children: busy ? "Rejecting…" : "Reject request" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adjOpen, onOpenChange: setAdjOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Adjust leave balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Year ",
          year,
          ". Adjustments are logged and audited."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Employee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adj.employeeId, onValueChange: (v) => setAdj({
            ...adj,
            employeeId: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select employee" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: empsList.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id, children: [
              e.first_name,
              " ",
              e.last_name,
              " (",
              e.employee_number,
              ")"
            ] }, e.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Leave type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adj.leaveTypeId, onValueChange: (v) => setAdj({
            ...adj,
            leaveTypeId: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: typesList.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: adj.field, onValueChange: (v) => setAdj({
              ...adj,
              field: v
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "accrued_days", children: "Accrued" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "used_days", children: "Used" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "carried_over_days", children: "Carried over" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delta (+/-)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: adj.delta, onChange: (e) => setAdj({
              ...adj,
              delta: Number(e.target.value)
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: adj.reason, onChange: (e) => setAdj({
            ...adj,
            reason: e.target.value
          }), placeholder: "Why this adjustment?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAdjOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onAdjust, disabled: busy, children: "Apply" })
      ] })
    ] }) })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    pending: {
      label: "Pending",
      variant: "secondary"
    },
    approved: {
      label: "Approved",
      variant: "default"
    },
    rejected: {
      label: "Rejected",
      variant: "destructive"
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline"
    }
  };
  const m = map[status] ?? {
    label: status,
    variant: "outline"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: m.variant, children: m.label });
}
export {
  OrgLeave as component
};
