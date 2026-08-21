import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { listClients, listInvoices, upsertInvoice, markInvoicePaid, getInvoice } from "@/lib/practice.functions";
import { buildInvoicePdf } from "@/lib/invoice-pdf";
import { toast } from "sonner";
import { Check, Plus, Trash2, Download } from "lucide-react";

export const Route = createFileRoute("/practice/invoices")({
  head: () => ({ meta: [{ title: "Invoices — WorldPay HRMS" }] }),
  component: InvoicesPage,
});

const STATUS_TONE: Record<string, string> = {
  draft: "bg-status-pending text-status-pending-foreground",
  sent: "bg-status-info text-status-info-foreground",
  paid: "bg-status-done text-status-done-foreground",
  overdue: "bg-destructive text-destructive-foreground",
  void: "bg-muted text-muted-foreground",
};

function InvoicesPage() {
  const fetchInvoices = useServerFn(listInvoices);
  const mark = useServerFn(markInvoicePaid);
  const fetchInvoice = useServerFn(getInvoice);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["invoices"], queryFn: () => fetchInvoices({}) });

  const [preview, setPreview] = useState<{ url: string; filename: string; doc: any } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function setPaid(id: string) {
    try {
      await mark({ data: { id } });
      toast.success("Marked as paid");
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function openPreview(id: string) {
    setPreviewLoading(true);
    try {
      const res = await fetchInvoice({ data: { id } });
      if (!res?.invoice) throw new Error("Invoice not found");
      const { doc, filename } = buildInvoicePdf({ invoice: res.invoice as any, lines: (res.lines ?? []) as any });
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPreview({ url, filename, doc });
    } catch (e: any) { toast.error(e?.message ?? "Failed to generate PDF"); }
    finally { setPreviewLoading(false); }
  }

  function closePreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  function confirmDownload() {
    if (!preview) return;
    preview.doc.save(preview.filename);
  }


  return (
    <AppShell title="Invoices" subtitle="Bill clients for completed work">
      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <InvoiceDialog onSaved={() => qc.invalidateQueries({ queryKey: ["invoices"] })} />
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading…</p> : (data?.invoices ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead><TableHead>Client</TableHead>
                    <TableHead>Issued</TableHead><TableHead>Due</TableHead>
                    <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.clients?.name}</TableCell>
                      <TableCell>{inv.issue_date}</TableCell>
                      <TableCell>{inv.due_date ?? "—"}</TableCell>
                      <TableCell>{inv.currency_code} {Number(inv.total).toFixed(2)}</TableCell>
                      <TableCell><Badge className={STATUS_TONE[inv.status] ?? ""}>{inv.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openPreview(inv.id)} disabled={previewLoading}>
                            <Download className="mr-1 h-3 w-3" /> PDF
                          </Button>
                          {inv.status !== "paid" && (
                            <Button size="sm" variant="outline" onClick={() => setPaid(inv.id)}>
                              <Check className="mr-1 h-3 w-3" /> Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => { if (!o) closePreview(); }}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader><DialogTitle>Invoice preview</DialogTitle></DialogHeader>
          {preview && (
            <iframe src={preview.url} title="Invoice PDF preview" className="flex-1 w-full rounded border" />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closePreview}>Close</Button>
            <Button onClick={confirmDownload}><Download className="mr-1 h-3 w-3" /> Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function InvoiceDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const fetchClients = useServerFn(listClients);
  const { data: cd } = useQuery({ queryKey: ["clients"], queryFn: () => fetchClients({}), enabled: open });
  const save = useServerFn(upsertInvoice);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<any>({
    client_id: "", invoice_number: "", status: "draft",
    issue_date: today, due_date: "", currency_code: "USD",
    notes: "", terms: "",
    lines: [{ description: "", quantity: 1, unit_price: 0, tax_rate: 0 }],
  });

  function setLine(i: number, patch: any) {
    const next = [...form.lines]; next[i] = { ...next[i], ...patch }; setForm({ ...form, lines: next });
  }
  function addLine() { setForm({ ...form, lines: [...form.lines, { description: "", quantity: 1, unit_price: 0, tax_rate: 0 }] }); }
  function removeLine(i: number) { setForm({ ...form, lines: form.lines.filter((_: any, x: number) => x !== i) }); }

  const subtotal = form.lines.reduce((s: number, l: any) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);
  const tax = form.lines.reduce((s: number, l: any) => s + Number(l.quantity || 0) * Number(l.unit_price || 0) * (Number(l.tax_rate || 0) / 100), 0);

  async function submit() {
    try {
      await save({ data: {
        ...form,
        due_date: form.due_date || null,
        lines: form.lines.map((l: any) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
          tax_rate: Number(l.tax_rate),
        })),
      }});
      toast.success("Invoice saved");
      setOpen(false); onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New invoice</Button></DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pick client" /></SelectTrigger>
                <SelectContent>{(cd?.clients ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Invoice #</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></div>
            <div><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
            <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div><Label>Currency</Label><Input maxLength={3} value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label>Line items</Label>
              <Button size="sm" variant="outline" onClick={addLine}><Plus className="mr-1 h-3 w-3" /> Add</Button>
            </div>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Description</TableHead><TableHead>Qty</TableHead>
                <TableHead>Unit price</TableHead><TableHead>Tax %</TableHead>
                <TableHead>Total</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {form.lines.map((l: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell><Input value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} /></TableCell>
                    <TableCell><Input type="number" step="0.25" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} className="w-20" /></TableCell>
                    <TableCell><Input type="number" step="0.01" value={l.unit_price} onChange={(e) => setLine(i, { unit_price: e.target.value })} className="w-28" /></TableCell>
                    <TableCell><Input type="number" step="0.5" value={l.tax_rate} onChange={(e) => setLine(i, { tax_rate: e.target.value })} className="w-20" /></TableCell>
                    <TableCell>{(Number(l.quantity || 0) * Number(l.unit_price || 0) * (1 + Number(l.tax_rate || 0) / 100)).toFixed(2)}</TableCell>
                    <TableCell>{form.lines.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4" /></Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-6 text-sm">
              <div>Subtotal: <strong>{form.currency_code} {subtotal.toFixed(2)}</strong></div>
              <div>Tax: <strong>{form.currency_code} {tax.toFixed(2)}</strong></div>
              <div>Total: <strong>{form.currency_code} {(subtotal + tax).toFixed(2)}</strong></div>
            </div>
          </div>

          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!form.client_id || !form.invoice_number || !form.currency_code}>Save invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
