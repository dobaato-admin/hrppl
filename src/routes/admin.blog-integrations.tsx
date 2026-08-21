import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, KeyRound, Webhook, Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  listApiKeys, createApiKey, revokeApiKey,
  listWebhooks, upsertWebhook, deleteWebhook,
} from "@/lib/blog.functions";
import { SuperAdminGuard } from "@/components/SuperAdminGuard";

export const Route = createFileRoute("/admin/blog-integrations")({
  head: () => ({ meta: [{ title: "Blog API & Webhooks — hrppl" }] }),
  component: BlogIntegrationsPage,
});

function BlogIntegrationsPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isSuper = roles.includes("super_admin");

  const listKeysFn = useServerFn(listApiKeys);
  const createKeyFn = useServerFn(createApiKey);
  const revokeKeyFn = useServerFn(revokeApiKey);
  const listHooksFn = useServerFn(listWebhooks);
  const saveHookFn = useServerFn(upsertWebhook);
  const delHookFn = useServerFn(deleteWebhook);

  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [hookOpen, setHookOpen] = useState(false);
  const [hookForm, setHookForm] = useState({
    id: "" as string | undefined, name: "", url: "",
    events: ["post.published", "post.updated", "post.deleted"] as string[],
    active: true,
  });
  const [hookSecret, setHookSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (!loading && user && !isSuper) {
    return (
      <SuperAdminGuard title="Blog API & Webhooks" route="/admin/blog-integrations">
        <div />
      </SuperAdminGuard>
    );
  }

  const { data: keysData } = useQuery({ queryKey: ["blog-api-keys"], queryFn: () => listKeysFn(), enabled: isSuper });
  const { data: hooksData } = useQuery({ queryKey: ["blog-webhooks"], queryFn: () => listHooksFn(), enabled: isSuper });
  const keys = keysData?.keys ?? [];
  const hooks = hooksData?.webhooks ?? [];

  async function generateKey() {
    if (!newKeyName.trim()) return toast.error("Give the key a name");
    try {
      const res = await createKeyFn({ data: { name: newKeyName.trim(), scopes: ["posts:read", "posts:write"] } });
      setNewKey(res.key);
      setNewKeyName("");
      qc.invalidateQueries({ queryKey: ["blog-api-keys"] });
    } catch (err) { toast.error((err as Error).message); }
  }
  async function revoke(id: string) {
    if (!confirm("Revoke this API key? Integrations using it will stop working.")) return;
    try { await revokeKeyFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["blog-api-keys"] }); }
    catch (err) { toast.error((err as Error).message); }
  }

  function openNewHook() {
    setHookForm({ id: undefined, name: "", url: "", events: ["post.published", "post.updated", "post.deleted"], active: true });
    setHookSecret(null);
    setHookOpen(true);
  }
  async function saveHook(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await saveHookFn({ data: { id: hookForm.id, name: hookForm.name, url: hookForm.url, events: hookForm.events as ("post.published" | "post.updated" | "post.deleted")[], active: hookForm.active } });
      if ((res as { secret?: string }).secret) setHookSecret((res as { secret: string }).secret);
      else setHookOpen(false);
      qc.invalidateQueries({ queryKey: ["blog-webhooks"] });
      toast.success("Webhook saved");
    } catch (err) { toast.error((err as Error).message); }
  }
  async function delHook(id: string) {
    if (!confirm("Delete this webhook?")) return;
    try { await delHookFn({ data: { id } }); qc.invalidateQueries({ queryKey: ["blog-webhooks"] }); }
    catch (err) { toast.error((err as Error).message); }
  }
  function copy(text: string) {
    navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AppShell title="Blog API & Webhooks">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> API keys</CardTitle>
            <CardDescription>Issue keys to Blaze.ai, AutoSEO, Make, Zapier or your own scripts. Each key can read & write posts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[240px]">
                <Label>Key name</Label>
                <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Blaze.ai – production" maxLength={80} />
              </div>
              <Button onClick={generateKey}><Plus className="h-4 w-4 mr-1" /> Generate key</Button>
            </div>
            {newKey && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                <p className="text-sm font-medium">Save this key now — you won't see it again.</p>
                <div className="flex items-center gap-2 bg-card border border-border rounded-md p-2 font-mono text-sm break-all">
                  <span className="flex-1">{newKey}</span>
                  <Button size="sm" variant="ghost" onClick={() => copy(newKey)}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
                </div>
              </div>
            )}
            {keys.length === 0 ? <p className="text-sm text-muted-foreground">No keys yet.</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Prefix</TableHead><TableHead>Last used</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell><code className="text-xs">{k.prefix}…</code></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}</TableCell>
                      <TableCell>{k.revoked_at ? <Badge variant="secondary">Revoked</Badge> : <Badge className="bg-status-done text-status-done-foreground">Active</Badge>}</TableCell>
                      <TableCell className="text-right">
                        {!k.revoked_at && <Button size="sm" variant="ghost" onClick={() => revoke(k.id)}><Trash2 className="h-4 w-4" /></Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhooks</CardTitle>
              <CardDescription>Notify external systems when posts are published, updated or deleted. Signed with HMAC-SHA256.</CardDescription>
            </div>
            <Button onClick={openNewHook}><Plus className="h-4 w-4 mr-1" /> New webhook</Button>
          </CardHeader>
          <CardContent>
            {hooks.length === 0 ? <p className="text-sm text-muted-foreground">No webhooks configured.</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>URL</TableHead><TableHead>Events</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {hooks.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[220px] truncate">{h.url}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{(h.events as string[]).map((e) => <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>)}</div></TableCell>
                      <TableCell>{h.active ? <Badge className="bg-status-done text-status-done-foreground">Active</Badge> : <Badge variant="secondary">Paused</Badge>}</TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => delHook(h.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={hookOpen} onOpenChange={setHookOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{hookForm.id ? "Edit webhook" : "New webhook"}</DialogTitle></DialogHeader>
            <form onSubmit={saveHook} className="space-y-3">
              <div><Label>Name</Label><Input value={hookForm.name} onChange={(e) => setHookForm({ ...hookForm, name: e.target.value })} required maxLength={80} /></div>
              <div><Label>Endpoint URL</Label><Input value={hookForm.url} onChange={(e) => setHookForm({ ...hookForm, url: e.target.value })} required type="url" placeholder="https://hooks.example.com/hrppl" /></div>
              <div className="flex items-center gap-2"><Switch checked={hookForm.active} onCheckedChange={(v) => setHookForm({ ...hookForm, active: v })} /><Label>Active</Label></div>
              {hookSecret && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm space-y-1">
                  <p className="font-medium">Signing secret — store securely.</p>
                  <code className="block font-mono break-all">{hookSecret}</code>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setHookOpen(false)}>Close</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Quick reference</CardTitle>
            <CardDescription>What to give Blaze.ai, AutoSEO or any HTTP-capable tool.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <div className="font-medium">Create or upsert a post</div>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto mt-1">{`POST https://hrppl.io/api/public/blog/posts
Authorization: Bearer hpk_xxx
Content-Type: application/json

{
  "title": "Top 10 payroll mistakes",
  "content_md": "# Intro\\nSome **markdown** here…",
  "tags": ["payroll","compliance"],
  "category_slug": "payroll",
  "status": "published",
  "seo_title": "...", "seo_description": "...",
  "external_source": "blaze.ai", "external_ref": "blaze-post-123"
}`}</pre>
            </div>
            <div>
              <div className="font-medium">Webhook payload</div>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto mt-1">{`POST <your endpoint>
X-HRPPL-Event: post.published
X-HRPPL-Signature: sha256=<hex>
X-HRPPL-Delivery: <uuid>

{ "event": "post.published", "occurred_at": "...", "data": { "post": { ... } } }`}</pre>
              <p className="text-muted-foreground mt-1">Verify the signature with the secret shown when you create the webhook.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
