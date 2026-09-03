import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { assignEmployeeAward, getEffectiveAwardRate, listAwards } from "@/lib/awards.functions";
import { Scale } from "lucide-react";

/**
 * Modern award library and employee award assignment (PRD M6).
 *
 * `listAwards` and `assignEmployeeAward` were both unreachable, which meant
 * the minimum-wage audit could compare pay against an award nobody could
 * assign — every employee scored as "no award", so the audit had nothing to
 * check.
 *
 * The catalogue itself (awards, classifications, rates) is platform data:
 * `awards readable by all` grants SELECT to every authenticated user, and
 * writes go through a country-scope check for super_admin or a scoped
 * regional_admin. So this page **reads** the catalogue and **assigns** from it;
 * it does not edit it. Assignment is what a tenant owns, and
 * `eaa org admin manage` says org_admin — which is why `org.auAwards` is that
 * and not the wider set the funds page uses.
 */
export const Route = createFileRoute("/admin/awards")({
  head: () => ({ meta: [{ title: "Award library — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.auAwards">
      <AwardsPage />
    </AdminGate>
  ),
});

/** Today in the browser's own calendar — never toISOString().slice(0,10). */
function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const money = (n: unknown) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(n));

function AwardsPage() {
  const { tenantId } = useMyTenantId();
  const { country } = useMyTenantCountry();
  const qc = useQueryClient();
  const enabled = !!tenantId && country === "AU";

  const fetchAwards = useServerFn(listAwards);
  const awardsQ = useQuery({
    queryKey: ["au-awards"],
    queryFn: () => fetchAwards({ data: { countryCode: "AU", includeRates: true } }),
    enabled,
    staleTime: 10 * 60_000,
  });

  const assignmentsQ = useQuery({
    queryKey: ["au-award-assignments", tenantId],
    enabled,
    queryFn: async () => {
      const { data: employees } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number, job_title")
        .eq("tenant_id", tenantId!)
        .order("first_name");
      const { data: assignments } = await supabase
        .from("employee_award_assignments")
        .select("id, employee_id, classification_id, effective_from, effective_to, casual")
        .eq("tenant_id", tenantId!)
        .order("effective_from", { ascending: false });
      return { employees: employees ?? [], assignments: assignments ?? [] };
    },
  });

  const awards = (awardsQ.data?.awards ?? []) as any[];
  const classifications = (awardsQ.data?.classifications ?? []) as any[];
  const rates = (awardsQ.data?.rates ?? []) as any[];

  const [selectedAward, setSelectedAward] = useState<string>("");
  const activeAward = selectedAward || awards[0]?.id || "";

  const classificationsFor = useMemo(
    () => classifications.filter((c) => c.award_id === activeAward),
    [classifications, activeAward],
  );

  const latestRate = (classificationId: string) =>
    rates.find((r) => r.classification_id === classificationId);

  const classificationById = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of classifications) m.set(c.id, c);
    return m;
  }, [classifications]);

  const currentAssignment = useMemo(() => {
    const m = new Map<string, any>();
    for (const a of assignmentsQ.data?.assignments ?? []) {
      if (!m.has((a as any).employee_id)) m.set((a as any).employee_id, a);
    }
    return m;
  }, [assignmentsQ.data]);

  const [assignFor, setAssignFor] = useState<any | null>(null);
  const [assignClassification, setAssignClassification] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(todayLocal);
  const [casual, setCasual] = useState(false);

  const assign = useServerFn(assignEmployeeAward);
  const assignM = useMutation({
    mutationFn: (d: any) => assign({ data: d }),
    onSuccess: () => {
      toast.success("Award classification assigned");
      setAssignFor(null);
      qc.invalidateQueries({ queryKey: ["au-award-assignments"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not assign the classification"),
  });

  /**
   * "What is this person's award rate today?" — resolved server-side rather
   * than by joining the tables in the page.
   *
   * `award_rate_on` picks the rate effective on a date, which is not the same
   * as the newest row in the library: a pay-guide increase dated next July must
   * not change what today's audit compares against. The Library tab shows the
   * latest rate per classification; this shows what actually applies now, and
   * the two legitimately differ around an effective date. That difference is
   * the point — the underpayment audit uses this one.
   */
  const [rateFor, setRateFor] = useState<any | null>(null);
  const fetchRate = useServerFn(getEffectiveAwardRate);
  const rateQ = useQuery({
    queryKey: ["au-effective-rate", rateFor?.id],
    queryFn: () => fetchRate({ data: { employeeId: rateFor.id } }),
    enabled: !!rateFor,
  });

  const unassignedCount = (assignmentsQ.data?.employees ?? []).filter(
    (e: any) => !currentAssignment.has(e.id),
  ).length;

  return (
    <AuComplianceShell
      title="Award library"
      subtitle="Modern award classifications, and which one each employee is paid under"
      tenantId={tenantId}
      country={country}
      isLoading={awardsQ.isLoading || assignmentsQ.isLoading}
    >
      {() => (
        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">Library ({awards.length})</TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments{unassignedCount > 0 ? ` (${unassignedCount} unassigned)` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <SectionCard
              title="Award classifications and rates"
              description="Read-only here. The award catalogue is shared across every Australian tenant and is maintained at platform level, so a rate change reaches everyone at once."
              actions={
                awards.length > 0 ? (
                  <Select value={activeAward} onValueChange={setSelectedAward}>
                    <SelectTrigger className="w-72">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {awards.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : undefined
              }
            >
              {awards.length === 0 ? (
                <EmptyState
                  icon={Scale}
                  title="No awards in the library"
                  description="The modern award catalogue is maintained at platform level. Ask a platform administrator to load the awards your organisation pays under."
                />
              ) : classificationsFor.length === 0 ? (
                <EmptyState
                  icon={Scale}
                  title="This award has no classifications"
                  description="Classifications and their pay-guide rates are loaded with the award at platform level."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Classification</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Base hourly</TableHead>
                      <TableHead className="text-right">Casual hourly</TableHead>
                      <TableHead>Effective from</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classificationsFor.map((c) => {
                      const r = latestRate(c.id);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {c.level ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(r?.base_hourly_rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(r?.casual_hourly_rate)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {r?.effective_from ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <SectionCard
              title="Employee award assignment"
              description="An employee with no classification is skipped by the underpayment audit — there is nothing to compare their pay against, so they pass by omission rather than by being paid correctly."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead>Effective from</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(assignmentsQ.data?.employees ?? []).map((e: any) => {
                    const a = currentAssignment.get(e.id);
                    const c = a ? classificationById.get(a.classification_id) : null;
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          {e.first_name} {e.last_name}
                          <div className="text-xs text-muted-foreground">{e.job_title ?? ""}</div>
                        </TableCell>
                        <TableCell>
                          {c ? (
                            c.name
                          ) : a ? (
                            <span className="font-mono text-xs">{a.classification_id}</span>
                          ) : (
                            <StatusChip tone="pending">Not assigned</StatusChip>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {a ? (a.casual ? "Casual" : "Permanent") : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {a?.effective_from ?? "—"}
                        </TableCell>
                        <TableCell>
                          {a ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRateFor(e)}
                              title="The rate that applies today"
                            >
                              Rate
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={classifications.length === 0}
                            onClick={() => {
                              setAssignFor(e);
                              setAssignClassification(a?.classification_id ?? "");
                              setEffectiveFrom(todayLocal());
                              setCasual(!!a?.casual);
                            }}
                          >
                            {a ? "Change" : "Assign"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </SectionCard>
          </TabsContent>

          <Dialog open={!!rateFor} onOpenChange={(o) => !o && setRateFor(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Effective rate — {rateFor?.first_name} {rateFor?.last_name}
                </DialogTitle>
                <DialogDescription>
                  The award rate in force today, which is what the underpayment audit compares
                  actual pay against.
                </DialogDescription>
              </DialogHeader>
              {rateQ.isLoading ? (
                <p className="text-sm text-muted-foreground">Resolving…</p>
              ) : !rateQ.data?.assignment ? (
                <p className="text-sm text-muted-foreground">
                  No classification is in force for this employee today.
                </p>
              ) : (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Award</dt>
                    <dd className="text-right font-medium">
                      {(rateQ.data.classification as any)?.awards?.code ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Classification</dt>
                    <dd className="text-right font-medium">
                      {(rateQ.data.classification as any)?.name ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Basis</dt>
                    <dd className="text-right">
                      {(rateQ.data.assignment as any)?.casual ? "Casual" : "Permanent"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t pt-2">
                    <dt className="text-muted-foreground">Hourly rate today</dt>
                    <dd className="text-right font-medium tabular-nums">
                      {money(
                        (rateQ.data.assignment as any)?.casual
                          ? ((rateQ.data.rate as any)?.casual_hourly_rate ??
                              (rateQ.data.rate as any)?.base_hourly_rate)
                          : (rateQ.data.rate as any)?.base_hourly_rate,
                      )}
                    </dd>
                  </div>
                </dl>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Assign a classification — {assignFor?.first_name} {assignFor?.last_name}
                </DialogTitle>
                <DialogDescription>
                  The classification sets the minimum the underpayment audit compares actual pay
                  against. Casual attracts the loaded rate instead of the base rate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="assign-classification">Classification</Label>
                  <Select value={assignClassification} onValueChange={setAssignClassification}>
                    <SelectTrigger id="assign-classification">
                      <SelectValue placeholder="Select a classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {awards.map((aw) => {
                        const own = classifications.filter((c) => c.award_id === aw.id);
                        if (own.length === 0) return null;
                        return own.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {aw.code} · {c.name}
                          </SelectItem>
                        ));
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assign-from">Effective from</Label>
                  <Input
                    id="assign-from"
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={casual}
                    onChange={(e) => setCasual(e.target.checked)}
                  />
                  Casual — compare against the loaded casual rate
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignFor(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!assignClassification || assignM.isPending}
                  onClick={() =>
                    assignM.mutate({
                      tenantId: tenantId!,
                      employeeId: assignFor.id,
                      classificationId: assignClassification,
                      effectiveFrom,
                      casual,
                    })
                  }
                >
                  {assignM.isPending ? "Saving…" : "Assign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      )}
    </AuComplianceShell>
  );
}
