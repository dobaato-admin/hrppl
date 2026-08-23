/**
 * The requests inbox — everything you have asked for, and everything waiting on
 * you, in one place.
 *
 * This page used to show support tickets only, which meant "what did I ask for
 * and where did it get to?" was answered by visiting `/leave`, `/me/wfh`,
 * `/me/expenses`, `/me/toil` and `/me/grievances` in turn and remembering which
 * of them existed. Six tables model the same idea — somebody asked, somebody
 * decides — so they are listed together here, normalised by
 * `requests-inbox.functions.ts`.
 *
 * Strictly personal. The organisation-wide repository — every request from
 * everyone, in every state — is /admin/requests, and approvers are pointed
 * there rather than given a second tab here. One page per audience: mixing
 * "what did I ask for" with "what must I decide" is how the old navigation got
 * to 101 items.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlatformAccountNotice } from "@/components/PlatformAccountNotice";
import { RequestList, KindSummary, IncompleteNotice } from "@/components/requests/RequestList";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Plus, Inbox } from "lucide-react";
import { createSupportTicket } from "@/lib/support-tickets.functions";
import {
  listMyRequests,
  REQUEST_KIND_LABELS,
  type RequestKind,
  type StatusGroup,
} from "@/lib/requests-inbox.functions";

export const Route = createFileRoute("/me/requests")({
  head: () => ({ meta: [{ title: "Requests — hrppl" }] }),
  component: RequestsInboxPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{String(error)}</div>
  ),
});

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

function RequestsInboxPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fnMine = useServerFn(listMyRequests);
  const fnCreate = useServerFn(createSupportTicket);

  const [kindFilter, setKindFilter] = useState<RequestKind | "all">("all");
  const [groupFilter, setGroupFilter] = useState<StatusGroup | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const mine = useQuery({
    queryKey: ["requests-inbox-mine", user?.id],
    queryFn: () => fnMine({ data: undefined }),
  });

  const [form, setForm] = useState({
    category: "stationery",
    subject: "",
    description: "",
    priority: "normal",
    requested_amount: "",
    requested_for_date: "",
  });

  const create = useMutation({
    mutationFn: async () =>
      fnCreate({
        data: {
          category: form.category as never,
          subject: form.subject,
          description: form.description,
          priority: form.priority as never,
          requested_amount: form.requested_amount ? Number(form.requested_amount) : null,
          requested_for_date: form.requested_for_date || null,
        },
      }),
    onSuccess: () => {
      toast.success("Request submitted");
      setForm({
        category: "stationery",
        subject: "",
        description: "",
        priority: "normal",
        requested_amount: "",
        requested_for_date: "",
      });
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["requests-inbox-mine", user?.id] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not submit request"),
  });

  const myRows = mine.data?.rows ?? [];
  const filtered = myRows.filter(
    (r) =>
      (kindFilter === "all" || r.kind === kindFilter) &&
      (groupFilter === "all" || r.group === groupFilter),
  );
  const openCount = myRows.filter((r) => r.group === "pending").length;

  const showAmount = ["overtime_payment", "expense_reimbursement"].includes(form.category);
  const showDate = ["shift_swap", "time_in_lieu", "overtime_payment"].includes(form.category);

  return (
    <AppShell
      title="Requests"
      subtitle="Everything you have asked for, and anything waiting on you."
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> New request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New request</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                For leave, remote work or expenses use their own forms —{" "}
                <Link to="/leave" className="underline">
                  leave
                </Link>
                ,{" "}
                <Link to="/me/wfh" className="underline">
                  work from home
                </Link>
                ,{" "}
                <Link to="/me/expenses" className="underline">
                  expenses
                </Link>
                . Everything else starts here.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="req-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger id="req-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="req-subject">Subject</Label>
                <Input
                  id="req-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="req-desc">Description</Label>
                <Textarea
                  id="req-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {showAmount && (
                <div className="space-y-1.5">
                  <Label htmlFor="req-amount">Amount</Label>
                  <Input
                    id="req-amount"
                    type="number"
                    value={form.requested_amount}
                    onChange={(e) => setForm({ ...form, requested_amount: e.target.value })}
                  />
                </div>
              )}
              {showDate && (
                <div className="space-y-1.5">
                  <Label htmlFor="req-date">For date</Label>
                  <Input
                    id="req-date"
                    type="date"
                    value={form.requested_for_date}
                    onChange={(e) => setForm({ ...form, requested_for_date: e.target.value })}
                  />
                </div>
              )}
              <Button
                className="w-full"
                disabled={create.isPending || !form.subject.trim()}
                onClick={() => create.mutate()}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <section className="mx-auto max-w-5xl space-y-4 px-6 py-8">
        {/* Approving happens elsewhere on purpose. Mixing "what did I ask for"
            with "what must I decide" is how the navigation reached 101 items. */}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Inbox className="h-3.5 w-3.5" />
          Deciding other people&rsquo;s requests happens in{" "}
          <Link to="/admin/requests" className="font-medium underline">
            Requests
          </Link>{" "}
          under Organisation.
        </p>
        <div className="space-y-3">
          {mine.data && "hasEmployee" in mine.data && !mine.data.hasEmployee ? (
            <PlatformAccountNotice subject="Personal requests" />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={kindFilter}
                  onValueChange={(v) => setKindFilter(v as RequestKind | "all")}
                >
                  <SelectTrigger className="h-8 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {(Object.keys(REQUEST_KIND_LABELS) as RequestKind[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {REQUEST_KIND_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={groupFilter}
                  onValueChange={(v) => setGroupFilter(v as StatusGroup | "all")}
                >
                  <SelectTrigger className="h-8 w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any status</SelectItem>
                    <SelectItem value="pending">Awaiting a decision</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Declined</SelectItem>
                    <SelectItem value="cancelled">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                <KindSummary rows={filtered} />
              </div>
              <IncompleteNotice kinds={mine.data?.incomplete ?? []} />
              {mine.isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
              ) : (
                <RequestList rows={filtered} />
              )}
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}
