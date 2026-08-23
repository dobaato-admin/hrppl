/**
 * Employee-facing work-from-home requests.
 *
 * The page exists because of a hard edge in attendance: in a tenant that runs
 * geofences, clocking in from outside every fence is refused outright. That is
 * the correct default and a broken one for anyone legitimately working
 * remotely, so this is the route through it — request the days, get them
 * approved, and the clock-in succeeds (flagged for review) instead of failing.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/monday";
import { toast } from "sonner";
import { House, Plus, Info } from "lucide-react";
import { cancelMyWfhRequest, listMyWfhRequests, requestWfh } from "@/lib/wfh.functions";
import { localYmd } from "@/lib/work-date";

export const Route = createFileRoute("/me/wfh")({
  head: () => ({ meta: [{ title: "Work from home — hrppl" }] }),
  component: MyWfhPage,
});

interface WfhRow {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  work_address: string | null;
  status: string;
  decision_note: string | null;
  created_at: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

function MyWfhPage() {
  const fnList = useServerFn(listMyWfhRequests);
  const fnRequest = useServerFn(requestWfh);
  const fnCancel = useServerFn(cancelMyWfhRequest);

  const [rows, setRows] = useState<WfhRow[]>([]);
  const [hasEmployee, setHasEmployee] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => localYmd(new Date()), []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState("");
  const [workAddress, setWorkAddress] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fnList({ data: undefined });
      setRows((res.requests ?? []) as WfhRow[]);
      setHasEmployee(res.hasEmployee);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load your requests");
    } finally {
      setLoading(false);
    }
  }, [fnList]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (endDate < startDate) {
      toast.error("End date cannot be before the start date");
      return;
    }
    setBusy(true);
    try {
      await fnRequest({
        data: {
          startDate,
          endDate,
          reason: reason.trim() || undefined,
          workAddress: workAddress.trim() || undefined,
        },
      });
      toast.success("Request sent for approval");
      setReason("");
      setWorkAddress("");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not send the request", {
        duration: 8000,
      });
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    setBusy(true);
    try {
      await fnCancel({ data: { id } });
      toast.success("Request withdrawn");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not withdraw the request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Work from home" subtitle="Request remote days and track their approval.">
      <section className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {!hasEmployee ? (
          <EmptyState
            icon={House}
            title="No employee record"
            description="Work-from-home requests are made against an employee record, and your account is not linked to one. Ask your HR administrator to link it."
          />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request remote days</CardTitle>
                <CardDescription>
                  An approved request lets you clock in from outside your organisation&rsquo;s work
                  zones. Remote punches are recorded as such and reviewed by your manager or HR.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="wfh-start">First day</Label>
                    <Input
                      id="wfh-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate < e.target.value) setEndDate(e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wfh-end">Last day</Label>
                    <Input
                      id="wfh-end"
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wfh-address">Where you will be working (optional)</Label>
                  <Input
                    id="wfh-address"
                    placeholder="Home address, co-working space, client site…"
                    value={workAddress}
                    onChange={(e) => setWorkAddress(e.target.value)}
                    maxLength={300}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wfh-reason">Reason (optional)</Label>
                  <Textarea
                    id="wfh-reason"
                    placeholder="Anything your approver should know."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      One pending or approved request per day, and dates cannot be in the past. Your
                      manager, HR or an organisation administrator decides it —{" "}
                      <span className="font-medium">never you</span>, even if you hold one of those
                      roles yourself.
                    </span>
                  </p>
                  <Button onClick={submit} disabled={busy}>
                    <Plus className="mr-1.5 h-4 w-4" /> Send request
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                ) : rows.length === 0 ? (
                  <EmptyState
                    icon={House}
                    title="No requests yet"
                    description="Requests you send will appear here with their approval status."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            {r.start_date}
                            {r.end_date !== r.start_date ? ` → ${r.end_date}` : ""}
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[22rem] text-sm text-muted-foreground">
                            {r.reason || "—"}
                            {r.decision_note ? (
                              <span className="block text-xs italic">Note: {r.decision_note}</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* Withdrawable while pending, and while approved
                                but not yet started — plans change, and making
                                someone chase an approver to release a day they
                                no longer need is friction for its own sake.
                                Once the window opens it is an approver's call,
                                because a remote punch may already depend on it. */}
                            {r.status === "pending" ||
                            (r.status === "approved" && r.start_date > today) ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => cancel(r.id)}
                              >
                                Withdraw
                              </Button>
                            ) : r.status === "approved" ? (
                              <span className="text-xs text-muted-foreground">
                                Started — ask your approver
                              </span>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </AppShell>
  );
}
