import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, Trophy, Award, Plus, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  listAppreciations, createAppreciation, toggleAppreciationReaction,
  listAwardTypes, upsertAwardType, listAwardCycles, upsertAwardCycle,
  nominateForAward, listNominations, decideNomination, listAwardsGranted,
} from "@/lib/hr-extras.functions";
import { getCompanyDirectory } from "@/lib/me.functions";
import { myEmployeeId } from "@/lib/timeline.functions";

export const Route = createFileRoute("/recognition")({
  head: () => ({ meta: [{ title: "Recognition — hrppl" }] }),
  component: RecognitionPage,
});

/**
 * Colleagues the current user can recognise or nominate.
 *
 * Reads getCompanyDirectory, which scopes to the caller's own tenant and to
 * active staff. It replaces a direct `supabase.from("employees")` query that had
 * no tenant filter and leaned on RLS — and RLS does not narrow for super_admin
 * or regional_admin, whose policies on `employees` carry no tenant predicate,
 * so those users were offered people from other organisations. See
 * src/lib/tenant-scope.ts.
 *
 * Self is excluded: appreciating or nominating yourself is never the intent.
 */
interface Colleague {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

function useColleagues(): Colleague[] {
  const directoryFn = useServerFn(getCompanyDirectory);
  const meFn = useServerFn(myEmployeeId);
  const { data } = useQuery<Colleague[]>({
    queryKey: ["recognition-colleagues"],
    queryFn: async () => {
      const [dir, me] = await Promise.all([directoryFn({ data: { limit: 200 } }), meFn()]);
      const mine = me?.employee?.id;
      return ((dir.employees ?? []) as Colleague[]).filter((e) => e.id !== mine);
    },
    staleTime: 5 * 60_000,
  });
  return data ?? [];
}

function RecognitionPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("org_admin") || roles.includes("super_admin");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  if (loading) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  return (
    <AppShell title="Recognition" subtitle="Appreciations, awards & nominations">
      <section className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">Kudos feed</TabsTrigger>
            <TabsTrigger value="awards">Awards & nominations</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Manage</TabsTrigger>}
          </TabsList>
          <TabsContent value="feed"><KudosFeed /></TabsContent>
          <TabsContent value="awards"><AwardsTab isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="winners"><WinnersTab /></TabsContent>
          {isAdmin && <TabsContent value="admin"><AdminTab /></TabsContent>}
        </Tabs>
      </section>
    </AppShell>
  );
}

