import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Check, X, TrendingUp } from "lucide-react";
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
import { listPromotions, proposePromotion, decidePromotion } from "@/lib/hr-extras.functions";
import { useMyTenantId } from "@/hooks/use-tenant";

export const Route = createFileRoute("/org/promotions")({
  head: () => ({ meta: [{ title: "Promotions — hrppl" }] }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const { user, roles, loading } = useAuth();
  const { tenantId } = useMyTenantId();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listPromotions);
  const proposeFn = useServerFn(proposePromotion);
  const decideFn = useServerFn(decidePromotion);
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");
  const isManager = isAdmin || roles.includes("manager");
  const [status, setStatus] = useState<string>("proposed");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ effective_date: new Date().toISOString().slice(0, 10) });
  const [decision, setDecision] = useState<{ id: string; promo: any } | null>(null);
  const [applyNow, setApplyNow] = useState(true);
  const [notes, setNotes] = useState("");

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
    Promise.all([
      supabase
        .from("employees")
        .select("id,first_name,last_name,email,job_title")
        .eq("tenant_id", tenantId)
        .order("first_name"),
      supabase.from("departments").select("id,name").eq("tenant_id", tenantId).order("name"),
      supabase.from("designations").select("id,title,grade").order("title"),
    ]).then(([e, d, des]) => {
      setEmployees(e.data ?? []);
      setDepartments(d.data ?? []);
      setDesignations(des.data ?? []);
    });
  }, [isManager, tenantId]);

  const { data, isLoading } = useQuery({
    queryKey: ["promotions", status],
    queryFn: () =>
      listFn({ data: { scope: "all", status: status === "all" ? undefined : status } }),
    enabled: isManager,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await proposeFn({ data: form });
      toast.success("Proposal submitted");
      setOpen(false);
      setForm({ effective_date: new Date().toISOString().slice(0, 10) });
      qc.invalidateQueries({ queryKey: ["promotions"] });
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
      qc.invalidateQueries({ queryKey: ["promotions"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
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
      title="Promotions"
      subtitle="Manager proposes, Org Admin approves"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Propose promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose a promotion</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2">
                <Label>Employee*</Label>
                <Select
                  value={form.employee_id ?? ""}
                  onValueChange={(v) => setForm({ ...form, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.first_name} {e.last_name} — {e.job_title ?? e.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Designation (catalog)</Label>
                <Select
                  value={form.to_designation_id ?? ""}
                  onValueChange={(v) => {
                    const d = designations.find((x) => x.id === v);
                    setForm({
                      ...form,
                      to_designation_id: v,
                      to_job_title: d?.title ?? form.to_job_title,
                      to_grade: d?.grade ?? form.to_grade,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title}
                        {d.grade ? ` · ${d.grade}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>New job title*</Label>
                  <Input
                    value={form.to_job_title ?? ""}
                    onChange={(e) => setForm({ ...form, to_job_title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Input
                    value={form.to_grade ?? ""}
                    onChange={(e) => setForm({ ...form, to_grade: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={form.to_department_id ?? ""}
                    onValueChange={(v) => setForm({ ...form, to_department_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Same" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Effective date*</Label>
                  <Input
                    type="date"
                    value={form.effective_date ?? ""}
                    onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  rows={3}
                  value={form.reason ?? ""}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
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
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Promotion requests</CardTitle>
            </div>
            <CardDescription>
              Approved promotions can be applied immediately to the employee record.
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
                    <TableHead>Effective</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.promotions ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        No records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data!.promotions.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.employees?.first_name} {p.employees?.last_name}
                          <div className="text-xs text-muted-foreground">
                            {p.employees?.job_title}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="text-muted-foreground line-through">
                            {p.from_job_title ?? "—"}
                          </span>{" "}
                          → <span className="font-medium">{p.to_job_title}</span>
                          {p.to_grade && (
                            <div className="text-xs text-muted-foreground">Grade {p.to_grade}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{p.effective_date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "applied"
                                ? "default"
                                : p.status === "approved"
                                  ? "secondary"
                                  : p.status === "rejected"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === "proposed" && isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDecision({ id: p.id, promo: p });
                                setApplyNow(true);
                                setNotes("");
                              }}
                            >
                              Review
                            </Button>
                          )}
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
            <DialogTitle>Review promotion</DialogTitle>
          </DialogHeader>
          {decision && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Employee:</span>{" "}
                {decision.promo.employees?.first_name} {decision.promo.employees?.last_name}
              </div>
              <div>
                <span className="text-muted-foreground">New title:</span>{" "}
                {decision.promo.to_job_title}
              </div>
              <div>
                <span className="text-muted-foreground">Effective:</span>{" "}
                {decision.promo.effective_date}
              </div>
              {decision.promo.reason && (
                <div>
                  <span className="text-muted-foreground">Reason:</span> {decision.promo.reason}
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
    </AppShell>
  );
}
