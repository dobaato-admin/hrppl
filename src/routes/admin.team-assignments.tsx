import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { listTeamData, setManagerRole, assignReports } from "@/lib/team-assignments.functions";
import { AdminGate } from "@/components/AdminGate";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/admin/team-assignments")({
  head: () => ({ meta: [{ title: "Team assignments — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.teamAssignments">
      <TeamAssignmentsPage />
    </AdminGate>
  ),
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{String(error)}</div>
  ),
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

function TeamAssignmentsPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  // W5 · Derived from the SAME feature key the route gate quotes, so this
  // page has one answer to "who may be here" instead of two. It previously
  // hand-rolled its own role list, which meant widening the route gate left
  // this check still rejecting — AdminGate let the user in and the page
  // bounced them a moment later.
  const canAccess = can("org.teamAssignments", roles);
  const load = useServerFn(listTeamData);
  const setRole = useServerFn(setManagerRole);
  const assign = useServerFn(assignReports);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && rolesLoaded && !canAccess) {
      toast.error("Organization Admin required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, rolesLoaded, canAccess, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["team-data"],
    queryFn: () => load(),
    enabled: !!user && rolesLoaded && canAccess,
  });

  const employees: any[] = data?.employees ?? [];
  const managers: any[] = data?.managers ?? [];
  const [selectedMgr, setSelectedMgr] = useState<string>("");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const currentReports = useMemo(
    () => new Set(employees.filter((e) => e.manager_id === selectedMgr).map((e) => e.id)),
    [employees, selectedMgr],
  );

  // sync selectedReports when manager changes
  useMemo(() => {
    setSelectedReports(new Set(currentReports));
  }, [selectedMgr]); // eslint-disable-line

  const visible = employees.filter(
    (e) =>
      !filter ||
      `${e.first_name} ${e.last_name} ${e.email ?? ""} ${e.job_title ?? ""}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
  );

  const grant = useMutation({
    mutationFn: async (v: { employee_id: string; grant: boolean }) => setRole({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      router.invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const save = useMutation({
    mutationFn: async () =>
      assign({
        data: {
          manager_employee_id: selectedMgr,
          report_employee_ids: Array.from(selectedReports),
        },
      }),
    onSuccess: () => {
      toast.success("Team saved");
      router.invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (loading || (user && !rolesLoaded)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    <AppShell
      title="Team assignments"
      subtitle="Promote employees to managers and assign their direct reports"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manager role</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
            <ul className="divide-y">
              {employees.map((e) => {
                const isMgr = managers.some((m) => m.id === e.id);
                return (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                    <div>
                      <p className="text-sm font-medium">
                        {e.first_name} {e.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.job_title ?? "—"} · {e.email ?? "no login"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMgr ? <Badge>Manager</Badge> : null}
                      {e.user_id ? (
                        <Button
                          size="sm"
                          variant={isMgr ? "outline" : "default"}
                          disabled={grant.isPending}
                          onClick={() => grant.mutate({ employee_id: e.id, grant: !isMgr })}
                        >
                          {isMgr ? "Revoke" : "Grant"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">no login</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedMgr} onValueChange={setSelectedMgr}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMgr ? (
              <>
                <Input
                  placeholder="Filter employees…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <div className="max-h-[420px] overflow-auto rounded border">
                  <ul className="divide-y">
                    {visible
                      .filter((e) => e.id !== selectedMgr)
                      .map((e) => {
                        const checked = selectedReports.has(e.id);
                        return (
                          <li key={e.id} className="flex items-center gap-3 px-3 py-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const next = new Set(selectedReports);
                                if (v) next.add(e.id);
                                else next.delete(e.id);
                                setSelectedReports(next);
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {e.first_name} {e.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {e.job_title ?? "—"}
                              </p>
                            </div>
                            {e.manager_id && e.manager_id !== selectedMgr ? (
                              <Badge variant="outline" className="text-xs">
                                other team
                              </Badge>
                            ) : null}
                          </li>
                        );
                      })}
                  </ul>
                </div>
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
                  {save.isPending ? "Saving…" : `Save (${selectedReports.size} reports)`}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pick a manager to assign direct reports.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
