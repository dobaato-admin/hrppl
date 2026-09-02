import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { AuditExportButtons } from "@/components/audit/AuditExportButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import {
  listVariations,
  createVariation,
  approveVariation,
  rejectVariation,
  applyVariation,
  listVariationAudit,
} from "@/lib/employment-variations.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyTenantId } from "@/hooks/use-tenant";
import { localYmd } from "@/lib/work-date";

// "promotion" and "pay_change" are deliberately not offered here — each is
// superseded by a more specialized, already-in-nav page: org.promotions.tsx
// (which additionally auto-proposes a pay-rate change at the designation's
// band midpoint on approval) and org.pay-rates.tsx / pay_rate_changes,
// respectively. Left in the server-side VariationType enum in case any draft
// rows already use them; only the picker here is narrowed. See
// docs/w4-information-architecture-design.md §2/§6.
const TYPES = [
  "transfer",
  "hours_change",
  "role_change",
  "department_change",
  "contract_change",
] as const;

const STATUS_COLOR: Record<string, string> = {
  draft: "outline",
  pending_approval: "secondary",
  approved: "default",
  rejected: "destructive",
  applied: "default",
  cancelled: "outline",
};

export const Route = createFileRoute("/hr/variations")({
  head: () => ({ meta: [{ title: "Employment variations — HRPPL" }] }),
  component: Page,
});

