import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { myPendingEnvelopes } from "@/lib/documents.functions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";

export const Route = createFileRoute("/me/signatures")({
  head: () => ({ meta: [{ title: "My signatures — hrppl" }] }),
  component: SignaturesPage,
});

function SignaturesPage() {
  const list = useServerFn(myPendingEnvelopes);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { list().then((r) => setItems(r.items)); }, []);

  const pending = items.filter((i) => i.status !== "signed");
  const done = items.filter((i) => i.status === "signed");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSignature className="h-4 w-4" /> Awaiting your signature ({pending.length})</CardTitle>
          <CardDescription>Open each document, review it, then sign or decline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.length === 0 ? <div className="text-sm text-muted-foreground">All caught up.</div> : pending.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{i.envelope?.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {i.envelope?.doc_type?.replace(/_/g, " ")} · Due {i.envelope?.due_date ?? "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{i.status}</Badge>
                <Link to="/sign/$envelopeId" params={{ envelopeId: i.envelope.id }}>
                  <Button size="sm">Open</Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recently signed</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {done.slice(0, 20).map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{i.envelope?.subject}</div>
                  <div className="text-xs text-muted-foreground">Signed {i.signed_at ? new Date(i.signed_at).toLocaleString() : ""}</div>
                </div>
                <Link to="/sign/$envelopeId" params={{ envelopeId: i.envelope.id }}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
