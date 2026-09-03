import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ClipboardList } from "lucide-react";
import { listMyDuties } from "@/lib/employee-duties.functions";

export const Route = createFileRoute("/me/duties")({
  head: () => ({ meta: [{ title: "My duties — hrppl" }] }),
  component: Page,
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

function Page() {
  const fn = useServerFn(listMyDuties);
  const { data, isLoading } = useQuery({ queryKey: ["my-duties"], queryFn: () => fn({}) });
  const duties = data?.duties ?? [];
  const total = duties.reduce((a: number, b: any) => a + Number(b.weight || 0), 0);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">My duties & responsibilities</h1>
              <p className="text-xs text-muted-foreground">These form your KPIs and are reviewed during your performance review.</p>
            </div>
          </div>
          <Link to="/me/dashboard"><Button size="sm" variant="outline">Back to dashboard</Button></Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-8">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
          duties.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
            No duties have been assigned yet. Your manager will add these during onboarding.
          </CardContent></Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KPI weight allocated</CardTitle>
                <CardDescription>Recommended total is 100%. Anything missing will show up in your review.</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={Math.min(total, 100)} />
                <div className="mt-1 text-xs text-muted-foreground">{total}% allocated across {duties.length} duties</div>
              </CardContent>
            </Card>

            {duties.map((d: any) => (
              <Card key={d.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <span className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" />{d.title}</span>
                    <Badge variant="secondary">{Number(d.weight).toFixed(0)}% KPI</Badge>
                  </CardTitle>
                  {d.kpi_target && <CardDescription>Target: {d.kpi_target}</CardDescription>}
                </CardHeader>
                {d.description && <CardContent className="text-sm text-muted-foreground">{d.description}</CardContent>}
              </Card>
            ))}
          </>
        )}
      </section>
    </main>
  );
}
