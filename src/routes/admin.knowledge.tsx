import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthRouteGate } from "@/components/AuthRouteGate";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { renderMarkdown } from "@/lib/markdown";

export const Route = createFileRoute("/admin/knowledge")({
  component: () => (
    <AdminGate feature="platform.admin">
      <KnowledgeAdminPage />
    </AdminGate>
  ),
});

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  role_audience: string[];
  body_md: string;
  video_url: string | null;
  tags: string[];
  sort_order: number;
  published: boolean;
};

function KnowledgeAdminPage() {
  return (
    <AuthRouteGate>
      <SuperAdminGuard title="Knowledge editor" route="/admin/knowledge">
        <AppShell title="Knowledge editor" subtitle="Create and edit help articles">
          <Inner />
        </AppShell>
      </SuperAdminGuard>
    </AuthRouteGate>
  );
}

function emptyArticle(): Article {
  return {
    id: "",
    slug: "",
    title: "",
    summary: "",
    category: "general",
    role_audience: ["all"],
    body_md: "",
    video_url: "",
    tags: [],
    sort_order: 100,
    published: true,
  };
}

function Inner() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const load = () => {
    supabase
      .from("knowledge_articles")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setArticles((data ?? []) as Article[]));
  };
  useEffect(load, []);

  async function save() {
    if (!selected) return;
    if (!selected.slug.trim() || !selected.title.trim()) {
      toast.error("Slug and title are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: selected.slug.trim(),
        title: selected.title.trim(),
        summary: selected.summary || null,
        category: selected.category || "general",
        role_audience: selected.role_audience.length ? selected.role_audience : ["all"],
        body_md: selected.body_md,
        video_url: selected.video_url || null,
        tags: selected.tags,
        sort_order: selected.sort_order,
        published: selected.published,
      };
      if (selected.id) {
        const { error } = await supabase
          .from("knowledge_articles")
          .update(payload)
          .eq("id", selected.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("knowledge_articles")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setSelected(data as Article);
      }
      toast.success("Saved");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected?.id) return;
    if (!confirm(`Delete article "${selected.title}"?`)) return;
    const { error } = await supabase.from("knowledge_articles").delete().eq("id", selected.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSelected(null);
    load();
    toast.success("Deleted");
  }

  return (
    <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr] md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Articles</CardTitle>
          <Button size="sm" onClick={() => setSelected(emptyArticle())}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent ${selected?.id === a.id ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-1">
                {a.published ? (
                  <Eye className="h-3 w-3 text-status-done" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="truncate font-medium">{a.title}</span>
              </div>
              <div className="ml-4 truncate text-[11px] text-muted-foreground">
                {a.category} · /{a.slug}
              </div>
            </button>
          ))}
          {articles.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              No articles yet.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {selected?.id
              ? "Edit article"
              : selected
                ? "New article"
                : "Select or create an article"}
          </CardTitle>
          {selected ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? "Edit" : "Preview"}
              </Button>
              {selected.id ? (
                <Button variant="outline" size="sm" onClick={remove}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              ) : null}
              <Button size="sm" onClick={save} disabled={saving}>
                <Save className="mr-1 h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {!selected ? (
            <p className="text-sm text-muted-foreground">
              Pick an article on the left or click <strong>New</strong>.
            </p>
          ) : showPreview ? (
            <div>
              <h1 className="text-2xl font-bold">{selected.title}</h1>
              {selected.summary && <p className="text-muted-foreground">{selected.summary}</p>}
              <div
                className="prose prose-sm mt-4 max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.body_md) }}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    value={selected.slug}
                    onChange={(e) => setSelected({ ...selected, slug: e.target.value })}
                    placeholder="apply-for-leave"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    value={selected.category}
                    onChange={(e) => setSelected({ ...selected, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={selected.title}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Summary</Label>
                <Input
                  value={selected.summary ?? ""}
                  onChange={(e) => setSelected({ ...selected, summary: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Roles (comma-separated, "all" for everyone)</Label>
                  <Input
                    value={selected.role_audience.join(", ")}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        role_audience: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Video URL (optional, embed)</Label>
                  <Input
                    value={selected.video_url ?? ""}
                    onChange={(e) => setSelected({ ...selected, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/embed/…"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Tags (comma)</Label>
                  <Input
                    value={selected.tags.join(", ")}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        tags: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={selected.sort_order}
                    onChange={(e) =>
                      setSelected({ ...selected, sort_order: Number(e.target.value) || 100 })
                    }
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant={selected.published ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelected({ ...selected, published: !selected.published })}
                  >
                    {selected.published ? (
                      <>
                        <Eye className="mr-1 h-3.5 w-3.5" /> Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 h-3.5 w-3.5" /> Draft
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Body (Markdown)</Label>
                <Textarea
                  value={selected.body_md}
                  onChange={(e) => setSelected({ ...selected, body_md: e.target.value })}
                  rows={18}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                  Supports: <Badge variant="outline">#</Badge> headings,
                  <Badge variant="outline">**bold**</Badge>,{" "}
                  <Badge variant="outline">*italic*</Badge>,<Badge variant="outline">`code`</Badge>,{" "}
                  <Badge variant="outline">- list</Badge>,<Badge variant="outline">1. list</Badge>,{" "}
                  <Badge variant="outline">[link](url)</Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
