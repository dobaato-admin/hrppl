import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { listClients, upsertClient } from "@/lib/practice.functions";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/practice/clients")({
  head: () => ({ meta: [{ title: "Clients — hrppl" }] }),
  component: () => (
    <AdminGate feature="practice.console">
      <ClientsPage />
    </AdminGate>
  ),
});

function ClientsPage() {
  const fetchClients = useServerFn(listClients);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetchClients({}),
  });

  return (
    <AppShell title="Clients" subtitle="Your client roster">
      <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All clients</h2>
          <ClientDialog onSaved={() => qc.invalidateQueries({ queryKey: ["clients"] })} />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : data?.clients.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No clients yet. Add your first one.</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data?.clients.map((c: any) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                  </div>
                  {c.contact_name && <CardDescription>{c.contact_name}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {c.contact_email && <div>{c.contact_email}</div>}
                  {c.country_code && <div>{c.country_code} · {c.currency_code ?? "—"}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ClientDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", contact_email: "", country_code: "", currency_code: "", status: "active" });
  const save = useServerFn(upsertClient);
  async function submit() {
    try {
      await save({ data: form });
      toast.success("Client saved");
      setOpen(false);
      setForm({ name: "", contact_email: "", country_code: "", currency_code: "", status: "active" });
      onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New client</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Contact name</Label><Input value={form.contact_name ?? ""} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
          <div><Label>Contact email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Country (ISO-2)</Label><Input maxLength={2} value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} /></div>
            <div><Label>Currency (ISO-3)</Label><Input maxLength={3} value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!form.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
