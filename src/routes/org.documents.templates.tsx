import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listTemplates,
  upsertTemplate,
  publishTemplate,
  archiveTemplate,
  cloneTemplate,
  getTemplate,
  renderTemplatePreview,
  listStarterTemplates,
  instantiateStarterTemplate,
} from "@/lib/documents.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  Archive,
  CheckCircle2,
  Pencil,
  Eye,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/org/documents/templates")({
  head: () => ({ meta: [{ title: "Document templates — hrppl" }] }),
  // Had no route-level gate at all — found while giving it a nav entry per the
  // W4 IA redesign. W5 P1 narrowed it from ADMIN_LAYOUT_ROLES, which admitted
  // regional_admin: a platform role has no business editing one tenant's
  // document templates, and org.documentTemplates never admitted it either.
  // Gating by feature key keeps this page and its nav row in step.
  component: () => (
    <AdminGate feature="org.documentTemplates">
      <TemplatesPage />
    </AdminGate>
  ),
});

const MERGE_HINTS = [
  "employee.first_name",
  "employee.last_name",
  "employee.full_name",
  "employee.email",
  "employee.job_title",
  "company.name",
  "today",
];

function TemplatesPage() {
  const list = useServerFn(listTemplates);
  const get = useServerFn(getTemplate);
  const upsert = useServerFn(upsertTemplate);
  const publish = useServerFn(publishTemplate);
  const archive = useServerFn(archiveTemplate);
  const clone = useServerFn(cloneTemplate);
  const listStarters = useServerFn(listStarterTemplates);
  const instantiate = useServerFn(instantiateStarterTemplate);
  const [rows, setRows] = useState<any[]>([]);
  const [editor, setEditor] = useState<any | null>(null);
  const [working, setWorking] = useState(false);
  const [starterOpen, setStarterOpen] = useState(false);
  const [starters, setStarters] = useState<any[]>([]);
  const [instantiating, setInstantiating] = useState<string | null>(null);

  async function refresh() {
    setRows((await list()).templates);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function openStarters() {
    setStarterOpen(true);
    if (starters.length === 0) {
      try {
        setStarters((await listStarters()).presets);
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Templates</CardTitle>
          <CardDescription>
            Author contracts, offers, policies and HR letters with merge tags.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={openStarters}>
            <Sparkles className="h-4 w-4 mr-1" /> Browse starters
          </Button>
          <Button
            size="sm"
            onClick={() =>
              setEditor({
                name: "",
                doc_type: "employment_contract",
                body_html: "",
                merge_fields: [],
                requires_signature: true,
                requires_countersign: false,
                default_due_days: 14,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> New template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No templates yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.doc_type.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "published"
                          ? "default"
                          : t.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">v{t.version}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(t.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {t.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const r = await get({ data: { id: t.id } });
                            setEditor({
                              ...r.template,
                              merge_fields: r.template.merge_fields ?? [],
                            });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await publish({ data: { id: t.id } });
                            toast.success("Published");
                            refresh();
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await clone({ data: { id: t.id } });
                        toast.success("Cloned");
                        refresh();
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {t.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await archive({ data: { id: t.id } });
                          toast.success("Archived");
                          refresh();
                        }}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={starterOpen} onOpenChange={setStarterOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> HRPPL recommended starters
            </DialogTitle>
            <CardDescription>
              Add a starter to your library as a draft. You can rename, edit, and publish it for
              your organisation.
            </CardDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {starters.length === 0 ? (
              <div className="text-sm text-muted-foreground">Loading starters…</div>
            ) : (
              starters.map((p) => (
                <div key={p.key} className="flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {p.doc_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                    {p.requires_signature && (
                      <span className="rounded bg-muted px-1.5 py-0.5">Signature</span>
                    )}
                    {p.requires_countersign && (
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        Countersign · {p.countersigner_role}
                      </span>
                    )}
                    <span className="rounded bg-muted px-1.5 py-0.5">
                      Due {p.default_due_days}d
                    </span>
                  </div>
                  <Button
                    size="sm"
                    disabled={instantiating === p.key}
                    onClick={async () => {
                      setInstantiating(p.key);
                      try {
                        await instantiate({ data: { key: p.key } });
                        toast.success(`Added "${p.name}" to your library`);
                        setStarterOpen(false);
                        refresh();
                      } catch (e: any) {
                        toast.error(e.message);
                      } finally {
                        setInstantiating(null);
                      }
                    }}
                  >
                    {instantiating === p.key ? "Adding…" : "Add as draft"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editor}
        onOpenChange={(o) => {
          if (!o) setEditor(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editor?.id ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>
          {editor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editor.name}
                    onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editor.doc_type}
                    onValueChange={(v) => setEditor({ ...editor, doc_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employment_contract">Employment contract</SelectItem>
                      <SelectItem value="offer_letter">Offer letter</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="hr_letter">HR letter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (internal)</Label>
                <Input
                  value={editor.description ?? ""}
                  onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                />
              </div>

              <TemplateBodyEditor
                bodyHtml={editor.body_html}
                onChange={(html) => setEditor({ ...editor, body_html: html })}
              />

              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editor.requires_signature}
                    onCheckedChange={(v) => setEditor({ ...editor, requires_signature: v })}
                  />
                  <Label>Requires signature</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editor.requires_countersign}
                    onCheckedChange={(v) => setEditor({ ...editor, requires_countersign: v })}
                  />
                  <Label>Countersign</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Default due (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={editor.default_due_days}
                    onChange={(e) =>
                      setEditor({ ...editor, default_due_days: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              {editor.requires_countersign && (
                <div className="space-y-2">
                  <Label>Countersigner role (label shown to admins)</Label>
                  <Input
                    value={editor.countersigner_role ?? ""}
                    placeholder="e.g. HR Manager, CEO"
                    onChange={(e) => setEditor({ ...editor, countersigner_role: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={working || !editor?.name || !editor?.body_html}
              onClick={async () => {
                setWorking(true);
                try {
                  await upsert({
                    data: {
                      id: editor.id,
                      name: editor.name,
                      description: editor.description ?? null,
                      doc_type: editor.doc_type,
                      body_html: editor.body_html,
                      merge_fields: editor.merge_fields ?? [],
                      requires_signature: editor.requires_signature,
                      requires_countersign: editor.requires_countersign,
                      countersigner_role: editor.countersigner_role ?? null,
                      default_due_days: editor.default_due_days,
                    },
                  });
                  toast.success("Saved");
                  setEditor(null);
                  refresh();
                } catch (e: any) {
                  toast.error(e.message);
                } finally {
                  setWorking(false);
                }
              }}
            >
              {working ? "Saving…" : "Save draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TemplateBodyEditor({
  bodyHtml,
  onChange,
}: {
  bodyHtml: string;
  onChange: (html: string) => void;
}) {
  const previewFn = useServerFn(renderTemplatePreview);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [preview, setPreview] = useState<{ html: string; unresolved: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  async function runPreview() {
    setBusy(true);
    try {
      const r = await previewFn({ data: { body_html: bodyHtml ?? "" } });
      setPreview({ html: r.html, unresolved: r.unresolved });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>Body (HTML with merge tags)</Label>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as any);
          if (v === "preview") runPreview();
        }}
      >
        <TabsList>
          <TabsTrigger value="edit">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview merged
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="space-y-2">
          <Textarea
            className="min-h-[280px] font-mono text-sm"
            value={bodyHtml}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-muted-foreground">Insert merge tag:</span>
            {MERGE_HINTS.map((m) => (
              <button
                key={m}
                type="button"
                className="rounded bg-muted px-1.5 py-0.5 font-mono hover:bg-accent"
                onClick={() => onChange((bodyHtml ?? "") + `{{${m}}}`)}
              >
                {`{{${m}}}`}
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="preview" className="space-y-2">
          {busy ? (
            <div className="text-sm text-muted-foreground">Rendering…</div>
          ) : preview ? (
            <>
              {preview.unresolved.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-status-working/40 bg-status-working/10 p-2 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-status-working mt-0.5" />
                  <div>
                    <div className="font-medium">Unresolved merge tags</div>
                    <div className="text-muted-foreground">
                      {preview.unresolved.map((u) => `{{${u}}}`).join(", ")}
                    </div>
                  </div>
                </div>
              )}
              <div
                className="rounded-md border bg-card p-4 prose prose-sm dark:prose-invert max-h-[420px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
              <div className="text-[10px] text-muted-foreground">
                Sample values used: employee.full_name=Alex Sample · company.name=Acme Inc. ·
                today=today
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
