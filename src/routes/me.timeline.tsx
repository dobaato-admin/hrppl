import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listEmployeeTimeline, myEmployeeId } from "@/lib/timeline.functions";

export const Route = createFileRoute("/me/timeline")({
  component: MyRecordPage,
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

function MyRecordPage() {
  const fetchMe = useServerFn(myEmployeeId);
  const fetchTl = useServerFn(listEmployeeTimeline);

  const meQ = useQuery({ queryKey: ["me-emp"], queryFn: () => fetchMe() });
  const employeeId = (meQ.data?.employee as any)?.id;
  const tlQ = useQuery({
    queryKey: ["my-timeline", employeeId],
    queryFn: () => fetchTl({ data: { employeeId, limit: 300 } }),
    enabled: !!employeeId,
  });

  const events = tlQ.data?.events ?? [];

  return (
    <AppShell title="My record" subtitle="Everything recorded across your employment in one place">
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {!employeeId ? (
              <p className="text-sm text-muted-foreground">
                No employee profile linked to your account.
              </p>
            ) : tlQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-4">
                {events.map((e: any) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[22px] mt-1 inline-block h-3 w-3 rounded-full bg-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {e.category.replace("_", " ")}
                      </Badge>
                      <span className="font-medium">{e.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.occurred_at).toLocaleString()}
                      </span>
                    </div>
                    {e.summary && (
                      <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
