import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Check, X, DollarSign, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  listPayRateChanges,
  proposePayRate,
  decidePayRate,
  getEmployeePayHistory,
} from "@/lib/hr-extras.functions";
import { CURRENCIES } from "@/lib/currencies";
import { useMyTenantId } from "@/hooks/use-tenant";

export const Route = createFileRoute("/org/pay-rates")({
  head: () => ({ meta: [{ title: "Pay rates — hrppl" }] }),
  component: PayRatesPage,
});

function PayRatesPage() {
  const { user, roles, loading } = useAuth();
  const { tenantId } = useMyTenantId();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listPayRateChanges);
  const proposeFn = useServerFn(proposePayRate);
  const decideFn = useServerFn(decidePayRate);
  const historyFn = useServerFn(getEmployeePayHistory);
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");
  const isManager = isAdmin || roles.includes("manager");
  const [status, setStatus] = useState<string>("proposed");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    effective_date: new Date().toISOString().slice(0, 10),
    currency_code: "USD",
    pay_frequency: "monthly",
    reason: "annual_review",
  });
  const [decision, setDecision] = useState<{ id: string; row: any } | null>(null);
  const [applyNow, setApplyNow] = useState(true);
  const [notes, setNotes] = useState("");
  const [historyFor, setHistoryFor] = useState<{ id: string; name: string } | null>(null);
  const [history, setHistory] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !isManager) {
      toast.error("Manager+ required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, isManager, navigate]);

  useEffect(() => {
    if (!isManager || !tenantId) return;
    // Tenant-scoped explicitly: RLS does not narrow this for super_admin
    // (its policy on employees has no tenant predicate), so the unfiltered
    // version listed every tenant. See src/hooks/use-tenant.ts.
    supabase
      .from("employees")
      .select("id,first_name,last_name,email,job_title,base_salary,currency_code")
      .eq("tenant_id", tenantId)
      .order("first_name")
      .then(({ data }) => setEmployees(data ?? []));
    supabase
      .from("designations")
      .select("id,title,grade,min_salary,max_salary,currency_code")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("title")
      .then(({ data }) => setDesignations(data ?? []));
  }, [isManager, tenantId]);

  const { data, isLoading } = useQuery({
    queryKey: ["pay-rates", status],
    queryFn: () =>
      listFn({ data: { scope: "all", status: status === "all" ? undefined : status } }),
    enabled: isManager,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await proposeFn({ data: { ...form, to_amount: Number(form.to_amount) } });
      toast.success("Pay change submitted");
      setOpen(false);
      setForm({
        effective_date: new Date().toISOString().slice(0, 10),
        currency_code: "USD",
        pay_frequency: "monthly",
        reason: "annual_review",
      });
      qc.invalidateQueries({ queryKey: ["pay-rates"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function decide(d: "approved" | "rejected") {
    if (!decision) return;
    try {
      await decideFn({
        data: { id: decision.id, decision: d, notes, apply_now: d === "approved" && applyNow },
      });
      toast.success(d === "approved" ? "Approved" : "Rejected");
      setDecision(null);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["pay-rates"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function openHistory(emp: { id: string; name: string }) {
    setHistoryFor(emp);
    setHistory(null);
    try {
      const r = await historyFn({ data: { employee_id: emp.id } });
      setHistory(r);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
      setHistoryFor(null);
    }
  }

  if (loading || !isManager)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    <AppShell
      title="Pay rate changes"
      subtitle="Proposed → approved → applied to payroll"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New change
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose pay rate change</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2">
                <Label>Employee*</Label>
                <Select
                  value={form.employee_id ?? ""}
                  onValueChange={(v) => {
                    const e = employees.find((x) => x.id === v);
                    setForm({
                      ...form,
                      employee_id: v,
                      currency_code: e?.currency_code ?? form.currency_code,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}{" "}
                        {e.base_salary ? `· ${e.currency_code ?? ""} ${e.base_salary}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Designation pay band (optional)</Label>
                <Select
                  value={form.designation_id ?? ""}
                  onValueChange={(v) => {
                    const d = designations.find((x) => x.id === v);
                    if (!d) {
                      setForm({ ...form, designation_id: v });
                      return;
                    }
                    const mid =
                      d.min_salary && d.max_salary
                        ? (Number(d.min_salary) + Number(d.max_salary)) / 2
                        : (d.min_salary ?? d.max_salary ?? form.to_amount);
                    setForm({
                      ...form,
                      designation_id: v,
                      to_amount: mid ?? form.to_amount,
                      currency_code: d.currency_code ?? form.currency_code,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a designation to pre-fill" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {designations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title}
                        {d.grade ? ` · ${d.grade}` : ""}
                        {d.min_salary || d.max_salary
                          ? ` — ${d.currency_code ?? ""} ${d.min_salary ?? "?"}–${d.max_salary ?? "?"}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pre-fills the amount with the midpoint of the designation's salary band.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>New amount*</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.to_amount ?? ""}
                    onChange={(e) => setForm({ ...form, to_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency*</Label>
                  <Select
                    value={form.currency_code}
                    onValueChange={(v) => setForm({ ...form, currency_code: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={form.pay_frequency}
                    onValueChange={(v) => setForm({ ...form, pay_frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Effective date*</Label>
                  <Input
                    type="date"
                    value={form.effective_date}
                    onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select
                    value={form.reason}
                    onValueChange={(v) => setForm({ ...form, reason: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hire">Hire</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="annual_review">Annual review</SelectItem>
                      <SelectItem value="market_adjustment">Market adjustment</SelectItem>
                      <SelectItem value="correction">Correction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  rows={2}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={busy}>
                  {busy ? "Submitting…" : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <section className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Compensation history</CardTitle>
            </div>
            <CardDescription>
              Approved changes can be pushed to the employee's base salary immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={status} onValueChange={setStatus} className="mb-3">
              <TabsList>
                <TabsTrigger value="proposed">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="applied">Applied</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value={status} />
            </Tabs>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Effective</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.changes ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data!.changes.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {c.employees?.first_name} {c.employees?.last_name}
                          <div className="text-xs text-muted-foreground">
                            {c.employees?.job_title}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="text-muted-foreground line-through">
                            {c.from_amount ?? "—"}
                          </span>{" "}
                          →{" "}
                          <span className="font-medium">
                            {c.currency_code} {Number(c.to_amount).toLocaleString()}
                          </span>
                          <div className="text-xs text-muted-foreground">{c.pay_frequency}</div>
                        </TableCell>
                        <TableCell className="text-xs">{c.reason}</TableCell>
                        <TableCell className="text-xs">{c.effective_date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              c.status === "applied"
                                ? "default"
                                : c.status === "approved"
                                  ? "secondary"
                                  : c.status === "rejected"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                openHistory({
                                  id: c.employee_id,
                                  name: `${c.employees?.first_name ?? ""} ${c.employees?.last_name ?? ""}`.trim(),
                                })
                              }
                            >
                              <History className="mr-1 h-3 w-3" /> History
                            </Button>
                            {c.status === "proposed" && isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setDecision({ id: c.id, row: c });
                                  setApplyNow(true);
                                  setNotes("");
                                }}
                              >
                                Review
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={!!decision} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review pay change</DialogTitle>
          </DialogHeader>
          {decision && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Employee:</span>{" "}
                {decision.row.employees?.first_name} {decision.row.employees?.last_name}
              </div>
              <div>
                <span className="text-muted-foreground">New rate:</span>{" "}
                {decision.row.currency_code} {Number(decision.row.to_amount).toLocaleString()}{" "}
                {decision.row.pay_frequency}
              </div>
              <div>
                <span className="text-muted-foreground">Effective:</span>{" "}
                {decision.row.effective_date}
              </div>
              {decision.row.notes && (
                <div>
                  <span className="text-muted-foreground">Notes:</span> {decision.row.notes}
                </div>
              )}
              <div className="space-y-2">
                <Label>Decision notes</Label>
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={applyNow} onCheckedChange={(c) => setApplyNow(!!c)} /> Apply to
                employee record now
              </label>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => decide("rejected")}>
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button onClick={() => decide("approved")}>
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!historyFor}
        onOpenChange={(o) => {
          if (!o) {
            setHistoryFor(null);
            setHistory(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pay & promotion history — {historyFor?.name}</DialogTitle>
          </DialogHeader>
          {!history ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="space-y-4 text-sm">
              {history.employee && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="font-medium">{history.employee.job_title ?? "—"}</div>
                  <div className="text-xs">
                    {history.employee.currency_code ?? ""}{" "}
                    {history.employee.base_salary
                      ? Number(history.employee.base_salary).toLocaleString()
                      : "—"}
                  </div>
                </div>
              )}
              <div>
                <div className="mb-1 font-medium">Pay changes</div>
                {history.pay_changes.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No changes recorded.</div>
                ) : (
                  <ul className="space-y-1">
                    {history.pay_changes.map((r: any) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded border px-2 py-1"
                      >
                        <span>
                          {r.effective_date} ·{" "}
                          <span className="text-muted-foreground">{r.reason}</span>
                        </span>
                        <span className="font-mono">
                          {r.from_amount ?? "—"} → {r.currency_code}{" "}
                          {Number(r.to_amount).toLocaleString()}
                        </span>
                        <Badge variant={r.status === "applied" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="mb-1 font-medium">Promotions</div>
                {history.promotions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No promotions recorded.</div>
                ) : (
                  <ul className="space-y-1">
                    {history.promotions.map((p: any) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded border px-2 py-1"
                      >
                        <span>
                          {p.effective_date} · {p.from_job_title ?? "—"} →{" "}
                          <span className="font-medium">{p.to_job_title}</span>
                        </span>
                        <Badge variant={p.status === "applied" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
