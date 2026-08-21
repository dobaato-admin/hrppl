import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Tag, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthRouteGate } from "@/components/AuthRouteGate";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { renderMarkdown } from "@/lib/markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/help/$slug")({
  component: HelpArticlePage,
});

type Article = {
  id: string; slug: string; title: string; summary: string | null;
  category: string; role_audience: string[]; body_md: string;
  video_url: string | null; tags: string[]; updated_at: string;
};

function HelpArticlePage() {
  return (
    <AuthRouteGate>
      <AppShell title="Knowledge hub" subtitle="Article">
        <Inner />
      </AppShell>
    </AuthRouteGate>
  );
}

function Inner() {
  const { slug } = useParams({ from: "/help/$slug" });
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("knowledge_articles")
      .select("id,slug,title,summary,category,role_audience,body_md,video_url,tags,updated_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setArticle((data ?? null) as Article | null);
        setLoading(false);
        if (data) {
          supabase.auth.getUser().then(({ data: u }) => {
            if (u.user) {
              supabase.from("knowledge_article_views").insert({
                article_id: (data as Article).id,
                user_id: u.user.id,
              });
            }
          });
        }
      });
  }, [slug]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/help">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Knowledge hub
          </Link>
        </Button>
        {article && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadArticlePdf(article)}>
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        )}
      </div>

      {loading ? (
        <Card><CardContent className="space-y-3 p-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent></Card>
      ) : !article ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
          Article not found.
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="uppercase">{article.category}</Badge>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Updated {new Date(article.updated_at).toLocaleDateString()}
              </span>
              {article.tags?.length ? (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {article.tags.join(", ")}
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{article.title}</h1>
            {article.summary ? (
              <p className="mt-2 text-base text-muted-foreground">{article.summary}</p>
            ) : null}

            {article.video_url ? (
              <div className="my-6 aspect-video w-full overflow-hidden rounded-lg border">
                <iframe
                  src={article.video_url}
                  title={article.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}

            <article
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body_md) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function downloadArticlePdf(article: Article) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const maxW = pageW - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(doc.splitTextToSize(article.title, maxW), margin, y);
    y += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(`${article.category.toUpperCase()}  •  Updated ${new Date(article.updated_at).toLocaleDateString()}`, margin, y);
    y += 14;
    if (article.summary) {
      doc.setFontSize(11);
      doc.setTextColor(60);
      const lines = doc.splitTextToSize(article.summary, maxW);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 6;
    }
    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 14;

    // Render markdown lightly: headings, lists, paragraphs
    doc.setTextColor(20);
    const blocks = article.body_md.split(/\n\n+/);
    for (const raw of blocks) {
      const block = raw.replace(/\r/g, "");
      const ensure = (h: number) => { if (y + h > pageH - margin) { doc.addPage(); y = margin; } };
      if (/^#\s/.test(block)) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        const t = block.replace(/^#\s+/, "");
        const ls = doc.splitTextToSize(t, maxW);
        ensure(ls.length * 20);
        doc.text(ls, margin, y); y += ls.length * 20 + 6;
      } else if (/^##\s/.test(block)) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(13);
        const t = block.replace(/^##\s+/, "");
        const ls = doc.splitTextToSize(t, maxW);
        ensure(ls.length * 16);
        doc.text(ls, margin, y); y += ls.length * 16 + 4;
      } else if (/^###\s/.test(block)) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        const t = block.replace(/^###\s+/, "");
        const ls = doc.splitTextToSize(t, maxW);
        ensure(ls.length * 14);
        doc.text(ls, margin, y); y += ls.length * 14 + 4;
      } else if (/^[-*]\s/m.test(block)) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
        for (const item of block.split(/\n/)) {
          const t = item.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
          if (!t.trim()) continue;
          const ls = doc.splitTextToSize("• " + stripInline(t), maxW - 12);
          ensure(ls.length * 13);
          doc.text(ls, margin + 12, y); y += ls.length * 13 + 2;
        }
        y += 4;
      } else if (/^>/.test(block)) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(10.5);
        doc.setTextColor(90);
        const t = block.replace(/^>\s?/gm, "");
        const ls = doc.splitTextToSize(stripInline(t), maxW - 16);
        ensure(ls.length * 13 + 8);
        doc.setDrawColor(180); doc.line(margin, y - 8, margin, y + ls.length * 13);
        doc.text(ls, margin + 12, y); y += ls.length * 13 + 8;
        doc.setTextColor(20);
      } else if (/^---+$/.test(block.trim())) {
        ensure(14);
        doc.setDrawColor(220); doc.line(margin, y, pageW - margin, y); y += 14;
      } else {
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
        const ls = doc.splitTextToSize(stripInline(block.replace(/\n/g, " ")), maxW);
        ensure(ls.length * 13);
        doc.text(ls, margin, y); y += ls.length * 13 + 6;
      }
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(140);
      doc.text(`hrppl — ${article.title}  •  Page ${i} of ${pages}`, margin, pageH - 20);
    }
    doc.save(`${article.slug}.pdf`);
  } catch (e: any) {
    toast.error(e.message ?? "Couldn't build PDF");
  }
}

function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)");
}
