import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createSupportTicket, listMyTickets } from "@/lib/support-tickets.functions";

const CATEGORY_LABELS: Record<string, string> = {
  stationery: "Stationery",
  equipment: "Equipment",
  shift_swap: "Shift swap",
  time_in_lieu: "Time in lieu",
  overtime_payment: "Overtime payment",
  expense_reimbursement: "Expense reimbursement",
  api_access_request: "API access",
  other: "Other",
};

export const Route = createFileRoute("/me/requests")({
  head: () => ({ meta: [{ title: "My requests — hrppl" }] }),
  component: MyRequestsPage,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{String(error)}</div>,
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

function MyRequestsPage() {
  const list = useServerFn(listMyTickets);
  const create = useServerFn(createSupportTicket);
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ["my-tickets"], queryFn: () => list() });

  const [form, setForm] = useState({
    category: "stationery",
    subject: "",
    description: "",
    priority: "normal",
    requested_amount: "",
    requested_for_date: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      const amt = form.requested_amount ? Number(form.requested_amount) : null;
      return create({
        data: {
          category: form.category as any,
          subject: form.subject,
          description: form.description,
          priority: form.priority as any,
          requested_amount: amt,
          requested_for_date: form.requested_for_date || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Request submitted");
      setForm({ category: "stationery", subject: "", description: "", priority: "normal", requested_amount: "", requested_for_date: "" });
      router.invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not submit request"),
  });

  const showAmount = ["overtime_payment", "expense_reimbursement"].includes(form.category);
  const showDate = ["shift_swap", "time_in_lieu", "overtime_payment"].includes(form.category);

  return (
    <AppShell title="My requests" subtitle="Raise a ticket for stationery, shift swaps, overtime, expense reimbursement and more">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>New request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== "api_access_request").map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} />
            </div>
            <div className="grid gap-2">
              <Label>Details</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={4000} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showDate && (
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.requested_for_date} onChange={(e) => setForm({ ...form, requested_for_date: e.target.value })} />
                </div>
              )}
              {showAmount && (
                <div className="grid gap-2">
                  <Label>Amount / hours</Label>
                  <Input type="number" min="0" step="0.01" value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: e.target.value })} />
                </div>
              )}
            </div>
            <Button onClick={() => mut.mutate()} disabled={mut.isPending || !form.subject || !form.description}>
              {mut.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent requests</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
            {(data?.tickets ?? []).length === 0 && !isLoading ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : null}
            <ul className="divide-y">
              {(data?.tickets ?? []).map((t: any) => (
                <li key={t.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[t.category] ?? t.category} · {new Date(t.created_at).toLocaleString()}
                      </p>
                      {t.decision_notes ? (
                        <p className="mt-1 text-xs italic text-muted-foreground">"{t.decision_notes}"</p>
                      ) : null}
                    </div>
                    <Badge variant={t.status === "approved" || t.status === "fulfilled" ? "default" : t.status === "rejected" ? "destructive" : "secondary"}>
                      {t.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
