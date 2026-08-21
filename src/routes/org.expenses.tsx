import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listExpenseClaims, listExpenseCategories, upsertExpenseCategory, decideExpenseClaim, getExpenseClaim, getReceiptSignedUrl } from "@/lib/expenses.functions";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, X, DollarSign, ReceiptText, Plus, Sparkles } from "lucide-react";
import { EXPENSE_CATEGORY_PRESETS, type ExpenseCategoryPreset } from "@/lib/expense-category-presets";

export const Route = createFileRoute("/org/expenses")({
  head: () => ({ meta: [{ title: "Expenses — hrppl" }] }),
  component: OrgExpensesPage,
});

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-status-info/20 text-status-info",
  recommended: "bg-status-working/20 text-status-working",
  approved: "bg-status-done/20 text-status-done",
  rejected: "bg-status-stuck/20 text-status-stuck",
  paid: "bg-primary/20 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

function OrgExpensesPage() {
  const list = useServerFn(listExpenseClaims);
  const get = useServerFn(getExpenseClaim);
  const decide = useServerFn(decideExpenseClaim);
  const cats = useServerFn(listExpenseCategories);
  const upCat = useServerFn(upsertExpenseCategory);
  const signed = useServerFn(getReceiptSignedUrl);

  const [tab, setTab] = useState("queue");
  const [claims, setClaims] = useState<any[]>([]);
  const [filter, setFilter] = useState("submitted");
  const [drawer, setDrawer] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>({ name: "", requires_receipt: true, is_active: true });
  const [payRef, setPayRef] = useState("");
  const [comment, setComment] = useState("");

  async function refresh() {
    const r = await list({ data: { scope: "all", status: filter } });
    setClaims(r.claims);
  }
  async function refreshCats() {
    const r = await cats(); setCategories(r.categories);
  }
  useEffect(() => { refresh(); }, [filter]);
  useEffect(() => { refreshCats(); }, []);

  async function openDrawer(id: string) {
    const r = await get({ data: { id } }); setDrawer(r); setPayRef(""); setComment("");
  }

  async function doDecide(action: "approve" | "reject" | "pay") {
    if (!drawer?.claim) return;
    try {
      await decide({ data: { id: drawer.claim.id, action, comment, payment_reference: payRef } });
      toast.success(`Claim ${action}d`);
      await refresh(); setDrawer(null);
    } catch (e: any) { toast.error(e.message); }
  }

  async function viewReceipt(path: string) {
    const r = await signed({ data: { path } });
    window.open(r.url, "_blank");
  }

  async function saveCat() {
    if (!editCat.name.trim()) return toast.error("Name required");
    await upCat({ data: { ...editCat, max_amount: editCat.max_amount ? Number(editCat.max_amount) : null } });
    toast.success("Saved");
    setCatOpen(false); setEditCat({ name: "", requires_receipt: true, is_active: true });
    await refreshCats();
  }

  async function quickAddPreset(p: ExpenseCategoryPreset) {
    try {
      await upCat({ data: {
        name: p.name,
        code: p.code,
        max_amount: p.max_amount,
        requires_receipt: p.requires_receipt,
        is_active: true,
      } });
      toast.success(`Added "${p.name}"`);
      await refreshCats();
    } catch (e: any) { toast.error(e.message); }
  }

  function customizePreset(p: ExpenseCategoryPreset) {
    setEditCat({
      name: p.name,
      code: p.code,
      max_amount: p.max_amount ?? "",
      requires_receipt: p.requires_receipt,
      is_active: true,
    });
    setCatOpen(true);
  }

  function presetAlreadyAdded(p: ExpenseCategoryPreset) {
    const codeLc = p.code.toLowerCase();
    const nameLc = p.name.toLowerCase();
    return categories.some((c) => (c.code ?? "").toLowerCase() === codeLc || (c.name ?? "").toLowerCase() === nameLc);
  }

  return (
    <AppShell title="Expenses & reimbursements" subtitle="Review, approve and reimburse staff expenses">
      <div className="p-4 md:p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="queue"><ReceiptText className="h-4 w-4 mr-1" /> Claims</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Claims queue</CardTitle>
                  <CardDescription>Approve, reject or mark as paid.</CardDescription>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Employee</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead><TableHead>Submitted</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {claims.map((c) => (
                      <TableRow key={c.id} onClick={() => openDrawer(c.id)} className="cursor-pointer">
                        <TableCell>{c.employees?.first_name} {c.employees?.last_name}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell><Badge className={STATUS_TONE[c.status]+" border-0 capitalize"}>{c.status}</Badge></TableCell>
                        <TableCell className="text-right font-mono">{c.currency} {Number(c.total_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle>Standard category presets</CardTitle>
                </div>
                <CardDescription>
                  Click a preset to add it instantly with sensible defaults. Use "Customize" to tweak the receipt rule, max amount or code before saving.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {EXPENSE_CATEGORY_PRESETS.map((p) => {
                    const added = presetAlreadyAdded(p);
                    return (
                      <div key={p.key} className="rounded-md border p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-sm">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.description}</div>
                          </div>
                          {added && <Badge variant="secondary" className="text-[10px]">Added</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{p.code}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5">
                            {p.requires_receipt ? "Receipt required" : "No receipt needed"}
                          </span>
                          {p.max_amount != null && (
                            <span className="rounded bg-muted px-1.5 py-0.5">Max {p.max_amount}</span>
                          )}
                        </div>
                        <div className="flex gap-1 mt-auto">
                          <Button size="sm" className="flex-1" disabled={added} onClick={() => quickAddPreset(p)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> {added ? "Added" : "Quick add"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => customizePreset(p)}>
                            Customize
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Expense categories</CardTitle>
                  <CardDescription>Your tenant's active categories — edit defaults or add a custom one.</CardDescription>
                </div>
                <Button onClick={() => { setEditCat({ name: "", requires_receipt: true, is_active: true }); setCatOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Add custom
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Name</TableHead><TableHead>Code</TableHead>
                    <TableHead>Receipt?</TableHead><TableHead>Max</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {categories.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="font-mono text-xs">{c.code ?? "—"}</TableCell>
                        <TableCell>{c.requires_receipt ? "Yes" : "No"}</TableCell>
                        <TableCell>{c.max_amount ? c.max_amount : "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => { setEditCat(c); setCatOpen(true); }}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{drawer?.claim?.title}</DialogTitle>
          </DialogHeader>
          {drawer?.claim && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {drawer.claim.employees?.first_name} {drawer.claim.employees?.last_name} • {drawer.claim.employees?.job_title}
                </div>
                <Badge className={STATUS_TONE[drawer.claim.status]+" border-0 capitalize"}>{drawer.claim.status}</Badge>
              </div>
              <div className="text-2xl font-display">{drawer.claim.currency} {Number(drawer.claim.total_amount).toFixed(2)}</div>
              {drawer.claim.description && <p className="text-sm text-muted-foreground">{drawer.claim.description}</p>}

              <Table>
                <TableHeader><TableRow>
                  <TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Merchant</TableHead>
                  <TableHead className="text-right">Amount</TableHead><TableHead>Receipt</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {drawer.lines.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs">{l.expense_date}</TableCell>
                      <TableCell>{l.expense_categories?.name ?? "—"}</TableCell>
                      <TableCell>{l.merchant ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">{l.currency} {Number(l.amount).toFixed(2)}</TableCell>
                      <TableCell>{l.receipt_path ? <Button variant="link" size="sm" onClick={() => viewReceipt(l.receipt_path)}>View</Button> : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {drawer.claim.status === "recommended" && drawer.claim.recommended_at && (
                <div className="rounded-md border border-status-working/30 bg-status-working/5 p-3 text-sm">
                  <div className="font-medium text-status-working">Recommended by manager</div>
                  <div className="text-xs text-muted-foreground">{new Date(drawer.claim.recommended_at).toLocaleString()}</div>
                  {drawer.claim.recommendation_note && <div className="mt-1">{drawer.claim.recommendation_note}</div>}
                </div>
              )}

              {(drawer.claim.status === "submitted" || drawer.claim.status === "recommended") && (
                <div className="space-y-2">
                  <Label>Comment (optional)</Label>
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Note for the employee" />
                </div>
              )}
              {drawer.claim.status === "approved" && (
                <div className="space-y-2">
                  <Label>Payment reference</Label>
                  <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Bank transfer reference" />
                </div>
              )}

              {drawer.approvals && drawer.approvals.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Audit history</Label>
                  <ol className="space-y-2 border-l border-border pl-4">
                    {drawer.approvals.map((a: any) => (
                      <li key={a.id} className="text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">{a.action.replace(/_/g, " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        {a.comment && <div className="text-muted-foreground text-xs mt-0.5">{a.comment}</div>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {(drawer?.claim?.status === "submitted" || drawer?.claim?.status === "recommended") && (
              <>
                <Button variant="outline" onClick={() => doDecide("reject")}><X className="h-4 w-4 mr-1" /> Reject</Button>
                <Button onClick={() => doDecide("approve")}><Check className="h-4 w-4 mr-1" /> Approve</Button>
              </>
            )}
            {drawer?.claim?.status === "approved" && (
              <Button onClick={() => doDecide("pay")}><DollarSign className="h-4 w-4 mr-1" /> Mark paid</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCat.id ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editCat.name} onChange={(e) => setEditCat({...editCat, name: e.target.value})} /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Code</Label><Input value={editCat.code ?? ""} onChange={(e) => setEditCat({...editCat, code: e.target.value})} /></div>
              <div><Label>Max amount</Label><Input type="number" step="0.01" value={editCat.max_amount ?? ""} onChange={(e) => setEditCat({...editCat, max_amount: e.target.value})} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={editCat.requires_receipt} onCheckedChange={(v) => setEditCat({...editCat, requires_receipt: !!v})} /> Requires receipt</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={editCat.is_active} onCheckedChange={(v) => setEditCat({...editCat, is_active: !!v})} /> Active</label>
          </div>
          <DialogFooter><Button onClick={saveCat}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
