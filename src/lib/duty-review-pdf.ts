import { jsPDF } from "jspdf";

interface ReviewLine {
  duty_title: string;
  weight: number;
  target: string | null;
  submitter: string | null;
  score: number | null;
  weighted_contribution: number | null;
  comments: string;
  updated_at: string | null;
}

interface ReviewEmployee {
  employee: { first_name: string | null; last_name: string | null; email: string | null; job_title: string | null };
  lines: ReviewLine[];
  total_weight: number;
  final_score: number | null;
}

export interface DutyReviewExport {
  tenant_name: string;
  cycle: { label: string; starts_on: string | null; ends_on: string | null; status: string | null };
  generated_at: string;
  employees: ReviewEmployee[];
}

export function generateDutyReviewPdf(payload: DutyReviewExport): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const addLine = (text: string, size = 10, bold = false) => {
    if (y > pageH - margin) { doc.addPage(); y = margin; }
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const wrapped = doc.splitTextToSize(text, pageW - margin * 2);
    for (const ln of wrapped) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(ln, margin, y);
      y += size + 4;
    }
  };

  const hr = () => {
    if (y > pageH - margin - 6) { doc.addPage(); y = margin; }
    doc.setDrawColor(200);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
  };

  addLine(payload.tenant_name, 18, true);
  addLine(`Duty-based performance report — Cycle ${payload.cycle.label}`, 13, true);
  const range = [payload.cycle.starts_on, payload.cycle.ends_on].filter(Boolean).join(" → ");
  if (range) addLine(`Period: ${range}  ·  Status: ${payload.cycle.status ?? "—"}`, 10);
  addLine(`Generated: ${new Date(payload.generated_at).toLocaleString()}`, 9);
  hr();

  if (payload.employees.length === 0) {
    addLine("No submitted scores for this cycle.", 11);
  }

  for (const emp of payload.employees) {
    const name = `${emp.employee.first_name ?? ""} ${emp.employee.last_name ?? ""}`.trim() || (emp.employee.email ?? "Employee");
    addLine(name, 13, true);
    if (emp.employee.job_title) addLine(emp.employee.job_title, 10);
    if (emp.employee.email) addLine(emp.employee.email, 9);
    addLine(
      `Total weight: ${emp.total_weight}%  ·  Final score: ${emp.final_score == null ? "—" : `${emp.final_score} / 100`}`,
      11, true,
    );
    y += 4;

    // Table header
    const colX = [margin, margin + 200, margin + 250, margin + 295, margin + 345, margin + 405];
    const drawRow = (cells: string[], bold = false) => {
      if (y > pageH - margin - 14) { doc.addPage(); y = margin; }
      doc.setFontSize(9);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(cells[0], colX[0], y);
      doc.text(cells[1], colX[1], y);
      doc.text(cells[2], colX[2], y);
      doc.text(cells[3], colX[3], y);
      doc.text(cells[4], colX[4], y);
      doc.text(cells[5], colX[5], y);
      y += 12;
    };
    drawRow(["Duty", "Weight", "Score", "Weighted", "Submitter", "Comments"], true);
    doc.setDrawColor(220);
    doc.line(margin, y - 8, pageW - margin, y - 8);

    for (const ln of emp.lines) {
      const truncDuty = ln.duty_title.length > 38 ? ln.duty_title.slice(0, 35) + "…" : ln.duty_title;
      const truncCmt = (ln.comments ?? "").slice(0, 60);
      drawRow([
        truncDuty,
        `${ln.weight}%`,
        ln.score == null ? "—" : String(ln.score),
        ln.weighted_contribution == null ? "—" : String(ln.weighted_contribution),
        ln.submitter ?? "—",
        truncCmt,
      ]);
    }
    y += 8;
    hr();
  }

  // Footer page numbers
  const pages = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} / ${pages}`, pageW - margin, pageH - 16, { align: "right" });
    doc.setTextColor(0);
  }

  return doc.output("blob");
}
