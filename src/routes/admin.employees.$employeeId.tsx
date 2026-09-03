import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Link2 as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { linkEvents, listEmployeeTimeline, recordCustomEvent } from "@/lib/timeline.functions";
import { listEventAccessLog, accessLogSummary, logEventAccess } from "@/lib/audit.functions";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/employees/$employeeId")({
  component: () => (
    <AdminGate feature="org.employees">
      <EmployeeRecordPage />
    </AdminGate>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">{(error as Error).message}</p>
        <Button
          onClick={() => {
            reset();
            router.invalidate();
          }}
        >
          Retry
        </Button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">Employee not found</div>,
});

const CATEGORIES = [
  "all",
  "medical",
  "disciplinary",
  "grievance",
  "training",
  "payroll",
  "review",
  "onboarding",
  "leave",
  "expense",
  "promotion",
  "pay_change",
  "document",
];

const CATEGORY_COLORS: Record<string, string> = {
  medical: "bg-status-stuck text-white",
  disciplinary: "bg-status-stuck text-white",
  grievance: "bg-status-pending text-white",
  training: "bg-status-info text-white",
  payroll: "bg-primary text-primary-foreground",
  review: "bg-accent text-accent-foreground",
  onboarding: "bg-status-info text-white",
  leave: "bg-status-done text-white",
  expense: "bg-status-done text-white",
  promotion: "bg-accent text-accent-foreground",
  pay_change: "bg-primary text-primary-foreground",
  document: "bg-muted text-foreground",
};

