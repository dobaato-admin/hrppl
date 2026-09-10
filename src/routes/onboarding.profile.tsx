import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormErrors, FieldError } from "@/hooks/use-form-errors";
import {
  getCountrySchema, getPersonalFields, getAddressFields, getEmergencyFields,
  type FieldDef,
} from "@/lib/onboarding-country-fields";
import { getMyOnboardingProfile, upsertMyOnboardingProfile } from "@/lib/staff-onboarding.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({ meta: [{ title: "Complete your profile — hrppl" }] }),
  component: OnboardingProfilePage,
});

interface Country { code: string; name: string }

function OnboardingProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchFn = useServerFn(getMyOnboardingProfile);
  const saveFn = useServerFn(upsertMyOnboardingProfile);
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  useEffect(() => {
    supabase.from("countries").select("code,name").order("name")
      .then(({ data }) => setCountries((data ?? []) as Country[]));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["my-onboarding-profile"],
    queryFn: () => fetchFn({}),
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.profile) setForm(data.profile);
    else if (data?.employee) {
      setForm((f) => ({
        ...f,
        legal_first_name: f.legal_first_name || data.employee.first_name,
        legal_last_name: f.legal_last_name || data.employee.last_name,
      }));
    }
  }, [data]);

  // Validation applies to "Submit profile" only. "Save progress" is the resume
  // feature — demanding a complete form to save a partial one would defeat it.
  const fieldErrors = useFormErrors();

  const country = form.country_of_residence || form.country_code || data?.profile?.country_code;
  const schema = useMemo(() => getCountrySchema(country), [country]);

  function field<K extends string>(def: FieldDef, type: string = "text") {
    return (
      <div className="space-y-2" key={def.key}>
        <Label htmlFor={`ob-${def.key}`}>
          {def.label}
          {def.required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={`ob-${def.key}`}
          type={type}
          value={form[def.key] ?? ""}
          onChange={(e) => {
            fieldErrors.clearField(def.key);
            setForm({ ...form, [def.key]: e.target.value });
          }}
          placeholder={def.placeholder}
          {...(fieldErrors.register(def.key) as object)}
        />
        <FieldError name={def.key} errors={fieldErrors.errors} />
      </div>
    );
  }

  /**
   * Every field on the page, in render order, so the first unfilled one is the
   * topmost one rather than whichever section happened to be built first.
   */
  function allFieldDefs(): FieldDef[] {
    return [
      ...getPersonalFields(),
      ...schema.identifiers,
      ...getAddressFields().filter((f) => f.key !== "country_of_residence"),
      ...getEmergencyFields(),
      ...schema.bank,
      ...schema.statutory,
    ];
  }

  async function save(submit: boolean) {
    if (submit) {
      if (!country) {
        toast.error("Choose your country of residence — it decides which tax and bank details we ask for");
        return;
      }
      const ok = fieldErrors.check(
        allFieldDefs()
          .filter((d) => d.required)
          .map((d) => ({ name: d.key, value: form[d.key], label: d.label })),
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      await saveFn({ data: { ...form, country_code: country, submit } });
      if (submit) {
        toast.success("Profile submitted");
        navigate({ to: "/dashboard" });
      } else {
        toast.success("Progress saved");
      }
    } catch (e: any) {
      // A server-side refusal lands on the field it names rather than as a
      // JSON blob; falls back to a plain message when it is not field-shaped.
      const labels = Object.fromEntries(allFieldDefs().map((d) => [d.key, d.label]));
      if (!fieldErrors.fromServer(e, labels)) toast.error(e?.message ?? "Failed to save");
    } finally { setBusy(false); }
  }

  if ((loading && !user) || (isLoading && !data)) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></main>;
  }

  if (!data?.employee) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No employee record</CardTitle>
            <CardDescription>You need to accept an organization invitation before completing onboarding.</CardDescription>
          </CardHeader>
          <CardContent><Button onClick={() => navigate({ to: "/welcome" })}>Back to welcome</Button></CardContent>
        </Card>
      </main>
    );
  }

  const submitted = !!data.profile?.submitted_at;

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
          <p className="text-sm text-muted-foreground">
            Hi {data.employee.first_name}. We need a few details to onboard you. The bank, tax, and statutory fields are tailored to your country of residence.
          </p>
        </div>

        {submitted && (
          <Card className="border-status-done/40 bg-status-done/10">
            <CardContent className="flex items-center gap-2 py-4 text-sm">
              <CheckCircle2 className="h-5 w-5 text-status-done" />
              You've already submitted this profile. You can still update it below.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Country of residence</CardTitle><CardDescription>This drives which tax and bank fields we ask for.</CardDescription></CardHeader>
          <CardContent>
            <Select value={country ?? ""} onValueChange={(v) => setForm({ ...form, country_of_residence: v, country_code: v })}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {getPersonalFields().map((d) => field(d, d.key === "date_of_birth" ? "date" : "text"))}
            {schema.identifiers.map((d) => field(d))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact & address</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {getAddressFields().filter((f) => f.key !== "country_of_residence").map((d) => field(d, d.key === "personal_email" ? "email" : "text"))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Emergency contact</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {getEmergencyFields().map((d) => field(d))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bank details</CardTitle><CardDescription>Used for salary disbursement.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">{schema.bank.map((d) => field(d))}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tax & statutory</CardTitle><CardDescription>Required for payroll deductions and reporting.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">{schema.statutory.map((d) => field(d))}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Anything else?</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes for your administrator" />
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => save(false)} disabled={busy}><Save className="mr-2 h-4 w-4" /> Save progress</Button>
          <Button onClick={() => save(true)} disabled={busy}>Submit profile</Button>
        </div>
      </div>
    </main>
  );
}
