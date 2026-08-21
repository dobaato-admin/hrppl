import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, BookOpen, FileText, Video, Download, LifeBuoy, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthRouteGate } from "@/components/AuthRouteGate";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportTicketDialog } from "@/components/SupportTicketDialog";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/help/")({
  component: HelpHubPage,
});

type Article = {
  id: string; slug: string; title: string; summary: string | null;
  category: string; role_audience: string[]; video_url: string | null; sort_order: number;
  tags: string[] | null;
};

function HelpHubPage() {
  return (
    <AuthRouteGate>
      <AppShell title="Knowledge hub" subtitle="How-to guides, videos & support">
        <HelpHubInner />
      </AppShell>
    </AuthRouteGate>
  );
}

function HelpHubInner() {
  const { roles } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [ticketOpen, setTicketOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("knowledge_articles")
      .select("id,slug,title,summary,category,role_audience,video_url,sort_order,tags")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setArticles((data ?? []) as Article[]));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.category));
    return ["all", ...Array.from(set).sort()];
  }, [articles]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => (a.tags ?? []).forEach((t) => t && set.add(t)));
    return Array.from(set).sort();
  }, [articles]);

  function toggleTag(t: string) {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (activeTags.length && !activeTags.every((t) => (a.tags ?? []).includes(t))) return false;
      if (!needle) return true;
      return (
        a.title.toLowerCase().includes(needle) ||
        (a.summary ?? "").toLowerCase().includes(needle) ||
        a.category.toLowerCase().includes(needle) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [articles, q, cat, activeTags]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Welcome to the Knowledge hub</h2>
            <p className="text-sm text-muted-foreground">
              Search how-to articles, watch tutorials, or download your role-specific user guide.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/help/guide" })}>
              <Download className="mr-2 h-4 w-4" /> Download user guide
            </Button>
            <Button onClick={() => setTicketOpen(true)}>
              <LifeBuoy className="mr-2 h-4 w-4" /> Raise a ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, e.g. ‘apply leave’ or ‘payroll’"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <Button
              key={c}
              variant={cat === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCat(c)}
              className="capitalize"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {allTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tags:</span>
          {allTags.map((t) => (
            <Badge
              key={t}
              variant={activeTags.includes(t) ? "default" : "outline"}
              className="cursor-pointer text-[11px]"
              onClick={() => toggleTag(t)}
            >
              #{t}
            </Badge>
          ))}
          {activeTags.length > 0 ? (
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setActiveTags([])}>
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link key={a.id} to="/help/$slug" params={{ slug: a.slug }} preload="intent">
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {a.category}
                  </Badge>
                  {a.video_url ? (
                    <Video className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="mt-2 text-base">{a.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="line-clamp-3">{a.summary}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Read article <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <BookOpen className="mx-auto mb-2 h-6 w-6" />
              No articles match your search.
            </CardContent>
          </Card>
        ) : null}
      </div>

      {roles.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Showing the full library. Your role: <span className="font-medium">{roles.join(", ")}</span>.
          Use <Link to="/help/guide" className="underline">Download user guide</Link> for a role-tailored step-by-step.
        </p>
      ) : null}

      <SupportTicketDialog open={ticketOpen} onOpenChange={setTicketOpen} />
    </div>
  );
}
