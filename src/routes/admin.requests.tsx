import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { listInboxTickets, updateTicketStatus } from "@/lib/support-tickets.functions";
import { AdminGate } from "@/components/AdminGate";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";

const CATEGORY_LABELS: Record<string, string> = {
  stationery: "Stationery", equipment: "Equipment", shift_swap: "Shift swap",
  time_in_lieu: "Time in lieu", overtime_payment: "Overtime", expense_reimbursement: "Expense",
  api_access_request: "API access", other: "Other",
};

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Requests inbox — hrppl" }] }),
  component: () => (<AdminGate allow={ADMIN_LAYOUT_ROLES}><AdminRequestsPage /></AdminGate>),
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{String(error)}</div>,
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

function AdminRequestsPage() {
  const list = useServerFn(listInboxTickets);
  const update = useServerFn(updateTicketStatus);
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ["admin-tickets"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: async (input: { ticket_id: string; status: any; decision_notes?: string }) =>
      update({ data: input }),
    onSuccess: () => { toast.success("Updated"); router.invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Could not update"),
  });

  return (
    <AppShell title="Requests" subtitle="Stationery, equipment, shift swaps, time in lieu, overtime and reimbursement requests from your team">
      <Card>
        <CardHeader><CardTitle>Inbox</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {(data?.tickets ?? []).length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : null}
          <ul className="divide-y">
            {(data?.tickets ?? []).map((t: any) => (
              <li key={t.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{t.subject}</span>
                      <Badge variant="outline">{CATEGORY_LABELS[t.category] ?? t.category}</Badge>
                      <Badge variant={t.priority === "urgent" || t.priority === "high" ? "destructive" : "secondary"}>{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.employees?.first_name} {t.employees?.last_name}
                      {t.employees?.job_title ? ` · ${t.employees.job_title}` : ""}
                      {" · "}
                      {new Date(t.created_at).toLocaleString()}
                      {t.requested_amount ? ` · ${t.requested_amount} ${t.currency_code ?? ""}` : ""}
                      {t.requested_for_date ? ` · for ${t.requested_for_date}` : ""}
                    </p>
                    {t.decision_notes ? (
                      <p className="mt-1 text-xs italic text-muted-foreground">"{t.decision_notes}"</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === "approved" || t.status === "fulfilled" ? "default" : t.status === "rejected" ? "destructive" : "secondary"}>
                      {t.status}
                    </Badge>
                    <DecideDialog
                      onDecide={(status, notes) => mut.mutate({ ticket_id: t.id, status, decision_notes: notes })}
                      disabled={mut.isPending}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function DecideDialog({ onDecide, disabled }: { onDecide: (s: any, n: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>Act</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Decide on request</DialogTitle></DialogHeader>
        <Textarea placeholder="Decision notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => { onDecide("in_review", notes); setOpen(false); }}>Mark in review</Button>
          <Button variant="destructive" onClick={() => { onDecide("rejected", notes); setOpen(false); }}>Reject</Button>
          <Button onClick={() => { onDecide("approved", notes); setOpen(false); }}>Approve</Button>
          <Button variant="outline" onClick={() => { onDecide("fulfilled", notes); setOpen(false); }}>Mark fulfilled</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
