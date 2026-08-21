import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listFxRates, upsertFxRate } from "@/lib/super-admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/platform/fx")({
  head: () => ({ meta: [{ title: "FX rates — Platform" }] }),
  component: FxRatesPage,
});

function FxRatesPage() {
  const fetchData = useServerFn(listFxRates);
  const save = useServerFn(upsertFxRate);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["fx-rates"], queryFn: () => fetchData({}) });

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ base_currency: "USD", quote_currency: "EUR", rate: "", rate_date: today });

  async function submit() {
    try {
      await save({ data: { ...form, rate: Number(form.rate) } });
      toast.success("FX rate saved");
      setForm({ ...form, rate: "" });
      qc.invalidateQueries({ queryKey: ["fx-rates"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <AppShell title="FX rates" subtitle="Platform-wide exchange rates">
      <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
        <Card>
          <CardHeader><CardTitle>Set a rate</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-5">
            <div><Label>From</Label><Input maxLength={3} value={form.base_currency} onChange={(e) => setForm({ ...form, base_currency: e.target.value.toUpperCase() })} /></div>
            <div><Label>To</Label><Input maxLength={3} value={form.quote_currency} onChange={(e) => setForm({ ...form, quote_currency: e.target.value.toUpperCase() })} /></div>
            <div><Label>Rate</Label><Input type="number" step="0.000001" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.rate_date} onChange={(e) => setForm({ ...form, rate_date: e.target.value })} /></div>
            <div className="flex items-end"><Button onClick={submit} disabled={!form.rate}>Save</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent rates</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading…</p> : (data?.rates ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No FX rates yet.</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Date</TableHead><TableHead>Pair</TableHead><TableHead>Rate</TableHead><TableHead>Source</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {data?.rates.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.rate_date}</TableCell>
                      <TableCell className="font-medium">{r.base_currency} → {r.quote_currency}</TableCell>
                      <TableCell>{Number(r.rate).toFixed(6)}</TableCell>
                      <TableCell>{r.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
