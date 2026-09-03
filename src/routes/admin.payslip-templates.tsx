import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DOMPurify from "isomorphic-dompurify";
import { AdminGate } from "@/components/AdminGate";

import { AppShell } from "@/components/AppShell";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "span",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "br",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "ul",
    "ol",
    "li",
    "div",
  ],
  ALLOWED_ATTR: ["class", "style"],
};
const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, SANITIZE_CONFIG);

export const Route = createFileRoute("/admin/payslip-templates")({
  head: () => ({ meta: [{ title: "Payslip Templates — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.payslipTemplates">
      <PayslipTemplatesPage />
    </AdminGate>
  ),
});

interface Country {
  code: string;
  name: string;
  currency_code: string;
}
interface Template {
  id: string;
  country_code: string;
  currency_code: string;
  name: string;
  locale: string;
  date_format: string;
  number_format: { decimal: string; thousands: string; decimals: number };
  currency_position: string;
  header_html: string | null;
  footer_html: string | null;
  show_employer_contributions: boolean;
  show_ytd: boolean;
  is_default: boolean;
  is_active: boolean;
  version: number;
  parent_template_id: string | null;
  status: "draft" | "published" | "archived";
  effective_from: string | null;
  effective_to: string | null;
  published_at: string | null;
}
interface LineItem {
  id: string;
  template_id: string;
  sort_order: number;
  code: string;
  label: string;
  category: string;
  calc_type: string;
  formula: string | null;
  rate: number | null;
  is_taxable: boolean;
  is_visible: boolean;
}

const CATEGORIES = ["earning", "deduction", "employer_contribution", "info"];
const CALC_TYPES = ["fixed", "percent_of_base", "formula", "system"];
const LOCALES = [
  "en-US",
  "en-GB",
  "en-AU",
  "fr-FR",
  "de-DE",
  "es-ES",
  "pt-BR",
  "ja-JP",
  "zh-CN",
  "ar-AE",
];
const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD-MMM-YYYY"];

function PayslipTemplatesPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const canEdit =
    roles.includes("super_admin") ||
    roles.includes("regional_admin") ||
    roles.includes("org_admin");

  const [countries, setCountries] = useState<Country[]>([]);
  const [scopedCountries, setScopedCountries] = useState<string[]>([]);
  const [country, setCountry] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [auditEntries, setAuditEntries] = useState<
    Array<{
      id: string;
      action: string;
      created_at: string;
      actor_id: string | null;
      entity_id: string | null;
      metadata: Record<string, unknown> | null;
      actor_email?: string | null;
    }>
  >([]);

  useEffect(() => {
    if (!loading && (!user || !canEdit)) {
      if (user) toast.error("Admin access required");
      navigate({ to: user ? "/dashboard" : "/auth" });
    }
  }, [loading, user, canEdit, navigate]);

  useEffect(() => {
    if (!canEdit || !user) return;
    (async () => {
      const c = await supabase.from("countries").select("*").order("name");
      if (c.data) setCountries(c.data as Country[]);
      if (
        roles.includes("org_admin") &&
        !roles.includes("super_admin") &&
        !roles.includes("regional_admin")
      ) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .maybeSingle();
        if (!prof?.tenant_id) return;
        const { data: tenant } = await supabase
          .from("tenants")
          .select("country_code")
          .eq("id", prof.tenant_id)
          .maybeSingle();
        const allowed = tenant?.country_code ? [tenant.country_code] : [];
        setScopedCountries(allowed);
        if (allowed.length && !country) setCountry(allowed[0]);
      } else if (roles.includes("regional_admin") && !roles.includes("super_admin")) {
        const s = await supabase.from("role_scope").select("country_code").eq("user_id", user.id);
        const list = (s.data ?? []).map((r) => r.country_code as string);
        setScopedCountries(list);
        if (list.length && !country) setCountry(list[0]);
      } else if (c.data && c.data[0] && !country) {
        setCountry(c.data[0].code);
      }
    })();
  }, [canEdit, user, roles]);

  if (loading || (user && !rolesLoaded)) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  const visibleCountries = useMemo(() => {
    if (roles.includes("super_admin")) return countries;
    return countries.filter((c) => scopedCountries.includes(c.code));
  }, [countries, scopedCountries, roles]);

  async function loadTemplates(cc: string) {
    const { data } = await supabase
      .from("payslip_templates")
      .select("*")
      .eq("country_code", cc)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as unknown as Template[];
    setTemplates(list);
    setSelectedId(list[0]?.id ?? "");
  }

  useEffect(() => {
    if (country) loadTemplates(country);
  }, [country]);

  useEffect(() => {
    if (!selectedId) {
      setLineItems([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("payslip_line_items")
        .select("*")
        .eq("template_id", selectedId)
        .order("sort_order");
      setLineItems((data ?? []) as unknown as LineItem[]);
    })();
  }, [selectedId]);

  const selected = templates.find((t) => t.id === selectedId);

  async function logAudit(action: string, entityId: string, metadata?: Record<string, unknown>) {
    if (!user) return;
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action,
      entity_type: "payslip_template",
      entity_id: entityId,
      metadata: (metadata ?? null) as never,
    });
  }

  async function createTemplate() {
    if (!country) return;
    const cc = countries.find((c) => c.code === country);
    setSaving(true);
    const { data, error } = await supabase
      .from("payslip_templates")
      .insert({
        country_code: country,
        currency_code: cc?.currency_code ?? "USD",
        name: `${cc?.name ?? country} Template`,
        created_by: user?.id,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    const tpl = data as unknown as Template;
    await logAudit("payslip_template.create", tpl.id, {
      name: tpl.name,
      country_code: tpl.country_code,
    });
    toast.success("Template created");
    await loadTemplates(country);
    setSelectedId(tpl.id);
  }

  function guardEditable(): boolean {
    if (!selected) return false;
    if (selected.status !== "draft") {
      toast.error("This version is published or archived. Create a new version to make changes.");
      return false;
    }
    return true;
  }

  async function saveTemplate(patch: Partial<Template>) {
    if (!selected) return;
    if (!guardEditable()) return;
    setSaving(true);
    const { error } = await supabase.from("payslip_templates").update(patch).eq("id", selected.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setTemplates((prev) =>
      prev.map((t) => (t.id === selected.id ? ({ ...t, ...patch } as Template) : t)),
    );
    await logAudit("payslip_template.draft.edit", selected.id, {
      fields: Object.keys(patch),
      version: selected.version,
    });
    loadAudit(selected);
    toast.success("Saved");
  }

  async function deleteTemplate() {
    if (!selected) return;
    if (!guardEditable()) return;
    if (!confirm(`Delete template "${selected.name}"?`)) return;
    const snapshot = {
      name: selected.name,
      version: selected.version,
      country_code: selected.country_code,
    };
    const { error } = await supabase.from("payslip_templates").delete().eq("id", selected.id);
    if (error) return toast.error(error.message);
    await logAudit("payslip_template.delete", selected.id, snapshot);
    toast.success("Deleted");
    loadTemplates(country);
  }

  async function addLineItem() {
    if (!selected) return;
    if (!guardEditable()) return;
    const { error } = await supabase.from("payslip_line_items").insert({
      template_id: selected.id,
      sort_order: lineItems.length,
      code: `ITEM_${lineItems.length + 1}`,
      label: "New line item",
      category: "earning",
      calc_type: "fixed",
    });
    if (error) return toast.error(error.message);
    const { data } = await supabase
      .from("payslip_line_items")
      .select("*")
      .eq("template_id", selected.id)
      .order("sort_order");
    setLineItems((data ?? []) as unknown as LineItem[]);
    await logAudit("payslip_template.draft.edit", selected.id, { change: "line_item.add" });
    loadAudit(selected);
  }

  async function updateLineItem(id: string, patch: Partial<LineItem>) {
    if (!guardEditable() || !selected) return;
    setLineItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const { error } = await supabase.from("payslip_line_items").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("payslip_template.draft.edit", selected.id, {
      change: "line_item.update",
      line_item_id: id,
      fields: Object.keys(patch),
    });
    loadAudit(selected);
  }

  async function removeLineItem(id: string) {
    if (!guardEditable() || !selected) return;
    setLineItems((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("payslip_line_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("payslip_template.draft.edit", selected.id, {
      change: "line_item.remove",
      line_item_id: id,
    });
    loadAudit(selected);
  }

  const isLocked = !!selected && selected.status !== "draft";

  const familyVersions = useMemo(() => {
    if (!selected) return [];
    const root = selected.parent_template_id ?? selected.id;
    return templates
      .filter((t) => (t.parent_template_id ?? t.id) === root)
      .sort((a, b) => b.version - a.version);
  }, [templates, selected]);

  async function cloneAsDraft() {
    if (!selected) return;
    const { data, error } = await supabase.rpc("clone_payslip_template", {
      _template_id: selected.id,
    });
    if (error) return toast.error(error.message);
    if (typeof data === "string") {
      await logAudit("payslip_template.clone", data, {
        from_template_id: selected.id,
        from_version: selected.version,
      });
    }
    toast.success("New draft version created");
    await loadTemplates(country);
    if (typeof data === "string") setSelectedId(data);
  }

  async function publishDraft() {
    if (!selected) return;
    const today = new Date().toISOString().slice(0, 10);
    const eff = prompt("Effective from date (YYYY-MM-DD)?", today);
    if (!eff) return;
    const root = selected.parent_template_id ?? selected.id;
    const priorPublished = templates.find(
      (t) =>
        (t.parent_template_id ?? t.id) === root && t.status === "published" && t.id !== selected.id,
    );
    const { error } = await supabase.rpc("publish_payslip_template", {
      _template_id: selected.id,
      _effective_from: eff,
    });
    if (error) return toast.error(error.message);
    await logAudit("payslip_template.publish", selected.id, {
      version: selected.version,
      effective_from: eff,
      country_code: selected.country_code,
    });
    if (priorPublished) {
      await logAudit("payslip_template.archive", priorPublished.id, {
        version: priorPublished.version,
        archived_by_publish_of: selected.id,
        effective_to: eff,
      });
    }
    toast.success("Template published");
    loadTemplates(country);
    loadAudit(selected);
  }

  async function loadAudit(tpl: Template) {
    if (!roles.includes("super_admin")) {
      setAuditEntries([]);
      return;
    }
    const root = tpl.parent_template_id ?? tpl.id;
    const familyIds = templates
      .filter((t) => (t.parent_template_id ?? t.id) === root)
      .map((t) => t.id);
    const ids = familyIds.length ? familyIds : [tpl.id];
    const { data } = await supabase
      .from("audit_log")
      .select("id, action, created_at, actor_id, entity_id, metadata")
      .eq("entity_type", "payslip_template")
      .in("entity_id", ids)
      .order("created_at", { ascending: false })
      .limit(100);
    const rows = (data ?? []) as Array<{
      id: string;
      action: string;
      created_at: string;
      actor_id: string | null;
      entity_id: string | null;
      metadata: Record<string, unknown> | null;
    }>;
    const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean) as string[]));
    let emails: Record<string, string> = {};
    if (actorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", actorIds);
      emails = Object.fromEntries(
        (profs ?? []).map((p) => [p.id as string, (p.email as string) ?? ""]),
      );
    }
    setAuditEntries(
      rows.map((r) => ({ ...r, actor_email: r.actor_id ? (emails[r.actor_id] ?? null) : null })),
    );
  }

  useEffect(() => {
    if (selected) loadAudit(selected);
    else setAuditEntries([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, templates.length, roles.join(",")]);

  const sampleAmount = 1234567.89;
  const formatted = useMemo(() => {
    if (!selected) return "";
    try {
      return new Intl.NumberFormat(selected.locale, {
        style: "currency",
        currency: selected.currency_code,
        minimumFractionDigits: selected.number_format.decimals,
        maximumFractionDigits: selected.number_format.decimals,
      }).format(sampleAmount);
    } catch {
      return `${selected.currency_code} ${sampleAmount}`;
    }
  }, [selected]);

  const formattedDate = useMemo(() => {
    if (!selected) return "";
    try {
      return new Intl.DateTimeFormat(selected.locale).format(new Date());
    } catch {
      return "";
    }
  }, [selected]);

  if (loading || !canEdit) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    // Wrapped in AppShell to restore the sidebar and top bar. admin.tsx is
    // deliberately a bare <Outlet /> (pinned by tests/admin-routes-block.test.ts),
    // so any /admin page that does not render its own shell had no navigation at
    // all — the user could only leave via the browser back button.
    //
    // No title passed: this page already renders its own header below, so the
    // shell contributes chrome only and does not duplicate the heading.
    <AppShell>
      <main className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">Payslip Templates</h1>
              <p className="text-xs text-muted-foreground">
                Configurable line items and localized formatting per country
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Select country</CardTitle>
              <CardDescription>Templates are scoped per country and currency.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-4">
              <div className="w-64 space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleCountries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.currency_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-72 space-y-2">
                <Label>Template</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder={templates.length ? "Select…" : "No templates yet"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.is_default ? "★" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createTemplate} disabled={!country || saving}>
                New template
              </Button>
              {selected && selected.status === "draft" && (
                <Button onClick={publishDraft}>Publish…</Button>
              )}
              {selected && (
                <Button variant="outline" onClick={cloneAsDraft}>
                  New version
                </Button>
              )}
              {selected && selected.status === "draft" && (
                <Button variant="destructive" onClick={deleteTemplate}>
                  Delete draft
                </Button>
              )}
            </CardContent>
          </Card>

          {selected && familyVersions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Version history</CardTitle>
                <CardDescription>
                  Published versions are immutable so historical payslips keep referencing them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective from</TableHead>
                      <TableHead>Effective to</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyVersions.map((v) => (
                      <TableRow
                        key={v.id}
                        className={v.id === selected.id ? "bg-muted/40" : undefined}
                      >
                        <TableCell className="font-medium">v{v.version}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              v.status === "published"
                                ? "default"
                                : v.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{v.effective_from ?? "—"}</TableCell>
                        <TableCell className="text-xs">{v.effective_to ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {v.published_at?.slice(0, 10) ?? "—"}
                        </TableCell>
                        <TableCell>
                          {v.id !== selected.id && (
                            <Button size="sm" variant="ghost" onClick={() => setSelectedId(v.id)}>
                              Open
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {selected && roles.includes("super_admin") && (
            <Card>
              <CardHeader>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>
                  Who changed what, across every version in this template family.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No audit entries yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditEntries.map((a) => {
                        const tpl = templates.find((t) => t.id === a.entity_id);
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs whitespace-nowrap">
                              {new Date(a.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs">
                              {a.actor_email ?? a.actor_id?.slice(0, 8) ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {a.action.replace("payslip_template.", "")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {tpl ? `v${tpl.version}` : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono max-w-md truncate">
                              {a.metadata ? JSON.stringify(a.metadata) : ""}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {selected && (
            <div className={isLocked ? "pointer-events-none opacity-70" : undefined}>
              {isLocked && (
                <div className="pointer-events-auto mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm">
                  This version is <strong>{selected.status}</strong> and read-only. Click "New
                  version" above to make changes.
                </div>
              )}
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="formatting">Localized Formatting</TabsTrigger>
                  <TabsTrigger value="lines">Line Items ({lineItems.length})</TabsTrigger>
                  <TabsTrigger value="layout">Header / Footer</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <Card>
                    <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={selected.name}
                          onChange={(e) =>
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id ? { ...t, name: e.target.value } : t,
                              ),
                            )
                          }
                          onBlur={(e) => saveTemplate({ name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input
                          value={selected.currency_code}
                          onChange={(e) =>
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id
                                  ? { ...t, currency_code: e.target.value.toUpperCase() }
                                  : t,
                              ),
                            )
                          }
                          onBlur={(e) =>
                            saveTemplate({ currency_code: e.target.value.toUpperCase() })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <Label>Default template</Label>
                          <p className="text-xs text-muted-foreground">
                            Used by tenants in this country
                          </p>
                        </div>
                        <Switch
                          checked={selected.is_default}
                          onCheckedChange={(v) => saveTemplate({ is_default: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <Label>Active</Label>
                        </div>
                        <Switch
                          checked={selected.is_active}
                          onCheckedChange={(v) => saveTemplate({ is_active: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <Label>Show employer contributions</Label>
                        </div>
                        <Switch
                          checked={selected.show_employer_contributions}
                          onCheckedChange={(v) => saveTemplate({ show_employer_contributions: v })}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <Label>Show year-to-date totals</Label>
                        </div>
                        <Switch
                          checked={selected.show_ytd}
                          onCheckedChange={(v) => saveTemplate({ show_ytd: v })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="formatting">
                  <Card>
                    <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Locale</Label>
                        <Select
                          value={selected.locale}
                          onValueChange={(v) => saveTemplate({ locale: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCALES.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date format</Label>
                        <Select
                          value={selected.date_format}
                          onValueChange={(v) => saveTemplate({ date_format: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DATE_FORMATS.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Currency position</Label>
                        <Select
                          value={selected.currency_position}
                          onValueChange={(v) => saveTemplate({ currency_position: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prefix">Prefix ($1,000)</SelectItem>
                            <SelectItem value="suffix">Suffix (1,000 €)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Decimal places</Label>
                        <Input
                          type="number"
                          min={0}
                          max={6}
                          value={selected.number_format.decimals}
                          onChange={(e) => {
                            const nf = {
                              ...selected.number_format,
                              decimals: Number(e.target.value),
                            };
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id ? { ...t, number_format: nf } : t,
                              ),
                            );
                          }}
                          onBlur={() => saveTemplate({ number_format: selected.number_format })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Decimal separator</Label>
                        <Input
                          maxLength={1}
                          value={selected.number_format.decimal}
                          onChange={(e) => {
                            const nf = { ...selected.number_format, decimal: e.target.value };
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id ? { ...t, number_format: nf } : t,
                              ),
                            );
                          }}
                          onBlur={() => saveTemplate({ number_format: selected.number_format })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Thousands separator</Label>
                        <Input
                          maxLength={1}
                          value={selected.number_format.thousands}
                          onChange={(e) => {
                            const nf = { ...selected.number_format, thousands: e.target.value };
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id ? { ...t, number_format: nf } : t,
                              ),
                            );
                          }}
                          onBlur={() => saveTemplate({ number_format: selected.number_format })}
                        />
                      </div>
                      <div className="md:col-span-2 rounded-md border bg-muted/30 p-4">
                        <p className="text-xs text-muted-foreground">Live preview</p>
                        <p className="text-lg font-medium">{formatted}</p>
                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lines">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Line items</CardTitle>
                        <CardDescription>
                          Earnings, deductions, and contributions in payslip order.
                        </CardDescription>
                      </div>
                      <Button onClick={addLineItem}>Add line</Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Calc</TableHead>
                            <TableHead>Rate / Formula</TableHead>
                            <TableHead>Taxable</TableHead>
                            <TableHead>Visible</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-muted-foreground">
                                No line items yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            lineItems.map((l, idx) => (
                              <TableRow key={l.id}>
                                <TableCell>
                                  <Input
                                    type="number"
                                    className="w-16"
                                    value={l.sort_order}
                                    onChange={(e) =>
                                      updateLineItem(l.id, { sort_order: Number(e.target.value) })
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="w-28 font-mono text-xs"
                                    value={l.code}
                                    onChange={(e) =>
                                      setLineItems((p) =>
                                        p.map((x) =>
                                          x.id === l.id ? { ...x, code: e.target.value } : x,
                                        ),
                                      )
                                    }
                                    onBlur={(e) => updateLineItem(l.id, { code: e.target.value })}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={l.label}
                                    onChange={(e) =>
                                      setLineItems((p) =>
                                        p.map((x) =>
                                          x.id === l.id ? { ...x, label: e.target.value } : x,
                                        ),
                                      )
                                    }
                                    onBlur={(e) => updateLineItem(l.id, { label: e.target.value })}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={l.category}
                                    onValueChange={(v) => updateLineItem(l.id, { category: v })}
                                  >
                                    <SelectTrigger className="w-44">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                          {c.replace(/_/g, " ")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={l.calc_type}
                                    onValueChange={(v) => updateLineItem(l.id, { calc_type: v })}
                                  >
                                    <SelectTrigger className="w-36">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CALC_TYPES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                          {c}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  {l.calc_type === "percent_of_base" ? (
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-24"
                                      value={l.rate ?? ""}
                                      onChange={(e) =>
                                        setLineItems((p) =>
                                          p.map((x) =>
                                            x.id === l.id
                                              ? { ...x, rate: Number(e.target.value) }
                                              : x,
                                          ),
                                        )
                                      }
                                      onBlur={(e) =>
                                        updateLineItem(l.id, { rate: Number(e.target.value) })
                                      }
                                    />
                                  ) : l.calc_type === "formula" ? (
                                    <Input
                                      className="w-44 font-mono text-xs"
                                      placeholder="base * 0.05"
                                      value={l.formula ?? ""}
                                      onChange={(e) =>
                                        setLineItems((p) =>
                                          p.map((x) =>
                                            x.id === l.id ? { ...x, formula: e.target.value } : x,
                                          ),
                                        )
                                      }
                                      onBlur={(e) =>
                                        updateLineItem(l.id, { formula: e.target.value })
                                      }
                                    />
                                  ) : (
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-24"
                                      value={l.rate ?? ""}
                                      onChange={(e) =>
                                        setLineItems((p) =>
                                          p.map((x) =>
                                            x.id === l.id
                                              ? { ...x, rate: Number(e.target.value) }
                                              : x,
                                          ),
                                        )
                                      }
                                      onBlur={(e) =>
                                        updateLineItem(l.id, { rate: Number(e.target.value) })
                                      }
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={l.is_taxable}
                                    onCheckedChange={(v) => updateLineItem(l.id, { is_taxable: v })}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={l.is_visible}
                                    onCheckedChange={(v) => updateLineItem(l.id, { is_visible: v })}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLineItem(l.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="layout">
                  <Card>
                    <CardContent className="grid gap-4 pt-6">
                      <div className="space-y-2">
                        <Label>Header HTML</Label>
                        <Textarea
                          rows={6}
                          value={selected.header_html ?? ""}
                          onChange={(e) =>
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id ? { ...t, header_html: e.target.value } : t,
                              ),
                            )
                          }
                          onBlur={(e) => saveTemplate({ header_html: e.target.value })}
                          placeholder="<h2>{{company_name}}</h2><p>Pay period: {{period}}</p>"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Footer HTML</Label>
                        <Textarea
                          rows={4}
                          value={selected.footer_html ?? ""}
                          onChange={(e) =>
                            setTemplates((p) =>
                              p.map((t) =>
                                t.id === selected.id ? { ...t, footer_html: e.target.value } : t,
                              ),
                            )
                          }
                          onBlur={(e) => saveTemplate({ footer_html: e.target.value })}
                          placeholder="Confidential. Generated on {{date}}."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="rounded-md border bg-card p-6">
                        <div
                          className="border-b pb-3"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(
                              selected.header_html ??
                                `<h2 class='text-xl font-semibold'>${selected.name}</h2>`,
                            ),
                          }}
                        />
                        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                          <span>Pay date: {formattedDate}</span>
                          <span>
                            {selected.country_code} · {selected.currency_code}
                          </span>
                        </div>
                        <table className="mt-4 w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-1">Code</th>
                              <th>Description</th>
                              <th className="text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems
                              .filter((l) => l.is_visible)
                              .map((l) => (
                                <tr key={l.id} className="border-b">
                                  <td className="py-1 font-mono text-xs">{l.code}</td>
                                  <td>
                                    {l.label}{" "}
                                    <Badge variant="outline" className="ml-1 text-[10px]">
                                      {l.category}
                                    </Badge>
                                  </td>
                                  <td className="text-right">{formatted}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <div
                          className="mt-4 border-t pt-2 text-xs text-muted-foreground"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(selected.footer_html ?? ""),
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
