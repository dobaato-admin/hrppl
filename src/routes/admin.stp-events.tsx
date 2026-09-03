import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { AuComplianceShell } from "@/components/AuComplianceShell";
import { EmptyState, SectionCard, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenantCountry, useMyTenantId } from "@/hooks/use-tenant";
import { buildStpPayEvent, listStpPayEvents, submitStpPayEvent } from "@/lib/stp.functions";
import {
  buildEofyFinalisation,
  listEofyFinalisations,
  submitEofyFinalisation,
} from "@/lib/eofy.functions";
import { FileText, Download } from "lucide-react";

/**
 * STP Phase 2 pay events and EOFY finalisation (PRD M3, M5).
 *
 * Six unreachable server functions. `/admin/au-stp-audit` has always been able
 * to tell an employer that its ABN, BMS ID and employee tax fields were not
 * set — and there was no page in the product that lodged anything, so the
 * audit reported on a process that could not be run.
 *
 * Gated `org.auStpEvents` — org_admin only, and finance deliberately absent.
 * That is not a guess: `stp_pay_events org_admin write` admits nobody else,
 * because lodging a pay event is a legal declaration by the employer. Offering
 * it to finance would put the "Forbidden" after the click instead of before.
 */
export const Route = createFileRoute("/admin/stp-events")({
  head: () => ({ meta: [{ title: "STP pay events — HRPPL" }] }),
  component: () => (
    <AdminGate feature="org.auStpEvents">
      <StpEventsPage />
    </AdminGate>
  ),
});

function eventTone(status: string) {
  if (status === "acknowledged") return "done" as const;
  if (status === "error") return "stuck" as const;
  if (status === "draft") return "pending" as const;
  return "working" as const;
}

/** The Australian financial year a date falls in: 1 Jul → 30 Jun. */
function currentFinancialYear(): number {
  const d = new Date();
  return d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear();
}

