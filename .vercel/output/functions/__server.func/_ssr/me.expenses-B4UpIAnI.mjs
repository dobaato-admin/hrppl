import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useServerFn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, B as Button, e as CardContent, f as Badge, T as Textarea } from "./router-CLxirH5A.mjs";
import { l as listExpenseClaims, a as listExpenseCategories, s as saveExpenseClaim, c as deleteExpenseClaim, b as getReceiptSignedUrl, e as getReimbursementSummary } from "./expenses.functions-BwU_QoMh.mjs";
import { s as supabase } from "./client-BLUqAwhM.mjs";
import { A as AppShell } from "./AppShell-fbDALlr7.mjs";
import { I as Input } from "./input-C6yqZkRy.mjs";
import { L as Label } from "./label-Cbju7vgw.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bk9id1Ls.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DBQt_Juv.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-UIV2CpIo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as jsPDF } from "../_libs/jspdf.mjs";
import { autoTable } from "../_libs/jspdf-autotable.mjs";
import "../_libs/seroval.mjs";
import "../_libs/lovable.dev__mcp-js.mjs";
import "../_libs/modelcontextprotocol__sdk.mjs";
import "../_libs/zod-to-json-schema.mjs";
import "../_libs/ajv-formats.mjs";
import { D as Download, T as Trash2, aa as Plus, R as Receipt, U as Upload, a3 as X } from "../_libs/lucide-react.mjs";
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
import "../_libs/jose.mjs";
import "../_libs/ajv.mjs";
import "../_libs/fast-deep-equal.mjs";
import "../_libs/json-schema-traverse.mjs";
import "../_libs/fast-uri.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/cmdk.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./rbac-BWg_Nf1T.mjs";
import "./onboarding.functions-BzLphvXk.mjs";
import "./hrppl-icon-DgSw_-Bc.mjs";
import "./separator-D6YV3GQ2.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./monday-Dpwrcz0o.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "fs";
import "path";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
const STATUS_TONE = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-status-info/20 text-status-info",
  approved: "bg-status-done/20 text-status-done",
  rejected: "bg-status-stuck/20 text-status-stuck",
  paid: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground"
};
function emptyLine() {
  return {
    expense_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    amount: 0,
    currency: "AUD"
  };
}
function MyExpensesPage() {
  const {
    user
  } = useAuth();
  const list = useServerFn(listExpenseClaims);
  const cats = useServerFn(listExpenseCategories);
  const save = useServerFn(saveExpenseClaim);
  const del = useServerFn(deleteExpenseClaim);
  const signed = useServerFn(getReceiptSignedUrl);
  const reimb = useServerFn(getReimbursementSummary);
  const [claims, setClaims] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [summary, setSummary] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(false);
  const [working, setWorking] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [title, setTitle] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [lines, setLines] = reactExports.useState([emptyLine()]);
  async function refresh() {
    const r = await list({
      data: {
        scope: "mine"
      }
    });
    setClaims(r.claims);
    const s = await reimb({
      data: {}
    });
    setSummary(s.summary);
  }
  const [catState, setCatState] = reactExports.useState("loading");
  reactExports.useEffect(() => {
    refresh();
    cats().then((r) => {
      const active = (r.categories ?? []).filter((c) => c.is_active);
      setCategories(active);
      setCatState(r.noTenantScope ? "no-tenant" : active.length ? "ok" : "empty");
    }).catch(() => setCatState("empty"));
  }, []);
  function downloadStatement() {
    if (!summary) return;
    const doc = new jsPDF();
    const fmt = (n) => `${summary.currency} ${Number(n).toFixed(2)}`;
    doc.setFontSize(16);
    doc.text("Reimbursement Statement", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, 14, 25);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 32,
      head: [["Bucket", "Amount"]],
      body: [["Pending (submitted / recommended)", fmt(summary.pendingTotal)], ["Approved (awaiting payment)", fmt(summary.outstandingTotal)], ["Paid", fmt(summary.paidTotal)], ["Rejected", fmt(summary.rejectedTotal)]],
      theme: "striped",
      headStyles: {
        fillColor: [30, 41, 59]
      }
    });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Title", "Status", "Submitted", "Paid on", "Amount"]],
      body: claims.map((c) => [c.title, c.status, c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—", c.paid_at ? new Date(c.paid_at).toLocaleDateString() : "—", fmt(Number(c.total_amount) || 0)]),
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59]
      }
    });
    doc.save(`reimbursement-statement-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`);
  }
  function openNew() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setLines([emptyLine()]);
    setOpen(true);
  }
  const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
  const RECEIPT_MIMES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
  async function uploadReceipt(file, idx) {
    if (!user) return;
    if (file.size > RECEIPT_MAX_BYTES) {
      return toast.error(`Receipt too large (${(file.size / 1024 / 1024).toFixed(1)}MB) — max 10MB.`);
    }
    if (file.type && !RECEIPT_MIMES.includes(file.type)) {
      return toast.error("Only JPG, PNG, WEBP, HEIC or PDF receipts are accepted.");
    }
    const {
      data: emp
    } = await supabase.from("employees").select("id,tenant_id").eq("user_id", user.id).maybeSingle();
    if (!emp) return toast.error("No employee profile");
    const path = `${emp.tenant_id}/${emp.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const {
      error
    } = await supabase.storage.from("expense-receipts").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });
    if (error) return toast.error(error.message);
    setLines((ls) => ls.map((l, i) => i === idx ? {
      ...l,
      receipt_path: path
    } : l));
    toast.success("Receipt uploaded");
  }
  async function openReceipt(path) {
    const r = await signed({
      data: {
        path
      }
    });
    window.open(r.url, "_blank");
  }
  async function submit(submitAfter) {
    if (!title.trim()) return toast.error("Title required");
    if (lines.some((l) => !l.amount || l.amount <= 0)) return toast.error("All lines need an amount");
    setWorking(true);
    try {
      await save({
        data: {
          id: editing?.id,
          title,
          description,
          currency: lines[0]?.currency ?? "AUD",
          lines: lines.map((l) => ({
            ...l,
            amount: Number(l.amount),
            mileage_km: l.mileage_km ? Number(l.mileage_km) : void 0,
            tax_amount: l.tax_amount ? Number(l.tax_amount) : void 0
          })),
          submit: submitAfter
        }
      });
      toast.success(submitAfter ? "Submitted for approval" : "Saved as draft");
      setOpen(false);
      await refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setWorking(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "My expenses", subtitle: "Submit receipts and track reimbursements", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
    " New claim"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 space-y-4", children: [
      summary ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Reimbursement summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Approved, paid and outstanding totals across all your claims." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: downloadStatement, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-3.5 w-3.5" }),
            " Statement PDF"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [{
          label: "Pending",
          value: summary.pendingTotal,
          tone: "text-status-info"
        }, {
          label: "Outstanding (approved, unpaid)",
          value: summary.outstandingTotal,
          tone: "text-status-working"
        }, {
          label: "Paid",
          value: summary.paidTotal,
          tone: "text-primary"
        }, {
          label: "Rejected",
          value: summary.rejectedTotal,
          tone: "text-status-stuck"
        }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-mono text-lg font-semibold ${s.tone}`, children: [
            summary.currency,
            " ",
            Number(s.value).toFixed(2)
          ] })
        ] }, s.label)) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "My claims" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Drafts can be edited before submission. Submitted claims are reviewed by your manager or finance team." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Submitted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: claims.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground py-6", children: "No claims yet" }) }) : claims.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: c.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: STATUS_TONE[c.status] + " border-0 capitalize", children: c.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right font-mono", children: [
              c.currency,
              " ",
              Number(c.total_amount).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: c.status === "draft" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
              await del({
                data: {
                  id: c.id
                }
              });
              refresh();
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) : null })
          ] }, c.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New expense claim" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Sept client travel" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lines[0]?.currency ?? "AUD", onChange: (e) => setLines((ls) => ls.map((l) => ({
              ...l,
              currency: e.target.value.toUpperCase()
            }))) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: description, onChange: (e) => setDescription(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Line items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setLines([...lines, emptyLine()]), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
              " Add line"
            ] })
          ] }),
          catState === "no-tenant" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-md border border-dashed p-3 text-xs text-muted-foreground", children: "Your account isn’t attached to an organization, so there are no expense categories to choose from. Expense claims belong to an organization — sign in with an account that has one." }),
          catState === "empty" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-md border border-dashed p-3 text-xs text-muted-foreground", children: [
            "No expense categories have been set up yet. An administrator can add them on",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/org/expenses", className: "underline", children: "Expenses → Categories" }),
            " ",
            "— there are one-click presets there."
          ] }),
          lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-md border p-3 md:grid-cols-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: l.expense_date, onChange: (e) => setLines((ls) => ls.map((x, j) => j === i ? {
              ...x,
              expense_date: e.target.value
            } : x)), className: "md:col-span-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: l.category_id ?? "", onValueChange: (v) => setLines((ls) => ls.map((x, j) => j === i ? {
              ...x,
              category_id: v || null
            } : x)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Category" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Merchant", value: l.merchant ?? "", onChange: (e) => setLines((ls) => ls.map((x, j) => j === i ? {
              ...x,
              merchant: e.target.value
            } : x)), className: "md:col-span-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "Amount", value: l.amount || "", onChange: (e) => setLines((ls) => ls.map((x, j) => j === i ? {
              ...x,
              amount: Number(e.target.value)
            } : x)), className: "md:col-span-2 font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 flex items-center gap-1", children: [
              l.receipt_path ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => openReceipt(l.receipt_path), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
                " Receipt",
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", hidden: true, accept: "image/*,application/pdf", onChange: (e) => e.target.files?.[0] && uploadReceipt(e.target.files[0], i) })
              ] }),
              lines.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setLines(lines.filter((_, j) => j !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Description", value: l.description ?? "", onChange: (e) => setLines((ls) => ls.map((x, j) => j === i ? {
              ...x,
              description: e.target.value
            } : x)), className: "md:col-span-12 text-xs" })
          ] }, i))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end font-mono text-sm", children: [
          "Total: ",
          lines[0]?.currency ?? "AUD",
          " ",
          lines.reduce((s, l) => s + (Number(l.amount) || 0), 0).toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => submit(false), disabled: working, children: "Save draft" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => submit(true), disabled: working, children: "Submit for approval" })
      ] })
    ] }) })
  ] });
}
export {
  MyExpensesPage as component
};
