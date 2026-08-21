import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { myAssignments, acknowledgeAsset, reportReturn } from "@/lib/assets.functions";
import { myOffboarding, toggleChecklistItem } from "@/lib/offboarding.functions";


export const Route = createFileRoute("/me/assets")({
  component: MyAssetsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">{(error as Error).message}</p>
        <Button onClick={() => { reset(); router.invalidate(); }}>Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

function MyAssetsPage() {
  const qc = useQueryClient();
  const fMine = useServerFn(myAssignments);
  const fAck = useServerFn(acknowledgeAsset);
  const fOffb = useServerFn(myOffboarding);
  const fToggle = useServerFn(toggleChecklistItem);

  const mineQ = useQuery({ queryKey: ["me-assets"], queryFn: () => fMine() });
  const offbQ = useQuery({ queryKey: ["me-offboarding"], queryFn: () => fOffb() });
  const fReport = useServerFn(reportReturn);

  const ackM = useMutation({
    mutationFn: (id: string) => fAck({ data: { assignmentId: id } }),
    onSuccess: () => { toast.success("Receipt acknowledged"); qc.invalidateQueries({ queryKey: ["me-assets"] }); },
  });
  const toggleM = useMutation({
    mutationFn: (v: { id: string; completed: boolean }) => fToggle({ data: { itemId: v.id, completed: v.completed } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me-offboarding"] }),
  });
  const [returnForm, setReturnForm] = useState<Record<string, { qty: string; cond: "good"|"damaged"|"lost"; notes: string; condNotes: string }>>({});
  const reportM = useMutation({
    mutationFn: (v: { id: string; qty: number; cond: "good"|"damaged"|"lost"; notes: string; condNotes: string }) =>
      fReport({ data: { assignmentId: v.id, quantityReturned: v.qty, returnCondition: v.cond, returnNotes: v.notes, conditionNotes: v.condNotes } }),
    onSuccess: () => { toast.success("Return reported — awaiting HR confirmation"); qc.invalidateQueries({ queryKey: ["me-assets"] }); },
    onError: (e: any) => toast.error(e.message),
  });


  return (
    <AppShell title="My assets" subtitle="Company items issued to you. Acknowledge receipt and return at offboarding.">
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Issued to me</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(mineQ.data?.assignments ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing issued yet.</p>
            ) : (
              (mineQ.data?.assignments ?? []).map((a: any) => {
                const f = returnForm[a.id] ?? { qty: String(a.quantity_issued ?? 1), cond: "good" as const, notes: "", condNotes: "" };
                const setF = (patch: Partial<typeof f>) => setReturnForm({ ...returnForm, [a.id]: { ...f, ...patch } });
                const issued = a.quantity_issued ?? 1;
                const reported = a.return_status === "reported_partial" || a.return_status === "reported_full";
                const confirmed = a.return_status === "confirmed";
                const disputed = a.return_status === "disputed";
                const approvalBadge = a.approval_status === "pending"
                  ? <Badge variant="outline">Awaiting approval</Badge>
                  : a.approval_status === "rejected" ? <Badge variant="destructive">Rejected</Badge> : null;
                return (
                  <div key={a.id} className="rounded border p-3 text-sm space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.assets?.name}</span>
                      <span className="font-mono text-xs">{a.assets?.asset_tag}</span>
                      <Badge variant="outline" className="capitalize">{a.assets?.category?.replace("_"," ")}</Badge>
                      {approvalBadge}
                      {confirmed ? <Badge>Return confirmed</Badge>
                        : disputed ? <Badge variant="destructive">Return disputed</Badge>
                        : reported ? <Badge variant="outline">Return reported — awaiting HR</Badge>
                        : a.acknowledged_at ? <Badge variant="outline">Acknowledged</Badge>
                        : <Badge variant="outline">Pending acknowledgement</Badge>}
                      {issued > 1 && <span className="text-xs text-muted-foreground ml-auto">Issued: {issued}</span>}
                    </div>
                    {a.assets?.serial_number && <p className="text-xs text-muted-foreground">SN: {a.assets.serial_number}</p>}
                    {a.expected_return_on && !confirmed && <p className="text-xs text-muted-foreground">Expected return: {a.expected_return_on}</p>}
                    {a.condition_notes && <p className="text-xs text-muted-foreground">Issue condition: {a.condition_notes}</p>}
                    {!a.acknowledged_at && a.approval_status === "approved" && !reported && !confirmed && (
                      <Button size="sm" onClick={() => ackM.mutate(a.id)}>Acknowledge receipt</Button>
                    )}
                    {a.approval_status === "approved" && !confirmed && (
                      <details className="rounded border bg-muted/30 p-2">
                        <summary className="cursor-pointer text-xs font-medium">{reported ? "Update return report" : "Report return"}</summary>
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Quantity returned (of {issued})</Label>
                              <Input type="number" min={0} max={issued} value={f.qty} onChange={(e) => setF({ qty: e.target.value })} />
                            </div>
                            <div>
                              <Label className="text-xs">Condition</Label>
                              <Select value={f.cond} onValueChange={(v) => setF({ cond: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="damaged">Damaged</SelectItem>
                                  <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Condition notes</Label>
                            <Textarea rows={2} value={f.condNotes} onChange={(e) => setF({ condNotes: e.target.value })} placeholder="Scratches, missing accessories…" />
                          </div>
                          <div>
                            <Label className="text-xs">Return notes</Label>
                            <Textarea rows={2} value={f.notes} onChange={(e) => setF({ notes: e.target.value })} placeholder="Where / who you returned it to" />
                          </div>
                          <Button size="sm" onClick={() => reportM.mutate({ id: a.id, qty: Number(f.qty || 0), cond: f.cond, notes: f.notes, condNotes: f.condNotes })}>
                            Submit return report
                          </Button>
                        </div>
                      </details>
                    )}
                  </div>
                );
              })

            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">My exit / offboarding</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!offbQ.data?.case ? (
              <p className="text-sm text-muted-foreground">No active offboarding case.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge className="capitalize">{(offbQ.data.case as any).status.replace(/_/g," ")}</Badge>
                  <Badge variant="outline" className="capitalize">{(offbQ.data.case as any).reason.replace(/_/g," ")}</Badge>
                  {(offbQ.data.case as any).last_working_day && (
                    <span className="text-xs text-muted-foreground">Last day: {(offbQ.data.case as any).last_working_day}</span>
                  )}
                </div>
                <p className="text-xs font-semibold mt-2">Your action items</p>
                {(offbQ.data.items ?? []).filter((it: any) => it.owner_role === "employee").map((it: any) => (
                  <label key={it.id} className="flex items-start gap-2 rounded border p-2 text-sm">
                    <input type="checkbox" checked={it.completed} onChange={(e) => toggleM.mutate({ id: it.id, completed: e.target.checked })} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={it.completed ? "line-through text-muted-foreground" : "font-medium"}>{it.title}</span>
                        {it.is_blocking && <Badge variant="outline">Required</Badge>}
                        {it.due_date && <span className="text-xs text-muted-foreground ml-auto">Due {it.due_date}</span>}
                      </div>
                    </div>
                  </label>
                ))}
                <p className="text-xs font-semibold mt-2">Full clearance</p>
                {(offbQ.data.items ?? []).filter((it: any) => it.owner_role !== "employee").map((it: any) => (
                  <div key={it.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                    <span className={it.completed ? "line-through text-muted-foreground" : ""}>{it.title}</span>
                    <Badge variant="outline" className="capitalize ml-auto">{it.owner_role}</Badge>
                    {it.completed ? <Badge>Done</Badge> : <Badge variant="outline">Pending</Badge>}
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
