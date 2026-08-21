import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { sanitizeRedirect } from "@/components/AuthRouteGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { supabase } from "@/integrations/supabase/client";
import { getMfaStatus, startEmailMfa, verifyEmailMfa, setTotpEnrolled } from "@/lib/mfa.functions";
import { setMfaSessionVerified, isMfaSessionVerified } from "@/lib/mfa-session";

export const Route = createFileRoute("/me/security")({
  // Declared so the router actually parses ?redirect=, and sanitised so this
  // page cannot be used to bounce someone to an arbitrary path. /auth has done
  // this since it was written; this route was reading the raw location instead.
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    // Absent is meaningful here — it distinguishes "manage my 2FA settings"
    // from "the gate challenged me mid-navigation" — so only sanitise when a
    // value was actually supplied. (AuthRouteGate's sanitizeRedirect takes a
    // string and falls back to /dashboard; auth.tsx keeps its own
    // unknown-tolerant copy. Two spellings of the same idea, worth unifying.)
    const raw = search.redirect;
    if (typeof raw !== "string") return {};
    return { redirect: sanitizeRedirect(raw) };
  },
  component: SecurityPage,
});

function SecurityPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/me/security" });
  // A redirect target means the route gate sent us here to CHALLENGE the user
  // mid-navigation. Without one, they opened Security from the nav to manage
  // their settings. Same page, two very different jobs (§1 #1 of the plan is
  // the same class of bug: a screen that never says it is finished).
  const isChallenge = !!redirect;
  const target = redirect ?? "/dashboard";

  const fetchStatus = useServerFn(getMfaStatus);
  const markTotpEnrolled = useServerFn(setTotpEnrolled);
  const {
    data: status,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["mfa-status"],
    queryFn: () => fetchStatus(),
  });

  // Repair a split brain between the two places "enrolled" is recorded.
  //
  // Supabase owns auth.mfa_factors; this app gates on profiles.mfa_method, and
  // setTotpEnrolled is the only thing that writes it. mfa.verify() marking a
  // factor verified and setTotpEnrolled landing are two separate round trips,
  // so a closed tab, a dropped connection or a server error between them
  // leaves a VERIFIED factor with mfa_method still null.
  //
  // That state is unrecoverable without this. AuthRouteGate reads mfa_method,
  // sees null and redirects here; this page reads the same null and shows the
  // ENROL view, which enrols yet another factor — a redirect loop that adds a
  // factor per cycle until max_enrolled_factors is hit. Observed on a real
  // account: verified_factors=1, mfa_method=null.
  //
  // So before offering to enrol, ask Supabase whether a verified factor
  // already exists and, if so, just record it.
  const [healing, setHealing] = useState(false);
  useEffect(() => {
    if (isLoading || status?.method) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: list } = await supabase.auth.mfa.listFactors();
        const verified = (list?.totp ?? []).find((f) => f.status === "verified");
        if (!verified || cancelled) return;
        setHealing(true);
        await markTotpEnrolled({});
        await refetch();
      } catch {
        // Fall through to the enrol view — no worse than before.
      } finally {
        if (!cancelled) setHealing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, status?.method]);

  // After enrollment OR successful login challenge, advance to redirect.
  const goNext = () => {
    setMfaSessionVerified();
    navigate({ to: target as never });
  };

  // Chrome only when this is the SETTINGS page.
  //
  // The two jobs this route does want opposite framing. Opened from the nav it
  // is a normal settings screen and needs the shell, or the user loses every
  // way to navigate. Arrived at as a gate challenge it must NOT show the app
  // navigation: nothing behind it is reachable yet, so every link would simply
  // bounce back here — which reads exactly like the redirect loop this page is
  // already too good at producing.
  const Frame = isChallenge
    ? ({ children }: { children: React.ReactNode }) => <main className="min-h-screen bg-muted/20 py-10">{children}</main>
    : ({ children }: { children: React.ReactNode }) => <AppShell title="Security">{children}</AppShell>;

  return (
    <Frame>
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">
            {isChallenge ? "Verify it's you" : "Two-factor authentication"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isChallenge
            ? "Your organisation requires a second step each time you sign in. Confirm the code below to continue."
            : "Two-factor authentication is required for all accounts. Choose an authenticator app (TOTP) or email-based one-time codes."}
        </p>

        {isLoading || healing ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : status?.method ? (
          <EnrolledView status={status} onVerified={goNext} />
        ) : (
          <EnrollView
            onEnrolled={() => {
              refetch();
              goNext();
            }}
            email={status?.email ?? null}
          />
        )}
      </div>
    </Frame>
  );
}

