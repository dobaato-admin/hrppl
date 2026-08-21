import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listEmployeeTimeline } from "@/lib/timeline.functions";
import { listEventAccessLog } from "@/lib/audit.functions";
import { AdminGate } from "@/components/AdminGate";
import { ADMIN_LAYOUT_ROLES } from "@/lib/rbac";

export const Route = createFileRoute("/admin/employees/$employeeId")({
  component: () => (<AdminGate allow={ADMIN_LAYOUT_ROLES}><EmployeeRecordPage /></AdminGate>),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">{(error as Error).message}</p>
        <Button onClick={() => { reset(); router.invalidate(); }}>Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Employee not found</div>,
});

const CATEGORIES = [
  "all", "medical", "disciplinary", "grievance", "training", "payroll",
  "review", "onboarding", "leave", "expense", "promotion", "pay_change", "document",
];

const CATEGORY_COLORS: Record<string, string> = {
  medical: "bg-status-stuck text-white",
  disciplinary: "bg-status-stuck text-white",
  grievance: "bg-status-pending text-white",
  training: "bg-status-info text-white",
  payroll: "bg-primary text-primary-foreground",
  review: "bg-accent text-accent-foreground",
  onboarding: "bg-status-info text-white",
  leave: "bg-status-done text-white",
  expense: "bg-status-done text-white",
  promotion: "bg-accent text-accent-foreground",
  pay_change: "bg-primary text-primary-foreground",
  document: "bg-muted text-foreground",
};

function EmployeeRecordPage() {
  const { employeeId } = Route.useParams();
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"timeline" | "audit">("timeline");
  const fetchTimeline = useServerFn(listEmployeeTimeline);
  const fetchAudit = useServerFn(listEventAccessLog);

  const { data, isLoading } = useQuery({
    queryKey: ["employee-timeline", employeeId, filter],
    queryFn: () =>
      fetchTimeline({
        data: {
          employeeId,
          categories: filter === "all" ? undefined : [filter],
          limit: 300,
        },
      }),
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["employee-audit", employeeId],
    queryFn: () => fetchAudit({ data: { employeeId, limit: 300 } }),
    enabled: view === "audit",
  });

  const events = data?.events ?? [];
  const grouped = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }, [events]);

  return (
    <AppShell title="Employee record" subtitle="Comprehensive timeline of everything that touches this employee">
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(grouped).length === 0 && (
              <span className="text-sm text-muted-foreground">No events yet.</span>
            )}
            {Object.entries(grouped).map(([cat, count]) => (
              <Badge key={cat} className={CATEGORY_COLORS[cat] ?? "bg-muted"}>
                {cat.replace("_", " ")} · {count}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button size="sm" variant={view === "timeline" ? "default" : "outline"} onClick={() => setView("timeline")}>Timeline</Button>
          <Button size="sm" variant={view === "audit" ? "default" : "outline"} onClick={() => setView("audit")}>Access audit</Button>
        </div>

        {view === "audit" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who viewed or edited this record</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !auditData?.entries.length ? (
                <p className="text-sm text-muted-foreground">No access recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditData.entries.map((row: any) => {
                    const actor = row.actor_id ? auditData.actors[row.actor_id] : null;
                    return (
                      <div key={row.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm">
                        <Badge variant="outline" className="capitalize">{row.action}</Badge>
                        <Badge variant="outline" className="capitalize">{row.resource_type.replace("_", " ")}</Badge>
                        {row.was_confidential && (
                          <Badge className="bg-status-stuck text-white">confidential</Badge>
                        )}
                        <span className="font-medium">
                          {actor?.full_name || actor?.email || "Unknown user"}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {view === "timeline" && <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex flex-wrap">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">
                {c.replace("_", " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing recorded.</p>
                ) : (
                  <ol className="relative space-y-4 border-l border-border pl-4">
                    {events.map((e: any) => (
                      <li key={e.id} className="relative">
                        <span className="absolute -left-[22px] mt-1 inline-block h-3 w-3 rounded-full bg-primary" />
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={CATEGORY_COLORS[e.category] ?? "bg-muted"}>
                            {e.category.replace("_", " ")}
                          </Badge>
                          <span className="font-medium">{e.title}</span>
                          {e.severity && (
                            <Badge variant="outline" className="capitalize">{e.severity}</Badge>
                          )}
                          {e.visibility !== "employee" && (
                            <Badge variant="outline" className="capitalize">{e.visibility}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(e.occurred_at).toLocaleString()}
                          </span>
                        </div>
                        {e.summary && (
                          <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                        )}
                        {e.source_table && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Source: {e.source_table} · {e.source_id?.slice(0, 8)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>}
      </div>
    </AppShell>
  );
}
