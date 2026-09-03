import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail, Building2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { buildGoogleRedirectUri } from "@/lib/oauth-config";
import { describeOAuthError } from "@/lib/oauth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { acceptInvitation, getInvitationByToken } from "@/lib/staff-invitations.functions";
import { validateInvitationDetails, type DetailsInput } from "@/lib/payroll-validation";
import { toast } from "sonner";


export const Route = createFileRoute("/invite/$token")({
  head: () => ({ meta: [{ title: "Accept invitation — hrppl" }] }),
  component: AcceptInvitePage,
});

type Details = {
  contact_number: string;
  bank_name: string;
  bank_bsb: string;
  bank_account_number: string;
  bank_account_name: string;
  tfn: string;
  super_fund_name: string;
  super_member_number: string;
  next_of_kin_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone: string;
};

const EMPTY_DETAILS: Details = {
  contact_number: "",
  bank_name: "",
  bank_bsb: "",
  bank_account_number: "",
  bank_account_name: "",
  tfn: "",
  super_fund_name: "",
  super_member_number: "",
  next_of_kin_name: "",
  next_of_kin_relationship: "",
  next_of_kin_phone: "",
};

function AcceptInvitePage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const lookupFn = useServerFn(getInvitationByToken);
  const acceptFn = useServerFn(acceptInvitation);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DetailsInput, string>>>({});
  const [emailSent, setEmailSent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => lookupFn({ data: { token } }),
  });

  const invitation = data?.invitation;
  const organization = data?.organization;
  const countryCode = (organization?.country_code || invitation?.country_code || "AU").toUpperCase();
  const isAU = countryCode === "AU";
  const isNP = countryCode === "NP";

  function update<K extends keyof Details>(k: K, v: string) {
    setDetails((p) => ({ ...p, [k]: v }));
    if (fieldErrors[k as keyof DetailsInput]) {
      setFieldErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  async function submitAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!invitation) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: invitation.email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/invite/${token}`,
            data: { full_name: fullName },
          },
        });
        if (error) {
          // Supabase returns a generic error when the user already exists.
          if (/already|registered|exists/i.test(error.message)) {
            toast.error("This email already has an account", {
              description: "Use “I have an account” to sign in, or continue with Google if you signed up that way.",
            });
            setMode("signin");
            return;
          }
          throw error;
        }
        setEmailSent(true);
        toast.success("Account created. Check your email to verify, then return to this link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: invitation.email, password });
        if (error) {
          if (/invalid login credentials/i.test(error.message)) {
            toast.error("Couldn't sign in", {
              description: "If you originally signed up with Google, use the “Continue with Google” button above.",
            });
            return;
          }
          throw error;
        }
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!invitation) return;
    const { redirectUri, validation } = buildGoogleRedirectUri(`/invite/${token}`);
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description: `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. Ask your administrator to add it.`,
      });
      return;
    }
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: { prompt: "select_account", login_hint: invitation.email },
      });
      if (result.redirected) return;
      setBusy(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        toast.error(info.title, { description: info.message });
      }
    } catch (err) {
      setBusy(false);
      const info = describeOAuthError(err);
      toast.error(info.title, { description: info.message });
    }
  }


  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!invitation) return;
    const { errors, normalized } = validateInvitationDetails(details, { isAU, countryCode });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please correct the highlighted fields");
      return;
    }
    setFieldErrors({});
    setBusy(true);
    try {
      await acceptFn({ data: { token, details: normalized as Details } });
      toast.success("Welcome aboard!");
      navigate({ to: "/onboarding/profile" });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not complete onboarding");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>This link is invalid or has been revoked.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (invitation.status !== "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invitation {invitation.status}</CardTitle>
            <CardDescription>
              This invitation is no longer active. Please contact your organization administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (user && user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Wrong account</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invitation.email}</strong>, but you're signed in as <strong>{user.email}</strong>.
              Sign out and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={async () => { await supabase.auth.signOut(); navigate({ to: `/invite/${token}` }); }}>
              Sign out & continue
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const header = (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Building2 className="h-5 w-5" /></div>
          <div>
            <CardTitle className="text-base">{organization?.name}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
              <Mail className="h-3.5 w-3.5" /> {invitation.email}
              {invitation.job_title && <Badge variant="secondary">{invitation.job_title}</Badge>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  // Step 2: authenticated and email matches → collect employee details
  if (user && user.email?.toLowerCase() === invitation.email.toLowerCase()) {
    return (
      <main className="min-h-screen bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-xl space-y-6">
          {header}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your details (optional)</CardTitle>
              <CardDescription>
                You're signed in as <strong>{user.email}</strong>. Add payroll and next-of-kin details now, or skip and complete them later from your profile. This information is private and only visible to you and your HR admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitDetails} className="space-y-6" noValidate>
                <section className="space-y-3">
                  <h3 className="text-sm font-medium">Contact</h3>
                  <div className="space-y-2">
                    <Label>Contact number</Label>
                    <Input value={details.contact_number} onChange={(e) => update("contact_number", e.target.value)} placeholder="+61 4xx xxx xxx" aria-invalid={!!fieldErrors.contact_number} />
                    {fieldErrors.contact_number && <p className="text-xs text-destructive">{fieldErrors.contact_number}</p>}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium">Next of kin</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full name</Label>
                      <Input value={details.next_of_kin_name} onChange={(e) => update("next_of_kin_name", e.target.value)} aria-invalid={!!fieldErrors.next_of_kin_name} />
                      {fieldErrors.next_of_kin_name && <p className="text-xs text-destructive">{fieldErrors.next_of_kin_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input value={details.next_of_kin_relationship} onChange={(e) => update("next_of_kin_relationship", e.target.value)} placeholder="Spouse, parent…" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Phone</Label>
                      <Input value={details.next_of_kin_phone} onChange={(e) => update("next_of_kin_phone", e.target.value)} aria-invalid={!!fieldErrors.next_of_kin_phone} />
                      {fieldErrors.next_of_kin_phone && <p className="text-xs text-destructive">{fieldErrors.next_of_kin_phone}</p>}
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium">Bank account {isAU ? "(Australia)" : isNP ? "(Nepal)" : `(${countryCode})`}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Account name</Label>
                      <Input value={details.bank_account_name} onChange={(e) => update("bank_account_name", e.target.value)} aria-invalid={!!fieldErrors.bank_account_name} placeholder="Name on the account" />
                      {fieldErrors.bank_account_name && <p className="text-xs text-destructive">{fieldErrors.bank_account_name}</p>}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Bank name</Label>
                      <Input value={details.bank_name} onChange={(e) => update("bank_name", e.target.value)} placeholder={isNP ? "e.g. Nabil Bank, NIC Asia, Global IME…" : "Your bank"} />
                    </div>
                    {isAU && (
                      <div className="space-y-2">
                        <Label>BSB</Label>
                        <Input value={details.bank_bsb} onChange={(e) => update("bank_bsb", e.target.value)} placeholder="000-000" inputMode="numeric" aria-invalid={!!fieldErrors.bank_bsb} />
                        {fieldErrors.bank_bsb && <p className="text-xs text-destructive">{fieldErrors.bank_bsb}</p>}
                      </div>
                    )}
                    {!isAU && !isNP && (
                      <div className="space-y-2">
                        <Label>Branch / sort code <span className="text-muted-foreground">(optional)</span></Label>
                        <Input value={details.bank_bsb} onChange={(e) => update("bank_bsb", e.target.value)} />
                      </div>
                    )}
                    <div className={`space-y-2 ${isAU ? "" : "sm:col-span-2"}`}>
                      <Label>Account number</Label>
                      <Input value={details.bank_account_number} onChange={(e) => update("bank_account_number", e.target.value)} inputMode="numeric" aria-invalid={!!fieldErrors.bank_account_number} />
                      {fieldErrors.bank_account_number && <p className="text-xs text-destructive">{fieldErrors.bank_account_number}</p>}
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium">{isAU ? "Tax & superannuation" : "Tax & pension"}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{isAU ? "Tax File Number (TFN)" : "Tax ID"}</Label>
                      <Input value={details.tfn} onChange={(e) => update("tfn", e.target.value)} placeholder={isAU ? "8 or 9 digits" : ""} inputMode={isAU ? "numeric" : "text"} aria-invalid={!!fieldErrors.tfn} />
                      {fieldErrors.tfn && <p className="text-xs text-destructive">{fieldErrors.tfn}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{isAU ? "Super fund name" : "Pension fund name"}</Label>
                      <Input value={details.super_fund_name} onChange={(e) => update("super_fund_name", e.target.value)} aria-invalid={!!fieldErrors.super_fund_name} />
                      {fieldErrors.super_fund_name && <p className="text-xs text-destructive">{fieldErrors.super_fund_name}</p>}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>{isAU ? "Super member number" : "Pension member number"}</Label>
                      <Input value={details.super_member_number} onChange={(e) => update("super_member_number", e.target.value)} aria-invalid={!!fieldErrors.super_member_number} />
                      {fieldErrors.super_member_number && <p className="text-xs text-destructive">{fieldErrors.super_member_number}</p>}
                    </div>
                  </div>
                </section>

                <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Your tax and bank details are stored securely and used only for payroll. All fields are optional — you can complete them later from your profile.</span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="flex-1" disabled={busy}>
                    {busy ? "Saving…" : "Save & continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await acceptFn({ data: { token, details: EMPTY_DETAILS } });
                        toast.success("Welcome aboard! You can add payroll details later from your profile.");
                        navigate({ to: "/onboarding/profile" });
                      } catch (err: any) {
                        toast.error(err?.message ?? "Could not complete onboarding");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Skip & finish later
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Step 1: sign in or sign up
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        {header}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You've been invited to join <strong>{organization?.name}</strong>. Create an account or sign in to continue.
            </p>
          </CardContent>
        </Card>

        {emailSent && (
          <Card className="border-status-info/40 bg-status-info/10">
            <CardContent className="flex items-start gap-3 pt-6 text-sm">
              <Mail className="mt-0.5 h-5 w-5 text-status-info" />
              <div>
                <div className="font-medium text-foreground">Check your inbox to verify your email</div>
                <p className="text-muted-foreground">
                  We sent a confirmation link to <strong>{invitation.email}</strong>. Click it, then come back to this invitation page to finish setting up your account. The link expires in 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 pt-6">
            <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={signInWithGoogle}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.998 6.998 0 0 1 5.46 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Continue with Google
            </Button>
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or with a password
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>Create account</Button>
              <Button size="sm" variant={mode === "signin" ? "default" : "outline"} onClick={() => setMode("signin")}>I have an account</Button>
            </div>
            <form onSubmit={submitAuth} className="space-y-3">
              {mode === "signup" && (
                <div className="space-y-2"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              )}
              <div className="space-y-2"><Label>Email</Label><Input value={invitation.email} disabled /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <Button type="submit" className="w-full" disabled={busy || !password}>
                {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in & continue"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
