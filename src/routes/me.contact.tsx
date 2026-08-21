import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getMeOverview, updateMyContactDetails } from "@/lib/me.functions";
import { SectionCard, SkeletonRows } from "@/components/monday";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/me/contact")({
  head: () => ({ meta: [{ title: "Contact — hrppl" }] }),
  component: MeContact,
});

const FIELDS: Array<{ key: string; label: string; type?: string; placeholder?: string }> = [
  { key: "personal_email", label: "Personal email", type: "email", placeholder: "you@personal.com" },
  { key: "personal_phone", label: "Personal phone", placeholder: "+1 555 0100" },
  { key: "phone", label: "Work phone", placeholder: "Optional" },
  { key: "marital_status", label: "Marital status", placeholder: "Single / Married / …" },
  { key: "address_line1", label: "Address line 1" },
  { key: "address_line2", label: "Address line 2" },
  { key: "city", label: "City" },
  { key: "region", label: "Region / State" },
  { key: "postal_code", label: "Postal code" },
  { key: "country_of_residence", label: "Country (ISO 2)", placeholder: "GB, US, ZA…" },
  { key: "emergency_contact_name", label: "Emergency contact name" },
  { key: "emergency_contact_phone", label: "Emergency contact phone" },
  { key: "emergency_contact_relation", label: "Emergency contact relation", placeholder: "Spouse, Parent…" },
];

function MeContact() {
  const qc = useQueryClient();
  const fn = useServerFn(getMeOverview);
  const updateFn = useServerFn(updateMyContactDetails);
  const { data, isLoading } = useQuery({ queryKey: ["me-overview"], queryFn: () => fn({}) });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data?.employee) return;
    const p = (data as any).profile ?? {};
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = (f.key === "phone" ? data.employee.phone : p[f.key]) ?? "";
    setForm(next);
  }, [data]);

  const m = useMutation({
    mutationFn: (v: Record<string, string>) => updateFn({ data: v as any }),
    onSuccess: () => { toast.success("Contact details saved"); qc.invalidateQueries({ queryKey: ["me-overview"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  if (isLoading) return <SkeletonRows rows={6} />;

  return (
    <SectionCard
      title="Contact & address"
      description="These details are visible to your HR admin and used on official documents."
      tone="info"
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const cleaned = Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, v?.trim() === "" ? null : v?.trim() ?? null]),
          );
          m.mutate(cleaned as any);
        }}
      >
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              maxLength={f.key.includes("address") ? 200 : 120}
            />
          </div>
        ))}
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={m.isPending}>
            <Save className="mr-1 h-4 w-4" /> {m.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