function downloadJson(payload: unknown, name: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function StpEventsPage() {
  const { tenantId } = useMyTenantId();
  const { country } = useMyTenantCountry();
  const qc = useQueryClient();
  const enabled = !!tenantId && country === "AU";

  const [fy, setFy] = useState(currentFinancialYear);
  const [buildOpen, setBuildOpen] = useState(false);
  const [runId, setRunId] = useState("");

  const fetchEvents = useServerFn(listStpPayEvents);
  const eventsQ = useQuery({
    queryKey: ["au-stp-events", tenantId],
    queryFn: () => fetchEvents({ data: { tenantId: tenantId! } }),
    enabled,
  });

  const fetchEofy = useServerFn(listEofyFinalisations);
  const eofyQ = useQuery({
    queryKey: ["au-eofy", tenantId, fy],
    queryFn: () => fetchEofy({ data: { tenantId: tenantId!, financialYear: fy } }),
    enabled,
  });

  // Approved/computed AU runs, for the build picker. Tenant filter is this
  // query's own job — see the Tenant scoping section in CLAUDE.md.
  const runsQ = useQuery({
    queryKey: ["au-stp-runs", tenantId],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from("payroll_runs")
        .select("id, period_start, period_end, pay_date, status")
        .eq("tenant_id", tenantId!)
        .eq("country_code", "AU")
        .in("status", ["computed", "approved"])
        .order("pay_date", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const buildEvent = useServerFn(buildStpPayEvent);
  const buildEventM = useMutation({
    mutationFn: (d: any) => buildEvent({ data: d }),
    onSuccess: () => {
      toast.success("Pay event built");
      setBuildOpen(false);
      qc.invalidateQueries({ queryKey: ["au-stp-events"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not build the pay event"),
  });

  const submitEvent = useServerFn(submitStpPayEvent);
  const submitEventM = useMutation({
    mutationFn: (eventId: string) => submitEvent({ data: { eventId } }),
    onSuccess: (res: any) => {
      if (res?.status === "awaiting_manual_lodgement") {
        toast.success("Ready for manual lodgement — download the payload to lodge it");
        if (res.payload) downloadJson(res.payload, `stp-pay-event-${Date.now()}.json`);
      } else {
        toast.success("Lodged and acknowledged");
      }
      qc.invalidateQueries({ queryKey: ["au-stp-events"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not submit the pay event"),
  });

  const buildFinal = useServerFn(buildEofyFinalisation);
  const buildFinalM = useMutation({
    mutationFn: (d: any) => buildFinal({ data: d }),
    onSuccess: (res: any) => {
      toast.success(res?.message ?? `Built ${res?.count ?? 0} finalisation declarations`);
      qc.invalidateQueries({ queryKey: ["au-eofy"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not build the finalisation"),
  });

  const submitFinal = useServerFn(submitEofyFinalisation);
  const submitFinalM = useMutation({
    mutationFn: (eventId: string) => submitFinal({ data: { eventId } }),
    onSuccess: (res: any) => {
      if (res?.status === "awaiting_manual_lodgement") {
        toast.success("Ready for manual lodgement");
        if (res.payload) downloadJson(res.payload, `eofy-finalisation-${Date.now()}.json`);
      } else {
        toast.success("Finalisation acknowledged");
      }
      qc.invalidateQueries({ queryKey: ["au-eofy"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not submit the finalisation"),
  });

  const events = (eventsQ.data?.events ?? []) as any[];
  const finalisations = (eofyQ.data?.events ?? []) as any[];
  const runs = runsQ.data ?? [];

  return (
    <AuComplianceShell
      title="STP pay events"
      subtitle="Single Touch Payroll Phase 2 lodgement, and end-of-financial-year finalisation"
      tenantId={tenantId}
      country={country}
      isLoading={eventsQ.isLoading}
      actions={
        <Button size="sm" onClick={() => setBuildOpen(true)} disabled={runs.length === 0}>
          <FileText className="mr-1 h-4 w-4" />
          Build pay event
        </Button>
      }
    >
      {() => (
        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">Pay events ({events.length})</TabsTrigger>
            <TabsTrigger value="eofy">EOFY finalisation</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-4">
            <SectionCard
              title="Pay events"
              description="One event per payroll run, lodged on or before the pay date. A manual gateway produces a payload to lodge yourself; a sandbox gateway simulates the acknowledgement."
            >
              {events.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No pay events yet"
                  description={
                    runs.length === 0
                      ? "There are no computed or approved Australian payroll runs to lodge. Run payroll first."
                      : "Build an event from a computed or approved run to lodge it with the ATO."
                  }
                  action={
                    runs.length > 0 ? (
                      <Button size="sm" onClick={() => setBuildOpen(true)}>
                        Build a pay event
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Payment date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message id</TableHead>
                      <TableHead className="w-32" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-mono text-xs">
                          {e.period_start} → {e.period_end}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{e.payment_date}</TableCell>
                        <TableCell className="uppercase text-xs">{e.run_type}</TableCell>
                        <TableCell>
                          <StatusChip tone={eventTone(e.status)}>
                            {String(e.status).replace(/_/g, " ")}
                          </StatusChip>
                          {e.error_message ? (
                            <div className="mt-1 text-xs text-destructive">{e.error_message}</div>
                          ) : null}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {e.gateway_message_id ?? "—"}
                        </TableCell>
                        <TableCell>
                          {e.status === "draft" ? (
                            <Button
                              size="sm"
                              disabled={submitEventM.isPending}
                              onClick={() => submitEventM.mutate(e.id)}
                            >
                              Lodge
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="eofy" className="mt-4 space-y-4">
            <SectionCard
              title="End-of-year finalisation"
              description="One declaration per employee, summing year-to-date totals from approved payslips. Employees see 'tax ready' in myGov once these are acknowledged."
              actions={
                <div className="flex items-center gap-2">
                  <Select value={String(fy)} onValueChange={(v) => setFy(Number(v))}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2].map((back) => {
                        const y = currentFinancialYear() - back;
                        return (
                          <SelectItem key={y} value={String(y)}>
                            FY {y - 1}–{String(y).slice(2)}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={buildFinalM.isPending}
                    onClick={() =>
                      buildFinalM.mutate({
                        tenantId: tenantId!,
                        financialYear: fy,
                        runType: "final",
                      })
                    }
                  >
                    {buildFinalM.isPending ? "Building…" : "Build declarations"}
                  </Button>
                </div>
              }
            >
              {finalisations.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={`No declarations for FY ${fy - 1}–${String(fy).slice(2)}`}
                  description="Building gathers year-to-date gross, PAYG-W and super from every approved run with a pay date inside the financial year, one declaration per employee."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-32" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finalisations.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-xs">{f.employee_id}</TableCell>
                        <TableCell className="uppercase text-xs">{f.run_type}</TableCell>
                        <TableCell>
                          <StatusChip tone={eventTone(f.status)}>
                            {String(f.status).replace(/_/g, " ")}
                          </StatusChip>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {f.submitted_at ? String(f.submitted_at).slice(0, 10) : "—"}
                        </TableCell>
                        <TableCell>
                          {f.status === "draft" ? (
                            <Button
                              size="sm"
                              disabled={submitFinalM.isPending}
                              onClick={() => submitFinalM.mutate(f.id)}
                            >
                              Lodge
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>

          <Dialog open={buildOpen} onOpenChange={setBuildOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Build a pay event</DialogTitle>
                <DialogDescription>
                  Assembles a Phase 2 payload from the run's payslips. Rebuilding for the same run
                  replaces its existing draft, so this is safe to repeat.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="stp-run">Payroll run</Label>
                  <Select value={runId} onValueChange={setRunId}>
                    <SelectTrigger id="stp-run">
                      <SelectValue placeholder="Select an Australian run" />
                    </SelectTrigger>
                    <SelectContent>
                      {runs.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.period_start} → {r.period_end} · paid {r.pay_date} · {r.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  The employer ABN and BMS ID must be set in Payroll setup, and each employee needs
                  a TFN status, income type, employment basis and tax treatment code. The STP2
                  readiness audit lists anything missing.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBuildOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!runId || buildEventM.isPending}
                  onClick={() => buildEventM.mutate({ runId, runType: "normal" })}
                >
                  {buildEventM.isPending ? "Building…" : "Build event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      )}
    </AuComplianceShell>
  );
}
