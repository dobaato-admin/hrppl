import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyGateStatus } from "@/lib/org-signup.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/suspended")({
  head: () => ({
    meta: [
      { title: "Account suspended — hrppl" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SuspendedPage,
});

/**
 * Terminal screen for a suspended account.
 *
 * Access is already blocked server-side on every request; this page exists so
 * the user gets an explanation and a way out rather than an app shell where
 * every action fails. It deliberately renders no navigation.
 */
function SuspendedPage() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getMyGateStatus);
  const [reason, setReason] = useState<string | null>(null);
  const [scope, setScope] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = (await fetchStatus()) as {
          suspended?: boolean;
          suspensionReason?: string | null;
          suspendedScope?: string | null;
        };
        if (cancelled) return;
        // Reinstated in another tab — don't strand the user here.
        if (!s.suspended) return navigate({ to: "/dashboard" });
        setReason(s.suspensionReason ?? null);
        setScope(s.suspendedScope ?? "account");
      } catch {
        /* leave the generic message in place */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchStatus, navigate]);

  const isOrg = scope === "organisation";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-status-stuck/15">
            <ShieldAlert className="h-5 w-5 text-status-stuck" />
          </div>
          <CardTitle>
            {isOrg ? "Your organisation's account is suspended" : "Your account is suspended"}
          </CardTitle>
          <CardDescription>
            {isOrg
              ? "Access is paused for everyone in your organisation. Your administrator or the hrppl team can restore it."
              : "You can't access hrppl until an administrator restores your access."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason ? (
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Reason given
              </p>
              <p className="mt-1 text-sm">{reason}</p>
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground">
            If you think this is a mistake, contact your organisation's administrator.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
