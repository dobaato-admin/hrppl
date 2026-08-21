import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ChecklistKind = "onboarding" | "offboarding";

export interface ChecklistPdfItem {
  label: string;
  required?: boolean;
  stage?: string | null;
  category?: string | null;
  owner_role?: string | null;
  due_offset_days?: number | null;
}

export interface ChecklistPdfPack {
  name: string;
  kind: ChecklistKind;
  description?: string | null;
  country_code?: string | null;
  branch_name?: string | null;
  department_name?: string | null;
  employment_type?: string | null;
  is_default?: boolean;
  is_system_seed?: boolean;
  items: ChecklistPdfItem[];
  comms_channels?: string[];
}

const COMMS_DEFAULT = [
  "Email / SSO",
  "Slack",
  "Microsoft Teams",
  "WhatsApp groups",
  "Telegram",
  "Viber",
  "Messenger",
  "Trello / Jira",
  "Google Drive / OneDrive shared folders",
  "GitHub / GitLab",
  "Internal CRM / ERP",
];

export function downloadChecklistPdf(pack: ChecklistPdfPack, tenantName = "hrppl") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${pack.kind === "onboarding" ? "Onboarding" : "Offboarding"} checklist`, margin, y);
  y += 22;
  doc.setFontSize(13);
  doc.text(pack.name, margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(tenantName, margin, y);
  doc.text(new Date().toLocaleString(), pageWidth - margin, y, { align: "right" });
  y += 16;
  doc.setTextColor(0);

  // Scope chips
  const scopeLines: string[] = [];
  if (pack.country_code) scopeLines.push(`Country: ${pack.country_code}`);
  if (pack.branch_name) scopeLines.push(`Branch: ${pack.branch_name}`);
  if (pack.department_name) scopeLines.push(`Department: ${pack.department_name}`);
  if (pack.employment_type) scopeLines.push(`Employment type: ${pack.employment_type}`);
  if (pack.is_default) scopeLines.push("Default");
  if (pack.is_system_seed) scopeLines.push("System seed");
  if (scopeLines.length) {
    doc.setFontSize(10);
    doc.text(scopeLines.join("  •  "), margin, y);
    y += 16;
  }

  if (pack.description) {
    doc.setFontSize(10);
    const split = doc.splitTextToSize(pack.description, pageWidth - margin * 2);
    doc.text(split, margin, y);
    y += split.length * 12 + 6;
  }

  // Steps table
  autoTable(doc, {
    startY: y + 4,
    head: [["#", "Step", "Stage / Category", "Owner", "Due", "Required", "Done"]],
    body: pack.items.map((it, i) => [
      String(i + 1),
      it.label,
      it.stage || it.category || "—",
      it.owner_role || "—",
      it.due_offset_days != null ? `${it.due_offset_days}d` : "—",
      it.required === false ? "Optional" : "Yes",
      "☐",
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 24 },
      4: { cellWidth: 36, halign: "center" },
      5: { cellWidth: 56, halign: "center" },
      6: { cellWidth: 36, halign: "center" },
    },
    margin: { left: margin, right: margin },
  });

  // Offboarding: comms channel removal section
  if (pack.kind === "offboarding") {
    const channels = pack.comms_channels && pack.comms_channels.length ? pack.comms_channels : COMMS_DEFAULT;
    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 40;
    let cy = finalY + 24;
    if (cy > 720) { doc.addPage(); cy = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Communication channel removal & evidence", margin, cy);
    cy += 6;
    autoTable(doc, {
      startY: cy + 6,
      head: [["Channel", "Removed by", "Date", "Evidence ref", "Verifier signature"]],
      body: channels.map((c) => [c, "", "", "", ""]),
      styles: { fontSize: 9, cellPadding: 6, minCellHeight: 22 },
      headStyles: { fillColor: [127, 29, 29] },
      margin: { left: margin, right: margin },
    });

    const fY = (doc as any).lastAutoTable?.finalY ?? cy + 40;
    let sy = fY + 24;
    if (sy > 720) { doc.addPage(); sy = margin; }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Final attestation:", margin, sy); sy += 14;
    doc.text("I confirm the employee has been removed from all communication channels listed above and that any", margin, sy); sy += 12;
    doc.text("shared documents, drives, and external accounts have been transferred or revoked.", margin, sy); sy += 24;
    doc.text("HR signature: ____________________   Date: ____________", margin, sy); sy += 18;
    doc.text("Manager signature: _______________   Date: ____________", margin, sy); sy += 18;
    doc.text("IT signature: ____________________   Date: ____________", margin, sy);
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 20, { align: "right" });
    doc.setTextColor(0);
  }

  const safeName = pack.name.replace(/[^a-z0-9-]+/gi, "_").slice(0, 60);
  doc.save(`${pack.kind}_checklist_${safeName}.pdf`);
}
