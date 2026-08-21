import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { HelpCircle, Search, LifeBuoy, BookOpen, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SupportTicketDialog } from "@/components/SupportTicketDialog";

type Article = { id: string; slug: string; title: string; summary: string | null; category: string; video_url: string | null };

export function HelpMenu() {
  const [open, setOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [q, setQ] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    supabase
      .from("knowledge_articles")
      .select("id,slug,title,summary,category,video_url")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        setArticles((data ?? []) as Article[]);
        setLoaded(true);
      });
  }, [open, loaded]);

  const filtered = useMemo(() => {
    if (!q.trim()) return articles.slice(0, 8);
    const needle = q.toLowerCase();
    return articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(needle) ||
          (a.summary ?? "").toLowerCase().includes(needle) ||
          a.category.toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [q, articles]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-9 min-w-9"
            aria-label="Help"
            title="Help & support"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))] p-3">
          <div className="flex items-center gap-2 pb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Knowledge hub</span>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search how-to articles…"
              className="h-9 pl-8 text-sm"
            />
          </div>
          <div className="mt-2 max-h-72 overflow-y-auto">
            {!loaded ? (
              <div className="px-1 py-4 text-center text-xs text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="px-1 py-4 text-center text-xs text-muted-foreground">
                No articles match "{q}".
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/help/$slug"
                      params={{ slug: a.slug }}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      {a.video_url ? (
                        <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{a.title}</div>
                        {a.summary && (
                          <div className="truncate text-xs text-muted-foreground">{a.summary}</div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-1.5 border-t pt-2">
            <Button asChild variant="secondary" size="sm" className="justify-start">
              <Link to="/help" onClick={() => setOpen(false)}>
                <BookOpen className="mr-2 h-3.5 w-3.5" /> Browse all articles
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                setOpen(false);
                setTicketOpen(true);
              }}
            >
              <LifeBuoy className="mr-2 h-3.5 w-3.5" /> Raise a support ticket
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <SupportTicketDialog open={ticketOpen} onOpenChange={setTicketOpen} />
    </>
  );
}
