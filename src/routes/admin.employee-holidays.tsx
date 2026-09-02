import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { CalendarPlus, MapPin } from "lucide-react";
import {
  listEmployeesWithState,
  setEmployeeState,
  listEmployeeHolidayPlan,
  upsertHolidayOverride,
  deleteHolidayOverride,
} from "@/lib/employee-holidays.functions";
import { listHolidayOverrideAudit } from "@/lib/holiday-override-audit.functions";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_OR_MANAGER } from "@/lib/rbac";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export const Route = createFileRoute("/admin/employee-holidays")({
  head: () => ({ meta: [{ title: "Employee holiday overrides — HRPPL" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_OR_MANAGER}>
      <EmployeeHolidaysPage />
    </AdminGate>
  ),
});

function EmployeeHolidaysPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canAccess =
    roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");

  const listFn = useServerFn(listEmployeesWithState);
  const setStateFn = useServerFn(setEmployeeState);
  const planFn = useServerFn(listEmployeeHolidayPlan);
  const upsertFn = useServerFn(upsertHolidayOverride);
  const deleteFn = useServerFn(deleteHolidayOverride);
  const auditFn = useServerFn(listHolidayOverrideAudit);

  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [employeeId, setEmployeeId] = useState<string>("");
  const [addForm, setAddForm] = useState<{
    date: string;
    name: string;
    action: "add" | "remove";
    isPaid: boolean;
  }>({ date: "", name: "", action: "add", isPaid: true });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && rolesLoaded && !canAccess) {
      toast.error("Manager/Admin only");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, rolesLoaded, canAccess, navigate]);

  const empQ = useQuery({
    queryKey: ["employees-with-state"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });

  const planQ = useQuery({
    queryKey: ["emp-holiday-plan", employeeId, year],
    queryFn: () => planFn({ data: { employeeId, year } }),
    enabled: canAccess && !!employeeId,
  });

  const auditQ = useQuery({
    queryKey: ["emp-holiday-audit", employeeId],
    queryFn: () => auditFn({ data: { employeeId } }),
    enabled: canAccess && !!employeeId,
  });

  const overrideByDate = new Map<string, any>();
  for (const o of (planQ.data?.overrides ?? []) as any[])
    overrideByDate.set(`${o.holiday_date}::${o.name}`, o);

  async function changeState(empId: string, state: string) {
    try {
      await setStateFn({ data: { employeeId: empId, stateRegion: state || null } });
      toast.success("State updated");
      qc.invalidateQueries({ queryKey: ["employees-with-state"] });
      qc.invalidateQueries({ queryKey: ["emp-holiday-plan", empId] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function removeSynced(h: any) {
    try {
      await upsertFn({
        data: {
          employeeId,
          holidayDate: h.holiday_date,
          name: h.name,
          action: "remove",
          isPaid: false,
        },
      });
      toast.success(`${h.name} suppressed for this employee`);
      qc.invalidateQueries({ queryKey: ["emp-holiday-plan", employeeId, year] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function addOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.date || !addForm.name) {
      toast.error("Date and name required");
      return;
    }
    try {
      await upsertFn({
        data: {
          employeeId,
          holidayDate: addForm.date,
          name: addForm.name,
          action: addForm.action,
          isPaid: addForm.isPaid,
        },
      });
      toast.success("Override saved");
      setAddForm({ date: "", name: "", action: "add", isPaid: true });
      qc.invalidateQueries({ queryKey: ["emp-holiday-plan", employeeId, year] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  }

  async function dropOverride(id: string) {
    try {
      await deleteFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["emp-holiday-plan", employeeId, year] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (loading || !user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    <AppShell
      title="Per-employee holiday overrides"
      subtitle="Set each employee's state and override individual public holidays."
    >
      <section className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Employees</CardTitle>
            </div>
            <CardDescription>
              Set each employee's state. Synced state holidays from data.gov.au flow through to
              payroll automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(empQ.data?.employees ?? []).map((e: any) => (
                  <TableRow key={e.id} className={employeeId === e.id ? "bg-muted/40" : ""}>
                    <TableCell className="font-medium">
                      {e.first_name} {e.last_name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.email}</TableCell>
                    <TableCell>
                      <Select
                        value={e.state_region ?? ""}
                        onValueChange={(v) => changeState(e.id, v)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {AU_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={employeeId === e.id ? "default" : "outline"}
                        onClick={() => setEmployeeId(e.id)}
                      >
                        Manage holidays
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {employeeId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>
                    Holidays for {planQ.data?.employee?.first_name}{" "}
                    {planQ.data?.employee?.last_name}
                  </CardTitle>
                  <CardDescription>
                    State: {planQ.data?.employee?.state_region ?? "—"} · Year {year}
                  </CardDescription>
                </div>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      today.getFullYear() - 1,
                      today.getFullYear(),
                      today.getFullYear() + 1,
                      today.getFullYear() + 2,
                    ].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 text-sm font-semibold">
                  Synced public holidays ({(planQ.data?.synced ?? []).length})
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(planQ.data?.synced ?? []).map((h: any) => {
                      const suppressed = overrideByDate.get(`${h.holiday_date}::${h.name}`);
                      const isRemoved = suppressed?.action === "remove";
                      return (
                        <TableRow key={h.id} className={isRemoved ? "opacity-50 line-through" : ""}>
                          <TableCell>{h.holiday_date}</TableCell>
                          <TableCell>{h.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{h.region ?? "NAT"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isRemoved ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => dropOverride(suppressed.id)}
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => removeSynced(h)}>
                                Suppress
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded border p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4 text-primary" />
                  <div className="font-semibold text-sm">Add an override</div>
                </div>
                <form
                  onSubmit={addOverride}
                  className="grid grid-cols-1 md:grid-cols-[140px_1fr_120px_120px_auto] gap-2 items-end"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action</Label>
                    <Select
                      value={addForm.action}
                      onValueChange={(v: any) => setAddForm({ ...addForm, action: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Add holiday</SelectItem>
                        <SelectItem value="remove">Suppress holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Paid</Label>
                    <Select
                      value={addForm.isPaid ? "y" : "n"}
                      onValueChange={(v) => setAddForm({ ...addForm, isPaid: v === "y" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="y">Paid</SelectItem>
                        <SelectItem value="n">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </form>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">
                  All overrides ({(planQ.data?.overrides ?? []).length})
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(planQ.data?.overrides ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground text-sm">
                          No overrides yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {(planQ.data?.overrides ?? []).map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell>{o.holiday_date}</TableCell>
                        <TableCell>{o.name}</TableCell>
                        <TableCell>
                          <Badge variant={o.action === "add" ? "default" : "outline"}>
                            {o.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{o.is_paid ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => dropOverride(o.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {employeeId && (
          <Card>
            <CardHeader>
              <CardTitle>Override change history</CardTitle>
              <CardDescription>
                Who changed what and when (latest 200). Includes snapshots of the full override list
                before and after each change.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(auditQ.data?.rows ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {(auditQ.data?.rows ?? []).map((r: any) => {
                    const before = Array.isArray(r.employee_overrides_before)
                      ? r.employee_overrides_before
                      : [];
                    const after = Array.isArray(r.employee_overrides_after)
                      ? r.employee_overrides_after
                      : [];
                    const summary = (arr: any[]) =>
                      arr.map((o) => `${o.holiday_date} ${o.name} (${o.action})`).join(", ") || "—";
                    return (
                      <details key={r.id} className="rounded border p-2 text-sm">
                        <summary className="cursor-pointer">
                          <Badge variant="outline" className="mr-2">
                            {r.action}
                          </Badge>
                          <span className="font-medium">{r.changed_by_name}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {new Date(r.changed_at).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {before.length} → {after.length} overrides
                          </span>
                        </summary>
                        <div className="mt-2 space-y-1 text-xs">
                          <div>
                            <span className="font-semibold">Before:</span> {summary(before)}
                          </div>
                          <div>
                            <span className="font-semibold">After:</span> {summary(after)}
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
