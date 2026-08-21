import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listExpenseClaims,
  listExpenseCategories,
  saveExpenseClaim,
  deleteExpenseClaim,
  getReceiptSignedUrl,
  getReimbursementSummary,
} from "@/lib/expenses.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Receipt as ReceiptIcon, X, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/me/expenses")({
  head: () => ({ meta: [{ title: "My expenses — hrppl" }] }),
  component: MyExpensesPage,
});

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-status-info/20 text-status-info",
  approved: "bg-status-done/20 text-status-done",
  rejected: "bg-status-stuck/20 text-status-stuck",
  paid: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

type Line = {
  id?: string; category_id?: string | null; expense_date: string; amount: number;
  currency: string; merchant?: string; description?: string; receipt_path?: string;
  mileage_km?: number; tax_amount?: number;
};

function emptyLine(): Line {
  return { expense_date: new Date().toISOString().slice(0,10), amount: 0, currency: "AUD" };
}

function MyExpensesPage() {
  const { user } = useAuth();
  const list = useServerFn(listExpenseClaims);
  const cats = useServerFn(listExpenseCategories);
  const save = useServerFn(saveExpenseClaim);
  const del = useServerFn(deleteExpenseClaim);
  const signed = useServerFn(getReceiptSignedUrl);
  const reimb = useServerFn(getReimbursementSummary);

  const [claims, setClaims] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);

  async function refresh() {
    const r = await list({ data: { scope: "mine" } });
    setClaims(r.claims);
    const s = await reimb({ data: {} });
    setSummary(s.summary);
  }
  // `noTenantScope` is carried through so the empty dropdown can explain itself.
  // A platform account (super_admin / regional_admin) has no tenant, so there
  // are no categories to show — previously that rendered a silent empty Select
  // that looked like a bug rather than a state.
  const [catState, setCatState] = useState<"loading" | "ok" | "empty" | "no-tenant">("loading");
  useEffect(() => {
    refresh();
    cats()
      .then((r) => {
        const active = (r.categories ?? []).filter((c: any) => c.is_active);
        setCategories(active);
        setCatState(r.noTenantScope ? "no-tenant" : active.length ? "ok" : "empty");
      })
      .catch(() => setCatState("empty"));
  }, []);

  function downloadStatement() {
    if (!summary) return;
    const doc = new jsPDF();
    const fmt = (n: number) => `${summary.currency} ${Number(n).toFixed(2)}`;
    doc.setFontSize(16);
    doc.text("Reimbursement Statement", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 25);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 32,
      head: [["Bucket", "Amount"]],
      body: [
        ["Pending (submitted / recommended)", fmt(summary.pendingTotal)],
        ["Approved (awaiting payment)", fmt(summary.outstandingTotal)],
        ["Paid", fmt(summary.paidTotal)],
        ["Rejected", fmt(summary.rejectedTotal)],
      ],
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59] },
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [["Title", "Status", "Submitted", "Paid on", "Amount"]],
      body: claims.map((c: any) => [
        c.title,
        c.status,
        c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—",
        c.paid_at ? new Date(c.paid_at).toLocaleDateString() : "—",
        fmt(Number(c.total_amount) || 0),
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save(`reimbursement-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
  }


  function openNew() {
    setEditing(null); setTitle(""); setDescription(""); setLines([emptyLine()]); setOpen(true);
  }

  const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
  const RECEIPT_MIMES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];

  async function uploadReceipt(file: File, idx: number) {
    if (!user) return;
    if (file.size > RECEIPT_MAX_BYTES) {
      return toast.error(`Receipt too large (${(file.size / 1024 / 1024).toFixed(1)}MB) — max 10MB.`);
    }
    if (file.type && !RECEIPT_MIMES.includes(file.type)) {
      return toast.error("Only JPG, PNG, WEBP, HEIC or PDF receipts are accepted.");
    }
    const { data: emp } = await supabase.from("employees").select("id,tenant_id").eq("user_id", user.id).maybeSingle();
    if (!emp) return toast.error("No employee profile");
    const path = `${emp.tenant_id}/${emp.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("expense-receipts").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) return toast.error(error.message);
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, receipt_path: path } : l)));
    toast.success("Receipt uploaded");
  }

  async function openReceipt(path: string) {
    const r = await signed({ data: { path } });
    window.open(r.url, "_blank");
  }

  async function submit(submitAfter: boolean) {
    if (!title.trim()) return toast.error("Title required");
    if (lines.some((l) => !l.amount || l.amount <= 0)) return toast.error("All lines need an amount");
    setWorking(true);
    try {
      await save({ data: {
        id: editing?.id, title, description,
        currency: lines[0]?.currency ?? "AUD",
        lines: lines.map((l) => ({ ...l, amount: Number(l.amount), mileage_km: l.mileage_km ? Number(l.mileage_km) : undefined, tax_amount: l.tax_amount ? Number(l.tax_amount) : undefined })),
        submit: submitAfter,
      }});
      toast.success(submitAfter ? "Submitted for approval" : "Saved as draft");
      setOpen(false);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setWorking(false); }
  }

  return (
    <AppShell title="My expenses" subtitle="Submit receipts and track reimbursements"
      actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New claim</Button>}>
      <div className="p-4 md:p-6 space-y-4">
        {summary ? (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>Reimbursement summary</CardTitle>
                <CardDescription>Approved, paid and outstanding totals across all your claims.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={downloadStatement}>
                <Download className="mr-1 h-3.5 w-3.5" /> Statement PDF
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Pending", value: summary.pendingTotal, tone: "text-status-info" },
                { label: "Outstanding (approved, unpaid)", value: summary.outstandingTotal, tone: "text-status-working" },
                { label: "Paid", value: summary.paidTotal, tone: "text-primary" },
                { label: "Rejected", value: summary.rejectedTotal, tone: "text-status-stuck" },
              ].map((s) => (
                <div key={s.label} className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`font-mono text-lg font-semibold ${s.tone}`}>
                    {summary.currency} {Number(s.value).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>My claims</CardTitle>
            <CardDescription>Drafts can be edited before submission. Submitted claims are reviewed by your manager or finance team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No claims yet</TableCell></TableRow>
                ) : claims.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge className={STATUS_TONE[c.status] + " border-0 capitalize"}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{c.currency} {Number(c.total_amount).toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-right">
                      {c.status === "draft" ? (
                        <Button variant="ghost" size="sm" onClick={async () => { await del({ data: { id: c.id } }); refresh(); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New expense claim</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sept client travel" />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={lines[0]?.currency ?? "AUD"} onChange={(e) => setLines((ls) => ls.map((l) => ({ ...l, currency: e.target.value.toUpperCase() })))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line items</Label>
                <Button size="sm" variant="outline" onClick={() => setLines([...lines, emptyLine()])}><Plus className="h-3.5 w-3.5 mr-1" /> Add line</Button>
              </div>
              {catState === "no-tenant" && (
                <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                  Your account isn&rsquo;t attached to an organization, so there are no expense
                  categories to choose from. Expense claims belong to an organization &mdash; sign
                  in with an account that has one.
                </p>
              )}
              {catState === "empty" && (
                <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                  No expense categories have been set up yet. An administrator can add them on{" "}
                  <Link to="/org/expenses" className="underline">Expenses &rarr; Categories</Link>
                  {" "}&mdash; there are one-click presets there.
                </p>
              )}
              {lines.map((l, i) => (
                <div key={i} className="grid gap-2 rounded-md border p-3 md:grid-cols-12">
                  <Input type="date" value={l.expense_date} onChange={(e) => setLines(ls => ls.map((x,j) => j===i ? { ...x, expense_date: e.target.value } : x))} className="md:col-span-2" />
                  <Select value={l.category_id ?? ""} onValueChange={(v) => setLines(ls => ls.map((x,j) => j===i ? { ...x, category_id: v || null } : x))}>
                    <SelectTrigger className="md:col-span-3"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Merchant" value={l.merchant ?? ""} onChange={(e) => setLines(ls => ls.map((x,j) => j===i ? { ...x, merchant: e.target.value } : x))} className="md:col-span-3" />
                  <Input type="number" step="0.01" placeholder="Amount" value={l.amount || ""} onChange={(e) => setLines(ls => ls.map((x,j) => j===i ? { ...x, amount: Number(e.target.value) } : x))} className="md:col-span-2 font-mono" />
                  <div className="md:col-span-2 flex items-center gap-1">
                    {l.receipt_path ? (
                      <Button size="sm" variant="outline" onClick={() => openReceipt(l.receipt_path!)}><ReceiptIcon className="h-3.5 w-3.5" /></Button>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted">
                        <Upload className="h-3.5 w-3.5" /> Receipt
                        <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && uploadReceipt(e.target.files[0], i)} />
                      </label>
                    )}
                    {lines.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input placeholder="Description" value={l.description ?? ""} onChange={(e) => setLines(ls => ls.map((x,j) => j===i ? { ...x, description: e.target.value } : x))} className="md:col-span-12 text-xs" />
                </div>
              ))}
            </div>
            <div className="flex justify-end font-mono text-sm">
              Total: {(lines[0]?.currency ?? "AUD")} {lines.reduce((s, l) => s + (Number(l.amount) || 0), 0).toFixed(2)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => submit(false)} disabled={working}>Save draft</Button>
            <Button onClick={() => submit(true)} disabled={working}>Submit for approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