function Page() {
  const { roles, loading } = useAuth();
  const { tenantId } = useMyTenantId();
  const navigate = useNavigate();
  const canAccess =
    roles.includes("hr") || roles.includes("org_admin") || roles.includes("super_admin");
  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const qc = useQueryClient();
  const listFn = useServerFn(listVariations);
  const createFn = useServerFn(createVariation);
  const approveFn = useServerFn(approveVariation);
  const rejectFn = useServerFn(rejectVariation);
  const applyFn = useServerFn(applyVariation);

  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["variations", status],
    queryFn: () => listFn({ data: { status: status as any } }),
    enabled: canAccess,
  });
  const allRows = (data?.rows ?? []) as any[];
  const filteredRows = allRows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${r.employee?.first_name ?? ""} ${r.employee?.last_name ?? ""}`.toLowerCase();
    return name.includes(q);
  });
  const counts = {
    pending: allRows.filter((r) => r.status === "pending_approval").length,
    approved: allRows.filter((r) => r.status === "approved").length,
    applied: allRows.filter((r) => r.status === "applied").length,
    rejected: allRows.filter((r) => r.status === "rejected").length,
  };

  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("transfer");
  const [effectiveDate, setEffectiveDate] = useState(localYmd(new Date()));
  const [notes, setNotes] = useState("");
  const [proposedJson, setProposedJson] = useState('{"base_salary": 0}');

  const [employees, setEmployees] = useState<any[]>([]);
  useEffect(() => {
    if (!open || !tenantId) return;
    // Tenant-scoped explicitly: RLS does not narrow this for super_admin
    // (its policy on employees has no tenant predicate), so the unfiltered
    // version listed every tenant. See src/hooks/use-tenant.ts.
    supabase
      .from("employees")
      .select("id, first_name, last_name, employee_number")
      .eq("tenant_id", tenantId)
      .order("first_name")
      .limit(500)
      .then(({ data }) => setEmployees(data ?? []));
  }, [open, tenantId]);

  const create = useMutation({
    mutationFn: () => {
      let proposed: any = {};
      try {
        proposed = JSON.parse(proposedJson || "{}");
      } catch {
        throw new Error("Proposed changes must be valid JSON");
      }
      return createFn({
        data: {
          employee_id: employeeId,
          variation_type: type,
          effective_date: effectiveDate,
          proposed_changes: proposed,
          notes: notes || null,
          submit: true,
        },
      });
    },
    onSuccess: () => {
      toast.success("Variation submitted for approval");
      setOpen(false);
      setEmployeeId("");
      setProposedJson('{"base_salary": 0}');
      setNotes("");
      qc.invalidateQueries({ queryKey: ["variations"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Create failed"),
  });

  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [auditFor, setAuditFor] = useState<string | null>(null);
  const auditFn = useServerFn(listVariationAudit);
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["variation-audit", auditFor],
    queryFn: () => auditFn({ data: { variation_id: auditFor! } }),
    enabled: !!auditFor,
  });
  const [rejectReason, setRejectReason] = useState("");

  const approve = useMutation({
    mutationFn: (id: string) => approveFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Approved");
      qc.invalidateQueries({ queryKey: ["variations"] });
    },
  });
  const reject = useMutation({
    mutationFn: () => rejectFn({ data: { id: rejectFor!, reason: rejectReason } }),
    onSuccess: () => {
      toast.success("Rejected");
      setRejectFor(null);
      setRejectReason("");
      qc.invalidateQueries({ queryKey: ["variations"] });
    },
  });
  const apply = useMutation({
    mutationFn: (id: string) => applyFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Applied to employee record");
      qc.invalidateQueries({ queryKey: ["variations"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Apply failed"),
  });

  return (
    <AppShell
      title="Employment variations"
      subtitle="Promotions, transfers, pay and contract changes"
    >
      <div className="p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <StatTile
            label="Pending approval"
            value={counts.pending}
            accent="text-amber-600"
            onClick={() => setStatus("pending_approval")}
          />
          <StatTile
            label="Approved"
            value={counts.approved}
            accent="text-emerald-600"
            onClick={() => setStatus("approved")}
          />
          <StatTile
            label="Applied"
            value={counts.applied}
            accent="text-primary"
            onClick={() => setStatus("applied")}
          />
          <StatTile
            label="Rejected"
            value={counts.rejected}
            accent="text-destructive"
            onClick={() => setStatus("rejected")}
          />
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">All variations</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                  </SelectContent>
                </Select>
                <AuditExportButtons source="variation" scopeLabel="all variations" />
                <Button onClick={() => setOpen(true)}>New variation</Button>
              </div>
            </div>
            <Input
              placeholder="Search by employee name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Effective</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Proposed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          {r.employee?.first_name} {r.employee?.last_name}
                        </TableCell>
                        <TableCell className="text-xs capitalize">
                          {r.variation_type.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-xs">{r.effective_date}</TableCell>
                        <TableCell>
                          <Badge variant={(STATUS_COLOR[r.status] as any) ?? "outline"}>
                            {r.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-xs">
                          <ProposedChips proposed={r.proposed_changes} />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {/* W5 P3 · The page writes an approvals log on every
                            submit, approve, reject and apply, and had no way to
                            read it back. On a record that changes someone's pay
                            or reporting line, "who decided this, and when" is
                            the question the log exists to answer. */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAuditFor(r.id)}
                            title="Who decided this, and when"
                          >
                            History
                          </Button>
                          {r.status === "pending_approval" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approve.mutate(r.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRejectFor(r.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {r.status === "approved" && (
                            <Button size="sm" onClick={() => apply.mutate(r.id)}>
                              Apply
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground text-sm py-6"
                        >
                          {allRows.length === 0
                            ? "No variations yet."
                            : "No matches for that search."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New employment variation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}{" "}
                      {e.employee_number ? `(#${e.employee_number})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Effective date</Label>
                <Input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Proposed changes (JSON)</Label>
              <Textarea
                value={proposedJson}
                onChange={(e) => setProposedJson(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Allowed keys: job_title, department_id, employment_type, base_salary, hourly_rate
              </p>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => create.mutate()} disabled={!employeeId || create.isPending}>
              {create.isPending ? "Submitting…" : "Submit for approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!auditFor} onOpenChange={(o) => !o && setAuditFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decision history</DialogTitle>
          </DialogHeader>
          {auditLoading ? (
            <div className="py-6 text-sm text-muted-foreground">Loading…</div>
          ) : (auditData?.entries ?? []).length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">
              Nothing recorded against this variation yet.
            </div>
          ) : (
            <ul className="divide-y">
              {(auditData?.entries ?? []).map((e: any) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium capitalize">
                      {String(e.action).replace("_", " ")}
                    </div>
                    {e.comment && <div className="text-xs text-muted-foreground">{e.comment}</div>}
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {e.created_at ? new Date(e.created_at).toLocaleString() : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAuditFor(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject variation</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => reject.mutate()}
              disabled={rejectReason.length < 3}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatTile({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums ${accent ?? ""}`}>{value}</div>
    </button>
  );
}

function ProposedChips({ proposed }: { proposed: any }) {
  if (!proposed || typeof proposed !== "object") {
    return <span className="text-muted-foreground">—</span>;
  }
  const entries = Object.entries(proposed).filter(
    ([, v]) => v !== null && v !== "" && v !== undefined,
  );
  if (entries.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <Badge key={k} variant="outline" className="text-[10px] font-normal">
          <span className="text-muted-foreground mr-1">{k.replace(/_/g, " ")}:</span>
          <span className="font-medium">{String(v)}</span>
        </Badge>
      ))}
    </div>
  );
}
