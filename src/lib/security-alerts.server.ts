import { sendInternalEmail } from "@/lib/email/send-internal.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ScanFindingInput {
  scanner_name: string;
  internal_id: string;
  title: string;
  severity: "error" | "warn" | "info";
  status?: "open" | "fixed" | "ignored" | "accepted_risk";
  description?: string;
  remediation?: string;
  scanned_at?: string;
}

/**
 * Upsert findings into security_findings_log and, for any ERROR-level finding
 * that is freshly opened (no prior identical scanner_name + internal_id row in
 * 'open' state), fan out email + webhook alerts to every super_admin.
 *
 * Idempotent: re-running the same scan does NOT duplicate alerts because we
 * only alert on transitions OPEN -> NEW.
 */
export async function ingestFindingsAndAlert(findings: ScanFindingInput[]): Promise<{
  inserted: number; alerted: number;
}> {
  let inserted = 0;
  let alerted = 0;
  const newErrorFindings: Array<ScanFindingInput & { id: string }> = [];

  for (const f of findings) {
    const scanned_at = f.scanned_at ?? new Date().toISOString();
    // Did this finding already exist and is still open?
    const { data: existing } = await supabaseAdmin
      .from("security_findings_log")
      .select("id,status")
      .eq("scanner_name", f.scanner_name)
      .eq("internal_id", f.internal_id)
      .order("scanned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Refresh scan timestamp only; don't reopen if a human has resolved it.
      await supabaseAdmin
        .from("security_findings_log")
        .update({ scanned_at } as never)
        .eq("id", existing.id);
      continue;
    }

    const { data: row, error } = await supabaseAdmin
      .from("security_findings_log")
      .insert({
        scanner_name: f.scanner_name,
        internal_id: f.internal_id,
        title: f.title,
        severity: f.severity,
        status: f.status ?? "open",
        description: f.description ?? null,
        remediation: f.remediation ?? null,
        scanned_at,
      } as never)
      .select("id")
      .single();
    if (error || !row) continue;
    inserted += 1;
    if (f.severity === "error" && (f.status ?? "open") === "open") {
      newErrorFindings.push({ ...f, id: (row as any).id });
    }
  }

  if (!newErrorFindings.length) return { inserted, alerted };

  // Find super admin recipients.
  const { data: superRoles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin");
  const superIds = (superRoles ?? []).map((r: any) => r.user_id as string);
  if (!superIds.length) return { inserted, alerted };
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name")
    .in("id", superIds);
  const recipients = (profiles ?? []).filter((p: any) => p.email);

  // Tenant-level webhook URL(s)
  const { data: governance } = await supabaseAdmin
    .from("tenant_governance")
    .select("tenant_id, security_alert_webhook_url")
    .not("security_alert_webhook_url", "is", null);

  for (const finding of newErrorFindings) {
    // Email super admins
    for (const r of recipients) {
      try {
        await sendInternalEmail({
          templateName: "security-finding-alert",
          recipientEmail: (r as any).email,
          templateData: {
            recipientName: (r as any).full_name ?? "Admin",
            scannerName: finding.scanner_name,
            severity: finding.severity,
            title: finding.title,
            description: finding.description,
            internalId: finding.internal_id,
            scannedAt: finding.scanned_at,
            findingsUrl: "https://hrppl.io/admin/security",
            errorCount: newErrorFindings.length,
          },
        });
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "email",
          recipient: (r as any).email,
          status: "sent",
          sent_at: new Date().toISOString(),
        } as never);
        alerted += 1;
      } catch (err: any) {
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "email",
          recipient: (r as any).email,
          status: "failed",
          error_message: String(err?.message ?? err),
        } as never);
      }
    }

    // Webhook fan-out
    for (const g of governance ?? []) {
      const url = (g as any).security_alert_webhook_url as string;
      if (!url) continue;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "security.finding.error",
            occurred_at: new Date().toISOString(),
            finding: {
              id: finding.id,
              scanner_name: finding.scanner_name,
              internal_id: finding.internal_id,
              severity: finding.severity,
              title: finding.title,
              description: finding.description,
              scanned_at: finding.scanned_at,
            },
          }),
        });
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "webhook",
          recipient: url,
          status: res.ok ? "sent" : "failed",
          error_message: res.ok ? null : `HTTP ${res.status}`,
          sent_at: res.ok ? new Date().toISOString() : null,
        } as never);
        if (res.ok) alerted += 1;
      } catch (err: any) {
        await supabaseAdmin.from("security_scan_alerts").insert({
          finding_id: finding.id,
          scanner_name: finding.scanner_name,
          internal_id: finding.internal_id,
          severity: finding.severity,
          title: finding.title,
          channel: "webhook",
          recipient: url,
          status: "failed",
          error_message: String(err?.message ?? err),
        } as never);
      }
    }
  }

  return { inserted, alerted };
}
