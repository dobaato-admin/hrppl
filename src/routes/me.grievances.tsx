import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ShieldAlert, Gavel } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { listGrievances, fileGrievance, listCases, listActions, withdrawGrievance } from "@/lib/discipline.functions";
import { GrievanceThread, GrievanceAttachments } from "@/routes/admin.discipline";

export const Route = createFileRoute("/me/grievances")({
  head: () => ({ meta: [{ title: "My grievances — hrppl" }] }),
  component: MyGrievancesPage,
});

const CATS = ["harassment","discrimination","workplace","pay","management","safety","other"] as const;
const SEVS = ["low","medium","high","critical"] as const;

function MyGrievancesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listGrievances);
  const fileFn = useServerFn(fileGrievance);
  const casesFn = useServerFn(listCases);
  const withdrawFn = useServerFn(withdrawGrievance);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const { data } = useQuery({ queryKey: ["my-grievances"], queryFn: () => listFn({ data: { scope: "me" } }), enabled: !!user });
  const { data: caseData } = useQuery({ queryKey: ["my-cases"], queryFn: () => casesFn({ data: {} }), enabled: !!user });
  const grievances = data?.grievances ?? [];
  const cases = caseData?.cases ?? [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ category: "workplace", severity: "medium", is_anonymous: false, subject: "", description: "" });
  const [active, setActive] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fileFn({ data: form });
      toast.success("Grievance filed");
      setOpen(false);
      setForm({ category: "workplace", severity: "medium", is_anonymous: false, subject: "", description: "" });
      qc.invalidateQueries({ queryKey: ["my-grievances"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AppShell title="My grievances & disciplinary record" subtitle="File concerns and view your record">
      <Tabs defaultValue="grievances">
        <TabsList>
          <TabsTrigger value="grievances"><ShieldAlert className="mr-2 h-4 w-4" />Grievances</TabsTrigger>
          <TabsTrigger value="cases"><Gavel className="mr-2 h-4 w-4" />My disciplinary record</TabsTrigger>
        </TabsList>

        <TabsContent value="grievances" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Grievances I've filed</CardTitle><CardDescription>{grievances.length} total</CardDescription></div>
              <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />File grievance</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Filed</TableHead></TableRow></TableHeader>
                <TableBody>
                  {grievances.map((g: any) => (
                    <TableRow key={g.id} className="cursor-pointer" onClick={() => setActive(g)}>
                      <TableCell className="max-w-xs truncate">{g.subject}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{g.category}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{g.status}</Badge></TableCell>
                      <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {grievances.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">None filed</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <Card>
            <CardHeader><CardTitle>My disciplinary record</CardTitle><CardDescription>{cases.length} entries</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {cases.map((c: any) => <MyCaseCard key={c.id} caseRow={c} />)}
              {cases.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No disciplinary record. Keep it up.</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>File a grievance</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Subject</Label>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} />
              Submit anonymously (hide my name from non-HR views)
            </label>
            <DialogFooter><Button type="submit">Submit</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{active?.subject}</DialogTitle></DialogHeader>
          {active && (<>
            <GrievanceThread grievance={active} canInternal={false} />
            <GrievanceAttachments grievance={active} canUpload />
            {!["resolved","dismissed"].includes(active.status) && (
              <div className="mt-3 text-right">
                <Button variant="outline" size="sm" onClick={async () => {
                  if (!confirm("Withdraw this grievance?")) return;
                  try {
                    await withdrawFn({ data: { id: active.id } });
                    toast.success("Withdrawn"); setActive(null);
                    qc.invalidateQueries({ queryKey: ["my-grievances"] });
                  } catch (e: any) { toast.error(e?.message ?? "Failed"); }
                }}>Withdraw</Button>
              </div>
            )}
          </>)}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function MyCaseCard({ caseRow }: { caseRow: any }) {
  const listFn = useServerFn(listActions);
  const { data } = useQuery({ queryKey: ["my-case-actions", caseRow.id], queryFn: () => listFn({ data: { case_id: caseRow.id } }) });
  const actions = data?.actions ?? [];
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{caseRow.category.replace(/_/g," ")}</Badge>
          <Badge variant="secondary" className="capitalize">{caseRow.status.replace(/_/g," ")}</Badge>
          <span className="text-xs text-muted-foreground">{caseRow.incident_date ?? "—"}</span>
        </div>
      </div>
      <p className="mt-2 text-sm whitespace-pre-wrap">{caseRow.description}</p>
      {actions.length > 0 && (
        <div className="mt-3 space-y-1">
          {actions.map((a: any) => (
            <div key={a.id} className="text-xs text-muted-foreground flex gap-2">
              <span className="font-mono">{a.action_date}</span>
              <Badge variant="outline" className="capitalize text-[10px]">{a.action_type.replace(/_/g," ")}</Badge>
              {a.notes && <span className="truncate">{a.notes}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
