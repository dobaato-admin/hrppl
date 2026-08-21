import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Clock, Plus, Download, X } from "lucide-react";
import {
  getMyToilBalance,
  submitToilRequest,
  cancelToilRequest,
} from "@/lib/toil.functions";

export const Route = createFileRoute("/me/toil")({
  head: () => ({ meta: [{ title: "My time in lieu — hrppl" }] }),
  component: MyToilPage,
});

const STATUS_TONE: Record<string, string> = {
  pending: "bg-status-pending/20 text-status-pending",
  approved: "bg-status-done/20 text-status-done",
  rejected: "bg-status-stuck/20 text-status-stuck",
  cancelled: "bg-muted text-muted-foreground",
  active: "bg-status-done/20 text-status-done",
  consumed: "bg-muted text-muted-foreground",
  expired: "bg-status-stuck/20 text-status-stuck",
};

function MyToilPage() {
  const get = useServerFn(getMyToilBalance);
  const submit = useServerFn(submitToilRequest);
  const cancel = useServerFn(cancelToilRequest);
  const [data, setData] = useState<any>({ balance: null, accruals: [], requests: [] });
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState({
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    hours: 8,
    reason: "",
  });

  async function refresh() {
    const r = await get({});
    setData(r);
  }
  useEffect(() => { refresh(); }, []);

  async function onSubmit() {
    setWorking(true);
    try {
      await submit({ data: form });
      toast.success("TOIL request submitted");
      setOpen(false);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit");
    } finally {
      setWorking(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["Type", "Date", "Hours", "Source/Status", "Notes"],
      ...data.accruals.map((a: any) => [
        "Accrual",
        a.accrued_on,
        a.hours,
        `${a.source} / ${a.status}`,
        a.notes ?? "",
      ]),
      ...data.requests.map((r: any) => [
        "Request",
        `${r.start_date} → ${r.end_date}`,
        r.hours,
        r.status,
        r.reason ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toil-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const b = data.balance ?? {};
  return (
    <AppShell title="Time in lieu" subtitle="Your TOIL balance, accruals and requests">
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="grid flex-1 gap-3 sm:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardDescription>Available</CardDescription><CardTitle className="text-2xl">{Number(b.available_hours ?? 0).toFixed(2)}h</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Accrued</CardDescription><CardTitle className="text-2xl">{Number(b.accrued_hours ?? 0).toFixed(2)}h</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Consumed</CardDescription><CardTitle className="text-2xl">{Number(b.consumed_hours ?? 0).toFixed(2)}h</CardTitle></CardHeader></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Expired</CardDescription><CardTitle className="text-2xl">{Number(b.expired_hours ?? 0).toFixed(2)}h</CardTitle></CardHeader></Card>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download className="mr-1 h-4 w-4" /> Statement</Button>
            <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Request TOIL</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> My requests</CardTitle></CardHeader>
          <CardContent>
            {data.requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No TOIL requests yet.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Hours</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.requests.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.start_date} → {r.end_date}</TableCell>
                      <TableCell>{Number(r.hours).toFixed(2)}h</TableCell>
                      <TableCell><Badge className={`border-0 ${STATUS_TONE[r.status]}`}>{r.status}</Badge></TableCell>
                      <TableCell className="max-w-[20rem] truncate text-sm text-muted-foreground">{r.reason}</TableCell>
                      <TableCell>
                        {r.status === "pending" && (
                          <Button size="sm" variant="ghost" onClick={async () => { await cancel({ data: { id: r.id } }); toast.success("Cancelled"); refresh(); }}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Accrual history</CardTitle></CardHeader>
          <CardContent>
            {data.accruals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accruals yet.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead>Hours</TableHead><TableHead>Consumed</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.accruals.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.accrued_on}</TableCell>
                      <TableCell className="capitalize">{a.source.replace("_", " ")}</TableCell>
                      <TableCell>{Number(a.hours).toFixed(2)}h</TableCell>
                      <TableCell>{Number(a.consumed_hours).toFixed(2)}h</TableCell>
                      <TableCell>{a.expires_on ?? "—"}</TableCell>
                      <TableCell><Badge className={`border-0 ${STATUS_TONE[a.status]}`}>{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request TOIL time off</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>End date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div><Label>Hours</Label><Input type="number" min={0.25} step={0.25} value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></div>
            <div><Label>Reason (optional)</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <p className="text-xs text-muted-foreground">Available balance: {Number(b.available_hours ?? 0).toFixed(2)} hours</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={onSubmit} disabled={working}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
