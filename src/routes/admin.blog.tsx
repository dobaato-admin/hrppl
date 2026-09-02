import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, ExternalLink, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listAdminPosts,
  upsertPost,
  deletePost,
  getAdminPost,
  listCategories,
} from "@/lib/blog.functions";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({ meta: [{ title: "Blog CMS — hrppl" }] }),
  component: () => (
    <AdminGate feature="platform.admin">
      <BlogAdmin />
    </AdminGate>
  ),
});

type PostForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string;
  category_id: string;
  tags_text: string;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_for: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
};

const emptyForm = (): PostForm => ({
  title: "",
  slug: "",
  excerpt: "",
  content_md: "",
  cover_image_url: "",
  category_id: "",
  tags_text: "",
  status: "draft",
  scheduled_for: "",
  seo_title: "",
  seo_description: "",
  og_image_url: "",
});

function BlogAdmin() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canAccess = roles.includes("super_admin");

  const listFn = useServerFn(listAdminPosts);
  const saveFn = useServerFn(upsertPost);
  const delFn = useServerFn(deletePost);
  const getFn = useServerFn(getAdminPost);
  const catFn = useServerFn(listCategories);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyForm());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // Non–super-admins get the dedicated denied screen (and are audit-logged).
  if (!loading && user && !canAccess) {
    return (
      <SuperAdminGuard title="Blog CMS" route="/admin/blog">
        <div />
      </SuperAdminGuard>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });
  const { data: catData } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => catFn(),
    enabled: canAccess,
  });
  const categories = catData?.categories ?? [];

  function startNew() {
    setForm(emptyForm());
    setOpen(true);
  }

  async function startEdit(id: string) {
    const { post } = await getFn({ data: { id } });
    if (!post) return;
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content_md: post.content_md ?? "",
      cover_image_url: post.cover_image_url ?? "",
      category_id: post.category_id ?? "",
      tags_text: (post.tags ?? []).join(", "),
      status: post.status as PostForm["status"],
      scheduled_for: post.scheduled_for
        ? new Date(post.scheduled_for).toISOString().slice(0, 16)
        : "",
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      og_image_url: post.og_image_url ?? "",
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const tags = form.tags_text
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await saveFn({
        data: {
          id: form.id,
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt || null,
          content_md: form.content_md,
          cover_image_url: form.cover_image_url || null,
          category_id: form.category_id || null,
          tags,
          status: form.status,
          scheduled_for:
            form.status === "scheduled" && form.scheduled_for
              ? new Date(form.scheduled_for).toISOString()
              : null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          og_image_url: form.og_image_url || null,
        },
      });
      toast.success(form.id ? "Post updated" : "Post created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const posts = data?.posts ?? [];
  const statusBadge: Record<string, string> = {
    draft: "bg-muted text-foreground",
    scheduled: "bg-status-pending text-status-pending-foreground",
    published: "bg-status-done text-status-done-foreground",
    archived: "bg-secondary text-secondary-foreground",
  };

  return (
    <AppShell title="Blog CMS">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Content
              </CardTitle>
              <CardDescription>
                Write, schedule and publish articles to hrppl.io/blog. External tools can also
                create posts via the API.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/admin/blog-integrations">API keys & webhooks</a>
              </Button>
              <Button onClick={startNew}>
                <Plus className="h-4 w-4 mr-1" /> New post
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No posts yet. Click <strong>New post</strong> to create one.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">/{p.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge[p.status] ?? ""}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {p.status === "published" && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => startEdit(p.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit post" : "New post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                    placeholder="auto-from-title"
                    pattern="[a-z0-9-]*"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.category_id || "none"}
                    onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Uncategorised</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                    maxLength={400}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Content (Markdown)</Label>
                  <Textarea
                    value={form.content_md}
                    onChange={(e) => setForm({ ...form, content_md: e.target.value })}
                    rows={14}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Cover image URL</Label>
                  <Input
                    value={form.cover_image_url}
                    onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={form.tags_text}
                    onChange={(e) => setForm({ ...form, tags_text: e.target.value })}
                    placeholder="payroll, compliance"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as PostForm["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.status === "scheduled" && (
                  <div>
                    <Label>Scheduled for</Label>
                    <Input
                      type="datetime-local"
                      value={form.scheduled_for}
                      onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
                    />
                  </div>
                )}
                <div className="md:col-span-2 border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">SEO</p>
                </div>
                <div>
                  <Label>SEO title</Label>
                  <Input
                    value={form.seo_title}
                    onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label>OG image URL</Label>
                  <Input
                    value={form.og_image_url}
                    onChange={(e) => setForm({ ...form, og_image_url: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>SEO description</Label>
                  <Textarea
                    value={form.seo_description}
                    onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                    rows={2}
                    maxLength={300}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>How to automate publishing</CardTitle>
            <CardDescription>
              Connect Blaze.ai, AutoSEO or any tool that can POST JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              API base URL:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">
                https://hrppl.io/api/public/blog/posts
              </code>
            </p>
            <p>
              Create an API key in{" "}
              <a className="text-primary underline" href="/admin/blog-integrations">
                API keys & webhooks
              </a>
              , then send it as <code>Authorization: Bearer hpk_…</code>.
            </p>
            <p className="text-muted-foreground">
              External tools can create drafts, schedule, or auto-publish. New posts trigger your
              registered webhooks (HMAC-signed).
            </p>
            <p>
              <a className="text-primary inline-flex items-center gap-1" href="/developers">
                <ExternalLink className="h-3 w-3" /> Full developer docs
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
