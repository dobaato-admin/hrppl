import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminGate } from "@/components/AdminGate";
import { can } from "@/lib/rbac";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  getCareersSettings,
  updateCareersSettings,
  updateJobPublication,
} from "@/lib/careers.functions";
import { getCareersAnalytics } from "@/lib/careers-analytics.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ExternalLink, Copy } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/org/careers/settings")({
  head: () => ({ meta: [{ title: "Careers page — HRPPL" }] }),
  component: () => (
    <AdminGate feature="org.recruitment">
      <Page />
    </AdminGate>
  ),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function Page() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  // W5 · Derived from the SAME feature key the route gate quotes, so this
  // page has one answer to "who may be here" instead of two. It previously
  // hand-rolled its own role list, which meant widening the route gate left
  // this check still rejecting — AdminGate let the user in and the page
  // bounced them a moment later.
  const canAccess = can("org.recruitment", roles);
  useEffect(() => {
    if (!loading && !canAccess) navigate({ to: "/dashboard" });
  }, [loading, canAccess, navigate]);

  const qc = useQueryClient();
  const getFn = useServerFn(getCareersSettings);
  const saveFn = useServerFn(updateCareersSettings);
  const pubFn = useServerFn(updateJobPublication);

  const { data, isLoading } = useQuery({
    queryKey: ["careers-settings"],
    queryFn: () => getFn(),
    enabled: canAccess,
  });

  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [color, setColor] = useState("#0F172A");
  const [hero, setHero] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setSlug(data.settings.public_slug ?? "");
      setHeadline(data.settings.headline ?? "");
      setAbout(data.settings.about_html ?? "");
      setColor(data.settings.brand_color ?? "#0F172A");
      setHero(data.settings.hero_image_url ?? "");
      setEnabled(!!data.settings.is_enabled);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          public_slug: slug,
          headline: headline || null,
          about_html: about || null,
          brand_color: color,
          hero_image_url: hero || null,
          is_enabled: enabled,
        },
      }),
    onSuccess: () => {
      toast.success("Careers page saved");
      qc.invalidateQueries({ queryKey: ["careers-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const togglePublish = useMutation({
    mutationFn: (v: {
      id: string;
      is_published: boolean;
      title: string;
      existingSlug: string | null;
    }) =>
      pubFn({
        data: {
          id: v.id,
          is_published: v.is_published,
          public_slug: v.existingSlug ?? slugify(v.title),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["careers-settings"] }),
    onError: (e: any) => toast.error(e?.message ?? "Publish failed"),
  });

  return (
    <AppShell
      title="Careers page"
      subtitle="Branded public site auto-generated from your job openings"
    >
      <div className="p-4 max-w-4xl">
        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page settings</CardTitle>
                <CardDescription>Public URL, branding, and visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Public slug</Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="your-company"
                    />
                    {slug && (
                      <div className="mt-1 flex items-center gap-2">
                        <a
                          href={`/careers/${slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary inline-flex items-center gap-1"
                        >
                          /careers/{slug} <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            const url = `${window.location.origin}/careers/${slug}`;
                            navigator.clipboard.writeText(url).then(
                              () => toast.success("Public URL copied"),
                              () => toast.error("Copy failed"),
                            );
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <Label>Enabled</Label>
                      <p className="text-xs text-muted-foreground">
                        Public visitors can see this page
                      </p>
                    </div>
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                  </div>
                </div>
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Join our team"
                  />
                </div>
                <div>
                  <Label>About (HTML allowed)</Label>
                  <Textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Brand color</Label>
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label>Hero image URL</Label>
                    <Input
                      value={hero}
                      onChange={(e) => setHero(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => save.mutate()} disabled={!slug || save.isPending}>
                    {save.isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job postings</CardTitle>
                <CardDescription>Toggle a job to publish it on your careers page</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.jobs ?? []).map((j: any) => {
                      const jobSlug = j.public_slug ?? slugify(j.title);
                      const fullPath = slug ? `/careers/${slug}/${jobSlug}` : null;
                      return (
                        <TableRow key={j.id}>
                          <TableCell>{j.title}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{jobSlug}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!!j.is_published}
                                onCheckedChange={(v) =>
                                  togglePublish.mutate({
                                    id: j.id,
                                    is_published: v,
                                    title: j.title,
                                    existingSlug: j.public_slug,
                                  })
                                }
                              />
                              {j.is_published && <Badge variant="default">Live</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {j.is_published && fullPath ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  asChild
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                >
                                  <a href={fullPath} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" /> View
                                  </a>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => {
                                    const url = `${window.location.origin}${fullPath}`;
                                    navigator.clipboard.writeText(url).then(
                                      () => toast.success("Job link copied"),
                                      () => toast.error("Copy failed"),
                                    );
                                  }}
                                >
                                  <Copy className="h-3 w-3 mr-1" /> Copy
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(data?.jobs ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-sm text-muted-foreground py-6"
                        >
                          No job openings yet. Create one in{" "}
                          <a href="/org/recruitment" className="text-primary underline">
                            Recruitment
                          </a>
                          .
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="pt-4">
            <CareersAnalyticsPanel enabled={canAccess} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function CareersAnalyticsPanel({ enabled }: { enabled: boolean }) {
  const fn = useServerFn(getCareersAnalytics);
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ["careers-analytics", days],
    queryFn: () => fn({ data: { days } }),
    enabled,
  });
  const totals = data?.totals;
  const perJob = data?.perJob ?? [];
  const series = data?.series ?? [];
  const topJobs = perJob.slice(0, 5);

  const funnelTotals = [
    { stage: "Job views", count: totals?.job_view ?? 0 },
    { stage: "Apply starts", count: totals?.apply_start ?? 0 },
    { stage: "Applications", count: totals?.apply_submit ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Last {days} days</h3>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="180">180 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Site views" value={totals?.site_view ?? 0} />
        <StatCard label="Job views" value={totals?.job_view ?? 0} />
        <StatCard label="Apply starts" value={totals?.apply_start ?? 0} />
        <StatCard
          label="Applications"
          value={totals?.apply_submit ?? 0}
          hint={`${totals?.conversion_pct ?? 0}% conv.`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily traffic</CardTitle>
            <CardDescription>Views, apply starts, and submissions over time</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            {series.length === 0 ? (
              <p className="text-sm text-muted-foreground">No traffic in this window.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="job_view"
                    name="Views"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="apply_start"
                    name="Starts"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="apply_submit"
                    name="Apps"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall funnel</CardTitle>
            <CardDescription>Views → Starts → Submissions across all jobs</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelTotals} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Count" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top jobs — conversion funnel</CardTitle>
          <CardDescription>
            Per-job views, starts and submissions (top 5 by traffic)
          </CardDescription>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          {topJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No per-job traffic yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topJobs.map((j: any) => ({
                  title: j.title.length > 24 ? j.title.slice(0, 22) + "…" : j.title,
                  Views: j.job_view,
                  Starts: j.apply_start,
                  Apps: j.apply_submit,
                }))}
                margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Views" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Starts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Apps" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per job</CardTitle>
          <CardDescription>
            Views, application starts, submissions, start-rate and conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Starts</TableHead>
                <TableHead className="text-right">Apps</TableHead>
                <TableHead className="text-right">Start %</TableHead>
                <TableHead className="text-right">Conv. %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perJob.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                    No traffic yet.
                  </TableCell>
                </TableRow>
              )}
              {perJob.map((j: any) => (
                <TableRow key={j.job_id}>
                  <TableCell>{j.title}</TableCell>
                  <TableCell className="text-right">{j.job_view}</TableCell>
                  <TableCell className="text-right">{j.apply_start}</TableCell>
                  <TableCell className="text-right">{j.apply_submit}</TableCell>
                  <TableCell className="text-right">{j.start_rate_pct}%</TableCell>
                  <TableCell className="text-right">{j.conversion_pct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}
