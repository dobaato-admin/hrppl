import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getToilSettings,
  updateToilSettings,
  listPendingToilApprovals,
  decideToilRequest,
  getToilReport,
  addToilAccrual,
} from "@/lib/toil.functions";

export const Route = createFileRoute("/admin/toil")({
  head: () => ({ meta: [{ title: "Time in lieu admin — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.toilAdmin">
      <AdminToilPage />
    </AdminGate>
  ),
});

function AdminToilPage() {
  return (
    <AppShell title="Time in lieu" subtitle="Settings, approvals and reporting">
      <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <Tabs defaultValue="approvals">
          <TabsList>
            <TabsTrigger value="approvals">Pending approvals</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="accruals">Adjust accruals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="approvals">
            <Approvals />
          </TabsContent>
          <TabsContent value="report">
            <Report />
          </TabsContent>
          <TabsContent value="accruals">
            <AddAccrual />
          </TabsContent>
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Approvals() {
  const list = useServerFn(listPendingToilApprovals);
  const decide = useServerFn(decideToilRequest);
  const [rows, setRows] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function refresh() {
    const r = await list({});
    setRows(r.requests);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function act(id: string, decision: "approved" | "rejected") {
    try {
      await decide({ data: { id, decision, notes: notes[id] ?? null } });
      toast.success(`TOIL ${decision}`);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pending TOIL requests</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.employees?.first_name} {r.employees?.last_name}
                  </TableCell>
                  <TableCell>
                    {r.start_date} → {r.end_date}
                  </TableCell>
                  <TableCell>{Number(r.hours).toFixed(2)}h</TableCell>
                  <TableCell className="max-w-[16rem] truncate text-sm">{r.reason}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 min-w-[14rem]">
                      <Input
                        placeholder="Notes (optional)"
                        value={notes[r.id] ?? ""}
                        onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => act(r.id, "approved")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => act(r.id, "rejected")}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function Report() {
  const get = useServerFn(getToilReport);
  const [data, setData] = useState<any>({ balances: [], pending: [], recent: [] });
  useEffect(() => {
    get({}).then(setData);
  }, []);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending approvals</CardDescription>
            <CardTitle className="text-2xl">{data.pending.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total available (hours)</CardDescription>
            <CardTitle className="text-2xl">
              {data.balances
                .reduce((s: number, b: any) => s + Number(b.available_hours ?? 0), 0)
                .toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recent accruals</CardDescription>
            <CardTitle className="text-2xl">{data.recent.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Balances by employee</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Accrued</TableHead>
                <TableHead>Consumed</TableHead>
                <TableHead>Expired</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.balances.map((b: any) => (
                <TableRow key={b.employee_id}>
                  <TableCell>
                    {b.employees?.first_name} {b.employees?.last_name}
                  </TableCell>
                  <TableCell>{Number(b.available_hours).toFixed(2)}h</TableCell>
                  <TableCell>{Number(b.accrued_hours).toFixed(2)}h</TableCell>
                  <TableCell>{Number(b.consumed_hours).toFixed(2)}h</TableCell>
                  <TableCell>{Number(b.expired_hours).toFixed(2)}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recent accruals (reconcile vs payroll/overtime)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.employees?.first_name} {r.employees?.last_name}
                  </TableCell>
                  <TableCell>{r.accrued_on}</TableCell>
                  <TableCell className="capitalize">{r.source.replace("_", " ")}</TableCell>
                  <TableCell>{Number(r.hours).toFixed(2)}h</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AddAccrual() {
  const add = useServerFn(addToilAccrual);
  const [form, setForm] = useState({
    employee_id: "",
    source: "manual" as const,
    hours: 1,
    accrued_on: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  async function submit() {
    try {
      await add({ data: { ...form, hours: Number(form.hours) } as any });
      toast.success("Accrual added");
      setForm({ ...form, hours: 1, notes: "" });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manual accrual / adjustment</CardTitle>
        <CardDescription>Use a negative number to deduct hours.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Employee ID</Label>
          <Input
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            placeholder="uuid"
          />
        </div>
        <div>
          <Label>Source</Label>
          <select
            className="h-9 w-full rounded-md border bg-background px-2"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value as any })}
          >
            <option value="overtime">Overtime</option>
            <option value="shift_swap">Shift swap</option>
            <option value="penalty">Penalty</option>
            <option value="manual">Manual</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <div>
          <Label>Hours</Label>
          <Input
            type="number"
            step={0.25}
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={form.accrued_on}
            onChange={(e) => setForm({ ...form, accrued_on: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={submit}>Add accrual</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Settings() {
  const get = useServerFn(getToilSettings);
  const save = useServerFn(updateToilSettings);
  const [s, setS] = useState<any>(null);
  useEffect(() => {
    get({}).then((r) => setS(r.settings));
  }, []);
  if (!s) return <div className="text-sm text-muted-foreground">Loading…</div>;
  async function onSave() {
    const { tenant_id, created_at, updated_at, ...rest } = s;
    try {
      const r = await save({ data: rest });
      setS(r.settings);
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }
  const N = (k: string) => (
    <Input
      type="number"
      step={0.25}
      value={s[k] ?? 0}
      onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })}
    />
  );
  const SW = (k: string, label: string) => (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={!!s[k]} onCheckedChange={(v) => setS({ ...s, [k]: v })} />
    </div>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">TOIL rules</CardTitle>
        <CardDescription>Per-tenant accrual rates, caps, expiry, and conversion.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {SW("enabled", "TOIL module enabled")}
        {SW("require_approval", "Require approval for TOIL requests")}
        {SW("allow_overtime_to_toil", "Allow overtime → TOIL conversion")}
        {SW("allow_toil_to_overtime", "Allow TOIL → overtime payout")}
        <div>
          <Label>Overtime multiplier</Label>
          {N("overtime_multiplier")}
        </div>
        <div>
          <Label>Shift-swap multiplier</Label>
          {N("shift_swap_multiplier")}
        </div>
        <div>
          <Label>Penalty multiplier</Label>
          {N("penalty_multiplier")}
        </div>
        <div>
          <Label>Max balance (hours, blank = no cap)</Label>
          <Input
            type="number"
            value={s.max_balance_hours ?? ""}
            onChange={(e) =>
              setS({
                ...s,
                max_balance_hours: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
        <div>
          <Label>Expiry (months)</Label>
          <Input
            type="number"
            value={s.expiry_months ?? 12}
            onChange={(e) => setS({ ...s, expiry_months: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Min request hours</Label>
          {N("min_request_hours")}
        </div>
        <div className="sm:col-span-2">
          <Button onClick={onSave}>Save settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}