function EnrolledView({
  status,
  onVerified,
}: {
  status: { method: "totp" | "email" | null; email: string | null };
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  // A toast disappears; being unable to receive a code does not. Keep the
  // reason on screen, otherwise the user just sees the same button again and
  // assumes the page is looping.
  const [sendError, setSendError] = useState<string | null>(null);
  const sendEmail = useServerFn(startEmailMfa);
  const verifyEmail = useServerFn(verifyEmailMfa);

  // If session already verified, just bounce.
  useEffect(() => {
    if (isMfaSessionVerified()) onVerified();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify() {
    setBusy(true);
    try {
      if (status.method === "totp") {
        // List factors, find verified TOTP, challenge + verify.
        const { data: list, error: lerr } = await supabase.auth.mfa.listFactors();
        if (lerr) throw lerr;
        const factor = list.totp.find((f) => f.status === "verified");
        if (!factor) throw new Error("No verified TOTP factor found. Re-enroll.");
        const { data: ch, error: cerr } = await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });
        if (cerr) throw cerr;
        const { error: verr } = await supabase.auth.mfa.verify({
          factorId: factor.id,
          challengeId: ch.id,
          code,
        });
        if (verr) throw verr;
      } else {
        await verifyEmail({ data: { purpose: "login", code } });
      }
      toast.success("Verified");
      onVerified();
    } catch (e: any) {
      toast.error(e?.message ?? "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your sign-in</CardTitle>
        <CardDescription>
          {status.method === "totp"
            ? "Enter the 6-digit code from your authenticator app."
            : `We'll send a 6-digit code to your email${status.email ? ` (${status.email})` : ""}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.method === "email" && !emailSent && (
          <Button
            onClick={async () => {
              setBusy(true);
              setSendError(null);
              try {
                await sendEmail({ data: { purpose: "login" } });
                setEmailSent(true);
                toast.success("Code sent");
              } catch (e: any) {
                const message = e?.message ?? "Could not send code";
                setSendError(message);
                toast.error(message);
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            <Mail className="mr-2 h-4 w-4" /> Send code to email
          </Button>
        )}

        {sendError && (
          <Alert variant="destructive">
            <AlertDescription className="space-y-1">
              <p className="font-medium">We couldn&rsquo;t send your code.</p>
              <p className="text-xs">{sendError}</p>
              <p className="text-xs">
                Email codes are sent by the server. If this environment has no mail credentials
                configured, use an authenticator app instead — ask an administrator to reset your
                2FA method.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {(status.method === "totp" || emailSent) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">6-digit code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
            </div>
            <Button onClick={handleVerify} disabled={busy || code.length !== 6}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Method on file:{" "}
          <strong>{status.method === "totp" ? "Authenticator app" : "Email OTP"}</strong>
        </p>
      </CardContent>
    </Card>
  );
}

function EnrollView({ onEnrolled, email }: { onEnrolled: () => void; email: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up two-factor authentication</CardTitle>
        <CardDescription>
          Pick a method to enrol. You'll need to use it on every sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="totp">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">
              <Smartphone className="mr-2 h-4 w-4" />
              Authenticator app
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email OTP
            </TabsTrigger>
          </TabsList>
          <TabsContent value="totp" className="pt-4">
            <TotpEnroll onEnrolled={onEnrolled} />
          </TabsContent>
          <TabsContent value="email" className="pt-4">
            <EmailEnroll onEnrolled={onEnrolled} email={email} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TotpEnroll({ onEnrolled }: { onEnrolled: () => void }) {
  const markEnrolled = useServerFn(setTotpEnrolled);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // Start enrollment on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Clean up any unverified factors first.
        const { data: list } = await supabase.auth.mfa.listFactors();
        for (const f of list?.totp ?? []) {
          if (f.status !== "verified") {
            await supabase.auth.mfa.unenroll({ factorId: f.id });
          }
        }
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: `TOTP-${Date.now()}`,
        });
        if (error) throw error;
        if (cancelled) return;
        setFactorId(data.id);
        setQr(data.totp.qr_code);
        setSecret(data.totp.secret);
      } catch (e: any) {
        toast.error(e?.message ?? "Could not start TOTP enrollment");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleVerify() {
    if (!factorId) return;
    setBusy(true);
    try {
      const { data: ch, error: cerr } = await supabase.auth.mfa.challenge({ factorId });
      if (cerr) throw cerr;
      const { error: verr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: ch.id,
        code,
      });
      if (verr) throw verr;
      await markEnrolled({});
      toast.success("Authenticator app enrolled");
      onEnrolled();
    } catch (e: any) {
      toast.error(e?.message ?? "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Scan this QR code with Google Authenticator, 1Password, Authy, Microsoft Authenticator,
          etc.
        </AlertDescription>
      </Alert>
      {qr ? (
        <div className="flex flex-col items-center gap-3">
          <img src={qr} alt="TOTP QR code" className="h-48 w-48 border rounded" />
          {secret && (
            <p className="text-xs text-muted-foreground break-all">
              Or enter this secret manually: <code className="font-mono">{secret}</code>
            </p>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="totp-code">Enter the 6-digit code from your app</Label>
        <Input
          id="totp-code"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
        />
      </div>
      <Button onClick={handleVerify} disabled={busy || !factorId || code.length !== 6}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Verify & enable
      </Button>
    </div>
  );
}

function EmailEnroll({ onEnrolled, email }: { onEnrolled: () => void; email: string | null }) {
  const sendEmail = useServerFn(startEmailMfa);
  const verifyEmail = useServerFn(verifyEmailMfa);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const masked = useMemo(() => (email ? email.replace(/(.).+(@.+)/, "$1***$2") : ""), [email]);

  async function send() {
    setBusy(true);
    try {
      await sendEmail({ data: { purpose: "enroll" } });
      setSent(true);
      toast.success(`Code sent to ${masked}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not send code");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    try {
      await verifyEmail({ data: { purpose: "enroll", code } });
      toast.success("Email OTP enrolled");
      onEnrolled();
    } catch (e: any) {
      toast.error(e?.message ?? "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          We'll email a 6-digit code to <strong>{masked || "your account email"}</strong> every time
          you sign in.
        </AlertDescription>
      </Alert>
      {!sent ? (
        <Button onClick={send} disabled={busy}>
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Send verification code
        </Button>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-code">6-digit code</Label>
            <Input
              id="email-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={verify} disabled={busy || code.length !== 6}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify & enable
            </Button>
            <Button variant="outline" onClick={send} disabled={busy}>
              Resend code
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