function EmployeeRecordPage() {
  const { employeeId } = Route.useParams();
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"timeline" | "audit">("timeline");
  const fetchTimeline = useServerFn(listEmployeeTimeline);
  const fetchAudit = useServerFn(listEventAccessLog);
  const fetchAuditSummary = useServerFn(accessLogSummary);
  const logAccess = useServerFn(logEventAccess);
  const addEvent = useServerFn(recordCustomEvent);
  const linkFn = useServerFn(linkEvents);
  const qc = useQueryClient();

  // W5 P3 · recordCustomEvent had no caller, so the employment timeline could
  // only ever contain events the system generated. Anything that happened off
  // -system — a conversation, a commitment made in a review, an informal
  // warning — had nowhere to live, and the record was incomplete in exactly
  // the cases where completeness matters.
  //
  // Deliberately NOT offered on /me/timeline: the server fn is assertHrOrAdmin
  // gated, and an employment record its own subject can write to is not a
  // record.
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<
    "employee" | "manager" | "hr" | "confidential"
  >("hr");
  const [savingNote, setSavingNote] = useState(false);

  async function saveNote() {
    if (!noteTitle.trim()) return;
    setSavingNote(true);
    try {
      await addEvent({
        data: {
          employeeId,
          category: "note",
          eventType: "manual_note",
          title: noteTitle.trim(),
          summary: noteBody.trim() || undefined,
          visibility: noteVisibility,
        },
      });
      toast.success("Note added to the record");
      setNoteOpen(false);
      setNoteTitle("");
      setNoteBody("");
      await qc.invalidateQueries({ queryKey: ["employee-timeline", employeeId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add the note");
    } finally {
      setSavingNote(false);
    }
  }

  // W5 P3 · logEventAccess and accessLogSummary both had zero callers, so the
  // event_access_log table this page already READS from was never being
  // WRITTEN to by the very page that opens an employee's record. Viewing
  // someone's employment history is exactly the access an audit trail exists to
  // capture, and it was the one access nobody recorded.
  //
  // Fire-and-forget: an audit write must never be the reason a record fails to
  // open, the same rule clockIn follows for geofence_audit_log.
  useEffect(() => {
    void logAccess({
      data: { resourceType: "employee_timeline", employeeId, action: "view" },
    }).catch(() => {});
  }, [employeeId, logAccess]);

  const { data: auditSummary } = useQuery({
    queryKey: ["employee-audit-summary", employeeId],
    queryFn: () => fetchAuditSummary({ data: { employeeId } }),
    enabled: view === "audit",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["employee-timeline", employeeId, filter],
    queryFn: () =>
      fetchTimeline({
        data: {
          employeeId,
          categories: filter === "all" ? undefined : [filter],
          limit: 300,
        },
      }),
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["employee-audit", employeeId],
    queryFn: () => fetchAudit({ data: { employeeId, limit: 300 } }),
    enabled: view === "audit",
  });

  const events = data?.events ?? [];

  // The links the server already returns, indexed for lookup while rendering.
  const links = data?.links ?? [];
  const eventById = useMemo(() => {
    const m = new Map<string, any>();
    for (const e of events) m.set(e.id, e);
    return m;
  }, [events]);
  const linksFrom = (id: string) => links.filter((l: any) => l.from_event_id === id);

  // Manual linking. The auto-created pairs cover the one case Postgres knows
  // about; everything else — a grievance and the discipline case that answered
  // it, two absences that were the same illness — is a judgement only a person
  // can make. linkEvents already asserts HR-or-admin server-side.
  const [linkFrom, setLinkFrom] = useState<any | null>(null);
  const [linkTo, setLinkTo] = useState("");
  const [relation, setRelation] = useState("related");
  const linkM = useMutation({
    mutationFn: () => linkFn({ data: { fromEventId: linkFrom.id, toEventId: linkTo, relation } }),
    onSuccess: () => {
      toast.success("Events linked");
      setLinkFrom(null);
      setLinkTo("");
      qc.invalidateQueries({ queryKey: ["employee-timeline"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not link the events"),
  });
  const grouped = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }, [events]);

  return (
    <AppShell
      title="Employee record"
      subtitle="Comprehensive timeline of everything that touches this employee"
    >
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(grouped).length === 0 && (
              <span className="text-sm text-muted-foreground">No events yet.</span>
            )}
            {Object.entries(grouped).map(([cat, count]) => (
              <Badge key={cat} className={CATEGORY_COLORS[cat] ?? "bg-muted"}>
                {cat.replace("_", " ")} · {count}
              </Badge>
            ))}
            {auditSummary && (
              <Badge variant="outline" className="ml-auto font-normal">
                {auditSummary.total} view{auditSummary.total === 1 ? "" : "s"} of this record
                {auditSummary.confidential > 0 && ` · ${auditSummary.confidential} confidential`}
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "timeline" ? "default" : "outline"}
            onClick={() => setView("timeline")}
          >
            Timeline
          </Button>
          <Button
            size="sm"
            variant={view === "audit" ? "default" : "outline"}
            onClick={() => setView("audit")}
          >
            Access audit
          </Button>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setNoteOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add note
          </Button>
        </div>

        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a note to this record</DialogTitle>
              <DialogDescription>
                Recorded permanently against the employee&rsquo;s timeline, attributed to you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Agreed revised start time"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Detail</Label>
                <Textarea
                  rows={4}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="What was discussed or decided."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Who can see this</Label>
                <Select
                  value={noteVisibility}
                  onValueChange={(v) => setNoteVisibility(v as typeof noteVisibility)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee and above</SelectItem>
                    <SelectItem value="manager">Manager and above</SelectItem>
                    <SelectItem value="hr">HR and admins</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveNote} disabled={!noteTitle.trim() || savingNote}>
                {savingNote ? "Saving…" : "Add note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {view === "audit" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who viewed or edited this record</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !auditData?.entries.length ? (
                <p className="text-sm text-muted-foreground">No access recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditData.entries.map((row: any) => {
                    const actor = row.actor_id ? auditData.actors[row.actor_id] : null;
                    return (
                      <div
                        key={row.id}
                        className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm"
                      >
                        <Badge variant="outline" className="capitalize">
                          {row.action}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {row.resource_type.replace("_", " ")}
                        </Badge>
                        {row.was_confidential && (
                          <Badge className="bg-status-stuck text-white">confidential</Badge>
                        )}
                        <span className="font-medium">
                          {actor?.full_name || actor?.email || "Unknown user"}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {view === "timeline" && (
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="flex flex-wrap">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c} value={c} className="capitalize">
                  {c.replace("_", " ")}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={filter} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing recorded.</p>
                  ) : (
                    <ol className="relative space-y-4 border-l border-border pl-4">
                      {events.map((e: any) => (
                        <li key={e.id} className="relative">
                          <span className="absolute -left-[22px] mt-1 inline-block h-3 w-3 rounded-full bg-primary" />
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={CATEGORY_COLORS[e.category] ?? "bg-muted"}>
                              {e.category.replace("_", " ")}
                            </Badge>
                            <span className="font-medium">{e.title}</span>
                            {e.severity && (
                              <Badge variant="outline" className="capitalize">
                                {e.severity}
                              </Badge>
                            )}
                            {e.visibility !== "employee" && (
                              <Badge variant="outline" className="capitalize">
                                {e.visibility}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(e.occurred_at).toLocaleString()}
                            </span>
                          </div>
                          {e.summary && (
                            <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                          )}
                          {e.source_table && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Source: {e.source_table} · {e.source_id?.slice(0, 8)}
                            </p>
                          )}
                          {/*
                            W5 P5 · The database has always built these links —
                            tg_event_medical writes a `spawned` / `caused_by`
                            pair when a medical incident opens a disciplinary
                            case — and listEmployeeTimeline has always returned
                            them. Nothing rendered them, so the one thing a
                            timeline exists to show, that this followed from
                            that, was computed, stored, fetched and dropped.
                          */}
                          {linksFrom(e.id).map((l: any) => {
                            const target = eventById.get(l.to_event_id);
                            return (
                              <p
                                key={l.id ?? `${l.from_event_id}-${l.to_event_id}`}
                                className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"
                              >
                                <LinkIcon className="h-3 w-3 shrink-0" />
                                <span className="capitalize">
                                  {String(l.relation).replace(/_/g, " ")}
                                </span>
                                <span className="text-foreground">
                                  {target?.title ?? "an event outside this range"}
                                </span>
                              </p>
                            );
                          })}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 h-6 px-1.5 text-[11px]"
                            onClick={() => setLinkFrom(e)}
                          >
                            <LinkIcon className="mr-1 h-3 w-3" />
                            Link to another event
                          </Button>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={!!linkFrom} onOpenChange={(o) => !o && setLinkFrom(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Link this event to another</DialogTitle>
              <DialogDescription className="line-clamp-2">
                From “{linkFrom?.title}”. Links appear on the timeline so the connection between two
                entries is visible to whoever reads the record next.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="link-to">Event</Label>
                <Select value={linkTo} onValueChange={setLinkTo}>
                  <SelectTrigger id="link-to">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events
                      .filter((e: any) => e.id !== linkFrom?.id)
                      .map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>
                          {new Date(e.occurred_at).toLocaleDateString()} · {e.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="link-relation">Relation</Label>
                <Select value={relation} onValueChange={setRelation}>
                  <SelectTrigger id="link-relation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Same vocabulary the trigger writes, so hand-made and
                        auto-made links read identically on the timeline. */}
                    <SelectItem value="related">Related to</SelectItem>
                    <SelectItem value="spawned">Spawned</SelectItem>
                    <SelectItem value="caused_by">Caused by</SelectItem>
                    <SelectItem value="supersedes">Supersedes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkFrom(null)}>
                Cancel
              </Button>
              <Button disabled={!linkTo || linkM.isPending} onClick={() => linkM.mutate()}>
                {linkM.isPending ? "Linking…" : "Link events"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
