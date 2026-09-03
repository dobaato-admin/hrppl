import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { can } from "@/lib/rbac";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { approveTimesheet, rejectTimesheet } from "@/lib/attendance.functions";

export const Route = createFileRoute("/org/timesheets")({
  head: () => ({ meta: [{ title: "Timesheets — hrppl" }] }),
  component: OrgTimesheets,
});

interface Timesheet {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  overtime_hours: number;
  status: string;
  submitted_at: string | null;
  rejection_reason: string | null;
  overtime_breakdown: Record<string, number> | null;
}
interface Emp {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}
interface PenaltyRate {
  id: string;
  code: string;
  name: string;
  rate_multiplier: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
}

function OrgTimesheets() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [rows, setRows] = useState<Timesheet[]>([]);
  const [emps, setEmps] = useState<Record<string, Emp>>({});
  const [rates, setRates] = useState<PenaltyRate[]>([]);
  const [rejectTarget, setRejectTarget] = useState<Timesheet | null>(null);
  const [reason, setReason] = useState("");
  const [approveTarget, setApproveTarget] = useState<Timesheet | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const fnApprove = useServerFn(approveTimesheet);
  const fnReject = useServerFn(rejectTimesheet);

  // W5 · Single source: the same feature key this page's nav row uses.
  // These pages carry no route-level gate component, only this inline
  // check, so the two were free to disagree — and did. The sidebar offered
  // the page and the page answered "Forbidden".
  const canAccess = can("org.requests", roles);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();
      if (prof?.tenant_id) {
        setTenantId(prof.tenant_id);
        const { data: t } = await supabase
          .from("tenants")
          .select("country_code")
          .eq("id", prof.tenant_id)
          .maybeSingle();
        if (t?.country_code) setCountryCode(t.country_code);
      }
    })();
  }, [user]);

  async function load() {
    if (!tenantId) return;
    const [tRes, eRes] = await Promise.all([
      supabase
        .from("timesheets")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("period_start", { ascending: false }),
      supabase
        .from("employees")
        .select("id,first_name,last_name,employee_number")
        .eq("tenant_id", tenantId),
    ]);
    setRows((tRes.data ?? []) as Timesheet[]);
    const m: Record<string, Emp> = {};
    (eRes.data ?? []).forEach((e: any) => {
      m[e.id] = e;
    });
    setEmps(m);
  }
  useEffect(() => {
    load();
  }, [tenantId]);

  useEffect(() => {
    if (!countryCode) return;
    (async () => {
      const { data } = await supabase
        .from("overtime_penalty_rates")
        .select("*")
        .eq("country_code", countryCode)
        .eq("is_active", true)
        .order("code");
      setRates((data ?? []) as PenaltyRate[]);
    })();
  }, [countryCode]);

  function openApprove(r: Timesheet) {
    setApproveTarget(r);
    const initial: Record<string, string> = {};
    const existing = r.overtime_breakdown ?? {};
    const activeRates = rates.filter(
      (rate) =>
        rate.effective_from <= r.period_end &&
        (!rate.effective_to || rate.effective_to >= r.period_end),
    );
    for (const rate of activeRates) {
      initial[rate.code] = existing[rate.code] != null ? String(existing[rate.code]) : "";
    }
    setBreakdown(initial);
  }

  const breakdownTotal = useMemo(
    () => Object.values(breakdown).reduce((s, v) => s + (Number(v) || 0), 0),
    [breakdown],
  );

  const activeRatesForTarget = useMemo(() => {
    if (!approveTarget) return [] as PenaltyRate[];
    return rates.filter(
      (rate) =>
        rate.effective_from <= approveTarget.period_end &&
        (!rate.effective_to || rate.effective_to >= approveTarget.period_end),
    );
  }, [rates, approveTarget]);

  const anyBreakdownEntered = useMemo(
    () => Object.values(breakdown).some((v) => Number(v) > 0),
    [breakdown],
  );
  const breakdownMatches = approveTarget
    ? Math.abs(breakdownTotal - Number(approveTarget.overtime_hours || 0)) <= 0.01
    : false;
  const approveDisabled = busy || (anyBreakdownEntered && !breakdownMatches);

  async function onApprove() {
    if (!approveTarget) return;
    setBusy(true);
    try {
      // Save breakdown directly via supabase (RLS allows org_admin/manager to update tenant timesheets via approveTimesheet path; we use admin path through approveTimesheet which already updates status).
      if (anyBreakdownEntered) {
        const payload: Record<string, number> = {};
        for (const [k, v] of Object.entries(breakdown)) {
          const n = Number(v);
          if (n > 0) payload[k] = n;
        }
        const { error: upErr } = await supabase
          .from("timesheets")
          .update({ overtime_breakdown: payload })
          .eq("id", approveTarget.id);
        if (upErr) throw new Error(upErr.message);
      } else {
        // Clear breakdown if user removed all values
        await supabase
          .from("timesheets")
          .update({ overtime_breakdown: {} })
          .eq("id", approveTarget.id);
      }
      await fnApprove({ data: { timesheetId: approveTarget.id } });
      toast.success("Approved");
      setApproveTarget(null);
      setBreakdown({});
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    if (!rejectTarget) return;
    setBusy(true);
    try {
      await fnReject({ data: { timesheetId: rejectTarget.id, reason: reason || undefined } });
      toast.success("Rejected");
      setRejectTarget(null);
      setReason("");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  if (!canAccess)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Forbidden.
      </main>
    );

  const submitted = rows.filter((r) => r.status === "submitted");
  const history = rows.filter((r) => r.status !== "submitted");

  const Row = ({ r, actions }: { r: Timesheet; actions?: boolean }) => {
    const e = emps[r.employee_id];
    return (
      <TableRow key={r.id}>
        <TableCell>
          <div className="font-medium">{e ? `${e.first_name} ${e.last_name}` : "—"}</div>
          <div className="text-xs text-muted-foreground">{e?.employee_number}</div>
        </TableCell>
        <TableCell>
          {r.period_start} → {r.period_end}
        </TableCell>
        <TableCell>{Number(r.total_hours).toFixed(2)}</TableCell>
        <TableCell>{Number(r.overtime_hours).toFixed(2)}</TableCell>
        <TableCell>
          <Badge
            variant={
              r.status === "approved"
                ? "default"
                : r.status === "rejected"
                  ? "destructive"
                  : "secondary"
            }
          >
            {r.status}
          </Badge>
        </TableCell>
        {actions && (
          <TableCell className="text-right space-x-1">
            <Button size="sm" disabled={busy} onClick={() => openApprove(r)}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setRejectTarget(r);
                setReason("");
              }}
            >
              Reject
            </Button>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Timesheets</h1>
            <p className="text-xs text-muted-foreground">Approve submitted timesheets.</p>
          </div>
          <Link to="/org">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <Tabs defaultValue="submitted">
          <TabsList>
            <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="submitted">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Awaiting approval</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>OT</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submitted.map((r) => (
                      <Row key={r.id} r={r} actions />
                    ))}
                    {submitted.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nothing to approve.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>OT</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((r) => (
                      <Row key={r.id} r={r} />
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No history.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Dialog
        open={!!approveTarget}
        onOpenChange={(o) => {
          if (!o) {
            setApproveTarget(null);
            setBreakdown({});
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve timesheet</DialogTitle>
          </DialogHeader>
          {approveTarget && (
            <div className="space-y-3 text-sm">
              <div className="text-muted-foreground">
                Total overtime:{" "}
                <span className="font-medium text-foreground">
                  {Number(approveTarget.overtime_hours).toFixed(2)} h
                </span>
              </div>
              {activeRatesForTarget.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No overtime penalty rates configured for this country. The country default
                  multiplier will be used.
                </p>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground">
                    Optionally split overtime hours across penalty rates. Leave all empty to use the
                    country default multiplier.
                  </div>
                  <div className="space-y-2">
                    {activeRatesForTarget.map((rate) => (
                      <div key={rate.code} className="grid grid-cols-[1fr_auto] items-center gap-2">
                        <Label className="text-xs">
                          <span className="font-mono text-[11px] mr-1">{rate.code}</span>
                          <span>{rate.name}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · ×{Number(rate.rate_multiplier).toFixed(2)}
                          </span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          className="w-24"
                          value={breakdown[rate.code] ?? ""}
                          onChange={(e) =>
                            setBreakdown({ ...breakdown, [rate.code]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  {anyBreakdownEntered && (
                    <div
                      className={`text-xs ${breakdownMatches ? "text-muted-foreground" : "text-destructive"}`}
                    >
                      Breakdown total: {breakdownTotal.toFixed(2)} h
                      {!breakdownMatches &&
                        ` (must equal ${Number(approveTarget.overtime_hours).toFixed(2)} h)`}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveTarget(null);
                setBreakdown({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={onApprove} disabled={approveDisabled}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) setRejectTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject timesheet</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={busy}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
