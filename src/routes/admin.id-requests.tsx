import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle2,
  XCircle,
  RotateCw,
  ArrowLeft,
  History,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listAllDocumentRequests,
  cancelDocumentRequest,
  approveDocumentRequest,
  resendDocumentRequest,
  bulkApproveDocumentRequests,
  bulkCancelDocumentRequests,
  bulkResendDocumentRequests,
  listRequestAudit,
} from "@/lib/teams.functions";
import { AdminGate } from "@/components/AdminGate";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";

export const Route = createFileRoute("/admin/id-requests")({
  head: () => ({
    meta: [
      { title: "Missing info requests — hrppl" },
      {
        name: "description",
        content: "Review, approve, cancel, and resend missing-information requests in bulk.",
      },
    ],
  }),
  component: () => (<AdminGate allow={ADMIN_LAYOUT_ROLES}><RequestsPage /></AdminGate>),
});

const DOC_LABELS: Record<string, string> = {
  national_id: "National ID / Passport",
  passport: "Passport",
  drivers_license: "Driver's license",
  tax_id: "Tax ID / TFN",
  social_security: "Social security number",
  bank_details: "Bank account details",
  next_of_kin: "Next of kin",
  address_proof: "Proof of address",
  other: "Other document",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-status-pending text-white",
  submitted: "bg-status-done text-white",
  cancelled: "bg-muted text-foreground",
};

const SEND_TONE: Record<string, string> = {
  queued: "bg-muted text-foreground",
  sent: "bg-status-done text-white",
  failed: "bg-status-stuck text-white",
  retrying: "bg-status-pending text-white",
};

function RequestsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllDocumentRequests);
  const cancelFn = useServerFn(cancelDocumentRequest);
  const approveFn = useServerFn(approveDocumentRequest);
  const resendFn = useServerFn(resendDocumentRequest);
  const bulkApprove = useServerFn(bulkApproveDocumentRequests);
  const bulkCancel = useServerFn(bulkCancelDocumentRequests);
  const bulkResend = useServerFn(bulkResendDocumentRequests);

  const [status, setStatus] = useState<"pending" | "submitted" | "cancelled" | "all">("pending");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [auditFor, setAuditFor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["id-requests", status],
    queryFn: () => listFn({ data: { status } }),
  });

  const rows = data?.requests ?? [];
  const selectableIds = useMemo(
    () => rows.filter((r: any) => r.status === "pending").map((r: any) => r.id),
    [rows],
  );
  const selectedIds = useMemo(
    () => selectableIds.filter((id: string) => selected[id]),
    [selectableIds, selected],
  );
  const allSelected = selectableIds.length > 0 && selectedIds.length === selectableIds.length;

  function toggleAll() {
    if (allSelected) setSelected({});
    else setSelected(Object.fromEntries(selectableIds.map((id: string) => [id, true])));
  }
  function toggleOne(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  async function runSingle(fn: any, id: string, msg: string) {
    try {
      await fn({ data: { id } });
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["id-requests"] });
      qc.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function runBulk(kind: "approve" | "cancel" | "resend") {
    if (selectedIds.length === 0) return;
    setBusy(true);
    try {
      const fn = kind === "approve" ? bulkApprove : kind === "cancel" ? bulkCancel : bulkResend;
      const res: any = await fn({ data: { ids: selectedIds } });
      const failures = (res.results ?? []).filter((r: any) => r.error);
      if (failures.length) {
        toast.warning(`${kind} completed with ${failures.length} error(s)`);
      } else {
        toast.success(`Bulk ${kind} (${selectedIds.length}) completed`);
      }
      setSelected({});
      qc.invalidateQueries({ queryKey: ["id-requests"] });
      qc.invalidateQueries({ queryKey: ["team-members"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Missing info requests" subtitle="Approve, cancel, or resend requests — individually or in bulk">
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/teams">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to team members
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter</span>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectableIds.length > 0 && (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span>
                  {selectedIds.length > 0
                    ? `${selectedIds.length} selected`
                    : `Select all ${selectableIds.length} pending`}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={busy || selectedIds.length === 0} onClick={() => runBulk("resend")}>
                  <RotateCw className="mr-1 h-3.5 w-3.5" /> Resend
                </Button>
                <Button size="sm" variant="outline" disabled={busy || selectedIds.length === 0} onClick={() => runBulk("approve")}>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="ghost" disabled={busy || selectedIds.length === 0} onClick={() => runBulk("cancel")}>
                  <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Requests ({rows.length})</CardTitle>
            <CardDescription>
              Each request appears as a pending item on the admin dashboard and on the employee's profile until resolved. Failed emails retry automatically in the background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing to show.</p>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r: any) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    {r.status === "pending" ? (
                      <Checkbox
                        checked={!!selected[r.id]}
                        onCheckedChange={() => toggleOne(r.id)}
                        aria-label="Select request"
                      />
                    ) : (
                      <div className="w-4" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {r.employee
                            ? `${r.employee.first_name} ${r.employee.last_name}`
                            : "Unknown employee"}
                        </span>
                        <Badge className={STATUS_TONE[r.status] ?? "bg-muted"}>{r.status}</Badge>
                        <Badge variant="outline">
                          {DOC_LABELS[r.document_type] ?? r.document_type.replace(/_/g, " ")}
                        </Badge>
                        {r.last_send_status && (
                          <Badge className={SEND_TONE[r.last_send_status] ?? "bg-muted"}>
                            email: {r.last_send_status}
                            {r.send_attempts ? ` · ${r.send_attempts}x` : ""}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.employee?.email ?? "no email"} · requested {new Date(r.requested_at).toLocaleString()}
                        {r.fulfilled_at && ` · resolved ${new Date(r.fulfilled_at).toLocaleString()}`}
                        {r.next_retry_at && ` · next retry ${new Date(r.next_retry_at).toLocaleString()}`}
                      </div>
                      {r.last_send_error && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-status-stuck">
                          <AlertTriangle className="h-3 w-3" /> {r.last_send_error}
                        </div>
                      )}
                      {r.notes && <div className="mt-1 text-xs">Notes: {r.notes}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setAuditFor(r.id)}>
                        <History className="mr-1 h-3.5 w-3.5" /> Audit
                      </Button>
                      {r.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => runSingle(resendFn, r.id, "Reminder resent")}>
                            <RotateCw className="mr-1 h-3.5 w-3.5" /> Resend
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => runSingle(approveFn, r.id, "Marked submitted")}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => runSingle(cancelFn, r.id, "Request cancelled")}>
                            <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                          </Button>
                        </>
                      )}
                      {r.status !== "pending" && r.employee?.email && (
                        <a
                          href={`mailto:${r.employee.email}`}
                          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="mr-1 h-3 w-3" /> Email
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <AuditDialog requestId={auditFor} onClose={() => setAuditFor(null)} />
    </AppShell>
  );
}

function AuditDialog({ requestId, onClose }: { requestId: string | null; onClose: () => void }) {
  const auditFn = useServerFn(listRequestAudit);
  const { data, isLoading } = useQuery({
    queryKey: ["id-request-audit", requestId],
    queryFn: () => auditFn({ data: { requestId: requestId! } }),
    enabled: !!requestId,
  });
  return (
    <Dialog open={!!requestId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit history</DialogTitle>
          <DialogDescription>
            Every approve, cancel, resend, and email-delivery attempt for this request.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (data?.entries ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
        ) : (
          <ol className="max-h-[60vh] space-y-2 overflow-y-auto">
            {(data?.entries ?? []).map((e: any) => (
              <li key={e.id} className="rounded-md border border-border p-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">{e.action.replace(/_/g, " ")}</Badge>
                  {e.from_status && e.to_status && (
                    <span className="text-xs text-muted-foreground">
                      {e.from_status} → {e.to_status}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                </div>
                {e.metadata && Object.keys(e.metadata).length > 0 && (
                  <pre className="mt-1 whitespace-pre-wrap text-[11px] text-muted-foreground">
                    {JSON.stringify(e.metadata, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
