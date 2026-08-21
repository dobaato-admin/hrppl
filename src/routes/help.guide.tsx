import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthRouteGate } from "@/components/AuthRouteGate";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { renderMarkdown } from "@/lib/markdown";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/help/guide")({
  component: GuidePage,
});

type Article = {
  id: string; slug: string; title: string; summary: string | null;
  category: string; role_audience: string[]; body_md: string; sort_order: number;
};

function GuidePage() {
  return (
    <AuthRouteGate>
      <AppShell title="User guide" subtitle="Role-tailored step-by-step guide">
        <Inner />
      </AppShell>
    </AuthRouteGate>
  );
}

function Inner() {
  const { roles } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("knowledge_articles")
      .select("id,slug,title,summary,category,role_audience,body_md,sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setArticles((data ?? []) as Article[]);
        setLoading(false);
      });
  }, []);

  // Filter by role audience: include if 'all' or any of user's roles is present
  const userRoleSet = new Set([...roles, "all", "employee"]);
  const filtered = articles.filter((a) =>
    a.role_audience.some((r) => userRoleSet.has(r)),
  );

  const grouped = filtered.reduce<Record<string, Article[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/help"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Download as PDF
        </Button>
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardContent className="space-y-6 p-6 print:p-0">
          <header className="border-b pb-4">
            <h1 className="font-display text-3xl font-bold tracking-tight">hrppl User Guide</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tailored for your role: <span className="font-medium capitalize">{roles.length ? roles.join(", ").replace(/_/g, " ") : "general user"}</span>
              {" · "} Generated {new Date().toLocaleDateString()}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: use your browser's "Save as PDF" option in the print dialog.
            </p>
          </header>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No articles yet.</p>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <section key={cat} className="break-inside-avoid">
                <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-primary">
                  {cat}
                </h2>
                <div className="mt-3 space-y-6">
                  {items.map((a) => (
                    <article key={a.id} className="break-inside-avoid">
                      <h3 className="text-lg font-semibold">{a.title}</h3>
                      {a.summary ? (
                        <p className="text-sm italic text-muted-foreground">{a.summary}</p>
                      ) : null}
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body_md) }}
                      />
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}

          <footer className="border-t pt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} hrppl · hrppl.io
          </footer>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          @page { margin: 18mm; }
          body { background: white !important; }
          aside, nav, header[class*="sticky"], .print\\:hidden { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
