/**
 * The work-from-home approval queue.
 *
 * Gated at the route rather than in the page body, per the convention in
 * CLAUDE.md — an `AdminGate` wrapper stops the page mounting at all, where an
 * in-body check renders a denial with no chrome around it. That exact mistake
 * left /admin/review-templates without a sidebar for six of eight roles.
 *
 * The allow-set mirrors the RLS policy on `wfh_requests`. If they drift, the
 * page loads and every decision fails with a raw Postgres error instead.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { WFH_APPROVER_ROLES } from "@/lib/rbac";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/monday";
import { toast } from "sonner";
import { House, Check, X, MapPin } from "lucide-react";
import {
  decideWfhRequest,
  getWfhSettings,
  listWfhForApproval,
  setWfhEnabled,
} from "@/lib/wfh.functions";
import { PlatformAccountNotice } from "@/components/PlatformAccountNotice";

export const Route = createFileRoute("/admin/wfh")({
  head: () => ({ meta: [{ title: "Work-from-home approvals — hrppl" }] }),
  component: () => (
    <AdminGate allow={WFH_APPROVER_ROLES}>
      <WfhApprovalsPage />
    </AdminGate>
  ),
});

interface Row {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string | null;
  startDate: string;
  endDate: string;
  reason: string | null;
  workAddress: string | null;
  status: string;
  decisionNote: string | null;
  createdAt: string;
}

type StatusFilter = "pending" | "approved" | "rejected" | "all";

function WfhApprovalsPage() {
  const { roles } = useAuth();
  const canManageSettings = roles.includes("org_admin") || roles.includes("super_admin");
  const fnList = useServerFn(listWfhForApproval);
  const fnDecide = useServerFn(decideWfhRequest);
  const fnGetSettings = useServerFn(getWfhSettings);
  const fnSetEnabled = useServerFn(setWfhEnabled);

  const [status, setStatus] = useState<StatusFilter>("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [noTenantScope, setNoTenantScope] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [wfhEnabled, setWfhEnabledState] = useState(true);
  const [settingsBusy, setSettingsBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fnList({ data: { status } });
      setRows(res.requests as Row[]);
      setNoTenantScope(!!res.noTenantScope);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not load requests");
    } finally {
      setLoading(false);
    }
  }, [fnList, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canManageSettings) return;
    (async () => {
      try {
        const res = await fnGetSettings({ data: undefined });
        setWfhEnabledState(res.enabled);
      } catch {
        // A settings-load failure should not block the approval queue below.
      }
    })();
  }, [canManageSettings, fnGetSettings]);

  async function toggleWfhEnabled(next: boolean) {
    setSettingsBusy(true);
    try {
      const res = await fnSetEnabled({ data: { enabled: next } });
      setWfhEnabledState(next);
      if (next) {
        toast.success("Work-from-home requests re-enabled");
      } else {
        // Switching off stops new requests and blocks new approvals, but does
        // not revoke windows already approved — somebody was told they may work
        // from home that day. Saying how many are still in force is the whole
        // point: a consequence nobody is told about is one nobody accounts for.
        const left = res?.remainingApprovedWindows ?? 0;
        toast.success("Work-from-home requests disabled", {
          description:
            left > 0
              ? `${left} already-approved ${left === 1 ? "window is" : "windows are"} still in force and will continue to allow remote clock-in. Decline them individually if they should not.`
              : "No approved windows remain, so this takes effect immediately.",
        });
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not update the setting");
    } finally {
      setSettingsBusy(false);
    }
  }

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    try {
      await fnDecide({ data: { id, decision, note: notes[id]?.trim() || undefined } });
      toast.success(decision === "approved" ? "Approved" : "Declined");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save the decision", {
        duration: 8000,
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell
      title="Work-from-home approvals"
      subtitle="Approve remote days so the employee can clock in from outside your work zones."
    >
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {canManageSettings && (
          <Card>
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div>
                <Label htmlFor="wfh-enabled-toggle" className="text-sm font-medium">
                  Allow work-from-home requests
                </Label>
                <p className="text-xs text-muted-foreground">
                  Off hides the request form on every employee&rsquo;s Work from home page. Existing
                  requests are unaffected.
                </p>
              </div>
              <Switch
                id="wfh-enabled-toggle"
                checked={wfhEnabled}
                disabled={settingsBusy}
                onCheckedChange={toggleWfhEnabled}
              />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-base">Requests</CardTitle>
              <CardDescription>
                Approving a request does not waive the geofence — a remote punch is accepted, marked
                as remote, and queued for review under{" "}
                <span className="font-medium">Geofences → Reconciliation</span>.
              </CardDescription>
            </div>
            <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Declined</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : noTenantScope ? (
              <PlatformAccountNotice subject="Work-from-home requests" />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={House}
                title={status === "pending" ? "Nothing waiting" : "No requests"}
                description={
                  status === "pending"
                    ? "Work-from-home requests needing a decision will appear here."
                    : "No requests match this filter. Your own requests are never listed here — they are decided by someone else."
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.employeeName || "—"}</div>
                        {r.jobTitle ? (
                          <div className="text-xs text-muted-foreground">{r.jobTitle}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {r.startDate}
                        {r.endDate !== r.startDate ? ` → ${r.endDate}` : ""}
                      </TableCell>
                      <TableCell className="max-w-[20rem] text-sm text-muted-foreground">
                        {r.reason || "—"}
                        {r.workAddress ? (
                          <span className="mt-0.5 flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" /> {r.workAddress}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "approved"
                              ? "default"
                              : r.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "pending" ? (
                          <div className="flex flex-col items-end gap-2">
                            <Input
                              placeholder="Note (optional)"
                              className="h-8 w-48"
                              value={notes[r.id] ?? ""}
                              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={busyId === r.id}
                                onClick={() => decide(r.id, "approved")}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === r.id}
                                onClick={() => decide(r.id, "rejected")}
                              >
                                <X className="mr-1 h-3.5 w-3.5" /> Decline
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {r.decisionNote || "—"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
