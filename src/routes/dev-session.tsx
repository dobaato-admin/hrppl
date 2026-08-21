import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/dev-session")({
  head: () => ({
    meta: [
      { title: "Import session (dev) — hrppl" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DevSessionPage,
});

/**
 * Local-development session import.
 *
 * Why this exists: Google OAuth is only configured for the deployed origins, so
 * you cannot sign in on localhost, and the password-reset link is consumed by
 * the deployed app before the token can be copied. Both the deployed app and
 * this dev server talk to the SAME Supabase project, so a session minted there
 * is already valid here — it just lives in the wrong browser origin.
 *
 * This pastes it across. It grants nothing: it accepts a session the user
 * already holds, and Supabase still validates it. It cannot mint, elevate or
 * extend anything, and it never touches the service-role key.
 *
 * Hard-disabled outside `vite dev` — import.meta.env.DEV is statically false in
 * a production build, so the whole page compiles away to the notice below.
 */
function DevSessionPage() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);

  if (!import.meta.env.DEV) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Not available</CardTitle>
            <CardDescription>This tool only runs on a local development server.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  /** Pull tokens out of whatever shape got pasted. */
  function extractTokens(input: string): { access_token: string; refresh_token: string } | null {
    const text = input.trim();
    if (!text) return null;

    // 1. The whole localStorage value, or a devtools copy of it.
    try {
      const parsed = JSON.parse(text);
      const node = parsed?.currentSession ?? parsed;
      if (node?.access_token && node?.refresh_token) {
        return { access_token: node.access_token, refresh_token: node.refresh_token };
      }
    } catch {
      /* not JSON — fall through */
    }

    // 2. A URL fragment or query carrying the tokens.
    const fromUrl = text.includes("access_token=");
    if (fromUrl) {
      const qs = text.slice(Math.max(text.indexOf("#"), text.indexOf("?")) + 1);
      const params = new URLSearchParams(qs.replace(/^#/, ""));
      const a = params.get("access_token");
      const r = params.get("refresh_token");
      if (a && r) return { access_token: a, refresh_token: r };
    }

    return null;
  }

  async function importSession() {
    const tokens = extractTokens(raw);
    if (!tokens) {
      return toast.error(
        "Couldn't find an access_token and refresh_token in that. Paste the whole value.",
      );
    }
    setBusy(true);
    const { error } = await supabase.auth.setSession(tokens);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Session imported — you're signed in locally.");
    navigate({ to: "/dashboard" });
  }

  const storageKey = "sb-astbnkrrgchezumcujgv-auth-token";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-status-working/20">
            <KeyRound className="h-5 w-5 text-status-working" />
          </div>
          <CardTitle>Import a session from the deployed app</CardTitle>
          <CardDescription>
            Google sign-in only works on the deployed origins. Both apps share the same Supabase
            project, so a session from there works here — copy it across.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Open the deployed app in another tab and sign in with Google as normal.</li>
            <li>
              Open DevTools there (F12) &rarr; <strong>Console</strong>, and run:
              <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs text-foreground">
                copy(localStorage.getItem({JSON.stringify(storageKey)}))
              </pre>
              That copies the session to your clipboard. If <code>copy()</code> is unavailable, drop
              the wrapper and copy the printed value by hand.
            </li>
            <li>Paste it below.</li>
          </ol>

          <div className="space-y-2">
            <Label htmlFor="session-blob">Session JSON</Label>
            <Textarea
              id="session-blob"
              rows={7}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder='{"access_token":"eyJ…","refresh_token":"…","expires_at":…}'
              spellCheck={false}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-start gap-2 rounded-md border border-status-pending/40 bg-status-pending/10 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-pending" />
            <p>
              This is your own live session — treat it like a password and don&rsquo;t paste it
              anywhere else. It expires on its normal schedule; re-copy it when it does.
              Multi-factor authentication still applies, so you may be asked to verify.
            </p>
          </div>

          <Button className="w-full" onClick={importSession} disabled={busy || !raw.trim()}>
            {busy ? "Importing…" : "Import session and continue"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
