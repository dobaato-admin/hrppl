import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getMeOverview, updateMyBankingTax } from "@/lib/me.functions";
import { SectionCard, SkeletonRows } from "@/components/monday";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Save, ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/me/banking-tax")({
  head: () => ({ meta: [{ title: "Banking & tax — hrppl" }] }),
  component: MeBankingTax,
});

const FIELDS: Array<{ key: string; label: string; group: "bank" | "tax"; placeholder?: string }> = [
  { key: "bank_name", label: "Bank name", group: "bank" },
  { key: "bank_account_holder", label: "Account holder", group: "bank" },
  { key: "bank_account_number", label: "Account number", group: "bank" },
  { key: "bank_branch_code", label: "Branch / sort code", group: "bank" },
  { key: "bank_iban", label: "IBAN", group: "bank", placeholder: "Optional" },
  { key: "bank_swift", label: "SWIFT / BIC", group: "bank", placeholder: "Optional" },
  { key: "national_id_number", label: "National ID number", group: "tax" },
  { key: "tax_identification_number", label: "Tax ID (TIN / PAYE / SSN…)", group: "tax" },
  { key: "social_security_number", label: "Social security number", group: "tax" },
  { key: "provident_fund_number", label: "Provident fund number", group: "tax" },
  { key: "pension_fund_number", label: "Pension fund number", group: "tax" },
];

function MeBankingTax() {
  const qc = useQueryClient();
  const fn = useServerFn(getMeOverview);
  const updateFn = useServerFn(updateMyBankingTax);
  const { data, isLoading } = useQuery({ queryKey: ["me-overview"], queryFn: () => fn({}) });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data?.profile) return;
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = (data as any).profile[f.key] ?? "";
    setForm(next);
  }, [data]);

  const m = useMutation({
    mutationFn: (v: Record<string, string>) => updateFn({ data: v as any }),
    onSuccess: () => { toast.success("Banking & tax details saved"); qc.invalidateQueries({ queryKey: ["me-overview"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  if (isLoading) return <SkeletonRows rows={6} />;

  const missingTaxId = !((form.tax_identification_number ?? "").trim());

  return (
    <div className="space-y-4">
      {missingTaxId && (
        <Alert className="border-status-warning/40 bg-status-warning/10">
          <AlertTriangle className="h-4 w-4 text-status-warning" />
          <AlertDescription>
            Your tax ID is missing. It's optional today, but please add it within a week so your payroll filings are accurate — we'll email a reminder otherwise.
          </AlertDescription>
        </Alert>
      )}
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          These details are encrypted in transit, audit-logged, and only visible to authorised payroll administrators.
          Account numbers in the audit trail are masked.
        </AlertDescription>
      </Alert>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cleaned = Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, v?.trim() === "" ? null : v?.trim() ?? null]),
          );
          m.mutate(cleaned as any);
        }}
        className="space-y-4"
      >
        <SectionCard title="Banking" description="Where your salary is paid" tone="primary">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.filter((f) => f.group === "bank").map((f) => (
              <Field key={f.key} f={f} value={form[f.key] ?? ""} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Tax & social" description="Statutory IDs used on your payslip and tax filings" tone="info">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.filter((f) => f.group === "tax").map((f) => (
              <Field key={f.key} f={f} value={form[f.key] ?? ""} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
            ))}
          </div>
        </SectionCard>
        <div className="flex justify-end">
          <Button type="submit" disabled={m.isPending}>
            <Save className="mr-1 h-4 w-4" /> {m.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ f, value, onChange }: { f: { key: string; label: string; placeholder?: string }; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={f.key}>{f.label}</Label>
      <Input
        id={f.key}
        value={value}
        placeholder={f.placeholder}
        onChange={(e) => onChange(e.target.value)}
        maxLength={60}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
