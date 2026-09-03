/**
 * The organisation-wide request repository.
 *
 * Every request anyone in the tenant has raised, of any type, in any state —
 * leave, work-from-home, expenses, support tickets, time off in lieu and
 * grievances — with filters and full history. This is the page you come to
 * asking "has anyone asked for X?", "what is outstanding?", or "what did we
 * decide in March?", none of which were answerable before without visiting five
 * separate screens and knowing they existed.
 *
 * It replaces a support-tickets-only inbox that happened to occupy this route.
 * Ticket decisions are kept inline, because that workflow lived here and
 * nowhere else; every other type deep-links to the page that owns its rules.
 * Approving leave touches balances and approving work-from-home changes what
 * `clockIn` will accept, so those decisions belong with their domain logic
 * rather than duplicated into a generic list.
 *
 * Tenant scoping is explicit in `listApprovalQueue`, never left to RLS —
 * `super_admin`'s policies carry no tenant predicate, so an unscoped read here
 * would merge every customer's requests into one screen.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { TicketThread } from "@/components/requests/TicketThread";
import { AdminGate } from "@/components/AdminGate";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiTile } from "@/components/monday";
import { PlatformAccountNotice } from "@/components/PlatformAccountNotice";
import { RequestList, KindSummary, IncompleteNotice } from "@/components/requests/RequestList";
import { toast } from "sonner";
import { Clock3, CheckCircle2, XCircle, Search } from "lucide-react";
import { listInboxTickets, updateTicketStatus } from "@/lib/support-tickets.functions";
import {
  listApprovalQueue,
  REQUEST_KIND_LABELS,
  type RequestKind,
  type StatusGroup,
} from "@/lib/requests-inbox.functions";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Requests — hrppl" }] }),
  component: () => (
    <AdminGate feature="manager.requestsInbox">
      <AdminRequestsPage />
    </AdminGate>
  ),
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{String(error)}</div>
  ),
});

const CATEGORY_LABELS: Record<string, string> = {
  stationery: "Stationery",
  equipment: "Equipment",
  shift_swap: "Shift swap",
  time_in_lieu: "Time in lieu",
  overtime_payment: "Overtime",
  expense_reimbursement: "Expense",
  api_access_request: "API access",
  other: "Other",
};

function AdminRequestsPage() {
  const qc = useQueryClient();
  const fnQueue = useServerFn(listApprovalQueue);
  const fnTickets = useServerFn(listInboxTickets);
  const fnUpdateTicket = useServerFn(updateTicketStatus);

  const [kindFilter, setKindFilter] = useState<RequestKind | "all">("all");
  const [groupFilter, setGroupFilter] = useState<StatusGroup | "all">("all");
  const [search, setSearch] = useState("");

  // The whole history, not just what is outstanding: this page has to answer
  // "what did we decide" as well as "what is waiting".
  const all = useQuery({
    queryKey: ["admin-requests-all"],
    queryFn: () => fnQueue({ data: { group: "all" } }),
    retry: false,
  });
  const tickets = useQuery({ queryKey: ["admin-tickets"], queryFn: () => fnTickets() });

  const updateTicket = useMutation({
    mutationFn: async (input: { ticket_id: string; status: string; decision_notes?: string }) =>
      fnUpdateTicket({ data: input as never }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin-requests-all"] });
      qc.invalidateQueries({ queryKey: ["requests-inbox-queue"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  // Memoised: a fresh [] literal on every render would defeat the filter and
  // count memos immediately below it.
  const rows = useMemo(() => all.data?.rows ?? [], [all.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (kindFilter === "all" || r.kind === kindFilter) &&
        (groupFilter === "all" || r.group === groupFilter) &&
        (q === "" ||
          r.title.toLowerCase().includes(q) ||
          (r.employeeName ?? "").toLowerCase().includes(q) ||
          (r.detail ?? "").toLowerCase().includes(q)),
    );
  }, [rows, kindFilter, groupFilter, search]);

  const counts = useMemo(
    () => ({
      pending: rows.filter((r) => r.group === "pending").length,
      approved: rows.filter((r) => r.group === "approved").length,
      rejected: rows.filter((r) => r.group === "rejected").length,
    }),
    [rows],
  );

  const ticketRows = (tickets.data?.tickets ?? []) as Record<string, string>[];

  return (
    <AppShell
      title="Requests"
      subtitle="Every request across your organisation — leave, remote work, expenses, support, TOIL and grievances."
    >
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {all.data?.noTenantScope ? (
          <PlatformAccountNotice subject="Organisation requests" />
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <KpiTile
                label="Awaiting a decision"
                value={counts.pending}
                tone={counts.pending > 0 ? "working" : "done"}
                icon={Clock3}
              />
              <KpiTile label="Approved" value={counts.approved} tone="done" icon={CheckCircle2} />
              <KpiTile label="Declined" value={counts.rejected} tone="stuck" icon={XCircle} />
            </section>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All requests</TabsTrigger>
                <TabsTrigger value="tickets">
                  Support tickets{ticketRows.length > 0 ? ` (${ticketRows.length})` : ""}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search person or subject…"
                      className="h-8 w-64 pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
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
                <IncompleteNotice kinds={all.data?.incomplete ?? []} />
                {all.isLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <RequestList
                    rows={filtered}
                    showWho
                    emptyTitle="No requests match"
                    emptyDescription="Try a wider filter. Your own requests are never listed here — someone else decides them."
                  />
                )}
              </TabsContent>

              <TabsContent value="tickets" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Support tickets</CardTitle>
                    <CardDescription>
                      Stationery, equipment, shift swaps, time in lieu, overtime and reimbursement.
                      Decided here; every other request type is decided on its own page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tickets.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : ticketRows.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No open tickets.
                      </p>
                    ) : (
                      <ul className="divide-y">
                        {ticketRows.map((t) => (
                          <li key={t.id} className="flex items-start justify-between gap-3 py-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{t.subject}</span>
                                <Badge variant="outline">
                                  {CATEGORY_LABELS[t.category] ?? t.category}
                                </Badge>
                                <Badge variant="secondary">{t.status}</Badge>
                              </div>
                              {t.description ? (
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                  {t.description}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {/*
                                Deciding is one-way and only happens once. Most
                                tickets need a question answered first — what
                                size, which cost centre, when — and until now
                                there was nowhere to ask it.
                              */}
                              <TicketThread ticketId={t.id} subject={t.subject} />
                              <TicketDecision
                                disabled={updateTicket.isPending}
                                onDecide={(status, notes) =>
                                  updateTicket.mutate({
                                    ticket_id: t.id,
                                    status,
                                    decision_notes: notes,
                                  })
                                }
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </section>
    </AppShell>
  );
}

function TicketDecision({
  disabled,
  onDecide,
}: {
  disabled: boolean;
  onDecide: (status: string, notes?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          Decide
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decide request</DialogTitle>
        </DialogHeader>
        <Textarea
          rows={3}
          placeholder="Notes for the requester (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onDecide("rejected", notes || undefined);
              setOpen(false);
            }}
          >
            <XCircle className="mr-1.5 h-4 w-4" /> Decline
          </Button>
          <Button
            onClick={() => {
              onDecide("approved", notes || undefined);
              setOpen(false);
            }}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
