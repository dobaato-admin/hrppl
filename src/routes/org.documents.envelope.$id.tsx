import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getEnvelope, sendEnvelopeReminder } from "@/lib/documents.functions";
import { sanitizeDocHtml } from "@/lib/doc-html-sanitize";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, BellRing, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/org/documents/envelope/$id")({
  head: () => ({ meta: [{ title: "Envelope — hrppl" }] }),
  component: EnvelopeDetail,
});

function EnvelopeDetail() {
  const { id } = useParams({ from: "/org/documents/envelope/$id" });
  const get = useServerFn(getEnvelope);
  const remind = useServerFn(sendEnvelopeReminder);
  const [data, setData] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() { setData(await get({ data: { id } })); }
  useEffect(() => { refresh(); }, [id]);

  async function doRemind() {
    setBusy(true);
    try {
      const r = await remind({ data: { envelope_id: id } });
      toast.success(`Reminded ${r.reminded} pending signer${r.reminded === 1 ? "" : "s"}`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }


  return (
    <AppShell title="Envelope" subtitle="Document detail & audit trail">
      <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Link to="/org/documents"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
          {data?.envelope && (
            <div className="flex items-center gap-2">
              {!["completed", "cancelled", "declined", "expired"].includes(data.envelope.status) && (
                <Button size="sm" variant="outline" disabled={busy} onClick={doRemind}>
                  <BellRing className="h-3.5 w-3.5 mr-1" />
                  {data.envelope.reminder_count ? `Send reminder (${data.envelope.reminder_count} sent)` : "Send reminder"}
                </Button>
              )}
              {data.envelope.status === "completed" && data.envelope.certificate_token && (
                <a href={`/sign/certificate/${data.envelope.certificate_token}`} target="_blank" rel="noreferrer">
                  <Button size="sm"><FileCheck2 className="h-3.5 w-3.5 mr-1" /> View signed copy</Button>
                </a>
              )}
            </div>
          )}
        </div>
        {!data ? <div className="text-muted-foreground">Loading…</div> : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{data.envelope.subject}</CardTitle>
                    <CardDescription>
                      To {data.envelope.recipient_name} ({data.envelope.recipient_email}) · {data.envelope.doc_type.replace(/_/g, " ")}
                      {data.envelope.last_reminder_at && <> · Last reminder {new Date(data.envelope.last_reminder_at).toLocaleString()}</>}
                    </CardDescription>
                  </div>
                  <Badge>{data.envelope.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-card p-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeDocHtml(data.envelope.body_html_snapshot) }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Signers</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.signers.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <div>
                        <div className="font-medium">{s.signer_name}</div>
                        <div className="text-xs text-muted-foreground">{s.signer_email} · {s.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={s.status === "signed" ? "default" : s.status === "declined" ? "destructive" : "secondary"}>
                          {s.status}
                        </Badge>
                        {s.signed_at && <span className="text-xs text-muted-foreground">{new Date(s.signed_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Audit trail</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {data.events.length === 0 ? <div className="text-sm text-muted-foreground">No events.</div> : data.events.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between border-b py-1.5 text-xs last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{e.event.replace(/_/g, " ")}</Badge>
                        {e.metadata?.audit_hash && <span className="font-mono text-[10px] text-muted-foreground">{e.metadata.audit_hash.slice(0, 16)}…</span>}
                      </div>
                      <div className="text-muted-foreground">
                        {e.ip ? `${e.ip} · ` : ""}{new Date(e.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
