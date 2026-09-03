import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Target } from "lucide-react";
import {
  listEmployeeDuties,
  upsertEmployeeDuty,
  deleteEmployeeDuty,
  listEmployeesForDuties,
} from "@/lib/employee-duties.functions";

export const Route = createFileRoute("/admin/employee-duties")({
  head: () => ({ meta: [{ title: "Duties & responsibilities — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.employeeDuties">
      <Page />
    </AdminGate>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">{(error as Error).message}</p>
        <Button
          onClick={() => {
            reset();
            router.invalidate();
          }}
        >
          Retry
        </Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

interface Duty {
  id: string;
  employee_id: string;
  title: string;
  description: string | null;
  weight: number;
  kpi_target: string | null;
  sort_order: number;
  is_active: boolean;
}

function Page() {
  const listEmps = useServerFn(listEmployeesForDuties);
  const listD = useServerFn(listEmployeeDuties);
  const upsert = useServerFn(upsertEmployeeDuty);
  const remove = useServerFn(deleteEmployeeDuty);
  const [empId, setEmpId] = useState<string>("");

  const empsQ = useQuery({ queryKey: ["emps-for-duties"], queryFn: () => listEmps({}) });
  const employees = empsQ.data?.employees ?? [];

  const dutiesQ = useQuery({
    queryKey: ["duties", empId],
    queryFn: () => listD({ data: { employeeId: empId } }),
    enabled: !!empId,
  });
  const duties: Duty[] = (dutiesQ.data?.duties as Duty[]) ?? [];
  const totalWeight = useMemo(
    () => duties.filter((d) => d.is_active).reduce((a, b) => a + Number(b.weight || 0), 0),
    [duties],
  );

  const [draft, setDraft] = useState({ title: "", description: "", weight: "10", kpi_target: "" });

  async function add() {
    if (!empId) return toast.error("Pick an employee first");
    if (!draft.title.trim()) return toast.error("Title required");
    try {
      const res: any = await upsert({
        data: {
          employee_id: empId,
          title: draft.title.trim(),
          description: draft.description.trim() || null,
          weight: Number(draft.weight) || 0,
          kpi_target: draft.kpi_target.trim() || null,
          sort_order: duties.length,
        },
      });
      setDraft({ title: "", description: "", weight: "10", kpi_target: "" });
      toast.success("Duty added");
      if (res?.warning) toast.warning(res.warning);
      dutiesQ.refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function save(d: Duty, patch: Partial<Duty>) {
    try {
      const res: any = await upsert({
        data: {
          id: d.id,
          employee_id: d.employee_id,
          title: patch.title ?? d.title,
          description: patch.description ?? d.description,
          weight: Number(patch.weight ?? d.weight),
          kpi_target: patch.kpi_target ?? d.kpi_target,
          sort_order: d.sort_order,
          is_active: patch.is_active ?? d.is_active,
        },
      });
      if (res?.warning) toast.warning(res.warning);
      dutiesQ.refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function del(id: string) {
    if (!confirm("Remove this duty?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Removed");
      dutiesQ.refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <AppShell
      title="Duties & responsibilities"
      subtitle="Set during onboarding. Feeds the employee dashboard and performance reviews as KPI-weighted scorecard rows."
    >
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee</CardTitle>
            <CardDescription>Select the employee whose duties you want to manage.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="min-w-[280px] space-y-1">
              <Label>Employee</Label>
              <Select value={empId} onValueChange={setEmpId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {`${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || e.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {empId && (
              <Badge
                variant={
                  totalWeight === 100 ? "default" : totalWeight === 0 ? "secondary" : "outline"
                }
              >
                Total KPI weight: {totalWeight.toFixed(0)}%
                {totalWeight !== 100 && totalWeight !== 0 && " (recommended 100%)"}
              </Badge>
            )}
          </CardContent>
        </Card>

        {empId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add a duty
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Manage monthly client reporting"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Description (what good looks like)</Label>
                  <Textarea
                    rows={2}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>KPI weight (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={draft.weight}
                    onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>KPI target (measurable)</Label>
                  <Input
                    value={draft.kpi_target}
                    onChange={(e) => setDraft({ ...draft, kpi_target: e.target.value })}
                    placeholder="e.g. 100% on-time delivery"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={add}>
                    <Plus className="mr-1 h-4 w-4" /> Add duty
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" /> Current duties
                </CardTitle>
                <CardDescription>
                  Edits save on blur. Toggle inactive duties off the employee's dashboard without
                  deleting history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dutiesQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : duties.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No duties yet. Add the first one above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {duties.map((d) => (
                      <div key={d.id} className="rounded-md border p-3">
                        <div className="grid gap-2 md:grid-cols-12">
                          <Input
                            className="md:col-span-5"
                            defaultValue={d.title}
                            onBlur={(e) =>
                              e.target.value !== d.title && save(d, { title: e.target.value })
                            }
                          />
                          <Input
                            className="md:col-span-2"
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            defaultValue={d.weight}
                            onBlur={(e) =>
                              Number(e.target.value) !== Number(d.weight) &&
                              save(d, { weight: Number(e.target.value) as any })
                            }
                          />
                          <Input
                            className="md:col-span-4"
                            defaultValue={d.kpi_target ?? ""}
                            placeholder="KPI target"
                            onBlur={(e) =>
                              (e.target.value || null) !== d.kpi_target &&
                              save(d, { kpi_target: (e.target.value || null) as any })
                            }
                          />
                          <div className="md:col-span-1 flex items-center justify-end gap-2">
                            <Switch
                              checked={d.is_active}
                              onCheckedChange={(v) => save(d, { is_active: v })}
                            />
                            <Button size="icon" variant="ghost" onClick={() => del(d.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            className="md:col-span-12"
                            rows={2}
                            defaultValue={d.description ?? ""}
                            placeholder="Description"
                            onBlur={(e) =>
                              (e.target.value || null) !== d.description &&
                              save(d, { description: (e.target.value || null) as any })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
