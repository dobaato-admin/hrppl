import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { previewNepalSeed, runNepalPayrollWizard } from "@/lib/nepal-payroll.functions";

export function NepalPayrollWizardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const fPreview = useServerFn(previewNepalSeed);
  const fRun = useServerFn(runNepalPayrollWizard);
  const previewQ = useQuery({ queryKey: ["np-preview"], queryFn: () => fPreview(), enabled: open });

  const [form, setForm] = useState({
    marital_default: "single" as "single" | "couple",
    ssf_enrolled: true,
    cit_percent: 33.333,
    festival_month: "Ashwin",
    remittance_percent: 0,
    pf_election: "optional" as "optional" | "mandatory" | "off",
  });

  const run = useMutation({
    mutationFn: () => fRun({ data: form }),
    onSuccess: () => { toast.success("Nepal payroll seeded for FY 2081/82"); onOpenChange(false); },
    onError: (e: any) => toast.error(e?.message ?? "Seed failed"),
  });

  const p: any = previewQ.data;
  const slabs = p ? (form.marital_default === "couple" ? p.slabsCouple : p.slabsSingle) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nepal payroll wizard — FY 2081/82 (2024/25)</DialogTitle>
          <DialogDescription>Seeds income tax slabs, SSF 11% + 20%, CIT, and festival bonus defaults. Inputs are saved as draft rules you can edit afterwards.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Marital default</Label>
              <Select value={form.marital_default} onValueChange={(v: any) => setForm((s) => ({ ...s, marital_default: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="couple">Couple (joint)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Switch id="ssf" checked={form.ssf_enrolled} onCheckedChange={(v) => setForm((s) => ({ ...s, ssf_enrolled: v }))} />
              <Label htmlFor="ssf">SSF enrolled (11% employee / 20% employer)</Label>
            </div>
            <div>
              <Label>CIT % of basic (default 33.333)</Label>
              <Input type="number" step="0.001" value={form.cit_percent} onChange={(e) => setForm((s) => ({ ...s, cit_percent: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Festival bonus month</Label>
              <Select value={form.festival_month} onValueChange={(v) => setForm((s) => ({ ...s, festival_month: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra","Baisakh","Jestha","Ashadh","Shrawan","Bhadra"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remittance % (foreign-source relief)</Label>
              <Input type="number" step="0.1" value={form.remittance_percent} onChange={(e) => setForm((s) => ({ ...s, remittance_percent: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Provident fund election</Label>
              <Select value={form.pf_election} onValueChange={(v: any) => setForm((s) => ({ ...s, pf_election: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional (per employee)</SelectItem>
                  <SelectItem value="mandatory">Mandatory for all</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {p && (
            <div className="border rounded-md p-3 text-xs space-y-2">
              <div className="font-medium text-sm">Preview — {p.fiscalYear}</div>
              <div>SSF split: <Badge variant="outline">{p.ssf.employee_percent}% emp</Badge> <Badge variant="outline">{p.ssf.employer_percent}% empr</Badge></div>
              <div className="font-medium mt-2">Slabs ({form.marital_default})</div>
              <table className="w-full">
                <thead className="text-muted-foreground"><tr><th className="text-left">From (NPR)</th><th className="text-left">To</th><th className="text-right">Rate %</th><th className="text-left">Note</th></tr></thead>
                <tbody>
                  {slabs.map((s: any, i: number) => (
                    <tr key={i}><td>{s.min.toLocaleString()}</td><td>{s.max ? s.max.toLocaleString() : "—"}</td><td className="text-right">{s.rate}</td><td>{s.label}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => run.mutate()} disabled={run.isPending}>
            {run.isPending ? "Seeding…" : "Seed FY 2081/82 defaults"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
