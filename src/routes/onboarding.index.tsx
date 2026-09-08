import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  toggleChecklistItem,
  recordEmployeeDocument,
  getDocumentDownloadUrl,
  deleteEmployeeDocument,
} from "@/lib/onboarding.functions";
import { computeUnlockedStages, STAGE_NONE_KEY } from "@/lib/onboarding-stage-rules";
import { computeOnboardingCompletion } from "@/lib/onboarding-completion";
import { computeCompleteSections } from "@/lib/onboarding-profile-sections";
import { AppShell } from "@/components/AppShell";
import { OnboardingJourney } from "@/components/onboarding/OnboardingJourney";
import { KpiTile, StatusChip, statusTone } from "@/components/monday";
import { ListChecks, FileText, Hourglass, Award, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding/")({
  head: () => ({ meta: [{ title: "Onboarding — hrppl" }] }),
  component: OnboardingPage,
});

interface Stage {
  key: string;
  label: string;
  order: number;
}
interface Checklist {
  id: string;
  name: string;
  is_default: boolean;
  items: { key: string; label: string; required: boolean; stage?: string | null }[];
  stages?: Stage[];
}
interface Progress {
  id: string;
  checklist_id: string;
  item_key: string;
  approval_status: string;
  approval_notes: string | null;
}
interface Doc {
  id: string;
  doc_type: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  visibility: string;
  created_at: string;
}
interface Assignment {
  id: string;
  checklist_id: string;
  due_date: string | null;
  status: string;
  signed_off_at: string | null;
  notes: string | null;
}

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [emp, setEmp] = useState<{ id: string; tenant_id: string } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  // The employee's own profile, so an item backed by a profile section reads as
  // done because the data exists — not because a write-side sync happened to
  // run while this checklist was already assigned. See onboarding-completion.ts.
  const [profileSections, setProfileSections] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [docType, setDocType] = useState("other");
  // True once load() has actually returned. Distinguishes "no checklists" from
  // "checklists not fetched yet" — see the redirect effect below.
  const [loaded, setLoaded] = useState(false);
  // Redirect on the transition into "complete" only, so a returning user can
  // still open /onboarding to review what they submitted (§1 #1).
  //
  // This flag must OUTLIVE the component. It used to be useState, which resets
  // on unmount — and navigating to /dashboard unmounts this page. So every
  // later visit looked like a fresh transition: the toast fired again and the
  // user was bounced straight back out, never reaching the summary below.
  // sessionStorage keeps it per-tab and per-employee, and it is cleared again
  // whenever the checklist stops being complete (HR rejected an item).
  const [redirected, setRedirected] = useState(false);

  const fnToggle = useServerFn(toggleChecklistItem);
  const fnRecord = useServerFn(recordEmployeeDocument);
  const fnDownload = useServerFn(getDocumentDownloadUrl);
  const fnDelete = useServerFn(deleteEmployeeDocument);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // §1 #1: the page used to compute progress and do nothing at 100%, stranding
  // the employee. Once every required item is done, hand them to /dashboard,
  // which already renders the right content for their role.
  //
  // Fires on the transition only — navigating back here later shows the
  // read-only summary instead of bouncing, so people can review what they
  // submitted. HR approval continues in the background and does not gate this;
  // a rejected item reopens the checklist and clears `redirected`.
  const onboardingComplete =
    checklists.length > 0 &&
    computeOnboardingCompletion(checklists, progress, profileSections).complete;

  useEffect(() => {
    // `loaded` is load-bearing, not a nicety. `emp` resolves from its own query
    // before load() has fetched the checklists, and until then `checklists` is
    // [] — which reads as "not complete". Acting on that window cleared the
    // latch on every single mount, so the toast fired and bounced the user out
    // again on every visit. Only judge completeness once the data is in.
    if (!emp || !loaded) return;
    const key = `hrppl:onboarding-welcomed:${emp.id}`;
    if (!onboardingComplete) {
      // Genuinely incomplete — HR reopened something. Re-arm the redirect so
      // finishing it again hands them back to the dashboard.
      sessionStorage.removeItem(key);
      setRedirected(false);
      return;
    }
    if (redirected || sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    setRedirected(true);
    toast.success("Onboarding complete — welcome aboard!");
    navigate({ to: "/dashboard" });
  }, [emp, loaded, onboardingComplete, redirected, navigate]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("employees")
        .select("id,tenant_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setEmp(data as any);
    })();
  }, [user]);

  async function load() {
    if (!emp) return;
    const [aRes, pRes, dRes, profRes] = await Promise.all([
      supabase
        .from("onboarding_assignments")
        .select("*")
        .eq("employee_id", emp.id)
        .order("assigned_at", { ascending: true }),
      supabase
        .from("onboarding_progress")
        .select("id,checklist_id,item_key,approval_status,approval_notes")
        .eq("employee_id", emp.id),
      supabase
        .from("employee_documents")
        .select("*")
        .eq("employee_id", emp.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("staff_onboarding_profiles")
        .select("*")
        .eq("employee_id", emp.id)
        .maybeSingle(),
    ]);
    setProfileSections(computeCompleteSections(profRes.data as never));
    const asg = (aRes.data ?? []) as Assignment[];
    setAssignments(asg);
    if (asg.length > 0) {
      const ids = asg.map((a) => a.checklist_id);
      const { data: cl } = await supabase.from("onboarding_checklists").select("*").in("id", ids);
      setChecklists((cl ?? []) as unknown as Checklist[]);
    } else {
      setChecklists([]);
    }
    setProgress((pRes.data ?? []) as Progress[]);
    setDocs((dRes.data ?? []) as Doc[]);
    setLoaded(true);
  }
  useEffect(() => {
    load();
  }, [emp]);

  const doneSet = useMemo(
    () => new Set(progress.map((p) => `${p.checklist_id}:${p.item_key}`)),
    [progress],
  );

  async function toggle(checklistId: string, itemKey: string, done: boolean) {
    if (!emp) return;
    try {
      await fnToggle({ data: { employeeId: emp.id, checklistId, itemKey, done } });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function onUpload(file: File) {
    if (!emp || !file) return;
    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${emp.tenant_id}/${emp.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("employee-documents")
        .upload(path, file, { upsert: false });
      if (upErr) throw new Error(upErr.message);
      await fnRecord({
        data: {
          employeeId: emp.id,
          filePath: path,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          docType,
          visibility: "employee",
        },
      });
      toast.success("Uploaded");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadDoc(id: string) {
    try {
      const { url, fileName } = await fnDownload({ data: { documentId: id } });
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function removeDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    setBusy(true);
    try {
      await fnDelete({ data: { documentId: id } });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );
  if (!emp)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        No employee record linked.
      </main>
    );

  const totalItems = checklists.reduce((s, cl) => s + cl.items.length, 0);
  const completedItems = checklists.reduce(
    (s, cl) => s + cl.items.filter((it) => doneSet.has(`${cl.id}:${it.key}`)).length,
    0,
  );
  // Progress over REQUIRED items — the number that decides whether the employee
  // is finished. The all-items count above is kept for the "x/y tasks" hint.
  const completion = computeOnboardingCompletion(checklists, progress, profileSections);
  const overallPct = completion.percent;
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = assignments.filter(
    (a) => a.due_date && a.due_date < todayStr && a.status !== "signed_off",
  ).length;
  const signedOffCount = assignments.filter((a) => a.status === "signed_off").length;

  return (
    <AppShell title="My onboarding" subtitle="Complete checklist items and upload your documents.">
      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* W7 · The one link. Everything a new starter owes, across four
            surfaces that previously did not reference each other. */}
        <OnboardingJourney />

        {/* Returning-visitor state. The redirect above only fires on the
            transition, so anyone coming back to review lands here rather than
            on a task list that implies outstanding work. */}
        {completion.complete && (
          <div className="flex flex-col gap-3 rounded-lg border border-status-done/40 bg-status-done/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-status-done" />
              <div>
                <p className="font-medium">You&rsquo;ve completed your onboarding</p>
                <p className="text-sm text-muted-foreground">
                  All {completion.totalRequired} required{" "}
                  {completion.totalRequired === 1 ? "task is" : "tasks are"} done.
                  {completion.awaitingReview > 0
                    ? ` ${completion.awaitingReview} ${completion.awaitingReview === 1 ? "item is" : "items are"} still with HR for review — nothing further is needed from you.`
                    : " Everything below is kept for your records."}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate({ to: "/dashboard" })} className="shrink-0">
              Go to dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* HR sent something back: this reopens the checklist, so say so
            plainly rather than silently un-completing it. */}
        {completion.rejected.length > 0 && (
          <div className="rounded-lg border border-status-stuck/40 bg-status-stuck/10 p-4">
            <p className="font-medium">
              {completion.rejected.length === 1
                ? "An item needs another look"
                : `${completion.rejected.length} items need another look`}
            </p>
            <p className="text-sm text-muted-foreground">
              HR sent {completion.rejected.length === 1 ? "it" : "them"} back. Re-submit below to
              finish onboarding.
            </p>
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Overall progress"
            value={`${overallPct}%`}
            tone="primary"
            icon={ListChecks}
            hint={`${completedItems}/${totalItems} tasks`}
          />
          <KpiTile
            label="Checklists assigned"
            value={assignments.length}
            tone="info"
            icon={FileText}
          />
          <KpiTile
            label="Overdue"
            value={overdueCount}
            tone={overdueCount > 0 ? "stuck" : "done"}
            icon={Hourglass}
          />
          <KpiTile label="Signed off" value={signedOffCount} tone="done" icon={Award} />
        </section>

        <Tabs defaultValue="checklists">
          <TabsList>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="space-y-6">
            {assignments.map((asg) => {
              const cl = checklists.find((c) => c.id === asg.checklist_id);
              if (!cl) return null;
              const total = cl.items.length;
              const done = cl.items.filter((it) => doneSet.has(`${cl.id}:${it.key}`)).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const today = new Date().toISOString().slice(0, 10);
              const overdue = asg.due_date && asg.due_date < today && asg.status !== "signed_off";
              return (
                <Card key={asg.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {cl.name}
                          {asg.status === "signed_off" && <Badge>Signed off</Badge>}
                          {asg.status === "cancelled" && <Badge variant="outline">Cancelled</Badge>}
                        </CardTitle>
                        <CardDescription>
                          {done} of {total} complete ({pct}%)
                          {asg.due_date && (
                            <span className={overdue ? "ml-2 text-destructive" : "ml-2"}>
                              · Due {new Date(asg.due_date).toLocaleDateString()}
                              {overdue && " (overdue)"}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const stages = (cl.stages ?? []).slice().sort((a, b) => a.order - b.order);
                      const unlocked = computeUnlockedStages(stages, cl.items, progress, cl.id);
                      const groups: Array<{
                        key: string;
                        label: string | null;
                        items: typeof cl.items;
                      }> = [];
                      const noStage = cl.items.filter((it) => !it.stage);
                      if (noStage.length > 0)
                        groups.push({
                          key: STAGE_NONE_KEY,
                          label: stages.length > 0 ? "General" : null,
                          items: noStage,
                        });
                      for (const s of stages) {
                        const its = cl.items.filter((it) => it.stage === s.key);
                        if (its.length > 0) groups.push({ key: s.key, label: s.label, items: its });
                      }
                      if (groups.length === 0)
                        return <p className="text-sm text-muted-foreground">No items.</p>;
                      return groups.map((g) => {
                        const stageUnlocked = unlocked.has(g.key);
                        return (
                          <div key={g.key} className="space-y-2">
                            {g.label && (
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold">{g.label}</h4>
                                {!stageUnlocked && (
                                  <Badge variant="outline" className="text-xs">
                                    Locked
                                  </Badge>
                                )}
                              </div>
                            )}
                            {!stageUnlocked && (
                              <p className="text-xs text-muted-foreground">
                                Complete required items in earlier stages to unlock.
                              </p>
                            )}
                            {g.items.map((it) => {
                              const isDone = doneSet.has(`${cl.id}:${it.key}`);
                              const pr = progress.find(
                                (p) => p.checklist_id === cl.id && p.item_key === it.key,
                              );
                              const locked =
                                asg.status === "signed_off" ||
                                asg.status === "cancelled" ||
                                !stageUnlocked;
                              return (
                                <div key={it.key} className="flex items-start gap-3">
                                  <Checkbox
                                    checked={isDone}
                                    disabled={locked}
                                    onCheckedChange={(v) => toggle(cl.id, it.key, !!v)}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={
                                          isDone
                                            ? "line-through text-muted-foreground"
                                            : !stageUnlocked
                                              ? "text-muted-foreground"
                                              : ""
                                        }
                                      >
                                        {it.label}
                                      </span>
                                      {it.required && (
                                        <Badge variant="outline" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                      {pr?.approval_status === "approved" && (
                                        <Badge className="text-xs">Approved</Badge>
                                      )}
                                      {pr?.approval_status === "rejected" && (
                                        <Badge variant="destructive" className="text-xs">
                                          Rejected
                                        </Badge>
                                      )}
                                    </div>
                                    {pr?.approval_notes && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        Manager note: {pr.approval_notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      });
                    })()}
                    {asg.notes && (
                      <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                        Manager note: {asg.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {assignments.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">No onboarding assigned</CardTitle>
                  <CardDescription>
                    Your manager hasn't assigned any onboarding checklists yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <OnboardingTimeline
              assignments={assignments}
              checklists={checklists}
              progress={progress}
              doneSet={doneSet}
              toggle={toggle}
            />
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">My documents</CardTitle>
            <CardDescription>Upload personal documents (ID, certifications, etc.).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <Label>Document type</Label>
                <Input
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  placeholder="passport, contract, ..."
                  className="w-48"
                />
              </div>
              <div>
                <Label>File</Label>
                <Input
                  type="file"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.file_name}</TableCell>
                    <TableCell>{d.doc_type}</TableCell>
                    <TableCell>
                      {d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => downloadDoc(d.id)}>
                        Download
                      </Button>
                      {d.visibility === "employee" && (
                        <Button size="sm" variant="outline" onClick={() => removeDoc(d.id)}>
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {docs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No documents yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function OnboardingTimeline({
  assignments,
  checklists,
  progress,
  doneSet,
  toggle,
}: {
  assignments: Assignment[];
  checklists: Checklist[];
  progress: Progress[];
  doneSet: Set<string>;
  toggle: (checklistId: string, itemKey: string, done: boolean) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const overall = useMemo(() => {
    let done = 0;
    let total = 0;
    assignments.forEach((asg) => {
      const cl = checklists.find((c) => c.id === asg.checklist_id);
      if (!cl) return;
      total += cl.items.length;
      done += cl.items.filter((it) => doneSet.has(`${cl.id}:${it.key}`)).length;
    });
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [assignments, checklists, doneSet]);

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">No onboarding assigned</CardTitle>
          <CardDescription>
            Your manager hasn't assigned any onboarding checklists yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={overall.pct} className="flex-1" />
            <span className="text-sm font-medium shrink-0">
              {overall.done}/{overall.total} tasks
            </span>
          </div>
        </CardContent>
      </Card>

      {assignments.map((asg) => {
        const cl = checklists.find((c) => c.id === asg.checklist_id);
        if (!cl) return null;
        const total = cl.items.length;
        const done = cl.items.filter((it) => doneSet.has(`${cl.id}:${it.key}`)).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const overdue = asg.due_date && asg.due_date < today && asg.status !== "signed_off";

        const stages = (cl.stages ?? []).slice().sort((a, b) => a.order - b.order);
        const unlocked = computeUnlockedStages(stages, cl.items, progress, cl.id);

        const groups: Array<{ key: string; label: string | null; items: typeof cl.items }> = [];
        const noStage = cl.items.filter((it) => !it.stage);
        if (noStage.length > 0)
          groups.push({
            key: STAGE_NONE_KEY,
            label: stages.length > 0 ? "General" : null,
            items: noStage,
          });
        for (const s of stages) {
          const its = cl.items.filter((it) => it.stage === s.key);
          if (its.length > 0) groups.push({ key: s.key, label: s.label, items: its });
        }

        return (
          <Card key={asg.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-base">{cl.name}</CardTitle>
                  <CardDescription>
                    {asg.due_date ? (
                      <span className={overdue ? "text-destructive" : ""}>
                        Due {new Date(asg.due_date).toLocaleDateString()} {overdue && "(overdue)"}
                      </span>
                    ) : (
                      "No due date"
                    )}
                    {" · "}
                    {done}/{total} tasks
                  </CardDescription>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">{pct}%</div>
                </div>
              </div>
              <Progress value={pct} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              {groups.map((g) => {
                const stageUnlocked = unlocked.has(g.key);
                return (
                  <div key={g.key}>
                    {g.label && (
                      <div className="flex items-center gap-2 pb-1">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary border border-border">
                          <span className="text-[10px] font-bold text-secondary-foreground">
                            {g.label.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {g.label}
                        </span>
                        {!stageUnlocked && (
                          <Badge variant="outline" className="text-[10px]">
                            Locked
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="ml-3 border-l-2 border-border pl-4 space-y-1">
                      {g.items.map((it) => {
                        const isDone = doneSet.has(`${cl.id}:${it.key}`);
                        const pr = progress.find(
                          (p) => p.checklist_id === cl.id && p.item_key === it.key,
                        );
                        const locked =
                          asg.status === "signed_off" ||
                          asg.status === "cancelled" ||
                          !stageUnlocked;
                        return (
                          <div key={it.key} className="flex items-start gap-3 py-1">
                            <div className="flex flex-col items-center w-4 shrink-0 pt-1.5">
                              <div
                                className={`h-2.5 w-2.5 rounded-full ${
                                  isDone
                                    ? "bg-primary"
                                    : pr?.approval_status === "rejected"
                                      ? "bg-destructive"
                                      : locked
                                        ? "bg-muted"
                                        : "bg-muted ring-2 ring-primary/30"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-sm ${isDone ? "line-through text-muted-foreground" : locked ? "text-muted-foreground" : ""}`}
                                >
                                  {it.label}
                                </span>
                                {it.required && (
                                  <Badge variant="outline" className="text-[10px]">
                                    Required
                                  </Badge>
                                )}
                                {pr?.approval_status === "approved" && (
                                  <Badge className="text-[10px]">Approved</Badge>
                                )}
                                {pr?.approval_status === "rejected" && (
                                  <Badge variant="destructive" className="text-[10px]">
                                    Rejected
                                  </Badge>
                                )}
                              </div>
                              {pr?.approval_notes && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {pr.approval_notes}
                                </p>
                              )}
                            </div>
                            <Checkbox
                              checked={isDone}
                              disabled={locked}
                              onCheckedChange={(v) => toggle(cl.id, it.key, !!v)}
                              className="shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {asg.notes && (
                <p className="text-xs text-muted-foreground border-t pt-3 mt-2">
                  Manager note: {asg.notes}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
