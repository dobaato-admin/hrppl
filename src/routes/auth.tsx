import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  describeOAuthError,
  describePasswordSignInError,
  readOAuthErrorFromUrl,
} from "@/lib/oauth-errors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buildGoogleRedirectUri } from "@/lib/oauth-config";

// Only allow internal, same-origin relative paths.
function sanitizeRedirect(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — hrppl" },
      { name: "description", content: "Sign in to your hrppl workspace, or create a new account to start running global payroll and HR." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Sign in — hrppl" },
      { property: "og:description", content: "Sign in to hrppl, the global HRMS and payroll platform." },
      { property: "og:url", content: "https://hrppl.io/auth" },
    ],
    links: [{ rel: "canonical", href: "https://hrppl.io/auth" }],
  }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = sanitizeRedirect(search.redirect);
    return r ? { redirect: r } : {};
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect = "/dashboard" } = useSearch({ from: "/auth" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // A toast disappears; being unable to sign in does not. Keep the reason on
  // screen with GoTrue's error_code, because "invalid_credentials" and
  // "email_not_confirmed" look identical to the user but need opposite fixes.
  const [signInError, setSignInError] = useState<
    { title: string; message: string; code: string } | null
  >(null);

  // Surface OAuth errors returned via redirect (?error=... / #error=...).
  useEffect(() => {
    const info = readOAuthErrorFromUrl();
    if (info) {
      toast.error(info.title, { description: info.message });
      // Clean the URL so a refresh doesn't re-toast.
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSignInError(null);
    // Trim the email only. Leading/trailing space is never intended in an
    // address and is a classic copy-paste artefact; a password's whitespace is
    // significant and must be sent exactly as typed.
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      const info = describePasswordSignInError(error);
      setSignInError(info);
      return toast.error(info.title, { description: info.message });
    }
    setSignInError(null);
    toast.success("Signed in");
    navigate({ to: redirect });
  }

  async function signInGoogle() {
    const { redirectUri, validation } = buildGoogleRedirectUri(redirect);
    if (!validation.ok) {
      toast.error("Sign-in misconfigured", {
        description:
          `This site's origin (${validation.origin}) isn't on the Google OAuth allowlist. ` +
          `Open the app from an approved URL, or ask your administrator to add it. ` +
          `Details have been logged to the console.`,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: { prompt: "select_account" },
      });
      if (result.redirected) return;
      setLoading(false);
      if (result.error) {
        const info = describeOAuthError(result.error);
        return toast.error(info.title, { description: info.message });
      }
      navigate({ to: redirect });
    } catch (err) {
      setLoading(false);
      const info = describeOAuthError(err);
      toast.error(info.title, { description: info.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="sr-only">Sign in to hrppl</h1>
          <CardTitle>hrppl</CardTitle>
          <CardDescription>Sign in to your existing account, or create one to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <div className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground">
                  For existing users only. New here? Switch to the Sign Up tab.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={signInGoogle}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      or sign in with email
                    </span>
                  </div>
                </div>
                <form onSubmit={signIn} className="space-y-4">
                  {signInError && (
                    <Alert variant="destructive">
                      <AlertDescription className="space-y-1">
                        <p className="font-medium">{signInError.title}</p>
                        <p className="text-xs">{signInError.message}</p>
                        {signInError.code && (
                          <p className="text-xs opacity-70">
                            Reference: <code className="font-mono">{signInError.code}</code>
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email-in">Email</Label>
                    <Input id="email-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pw-in">Password</Label>
                      <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="pw-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </div>
            </TabsContent>
            <TabsContent value="signup">
              <div className="space-y-4 pt-4 text-sm">
                <p className="text-muted-foreground">Choose how you want to get started:</p>
                <div className="rounded-md border p-4 space-y-2">
                  <p className="font-medium">Create a new organisation</p>
                  <p className="text-xs text-muted-foreground">
                    Set up a workspace for your company. You'll become the admin and can invite your team.
                  </p>
                  <Link to="/signup" search={{ redirect: "/org/setup" }} className="block">
                    <Button type="button" className="w-full">Create organisation</Button>
                  </Link>
                </div>
                <div className="rounded-md border p-4 space-y-2">
                  <p className="font-medium">Join an existing organisation</p>
                  <p className="text-xs text-muted-foreground">
                    You need an invitation from your organisation admin. Open the invitation
                    link from your email — it will sign you in and add you to the team. We don't
                    accept individual employee signups without an invitation.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
