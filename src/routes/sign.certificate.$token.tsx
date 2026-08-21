import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCertificate } from "@/lib/documents.functions";

export const Route = createFileRoute("/sign/certificate/$token")({
  head: () => ({ meta: [{ title: "Signed copy — hrppl" }] }),
  component: CertificatePage,
});

function CertificatePage() {
  const { token } = useParams({ from: "/sign/certificate/$token" });
  const get = useServerFn(getCertificate);
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; html?: string; error?: string }>({ status: "loading" });

  useEffect(() => {
    get({ data: { token } })
      .then((r) => setState({ status: "ok", html: r.html }))
      .catch((e: any) => setState({ status: "error", error: e?.message ?? "Not available" }));
  }, [token]);

  if (state.status === "loading") {
    return <div className="p-8 text-center text-muted-foreground">Loading signed copy…</div>;
  }
  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold">Signed copy unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{state.error}</p>
      </div>
    );
  }
  return (
    <iframe
      title="Signed document"
      className="h-screen w-screen border-0"
      // Sandbox keeps the certificate HTML isolated from app context
      sandbox="allow-scripts allow-modals allow-popups"
      srcDoc={state.html}
    />
  );
}
