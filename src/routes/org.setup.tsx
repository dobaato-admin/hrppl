import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { requestRoleRefresh } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestOrgStatusRefresh } from "@/components/AuthRouteGate";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  createOrganization,
  getMyOrgStatus,
  markSetupStep,
  seedOrgDefaults,
  resetMyOrgSetup,
  updateOrganizationProfile,
} from "@/lib/org-signup.functions";
import { getMyTrialInvitation, redeemMyTrialInvitation } from "@/lib/super-invitations.functions";
import { inviteStaff } from "@/lib/staff-invitations.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { validateBusinessRegistrationNumber } from "@/lib/payroll-validation";
import { useFormErrors, FieldError } from "@/hooks/use-form-errors";
import { DepartmentPicker } from "@/components/setup/DepartmentPicker";
import { StepNote, SetupGuideHandoff } from "@/components/setup/StepNote";

export const Route = createFileRoute("/org/setup")({
  head: () => ({ meta: [{ title: "Set up your organization — hrppl" }] }),
  component: OrgSetupPage,
});

type StepKey = "details" | "branding" | "departments" | "defaults" | "invites";

const STEPS: { key: StepKey; title: string; subtitle: string }[] = [
  { key: "details", title: "Organization details", subtitle: "Name, country, contact" },
  { key: "branding", title: "Address & branding", subtitle: "Where you operate" },
  { key: "departments", title: "Departments", subtitle: "Starter org structure" },
  // Named for what it does. It seeds leave types and nothing else — payroll is
  // configured in the Setup guide afterwards, and calling this step "Leave &
  // payroll" implied an admin had dealt with payroll when they had not.
  { key: "defaults", title: "Leave defaults", subtitle: "So people can book time off" },
  { key: "invites", title: "Invite your team", subtitle: "Optional — do it later" },
];

interface Country {
  code: string;
  name: string;
  currency_code: string;
}

function OrgSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const statusFn = useServerFn(getMyOrgStatus);
  const createFn = useServerFn(createOrganization);
  const markFn = useServerFn(markSetupStep);
  const seedFn = useServerFn(seedOrgDefaults);
  const inviteFn = useServerFn(inviteStaff);
  const resetFn = useServerFn(resetMyOrgSetup);
  const updateProfileFn = useServerFn(updateOrganizationProfile);
  const trialInviteFn = useServerFn(getMyTrialInvitation);
  const redeemTrialFn = useServerFn(redeemMyTrialInvitation);

  const form = useFormErrors();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepInitialized, setStepInitialized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [deptOptions, setDeptOptions] = useState<{ id: string; name: string }[]>([]);
  type InviteRow = {
    email: string;
    first_name: string;
    last_name: string;
    job_title: string;
    role: "employee" | "manager" | "org_admin";
    department_id?: string;
    status: "idle" | "sending" | "sent" | "failed";
    error?: string;
  };
  const newInviteRow = (): InviteRow => ({
    email: "",
    first_name: "",
    last_name: "",
    job_title: "",
    role: "employee",
    status: "idle",
  });
  const [invites, setInvites] = useState<InviteRow[]>([newInviteRow()]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase
      .from("countries")
      .select("code,name,currency_code")
      .order("name")
      .then(({ data }) => setCountries((data ?? []) as Country[]));
  }, []);

  const { data: status, isLoading } = useQuery({
    queryKey: ["my-org-status"],
    queryFn: () => statusFn({}),
    enabled: !!user,
  });

  const { data: trialData } = useQuery({
    queryKey: ["my-trial-invitation"],
    queryFn: () => trialInviteFn({}),
    enabled: !!user,
    staleTime: 60_000,
  });
  const trialInvitation = trialData?.invitation ?? null;

  async function refreshOrgStatus() {
    await qc.invalidateQueries({ queryKey: ["my-org-status"] });
    requestOrgStatusRefresh();
  }

  const completedSteps = useMemo(() => {
    const sp = status?.setupProgress;
    if (!sp) return 0;
    return STEPS.filter((s) => (sp as any)[`${s.key}_done`]).length;
  }, [status]);

  // On initial load, jump to the first incomplete step so returning users
  // aren't stuck staring at a step they've already completed.
  useEffect(() => {
    if (stepInitialized) return;
    const sp = status?.setupProgress as any;
    if (!sp) return;
    const firstIncomplete = STEPS.findIndex((s) => !sp[`${s.key}_done`]);
    setStepIdx(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete);
    setStepInitialized(true);
  }, [status, stepInitialized]);

  // --- Step state ---
  const [details, setDetails] = useState({
    name: "",
    legal_name: "",
    primary_contact_name: "",
    owner_job_title: "",
    country_code: "",
    contact_email: "",
    contact_phone: "",
    registration_number: "",
    tax_id_number: "",
  });
  const [branding, setBranding] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    region: "",
    postal_code: "",
    website: "",
    tagline: "",
  });
  const [departments, setDepartments] = useState<string[]>(["Operations", "Engineering", "People"]);
  const [defaults, setDefaults] = useState({ withLeaveTypes: true });

  useEffect(() => {
    if (status?.tenantId && status?.setupProgress?.departments_done) {
      supabase
        .from("departments")
        .select("name")
        .eq("tenant_id", status.tenantId)
        .order("name")
        .then(({ data }) => {
          const names = (data ?? []).map((row: any) => row.name).filter(Boolean);
          if (names.length) setDepartments(names);
        });
    }
  }, [status?.tenantId, status?.setupProgress?.departments_done]);

  // Load departments for invite assignments after tenant exists
  useEffect(() => {
    if (!status?.tenantId) return;
    supabase
      .from("departments")
      .select("id,name")
      .eq("tenant_id", status.tenantId)
      .order("name")
      .then(({ data }) => setDeptOptions((data ?? []) as { id: string; name: string }[]));
  }, [status?.tenantId, status?.setupProgress]);

  useEffect(() => {
    if (status?.tenant && !details.name) {
      setDetails((d) => ({
        ...d,
        name: status.tenant.name ?? "",
        legal_name: status.tenant.legal_name ?? "",
        primary_contact_name: status.tenant.primary_contact_name ?? "",
        contact_phone: status.tenant.contact_phone ?? "",
        country_code: status.tenant.country_code ?? "",
        contact_email: status.tenant.contact_email ?? user?.email ?? "",
        registration_number: status.tenant.registration_number ?? "",
        tax_id_number: status.tenant.tax_id_number ?? "",
      }));
      setBranding((current) => ({
        ...current,
        address_line1: status.tenant.address_line1 ?? current.address_line1,
        address_line2: status.tenant.address_line2 ?? current.address_line2,
        city: status.tenant.city ?? current.city,
        region: status.tenant.region ?? current.region,
        postal_code: status.tenant.postal_code ?? current.postal_code,
        website: status.tenant.website ?? current.website,
        tagline: status.tenant.tagline ?? current.tagline,
      }));
    }
    if (!status?.tenant && user?.email && !details.contact_email) {
      setDetails((d) => ({ ...d, contact_email: user.email! }));
    }
  }, [status, user, details.name, details.contact_email]);

  // Prefill from trial invitation when present and tenant not yet created
  useEffect(() => {
    if (!trialInvitation || status?.tenantId) return;
    setDetails((d) => ({
      ...d,
      name: d.name || trialInvitation.org_name || "",
      legal_name: d.legal_name || trialInvitation.org_name || "",
      country_code: d.country_code || (trialInvitation.country_code ?? "").toUpperCase() || "",
      contact_email: d.contact_email || trialInvitation.email || user?.email || "",
      primary_contact_name: d.primary_contact_name || trialInvitation.contact_name || "",
    }));
  }, [trialInvitation, status?.tenantId, user?.email]);

  const hasTenant = !!status?.tenantId;

  async function saveDetails() {
    const name = details.name.trim();
    const country = details.country_code.trim().toUpperCase();
    const email = details.contact_email.trim();
    const phone = details.contact_phone.trim();
    const reg = details.registration_number.trim();
    const hasTrialInvitation = !!trialInvitation;

    // Same rules and the same wording as before; what is new is that the field
    // in question is marked, focused and named. Previously each of these was a
    // bare toast, so on a two-column form the reader was told a rule had failed
    // without being told which box it belonged to.
    //
    // A trial invitee is excused the phone and the registration number: they
    // are mid-signup and those arrive later.
    // Order matches the rendered layout, not the shape of the state object:
    // `check` focuses the first failure, and "first" has to mean the one
    // highest on screen or the cursor jumps past a field the reader can see is
    // wrong. Phone renders above email here.
    const ok = form.check([
      {
        name: "name",
        value: name,
        label: "Organization name",
        rule: (v) => (v.length < 2 ? "Organization name must be at least 2 characters." : null),
      },
      {
        name: "country_code",
        value: country,
        label: "Country",
        rule: (v) => (v.length !== 2 ? "Please choose a country." : null),
      },
      {
        name: "contact_phone",
        value: phone,
        label: "Contact phone",
        required: !hasTrialInvitation,
        rule: (v) => (v.replace(/\D+/g, "").length < 6 ? "Contact phone is required." : null),
      },
      {
        name: "contact_email",
        value: email,
        label: "Contact email",
        rule: (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Please enter a valid contact email.",
      },
      {
        name: "registration_number",
        value: reg,
        label: country === "AU" ? "ABN" : "Business registration number",
        required: !hasTrialInvitation,
        rule: (v) => {
          const r = validateBusinessRegistrationNumber(v, country);
          return r.ok ? null : (r.error ?? "Not a valid registration number");
        },
      },
    ]);
    if (!ok) return;

    // Already validated above; this only normalises the accepted value.
    let normalizedRegistrationNumber = reg;
    if (reg) {
      const r = validateBusinessRegistrationNumber(reg, country);
      if (r.ok) normalizedRegistrationNumber = r.value;
    }

    setBusy(true);
    setStepError(null);
    try {
      if (!hasTenant) {
        const res = await createFn({
          data: {
            name,
            legal_name: details.legal_name.trim(),
            primary_contact_name: details.primary_contact_name.trim(),
            owner_job_title: details.owner_job_title.trim(),
            country_code: country,
            contact_email: email,
            contact_phone: phone,
            registration_number: normalizedRegistrationNumber,
            tax_id_number: details.tax_id_number.trim(),
            address_line1: branding.address_line1.trim(),
            address_line2: branding.address_line2.trim(),
            city: branding.city.trim(),
            region: branding.region.trim(),
            postal_code: branding.postal_code.trim(),
            website: branding.website.trim(),
            tagline: branding.tagline.trim(),
          },
        });
        console.info("[org-setup] organization created", res);
        requestRoleRefresh();
        // Redeem any pending trial invitation for this user
        try {
          if (res?.tenantId) {
            const redeem = await redeemTrialFn({ data: { tenant_id: res.tenantId } });
            if (redeem?.ok) {
              toast.success("Trial activated — 30-day free trial is now live");
              await qc.invalidateQueries({ queryKey: ["my-trial-invitation"] });
            }
          }
        } catch (err) {
          console.warn("[org-setup] trial redemption skipped", err);
        }
      } else {
        await updateProfileFn({
          data: {
            legal_name: details.legal_name.trim(),
            primary_contact_name: details.primary_contact_name.trim(),
            contact_phone: phone,
            registration_number: normalizedRegistrationNumber,
            tax_id_number: details.tax_id_number.trim(),
          },
        });
      }
      await markFn({ data: { step: "details" } });
      await refreshOrgStatus();
      setStepIdx(1);
      toast.success("Organization details saved");
    } catch (e: any) {
      const msg = e?.message ?? (typeof e === "string" ? e : "Could not save organization");
      console.error("[org-setup] createOrganization failed", e);
      setStepError(msg);
      toast.error(msg, { duration: 8000 });
    } finally {
      setBusy(false);
    }
  }

  async function startOver() {
    if (
      !confirm("Reset the organization setup? This deletes the current org if it has no employees.")
    )
      return;
    setBusy(true);
    try {
      const res = await resetFn({});
      await refreshOrgStatus();
      setStepIdx(0);
      requestRoleRefresh();
      setDetails({
        name: "",
        legal_name: "",
        primary_contact_name: "",
        owner_job_title: "",
        country_code: "",
        contact_email: user?.email ?? "",
        contact_phone: "",
        registration_number: "",
        tax_id_number: "",
      });
      setBranding({
        address_line1: "",
        address_line2: "",
        city: "",
        region: "",
        postal_code: "",
        website: "",
        tagline: "",
      });
      toast.success(res.reset ? "Setup reset — you can start over." : "Nothing to reset.");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not reset setup");
    } finally {
      setBusy(false);
    }
  }

  async function saveBranding() {
    setBusy(true);
    setStepError(null);
    try {
      await updateProfileFn({
        data: {
          legal_name: details.legal_name.trim(),
          primary_contact_name: details.primary_contact_name.trim(),
          contact_phone: details.contact_phone.trim(),
          address_line1: branding.address_line1.trim(),
          address_line2: branding.address_line2.trim(),
          city: branding.city.trim(),
          region: branding.region.trim(),
          postal_code: branding.postal_code.trim(),
          website: branding.website.trim(),
          tagline: branding.tagline.trim(),
          registration_number: details.registration_number.trim(),
          tax_id_number: details.tax_id_number.trim(),
        },
      });
      await markFn({ data: { step: "branding" } });
      await refreshOrgStatus();
      setStepIdx(2);
      toast.success("Address saved");
    } catch (e: any) {
      const msg = e?.message ?? "Could not save address";
      setStepError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function saveDepartments() {
    setBusy(true);
    setStepError(null);
    try {
      const names = departments.map((s) => s.trim()).filter(Boolean);
      if (names.length) {
        await seedFn({ data: { departments: names, withLeaveTypes: false } });
      }
      await markFn({ data: { step: "departments" } });
      await refreshOrgStatus();
      // Refresh dept list so the invite step has them
      if (status?.tenantId) {
        const { data } = await supabase
          .from("departments")
          .select("id,name")
          .eq("tenant_id", status.tenantId)
          .order("name");
        setDeptOptions((data ?? []) as { id: string; name: string }[]);
      }
      setStepIdx(3);
      toast.success("Departments created");
    } catch (e: any) {
      const msg = e?.message ?? "Could not save departments";
      setStepError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function saveDefaults() {
    setBusy(true);
    setStepError(null);
    try {
      await seedFn({ data: { departments: [], withLeaveTypes: defaults.withLeaveTypes } });
      await markFn({ data: { step: "defaults" } });
      await refreshOrgStatus();
      setStepIdx(4);
      toast.success("Defaults configured");
    } catch (e: any) {
      const msg = e?.message ?? "Could not save defaults";
      setStepError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function updateInvite(idx: number, patch: Partial<InviteRow>) {
    setInvites((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function sendOneInvite(idx: number) {
    const row = invites[idx];
    const email = row.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      updateInvite(idx, { status: "failed", error: "Enter a valid email" });
      return false;
    }
    updateInvite(idx, { status: "sending", error: undefined });
    try {
      await inviteFn({
        data: {
          email,
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          job_title: row.job_title.trim(),
          role: row.role,
          department_id: row.department_id || null,
        },
      });
      updateInvite(idx, { status: "sent", error: undefined });
      return true;
    } catch (e: any) {
      updateInvite(idx, { status: "failed", error: e?.message ?? "Send failed" });
      return false;
    }
  }

  async function sendAllAndFinish(skip = false) {
    setBusy(true);
    try {
      if (!skip) {
        const pending = invites
          .map((r, i) => ({ r, i }))
          .filter(({ r }) => r.email.trim() && r.status !== "sent");
        let okCount = 0;
        for (const { i } of pending) {
          const ok = await sendOneInvite(i);
          if (ok) okCount++;
        }
        if (pending.length > 0) {
          if (okCount === pending.length)
            toast.success(`${okCount} invitation${okCount === 1 ? "" : "s"} sent`);
          else if (okCount === 0) {
            toast.error("Could not send invitations — review the errors and retry.");
            setBusy(false);
            return;
          } else
            toast.warning(`Sent ${okCount} of ${pending.length}. Retry the failed ones or skip.`);
        }
      }
      await markFn({ data: { step: "invites" } });
      await refreshOrgStatus();
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to finish setup");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </main>
    );
  }

  const stepDone = (k: StepKey) => !!(status?.setupProgress as any)?.[`${k}_done`];
  const pct = Math.round((completedSteps / STEPS.length) * 100);

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[260px_1fr]">
        {/* Stepper rail */}
        <aside className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold">Set up your organization</h1>
            <p className="text-sm text-muted-foreground">Quick guided setup — under 5 minutes.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
          <div className="space-y-2">
            <Progress value={pct} />
            <div className="text-xs text-muted-foreground">
              {completedSteps}/{STEPS.length} steps complete
            </div>
          </div>
          <ol className="space-y-1">
            {STEPS.map((s, i) => {
              const done = stepDone(s.key);
              const current = i === stepIdx;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => {
                      setStepError(null);
                      setStepIdx(i);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                      current
                        ? "bg-background shadow-sm ring-1 ring-border"
                        : "hover:bg-background/60",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-status-done" />
                    ) : (
                      <Circle
                        className={cn(
                          "mt-0.5 h-5 w-5",
                          current ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{s.subtitle}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
          {hasTenant && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={startOver}
                disabled={busy}
              >
                Start over (delete this org)
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Only works if no employees have been added yet.
              </p>
            </div>
          )}
        </aside>

        {/* Step content */}
        <section className="space-y-4">
          {stepError && stepIdx < 4 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">We couldn't save this step</div>
                <div className="opacity-90">{stepError}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  if (stepIdx === 0) void saveDetails();
                  else if (stepIdx === 1) void saveBranding();
                  else if (stepIdx === 2) void saveDepartments();
                  else if (stepIdx === 3) void saveDefaults();
                }}
              >
                Retry
              </Button>
            </div>
          )}
          {stepIdx === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Organization details</CardTitle>
                <CardDescription>
                  The legal, contact, and tax details used for payroll, invites, and HR records.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="os-name">
                    Organization name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="os-name"
                    value={details.name}
                    onChange={(e) => {
                      form.clearField("name");
                      setDetails({ ...details, name: e.target.value });
                    }}
                    disabled={hasTenant}
                    {...(form.register("name") as object)}
                  />
                  <FieldError name="name" errors={form.errors} />
                </div>
                <div className="space-y-2">
                  <Label>Legal business name</Label>
                  <Input
                    value={details.legal_name}
                    onChange={(e) => setDetails({ ...details, legal_name: e.target.value })}
                    placeholder="Optional if same as organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary contact name</Label>
                  <Input
                    value={details.primary_contact_name}
                    onChange={(e) =>
                      setDetails({ ...details, primary_contact_name: e.target.value })
                    }
                    placeholder="Owner or HR lead"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={details.country_code}
                    onValueChange={(v) => {
                      form.clearField("country_code");
                      setDetails({ ...details, country_code: v });
                    }}
                    disabled={hasTenant}
                  >
                    <SelectTrigger {...(form.register("country_code") as object)}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name} ({c.currency_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError name="country_code" errors={form.errors} />
                </div>
                <div className="space-y-2">
                  <Label>
                    Contact phone{" "}
                    {trialInvitation ? null : <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="os-contact_phone"
                    value={details.contact_phone}
                    onChange={(e) => {
                      form.clearField("contact_phone");
                      setDetails({ ...details, contact_phone: e.target.value });
                    }}
                    placeholder="+61 4xx xxx xxx"
                    {...(form.register("contact_phone") as object)}
                  />
                  <FieldError name="contact_phone" errors={form.errors} />
                </div>
                <div className="space-y-2">
                  <Label>Your title</Label>
                  <Input
                    value={details.owner_job_title}
                    onChange={(e) => setDetails({ ...details, owner_job_title: e.target.value })}
                    placeholder="Managing Director, HR Lead…"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>
                    Contact email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="os-contact_email"
                    type="email"
                    value={details.contact_email}
                    onChange={(e) => {
                      form.clearField("contact_email");
                      setDetails({ ...details, contact_email: e.target.value });
                    }}
                    {...(form.register("contact_email") as object)}
                  />
                  <FieldError name="contact_email" errors={form.errors} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {details.country_code.toUpperCase() === "AU"
                      ? "ABN"
                      : "Business registration number"}{" "}
                    {trialInvitation ? null : <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="os-registration_number"
                    value={details.registration_number}
                    onChange={(e) => {
                      form.clearField("registration_number");
                      setDetails({ ...details, registration_number: e.target.value });
                    }}
                    placeholder={details.country_code.toUpperCase() === "AU" ? "11 digits" : ""}
                    inputMode={details.country_code.toUpperCase() === "AU" ? "numeric" : "text"}
                    {...(form.register("registration_number") as object)}
                  />
                  <FieldError name="registration_number" errors={form.errors} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID / TFN / EIN</Label>
                  <Input
                    value={details.tax_id_number}
                    onChange={(e) => setDetails({ ...details, tax_id_number: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <StepNote editLabel="Organization settings" editTo="/settings/organization">
                    Creates your organisation and makes you its admin. <b>Country is permanent</b> —
                    it decides your currency, tax rules, public holidays and payroll engine, and
                    changing it later would invalidate anything already recorded against it.
                    Everything else on this step is editable afterwards.
                  </StepNote>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={saveDetails} disabled={busy}>
                    {busy ? "Saving…" : "Save & continue"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stepIdx === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Address & branding</CardTitle>
                <CardDescription>
                  Business address and public-facing details shown on HR documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Street address</Label>
                  <Input
                    value={branding.address_line1}
                    onChange={(e) => setBranding({ ...branding, address_line1: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address line 2</Label>
                  <Input
                    value={branding.address_line2}
                    onChange={(e) => setBranding({ ...branding, address_line2: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={branding.city}
                    onChange={(e) => setBranding({ ...branding, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / region</Label>
                  <Input
                    value={branding.region}
                    onChange={(e) => setBranding({ ...branding, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal code</Label>
                  <Input
                    value={branding.postal_code}
                    onChange={(e) => setBranding({ ...branding, postal_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={branding.website}
                    onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Short tagline</Label>
                  <Input
                    value={branding.tagline}
                    onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <StepNote editLabel="Organization settings" editTo="/settings/organization">
                    Used on payslips, invoices and the public careers page candidates see. None of
                    it is required to continue, and all of it is editable later.
                  </StepNote>
                </div>
                <div className="md:col-span-2 flex justify-between">
                  <Button variant="ghost" onClick={() => setStepIdx(0)}>
                    Back
                  </Button>
                  <Button onClick={saveBranding} disabled={busy}>
                    {busy ? "Saving…" : "Save & continue"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stepIdx === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  The teams people belong to. Managers are scoped to a department, and leave and
                  timesheet approvals follow that scoping.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DepartmentPicker value={departments} onChange={setDepartments} />
                <StepNote editLabel="Departments" editTo="/admin/departments">
                  Each one becomes a department you can assign employees and managers to. Add or
                  rename them at any time — but an employee already attached to a department keeps
                  that link, so deleting one later is more work than adding one now.
                </StepNote>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStepIdx(1)}>
                    Back
                  </Button>
                  <Button onClick={saveDepartments} disabled={busy}>
                    {busy ? "Creating…" : "Create & continue"}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stepIdx === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Leave defaults</CardTitle>
                <CardDescription>
                  A starting set of leave types so people can request time off from day one.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={defaults.withLeaveTypes}
                    onChange={(e) => setDefaults({ withLeaveTypes: e.target.checked })}
                  />
                  <span>
                    <span className="font-medium">Create these three leave types</span>
                    <span className="mt-2 block overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="text-muted-foreground">
                          <tr>
                            <th className="py-1 pr-3 text-left font-medium">Type</th>
                            <th className="py-1 pr-3 text-right font-medium">Days / year</th>
                            <th className="py-1 pr-3 text-right font-medium">Accrues / month</th>
                            <th className="py-1 text-left font-medium">Paid</th>
                          </tr>
                        </thead>
                        <tbody className="tabular-nums">
                          {[
                            ["Annual Leave", "21", "1.75", "Yes"],
                            ["Sick Leave", "10", "0.83", "Yes"],
                            ["Unpaid Leave", "—", "—", "No"],
                          ].map(([name, quota, accrual, paid]) => (
                            <tr key={name} className="border-t">
                              <td className="py-1 pr-3">{name}</td>
                              <td className="py-1 pr-3 text-right">{quota}</td>
                              <td className="py-1 pr-3 text-right">{accrual}</td>
                              <td className="py-1">{paid}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </span>
                  </span>
                </label>
                <StepNote editLabel="Leave types" editTo="/admin/leave-types">
                  Quotas and accrual rates are editable per type, and you can add your own — long
                  service, study, parental. Skipping this leaves you with no leave types, which
                  means nobody can submit a leave request until you create one. It is only applied
                  if your organisation has none yet, so coming back here cannot duplicate them.
                </StepNote>
                <SetupGuideHandoff />
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStepIdx(2)}>
                    Back
                  </Button>
                  <Button onClick={saveDefaults} disabled={busy}>
                    {busy ? "Saving…" : "Save & continue"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stepIdx === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Invite your team</CardTitle>
                <CardDescription>
                  Add employees, managers, or co-admins. Managers can be linked to a department so
                  they can later view and manage their team. You can also do this later from the
                  Employees page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {invites.map((row, idx) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-3 bg-background">
                    <StepNote editLabel="Employees" editTo="/org/employees">
                      Each invite emails a link that lets the person set their own password and
                      complete their own record — you do not enter their bank or tax details for
                      them. Skipping this is fine; invite people whenever you are ready.
                    </StepNote>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Invitee {idx + 1}</div>
                      <div className="flex items-center gap-2">
                        {row.status === "sent" && (
                          <span className="text-xs text-status-done flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Sent
                          </span>
                        )}
                        {row.status === "sending" && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                          </span>
                        )}
                        {row.status === "failed" && (
                          <span className="text-xs text-destructive">Failed</span>
                        )}
                        {invites.length > 1 && row.status !== "sent" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInvites((rows) => rows.filter((_, i) => i !== idx))}
                            disabled={busy}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Work email</Label>
                        <Input
                          type="email"
                          value={row.email}
                          disabled={row.status === "sent" || busy}
                          onChange={(e) => updateInvite(idx, { email: e.target.value })}
                          placeholder="teammate@yourco.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>First name</Label>
                        <Input
                          value={row.first_name}
                          disabled={row.status === "sent" || busy}
                          onChange={(e) => updateInvite(idx, { first_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Last name</Label>
                        <Input
                          value={row.last_name}
                          disabled={row.status === "sent" || busy}
                          onChange={(e) => updateInvite(idx, { last_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Job title</Label>
                        <Input
                          value={row.job_title}
                          disabled={row.status === "sent" || busy}
                          onChange={(e) => updateInvite(idx, { job_title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Role</Label>
                        <Select
                          value={row.role}
                          disabled={row.status === "sent" || busy}
                          onValueChange={(v) => updateInvite(idx, { role: v as InviteRow["role"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager (can lead a team)</SelectItem>
                            <SelectItem value="org_admin">Organization admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>
                          Team / department{" "}
                          {row.role === "manager" ? "(team they will manage)" : "(optional)"}
                        </Label>
                        <Select
                          value={row.department_id ?? "__none"}
                          disabled={row.status === "sent" || busy || deptOptions.length === 0}
                          onValueChange={(v) =>
                            updateInvite(idx, { department_id: v === "__none" ? undefined : v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                deptOptions.length === 0
                                  ? "No departments yet — go back to step 3"
                                  : "Select a team"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">No team</SelectItem>
                            {deptOptions.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {row.status === "failed" && row.error && (
                      <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        <span>{row.error}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendOneInvite(idx)}
                          disabled={busy}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvites((rows) => [...rows, newInviteRow()])}
                  disabled={busy}
                >
                  + Add another invite
                </Button>

                <div className="flex flex-wrap justify-between gap-2 pt-2 border-t">
                  <Button variant="ghost" onClick={() => setStepIdx(3)} disabled={busy}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => sendAllAndFinish(true)}
                      disabled={busy}
                    >
                      Skip & finish
                    </Button>
                    <Button
                      onClick={() => sendAllAndFinish(false)}
                      disabled={busy || !invites.some((r) => r.email.trim() && r.status !== "sent")}
                    >
                      {busy ? "Sending…" : "Send invites & finish"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
