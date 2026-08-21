import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { listEmployeesForAdmin } from "@/lib/timeline.functions";
import { listAssets, createAsset, assignAsset, returnAsset, listAssignments, confirmReturn, approveAssignment } from "@/lib/assets.functions";
import { AdminGate } from "@/components/AdminGate";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";

export const Route = createFileRoute("/admin/assets")({
  component: () => (<AdminGate allow={ADMIN_LAYOUT_ROLES}><AssetsPage /></AdminGate>),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">{(error as Error).message}</p>
        <Button onClick={() => { reset(); router.invalidate(); }}>Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

const CATEGORIES = ["laptop","phone","tablet","monitor","peripheral","vehicle","access_card","sim","uniform","tool","other"];

function AssetsPage() {
  const qc = useQueryClient();
  const fAssets = useServerFn(listAssets);
  const fCreate = useServerFn(createAsset);
  const fAssign = useServerFn(assignAsset);
  const fReturn = useServerFn(returnAsset);
  const fList = useServerFn(listAssignments);
  const fEmps = useServerFn(listEmployeesForAdmin);
  const fConfirm = useServerFn(confirmReturn);
  const fApprove = useServerFn(approveAssignment);


  const assetsQ = useQuery({ queryKey: ["assets"], queryFn: () => fAssets() });
  const empsQ = useQuery({ queryKey: ["emps-admin"], queryFn: () => fEmps() });
  const assignQ = useQuery({ queryKey: ["assignments"], queryFn: () => fList({ data: { openOnly: false } }) });

  const [form, setForm] = useState({ assetTag: "", name: "", category: "other", brand: "", model: "", serialNumber: "" });
  const [assign, setAssign] = useState({ assetId: "", employeeId: "", expectedReturnOn: "", notes: "", context: "employment", conditionNotes: "", quantityIssued: 1 });

  const createM = useMutation({
    mutationFn: () => fCreate({ data: form as any }),
    onSuccess: () => { toast.success("Asset added"); qc.invalidateQueries({ queryKey: ["assets"] }); setForm({ assetTag: "", name: "", category: "other", brand: "", model: "", serialNumber: "" }); },
    onError: (e: any) => toast.error(e.message),
  });
  const assignM = useMutation({
    mutationFn: () => fAssign({ data: assign as any }),
    onSuccess: (r: any) => {
      toast.success(r?.requiresApproval ? "Submitted for org-admin approval" : "Asset assigned");
      qc.invalidateQueries({ queryKey: ["assignments"] }); qc.invalidateQueries({ queryKey: ["assets"] });
      setAssign({ assetId: "", employeeId: "", expectedReturnOn: "", notes: "", context: "employment", conditionNotes: "", quantityIssued: 1 });
    },
    onError: (e: any) => toast.error(e.message),
  });
  void fReturn; // legacy one-shot kept available for future use

  const confirmM = useMutation({
    mutationFn: (v: { id: string; cond: "good"|"damaged"|"lost"; notes?: string }) =>
      fConfirm({ data: { assignmentId: v.id, returnCondition: v.cond, confirmationNotes: v.notes } }),
    onSuccess: () => { toast.success("Return confirmed"); qc.invalidateQueries({ queryKey: ["assignments"] }); qc.invalidateQueries({ queryKey: ["assets"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const disputeM = useMutation({
    mutationFn: (v: { id: string; notes: string }) => fConfirm({ data: { assignmentId: v.id, disputed: true, confirmationNotes: v.notes } }),
    onSuccess: () => { toast.success("Marked disputed"); qc.invalidateQueries({ queryKey: ["assignments"] }); },
  });
  const approveM = useMutation({
    mutationFn: (v: { id: string; decision: "approved"|"rejected"; notes?: string }) =>
      fApprove({ data: { assignmentId: v.id, decision: v.decision, notes: v.notes } }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["assignments"] }); qc.invalidateQueries({ queryKey: ["assets"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const available = (assetsQ.data?.assets ?? []).filter((a: any) => a.status === "available");
  const assignments = assignQ.data?.assignments ?? [];
  const pendingApprovals = assignments.filter((a: any) => a.approval_status === "pending");
  const pendingReturns = assignments.filter((a: any) => ["reported_partial","reported_full"].includes(a.return_status));


  return (
    <AppShell title="Asset register" subtitle="Track company-owned items and who currently has them. Assign during onboarding or any time, and reclaim on exit.">
      <div className="p-4">
        <Tabs defaultValue="register">
          <TabsList>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="approvals">Approvals {pendingApprovals.length > 0 && <Badge className="ml-1">{pendingApprovals.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="returns">Returns {pendingReturns.length > 0 && <Badge className="ml-1">{pendingReturns.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="assign">Assign / Issue</TabsTrigger>
            <TabsTrigger value="add">Add asset</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">All assets</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(assetsQ.data?.assets ?? []).map((a: any) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm">
                    <span className="font-mono text-xs">{a.asset_tag}</span>
                    <span className="font-medium">{a.name}</span>
                    <Badge variant="outline" className="capitalize">{a.category.replace("_"," ")}</Badge>
                    <Badge variant={a.status === "available" ? "outline" : "default"} className="capitalize">{a.status}</Badge>
                    {a.serial_number && <span className="text-xs text-muted-foreground">SN: {a.serial_number}</span>}
                  </div>
                ))}
                {(assetsQ.data?.assets ?? []).length === 0 && <p className="text-sm text-muted-foreground">No assets yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Assignments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {assignments.map((a: any) => {
                  const emp = (empsQ.data?.employees ?? []).find((e: any) => e.id === a.employee_id);
                  return (
                    <div key={a.id} className="rounded border p-2 text-sm space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{a.assets?.name}</span>
                        <span className="font-mono text-xs">{a.assets?.asset_tag}</span>
                        {emp && (
                          <Link to="/admin/employees/$employeeId" params={{ employeeId: a.employee_id }} className="text-primary hover:underline">
                            {emp.first_name} {emp.last_name}
                          </Link>
                        )}
                        <Badge variant="outline" className="capitalize">{a.context}</Badge>
                        {a.approval_status === "pending" && <Badge variant="outline">Awaiting approval</Badge>}
                        {a.approval_status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                        {a.return_status === "confirmed" && <Badge>Returned {a.returned_at ? new Date(a.returned_at).toLocaleDateString() : ""}</Badge>}
                        {a.return_status === "reported_partial" && <Badge variant="outline">Partial — awaiting HR</Badge>}
                        {a.return_status === "reported_full" && <Badge variant="outline">Reported — awaiting HR</Badge>}
                        {a.return_status === "disputed" && <Badge variant="destructive">Disputed</Badge>}
                        {a.return_status === "pending" && a.approval_status === "approved" && a.expected_return_on && <span className="text-xs text-muted-foreground">Due {a.expected_return_on}</span>}
                      </div>
                      {(a.quantity_issued > 1 || a.quantity_returned > 0) && (
                        <div className="text-xs text-muted-foreground">Qty issued {a.quantity_issued} · returned {a.quantity_returned}</div>
                      )}
                      {a.condition_notes && <div className="text-xs text-muted-foreground">Condition: {a.condition_notes}</div>}
                    </div>
                  );
                })}
                {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Pending assignment approvals</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {pendingApprovals.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting on approval.</p>}
                {pendingApprovals.map((a: any) => {
                  const emp = (empsQ.data?.employees ?? []).find((e: any) => e.id === a.employee_id);
                  return (
                    <div key={a.id} className="flex flex-wrap items-center gap-2 rounded border p-2 text-sm">
                      <span className="font-medium">{a.assets?.name}</span>
                      <span className="font-mono text-xs">{a.assets?.asset_tag}</span>
                      {emp && <span>→ {emp.first_name} {emp.last_name}</span>}
                      <Badge variant="outline" className="capitalize">{a.context}</Badge>
                      {a.quantity_issued > 1 && <span className="text-xs text-muted-foreground">Qty {a.quantity_issued}</span>}
                      <div className="ml-auto flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => approveM.mutate({ id: a.id, decision: "rejected" })}>Reject</Button>
                        <Button size="sm" onClick={() => approveM.mutate({ id: a.id, decision: "approved" })}>Approve</Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Returns awaiting HR confirmation</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {pendingReturns.length === 0 && <p className="text-sm text-muted-foreground">No returns awaiting confirmation.</p>}
                {pendingReturns.map((a: any) => {
                  const emp = (empsQ.data?.employees ?? []).find((e: any) => e.id === a.employee_id);
                  return (
                    <div key={a.id} className="rounded border p-3 text-sm space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{a.assets?.name}</span>
                        <span className="font-mono text-xs">{a.assets?.asset_tag}</span>
                        {emp && <span>from {emp.first_name} {emp.last_name}</span>}
                        <Badge variant="outline">{a.return_status === "reported_partial" ? "Partial" : "Full"} — {a.quantity_returned}/{a.quantity_issued}</Badge>
                        <Badge variant="outline" className="capitalize">{a.return_condition ?? "good"}</Badge>
                      </div>
                      {a.condition_notes && <p className="text-xs text-muted-foreground">Employee condition note: {a.condition_notes}</p>}
                      {a.employee_return_notes && <p className="text-xs text-muted-foreground">Notes: {a.employee_return_notes}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => confirmM.mutate({ id: a.id, cond: (a.return_condition ?? "good") as any })}>Confirm as {a.return_condition ?? "good"}</Button>
                        <Button size="sm" variant="outline" onClick={() => confirmM.mutate({ id: a.id, cond: "damaged" })}>Confirm damaged</Button>
                        <Button size="sm" variant="outline" onClick={() => confirmM.mutate({ id: a.id, cond: "lost" })}>Confirm lost</Button>
                        <Button size="sm" variant="destructive" onClick={() => {
                          const n = window.prompt("Dispute reason?"); if (n) disputeM.mutate({ id: a.id, notes: n });
                        }}>Dispute</Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="assign" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Issue an asset</CardTitle></CardHeader>
              <CardContent className="space-y-3 max-w-xl">
                <div>
                  <Label>Asset (available)</Label>
                  <Select value={assign.assetId} onValueChange={(v) => setAssign({ ...assign, assetId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                    <SelectContent>
                      {available.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.asset_tag} — {a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employee</Label>
                  <Select value={assign.employeeId} onValueChange={(v) => setAssign({ ...assign, employeeId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {(empsQ.data?.employees ?? []).map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Context</Label>
                    <Select value={assign.context} onValueChange={(v) => setAssign({ ...assign, context: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="offboarding">Offboarding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expected return</Label>
                    <Input type="date" value={assign.expectedReturnOn} onChange={(e) => setAssign({ ...assign, expectedReturnOn: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Quantity issued</Label>
                    <Input type="number" min={1} value={assign.quantityIssued} onChange={(e) => setAssign({ ...assign, quantityIssued: Number(e.target.value || 1) })} />
                  </div>
                  <div>
                    <Label>Condition on issue</Label>
                    <Input value={assign.conditionNotes} onChange={(e) => setAssign({ ...assign, conditionNotes: e.target.value })} placeholder="e.g. new, minor scratches" />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea rows={2} value={assign.notes} onChange={(e) => setAssign({ ...assign, notes: e.target.value })} />
                </div>

                <Button disabled={!assign.assetId || !assign.employeeId || assignM.isPending} onClick={() => assignM.mutate()} className="w-full">
                  {assignM.isPending ? "Assigning…" : "Assign asset"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Add a new asset</CardTitle></CardHeader>
              <CardContent className="space-y-3 max-w-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Asset tag</Label><Input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} placeholder="e.g. LAP-0042" /></div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_"," ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MacBook Pro 14" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                  <div><Label>Model</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
                </div>
                <div><Label>Serial number</Label><Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></div>
                <Button disabled={!form.assetTag || !form.name || createM.isPending} onClick={() => createM.mutate()} className="w-full">
                  {createM.isPending ? "Saving…" : "Add asset"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
