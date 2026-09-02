import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { upsertReviewTemplate } from "@/lib/performance.functions";
import { INDUSTRIES, REVIEW_PRESETS, type ReviewPreset } from "@/lib/review-presets";
import { AdminGate } from "@/components/AdminGate";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/kpi-kra")({
  head: () => ({
    meta: [
      { title: "KPI & KRA library — WorldPay HRMS" },
      {
        name: "description",
        content: "Browse standard KPI and KRA presets and apply them to your tenant in one click.",
      },
    ],
  }),
  // Gated at the route with an explicit role set, per the convention in
  // CLAUDE.md. This page previously hand-rolled `roles.includes("org_admin")`
  // inline and rendered its own "Forbidden" panel — one of the nine admin pages
  // that skipped AdminGate, which is why tests/admin-gate-role-sets.test.ts
  // could not pin its allow-set.
  component: () => (
    <AdminGate feature="org.kpiLibrary">
      <KpiKraLibrary />
    </AdminGate>
  ),
});

function KpiKraLibrary() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [kind, setKind] = useState<"all" | "kpi" | "kra">("all");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const fnSave = useServerFn(upsertReviewTemplate);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const presets = useMemo<ReviewPreset[]>(() => {
    const term = q.trim().toLowerCase();
    return REVIEW_PRESETS.filter((p) => p.kind === "kpi" || p.kind === "kra")
      .filter((p) => kind === "all" || p.kind === kind)
      .filter((p) => industry === "all" || p.industry === industry)
      .filter((p) => {
        if (!term) return true;
        return (
          p.name.toLowerCase().includes(term) ||
          p.role.toLowerCase().includes(term) ||
          p.industry.toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term) ||
          p.competencies.some((c) => (c.label ?? "").toLowerCase().includes(term))
        );
      });
  }, [q, industry, kind]);

  async function applyPreset(p: ReviewPreset) {
    setBusyKey(p.key);
    try {
      await fnSave({
        data: {
          name: p.name,
          description: p.description,
          industry: p.industry,
          kind: p.kind,
          scaleMin: p.scaleMin,
          scaleMax: p.scaleMax,
          scaleLabels: p.scaleLabels,
          competencies: p.competencies,
          isDefault: false,
          changeNote: `Applied from KPI & KRA library (${p.key})`,
        },
      });
      toast.success(`Applied "${p.name}" to your tenant`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to apply preset");
    } finally {
      setBusyKey(null);
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    // AppShell, not a hand-rolled <main>/<header>. admin.tsx is deliberately a
    // bare <Outlet /> (pinned by tests/admin-routes-block.test.ts), so a page
    // under /admin that does not render its own AppShell gets no sidebar and no
    // top bar at all — the user lands with no way out but the browser back
    // button. The "Back" link this replaces pointed at /org, which was itself
    // chrome-less until org.tsx was fixed.
    <AppShell
      title="KPI & KRA library"
      subtitle="Browse standard KPI / KRA presets. Click Apply to seed your tenant with a ready-to-edit template."
      actions={
        <Link to="/admin/review-templates">
          <Button variant="outline" size="sm">
            All review templates
          </Button>
        </Link>
      }
    >
      <section className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find a preset</CardTitle>
            <CardDescription>
              Filter by industry, kind, role, or any keyword in the preset (including KPI item
              labels).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_160px] gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search role, KPI/KRA name, or keyword…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={kind} onValueChange={(v) => setKind(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">KPI & KRA</SelectItem>
                  <SelectItem value="kpi">KPI only</SelectItem>
                  <SelectItem value="kra">KRA only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground">
          {presets.length} preset{presets.length === 1 ? "" : "s"} found
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map((p) => (
            <Card key={p.key} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm">{p.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {p.role} · {p.industry}
                    </CardDescription>
                  </div>
                  <Badge variant={p.kind === "kpi" ? "default" : "secondary"} className="uppercase">
                    {p.kind}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{p.description}</p>
                )}
                <div className="text-xs">
                  <span className="text-muted-foreground">Items:</span> {p.competencies.length} ·{" "}
                  <span className="text-muted-foreground">Scale:</span> {p.scaleMin}–{p.scaleMax}
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.competencies.slice(0, 4).map((c) => (
                    <Badge key={c.id} variant="outline" className="text-[10px] font-normal">
                      {c.label}
                    </Badge>
                  ))}
                  {p.competencies.length > 4 && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      +{p.competencies.length - 4} more
                    </Badge>
                  )}
                </div>
                <div className="pt-2">
                  <Button size="sm" onClick={() => applyPreset(p)} disabled={busyKey === p.key}>
                    {busyKey === p.key ? "Applying…" : "Apply to my tenant"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {presets.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No KPI or KRA presets match your filters. Try clearing the search or industry
                filter.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </AppShell>
  );
}
