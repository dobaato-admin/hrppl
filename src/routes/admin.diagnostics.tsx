import { AdminGate } from "@/components/AdminGate";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useServerFn } from "@tanstack/react-start";
import { perfBus } from "@/lib/perf-bus";
import { useRenderCount } from "@/hooks/use-render-count";
import { getRecentEmailLog } from "@/lib/diagnostics.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/admin/diagnostics")({
  head: () => ({
    meta: [
      { title: "Performance diagnostics — hrppl" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DiagnosticsPage,
});

function useBusSnapshot() {
  return useSyncExternalStore(
    (cb) => {
      const unsub = perfBus.subscribe(cb);
      return () => {
        unsub();
      };
    },
    () => perfBus.navs.length + perfBus.gates.length + perfBus.renders.size,
    () => 0,
  );
}

function DiagnosticsPage() {
  useRenderCount("/admin/diagnostics");
  useBusSnapshot();
  const fetchLog = useServerFn(getRecentEmailLog);
  const [emails, setEmails] = useState<any[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const loadEmails = async () => {
    setLoadingEmails(true);
    setEmailError(null);
    try {
      const res = await fetchLog({ data: { sinceMinutes: 60, limit: 25 } });
      setEmails(res.rows);
    } catch (e: any) {
      setEmailError(e?.message ?? "Failed to load");
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    void loadEmails();
  }, []);

  const avgNav =
    perfBus.navs.length === 0
      ? 0
      : Math.round(perfBus.navs.reduce((a, b) => a + b.ms, 0) / perfBus.navs.length);
  const avgGate =
    perfBus.gates.length === 0
      ? 0
      : Math.round(perfBus.gates.reduce((a, b) => a + b.ms, 0) / perfBus.gates.length);

  return (
    // Wrapped in AppShell to restore the sidebar and top bar; admin.tsx is a
    // bare <Outlet /> by design. No title passed — the page has its own header.
    <AppShell>
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Performance Diagnostics</h1>
          <p className="text-sm text-muted-foreground">
            Live, in-memory client telemetry. Super-admin only. Not persisted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => perfBus.clear()}>
            Clear
          </Button>
          <Button onClick={loadEmails} disabled={loadingEmails}>
            {loadingEmails ? "Loading…" : "Refresh emails"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Avg nav</div>
          <div className="mt-1 text-2xl font-semibold">{avgNav} ms</div>
          <div className="text-xs text-muted-foreground">over {perfBus.navs.length} samples</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Avg auth gate</div>
          <div className="mt-1 text-2xl font-semibold">{avgGate} ms</div>
          <div className="text-xs text-muted-foreground">over {perfBus.gates.length} samples</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Routes rendered</div>
          <div className="mt-1 text-2xl font-semibold">{perfBus.renders.size}</div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold">Recent navigations</h2>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1">Path</th>
                <th className="py-1">Duration</th>
                <th className="py-1">When</th>
              </tr>
            </thead>
            <tbody>
              {perfBus.navs.map((n, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1 font-mono text-xs">{n.path}</td>
                  <td className="py-1">{n.ms} ms</td>
                  <td className="py-1 text-muted-foreground">
                    {new Date(n.at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {perfBus.navs.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                    Navigate around the app and samples will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold">Auth gate timings</h2>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1">Path</th>
                <th className="py-1">Duration</th>
                <th className="py-1">Source</th>
                <th className="py-1">When</th>
              </tr>
            </thead>
            <tbody>
              {perfBus.gates.map((g, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1 font-mono text-xs">{g.path}</td>
                  <td className="py-1">{g.ms} ms</td>
                  <td className="py-1">
                    {g.cached ? (
                      <Badge variant="secondary">cached</Badge>
                    ) : (
                      <Badge>fresh</Badge>
                    )}
                  </td>
                  <td className="py-1 text-muted-foreground">
                    {new Date(g.at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold">Render counts per route</h2>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1">Path</th>
                <th className="py-1">Renders</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(perfBus.renders.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([p, c]) => (
                  <tr key={p} className="border-t">
                    <td className="py-1 font-mono text-xs">{p}</td>
                    <td className="py-1">{c}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold">Recent emails (last 60 min)</h2>
        {emailError ? (
          <div className="text-sm text-destructive">{emailError}</div>
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-1">Recipient</th>
                  <th className="py-1">Template</th>
                  <th className="py-1">Status</th>
                  <th className="py-1">When</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((row: any) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-1 font-mono text-xs">{row.recipient_email}</td>
                    <td className="py-1">{row.template_name}</td>
                    <td className="py-1">
                      <Badge variant={row.status === "sent" ? "secondary" : "default"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-1 text-muted-foreground">
                      {new Date(row.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && !loadingEmails && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No emails in the last 60 minutes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>
    </AppShell>
  );
}