// -------- Kudos Feed --------
function KudosFeed() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAppreciations);
  const createFn = useServerFn(createAppreciation);
  const reactFn = useServerFn(toggleAppreciationReaction);
  const [scope, setScope] = useState<"feed" | "received" | "sent">("feed");
  const [open, setOpen] = useState(false);
  const employees = useColleagues();
  const [form, setForm] = useState<any>({ visibility: "public", emoji: "👏" });
  const { data } = useQuery({ queryKey: ["appreciations", scope], queryFn: () => listFn({ data: { scope, limit: 50 } }) });


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try { await createFn({ data: form }); toast.success("Kudos sent 🎉"); setOpen(false); setForm({ visibility: "public", emoji: "👏" }); qc.invalidateQueries({ queryKey: ["appreciations"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function react(id: string, emoji: string) {
    await reactFn({ data: { appreciation_id: id, emoji } });
    qc.invalidateQueries({ queryKey: ["appreciations"] });
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
          <TabsList><TabsTrigger value="feed">Org feed</TabsTrigger><TabsTrigger value="received">Received</TabsTrigger><TabsTrigger value="sent">Sent</TabsTrigger></TabsList>
        </Tabs>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Send className="mr-1 h-4 w-4" /> Send kudos</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send appreciation</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2"><Label>To</Label>
                <Select value={form.to_employee_id ?? ""} onValueChange={(v) => setForm({ ...form, to_employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick someone" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Emoji</Label><Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} /></div>
                <div className="space-y-2 col-span-2"><Label>Value tag</Label><Input placeholder="e.g. Customer first" value={form.value_tag ?? ""} onChange={(e) => setForm({ ...form, value_tag: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Message</Label><Textarea rows={3} value={form.message ?? ""} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={2} /></div>
              <div className="space-y-2"><Label>Visibility</Label>
                <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="public">Org-wide</SelectItem><SelectItem value="manager">Recipient + manager only</SelectItem></SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="submit">Send</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {(data?.items ?? []).length === 0 ? (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">No kudos yet — be the first to celebrate someone.</CardContent></Card>
        ) : data!.items.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{a.emoji}</div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{a.from_emp?.first_name} {a.from_emp?.last_name}</span>
                    <span className="text-muted-foreground"> appreciated </span>
                    <span className="font-medium">{a.to_emp?.first_name} {a.to_emp?.last_name}</span>
                    {a.value_tag && <Badge variant="outline" className="ml-2">{a.value_tag}</Badge>}
                    {a.visibility === "manager" && <Badge variant="secondary" className="ml-2">Private</Badge>}
                  </div>
                  <p className="mt-2 text-sm">{a.message}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {["👏","❤️","🎉","🙌"].map((em) => {
                      const count = (a.appreciation_reactions ?? []).filter((r: any) => r.emoji === em).length;
                      return (
                        <button key={em} type="button" onClick={() => react(a.id, em)} className="rounded-full border bg-card px-2 py-1 text-xs hover:bg-muted">
                          {em} {count > 0 && <span className="ml-1">{count}</span>}
                        </button>
                      );
                    })}
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// -------- Awards / Nominations --------
function AwardsTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient();
  const cyclesFn = useServerFn(listAwardCycles);
  const cyclesQ = useQuery({ queryKey: ["award-cycles"], queryFn: () => cyclesFn() });
  const cycles = cyclesQ.data?.cycles ?? [];
  const [activeCycle, setActiveCycle] = useState<string>("");
  const nomFn = useServerFn(listNominations);
  const nominateFn = useServerFn(nominateForAward);
  const decideFn = useServerFn(decideNomination);
  const employees = useColleagues();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (!activeCycle && cycles.length) setActiveCycle(cycles[0].id); }, [cycles, activeCycle]);

  const nomsQ = useQuery({ queryKey: ["nominations", activeCycle], queryFn: () => nomFn({ data: { cycle_id: activeCycle } }), enabled: !!activeCycle });

  async function submitNomination(e: React.FormEvent) {
    e.preventDefault();
    try { await nominateFn({ data: { cycle_id: activeCycle, ...form } }); toast.success("Nomination submitted"); setOpen(false); setForm({}); qc.invalidateQueries({ queryKey: ["nominations"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function decide(id: string, decision: "shortlisted" | "awarded" | "rejected", citation?: string) {
    try { await decideFn({ data: { id, decision, citation } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["nominations"] }); qc.invalidateQueries({ queryKey: ["awards-granted"] }); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <Select value={activeCycle} onValueChange={setActiveCycle}>
          <SelectTrigger className="w-[320px]"><SelectValue placeholder="Pick a cycle" /></SelectTrigger>
          <SelectContent>{cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.award_types?.name} — {c.title}</SelectItem>)}</SelectContent>
        </Select>
        {activeCycle && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nominate</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nominate a colleague</DialogTitle></DialogHeader>
              <form onSubmit={submitNomination} className="space-y-3">
                <div className="space-y-2"><Label>Nominee</Label>
                  <Select value={form.nominee_employee_id ?? ""} onValueChange={(v) => setForm({ ...form, nominee_employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick employee" /></SelectTrigger>
                    <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Why they deserve this</Label><Textarea rows={4} value={form.justification ?? ""} onChange={(e) => setForm({ ...form, justification: e.target.value })} required minLength={10} /></div>
                <DialogFooter><Button type="submit">Submit nomination</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {(nomsQ.data?.nominations ?? []).length === 0 ? (
          <Card><CardContent className="py-6 text-sm text-muted-foreground">No nominations yet for this cycle.</CardContent></Card>
        ) : nomsQ.data!.nominations.map((n: any) => (
          <Card key={n.id}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Trophy className="h-6 w-6 text-status-pending mt-1" />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{n.nominee?.first_name} {n.nominee?.last_name}</span>
                    <span className="text-muted-foreground"> · nominated by </span>
                    <span>{n.nominator?.first_name} {n.nominator?.last_name}</span>
                    <Badge variant={n.status === "awarded" ? "default" : n.status === "shortlisted" ? "secondary" : "outline"} className="ml-2">{n.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{n.justification}</p>
                  {isAdmin && n.status === "submitted" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => decide(n.id, "shortlisted")}>Shortlist</Button>
                      <Button size="sm" onClick={() => decide(n.id, "awarded")}>Award</Button>
                      <Button size="sm" variant="ghost" onClick={() => decide(n.id, "rejected")}>Reject</Button>
                    </div>
                  )}
                  {isAdmin && n.status === "shortlisted" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => decide(n.id, "awarded")}>Award</Button>
                      <Button size="sm" variant="ghost" onClick={() => decide(n.id, "rejected")}>Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// -------- Winners --------
function WinnersTab() {
  const fn = useServerFn(listAwardsGranted);
  const { data } = useQuery({ queryKey: ["awards-granted"], queryFn: () => fn() });
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {(data?.awards ?? []).length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">No awards granted yet.</CardContent></Card>
      ) : data!.awards.map((a: any) => (
        <Card key={a.id} className="border-status-pending/40">
          <CardHeader>
            <div className="flex items-center gap-2"><Award className="h-5 w-5 text-status-pending" /><CardTitle className="text-lg">{a.award_types?.name}</CardTitle></div>
            <CardDescription>{a.award_cycles?.title} · {a.granted_on}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{a.recipient?.first_name} {a.recipient?.last_name}</div>
            <div className="text-xs text-muted-foreground">{a.recipient?.job_title}</div>
            <p className="mt-2 text-sm italic">"{a.citation}"</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// -------- Admin: types + cycles --------
function AdminTab() {
  const qc = useQueryClient();
  const typesListFn = useServerFn(listAwardTypes);
  const cyclesListFn = useServerFn(listAwardCycles);
  const typesQ = useQuery({ queryKey: ["award-types"], queryFn: () => typesListFn() });
  const cyclesQ = useQuery({ queryKey: ["award-cycles"], queryFn: () => cyclesListFn() });
  const typeFn = useServerFn(upsertAwardType);
  const cycleFn = useServerFn(upsertAwardCycle);
  const [typeOpen, setTypeOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [typeForm, setTypeForm] = useState<any>({ cadence: "monthly", is_active: true });
  const [cycleForm, setCycleForm] = useState<any>({ status: "open" });

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between"><CardTitle className="text-base">Award types</CardTitle>
            <Dialog open={typeOpen} onOpenChange={setTypeOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> New</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New award type</DialogTitle></DialogHeader>
                <form onSubmit={async (e) => { e.preventDefault(); await typeFn({ data: typeForm }); toast.success("Saved"); setTypeOpen(false); setTypeForm({ cadence: "monthly", is_active: true }); qc.invalidateQueries({ queryKey: ["award-types"] }); }} className="space-y-3">
                  <div className="space-y-2"><Label>Name</Label><Input value={typeForm.name ?? ""} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={typeForm.description ?? ""} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Icon (emoji)</Label><Input value={typeForm.icon ?? ""} onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Cadence</Label>
                      <Select value={typeForm.cadence} onValueChange={(v) => setTypeForm({ ...typeForm, cadence: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="annual">Annual</SelectItem><SelectItem value="ad_hoc">Ad-hoc</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(typesQ.data?.types ?? []).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded border bg-card px-3 py-2 text-sm">
              <div>{t.icon} <span className="font-medium">{t.name}</span> <Badge variant="outline" className="ml-2">{t.cadence}</Badge></div>
              <Badge variant={t.is_active ? "default" : "outline"}>{t.is_active ? "active" : "off"}</Badge>
            </div>
          ))}
          {!typesQ.data?.types?.length && <div className="text-sm text-muted-foreground">No types yet.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between"><CardTitle className="text-base">Award cycles</CardTitle>
            <Dialog open={cycleOpen} onOpenChange={setCycleOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> New</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New cycle</DialogTitle></DialogHeader>
                <form onSubmit={async (e) => { e.preventDefault(); await cycleFn({ data: cycleForm }); toast.success("Saved"); setCycleOpen(false); setCycleForm({ status: "open" }); qc.invalidateQueries({ queryKey: ["award-cycles"] }); }} className="space-y-3">
                  <div className="space-y-2"><Label>Award type</Label>
                    <Select value={cycleForm.award_type_id ?? ""} onValueChange={(v) => setCycleForm({ ...cycleForm, award_type_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                      <SelectContent>{(typesQ.data?.types ?? []).map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Title</Label><Input value={cycleForm.title ?? ""} onChange={(e) => setCycleForm({ ...cycleForm, title: e.target.value })} placeholder="e.g. Q3 2026" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Period start</Label><Input type="date" value={cycleForm.period_start ?? ""} onChange={(e) => setCycleForm({ ...cycleForm, period_start: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Period end</Label><Input type="date" value={cycleForm.period_end ?? ""} onChange={(e) => setCycleForm({ ...cycleForm, period_end: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-2"><Label>Nominations close</Label><Input type="datetime-local" value={cycleForm.nominations_close_at ?? ""} onChange={(e) => setCycleForm({ ...cycleForm, nominations_close_at: e.target.value || null })} /></div>
                  <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(cyclesQ.data?.cycles ?? []).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded border bg-card px-3 py-2 text-sm">
              <div><span className="font-medium">{c.title}</span> <span className="text-muted-foreground">— {c.award_types?.name}</span><div className="text-xs text-muted-foreground">{c.period_start} → {c.period_end}</div></div>
              <Badge variant={c.status === "open" ? "default" : "outline"}>{c.status}</Badge>
            </div>
          ))}
          {!cyclesQ.data?.cycles?.length && <div className="text-sm text-muted-foreground">No cycles yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
