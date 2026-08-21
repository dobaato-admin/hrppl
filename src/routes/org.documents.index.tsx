import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listEnvelopes, sendEnvelopes, cancelEnvelope, listTemplates } from "@/lib/documents.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Send, X } from "lucide-react";
import { useMyTenantId } from "@/hooks/use-tenant";

export const Route = createFileRoute("/org/documents/")({
  head: () => ({ meta: [{ title: "Envelopes — hrppl" }] }),
  component: EnvelopesPage,
});

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-status-info/20 text-status-info",
  viewed: "bg-status-working/20 text-status-working",
  in_progress: "bg-status-working/20 text-status-working",
  completed: "bg-status-done/20 text-status-done",
  declined: "bg-status-stuck/20 text-status-stuck",
  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-status-stuck/20 text-status-stuck",
};

function EnvelopesPage() {
  const { tenantId } = useMyTenantId();
  const list = useServerFn(listEnvelopes);
  const send = useServerFn(sendEnvelopes);
  const cancel = useServerFn(cancelEnvelope);
  const tplFn = useServerFn(listTemplates);
  const [rows, setRows] = useState<any[]>([]);
  const [tpls, setTpls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [openSend, setOpenSend] = useState(false);
  const [working, setWorking] = useState(false);

  async function refresh() {
    const [r, t] = await Promise.all([
      list({ data: filter === "all" ? {} : { status: filter } }),
      tplFn(),
    ]);
    setRows(r.envelopes);
    setTpls(t.templates.filter((x: any) => x.status === "published"));
  }

  async function loadEmployees() {
    if (!tenantId) return;
    // Tenant-scoped explicitly: RLS does not narrow this for super_admin
    // (its policy on employees has no tenant predicate), so the unfiltered
    // version listed every tenant. See src/hooks/use-tenant.ts.
    const { data } = await supabase.from("employees")
      .select("id,first_name,last_name,email,job_title").eq("tenant_id", tenantId).eq("status", "active").order("first_name").limit(500);
    setEmployees(data ?? []);
  }

  useEffect(() => { refresh(); }, [filter]);
  // Depends on tenantId: it resolves asynchronously, so an empty dep array ran
  // loadEmployees once while it was still undefined and never again.
  useEffect(() => { loadEmployees(); /* eslint-disable-next-line */ }, [tenantId]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Envelopes</CardTitle>
            <CardDescription>Documents sent to employees, contractors, or candidates.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={openSend} onOpenChange={setOpenSend}>
              <DialogTrigger asChild>
                <Button size="sm"><Send className="h-4 w-4 mr-1" /> Send document</Button>
              </DialogTrigger>
              <SendDialog
                templates={tpls}
                employees={employees}
                working={working}
                onSubmit={async (payload) => {
                  setWorking(true);
                  try {
                    const r = await send({ data: payload });
                    toast.success(`Sent ${r.created} envelope${r.created === 1 ? "" : "s"}`);
                    setOpenSend(false);
                    refresh();
                  } catch (e: any) { toast.error(e.message); }
                  finally { setWorking(false); }
                }}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-muted-foreground">No envelopes yet.</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-xs truncate">{r.subject}</TableCell>
                  <TableCell><Badge variant="outline">{r.doc_type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs">
                    <div>{r.recipient_name}</div>
                    <div className="text-muted-foreground">{r.recipient_email}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_TONE[r.status] ?? ""}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{r.due_date ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.sent_at ? new Date(r.sent_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Link to="/org/documents/envelope/$id" params={{ id: r.id }}>
                      <Button size="sm" variant="ghost">Open</Button>
                    </Link>
                    {!["completed", "cancelled", "declined"].includes(r.status) && (
                      <Button size="sm" variant="ghost" onClick={async () => {
                        const reason = prompt("Reason for cancellation?");
                        if (reason == null) return;
                        await cancel({ data: { id: r.id, reason } });
                        toast.success("Cancelled");
                        refresh();
                      }}><X className="h-3.5 w-3.5" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SendDialog(props: {
  templates: any[]; employees: any[]; working: boolean;
  onSubmit: (payload: any) => Promise<void>;
}) {
  const [templateId, setTemplateId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [docType, setDocType] = useState("other");
  const [dueDays, setDueDays] = useState(14);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [useCountersigner, setUseCountersigner] = useState(false);
  const [countersignerEmpId, setCountersignerEmpId] = useState<string>("");
  const [countersignerRole, setCountersignerRole] = useState<string>("HR Manager");

  useEffect(() => {
    if (templateId) {
      const t = props.templates.find((x: any) => x.id === templateId);
      if (t) {
        setSubject(t.name); setDocType(t.doc_type); setDueDays(t.default_due_days);
        if (t.requires_countersign) {
          setUseCountersigner(true);
          if (t.countersigner_role) setCountersignerRole(t.countersigner_role);
        }
      }
    }
  }, [templateId, props.templates]);

  const filtered = props.employees.filter((e) =>
    !search || `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Send document</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Template (optional — leave blank for one-off)</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger><SelectValue placeholder="Select published template…" /></SelectTrigger>
            <SelectContent>
              {props.templates.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No published templates</div>}
              {props.templates.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.name} ({t.doc_type.replace(/_/g, " ")})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Employment Contract" />
        </div>
        {!templateId && (
          <>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employment_contract">Employment contract</SelectItem>
                  <SelectItem value="offer_letter">Offer letter</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="hr_letter">HR letter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Body (HTML — use {`{{employee.first_name}}`} etc. for merge tags)</Label>
              <textarea
                className="min-h-[160px] w-full rounded-md border bg-background p-2 text-sm font-mono"
                value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label>Due in (days)</Label>
          <Input type="number" min={1} max={365} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} />
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={useCountersigner} onCheckedChange={(c) => setUseCountersigner(!!c)} />
            Add a countersigner (signs after the recipient)
          </label>
          {useCountersigner && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Countersigner (employee)</Label>
                <Select value={countersignerEmpId} onValueChange={setCountersignerEmpId}>
                  <SelectTrigger><SelectValue placeholder="Select employee…" /></SelectTrigger>
                  <SelectContent>
                    {props.employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role label</Label>
                <Input value={countersignerRole} onChange={(e) => setCountersignerRole(e.target.value)} placeholder="HR Manager" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Recipients ({selected.size} selected)</Label>
          <Input placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-64 overflow-y-auto rounded-md border">
            {filtered.map((e) => (
              <label key={e.id} className="flex items-center gap-2 border-b px-2 py-1.5 last:border-b-0 hover:bg-accent">
                <Checkbox
                  checked={selected.has(e.id)}
                  onCheckedChange={(c) => {
                    const next = new Set(selected);
                    if (c) next.add(e.id); else next.delete(e.id);
                    setSelected(next);
                  }}
                />
                <span className="text-sm">{e.first_name} {e.last_name}</span>
                <span className="text-xs text-muted-foreground">{e.email}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button disabled={props.working || selected.size === 0 || !subject || (!templateId && !bodyHtml) || (useCountersigner && !countersignerEmpId)} onClick={() =>
          props.onSubmit({
            template_id: templateId || undefined,
            subject,
            body_html: templateId ? undefined : bodyHtml,
            doc_type: templateId ? undefined : docType,
            due_days: dueDays,
            recipients: Array.from(selected).map((id) => ({ employee_id: id, merge_values: {} })),
            countersigner: useCountersigner && countersignerEmpId
              ? { employee_id: countersignerEmpId, role: countersignerRole }
              : undefined,
          })
        }>
          {props.working ? "Sending…" : `Send to ${selected.size} recipient${selected.size === 1 ? "" : "s"}`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
