import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfPayslip {
  id: string;
  currency_code: string;
  gross: number;
  income_tax: number;
  employee_contributions: number;
  employer_contributions: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  lines: Array<{ code: string; label: string; category: string; amount: number | string }>;
  accruals?: Array<{ leave_type: string; opening: number; accrued: number; taken: number; balance: number }>;
}
export interface PdfRun {
  period_start: string;
  period_end: string;
  pay_date: string;
}
export interface PdfEmployee {
  first_name: string;
  last_name: string;
  employee_number: string;
  email: string;
  job_title?: string | null;
}
export interface PdfTenant {
  name: string;
  country_code: string;
}

export function generatePayslipPdf(opts: {
  payslip: PdfPayslip;
  run: PdfRun;
  employee: PdfEmployee;
  tenant: PdfTenant;
}) {
  const { doc, filename } = buildPayslipPdf(opts);
  doc.save(filename);
}

/** Server-safe: returns the PDF bytes and a filename. Does not touch the DOM. */
export function renderPayslipPdfBytes(opts: {
  payslip: PdfPayslip;
  run: PdfRun;
  employee: PdfEmployee;
  tenant: PdfTenant;
}): { bytes: Uint8Array; filename: string } {
  const { doc, filename } = buildPayslipPdf(opts);
  const ab = doc.output("arraybuffer") as ArrayBuffer;
  return { bytes: new Uint8Array(ab), filename };
}

function buildPayslipPdf(opts: {
  payslip: PdfPayslip;
  run: PdfRun;
  employee: PdfEmployee;
  tenant: PdfTenant;
}): { doc: jsPDF; filename: string } {

  const { payslip, run, employee, tenant } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: payslip.currency_code }).format(Number(n) || 0);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("PAYSLIP", M, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(tenant.name, W - M, 50, { align: "right" });
  doc.text(`Country: ${tenant.country_code}`, W - M, 64, { align: "right" });

  doc.setDrawColor(220);
  doc.line(M, 78, W - M, 78);

  // Employee + period block
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Employee", M, 100);
  doc.text("Pay period", W / 2, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`${employee.first_name} ${employee.last_name}`, M, 116);
  doc.text(`# ${employee.employee_number}`, M, 130);
  if (employee.job_title) doc.text(employee.job_title, M, 144);
  doc.text(employee.email, M, 158);

  doc.text(`${run.period_start} → ${run.period_end}`, W / 2, 116);
  doc.text(`Pay date: ${run.pay_date}`, W / 2, 130);
  doc.text(`Currency: ${payslip.currency_code}`, W / 2, 144);

  // Line items table
  autoTable(doc, {
    startY: 180,
    head: [["Code", "Description", "Category", "Amount"]],
    body: (payslip.lines ?? []).map((l) => [
      l.code,
      l.label,
      l.category,
      fmt(Number(l.amount)),
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    columnStyles: { 3: { halign: "right" } },
    margin: { left: M, right: M },
    theme: "striped",
  });

  // Totals
  // @ts-ignore - autoTable adds lastAutoTable
  const afterY: number = (doc as any).lastAutoTable.finalY + 20;
  const rows: Array<[string, string]> = [
    ["Gross", fmt(payslip.gross)],
    ["Allowances", fmt(payslip.allowances)],
    ["Deductions", fmt(payslip.deductions)],
    ["Employee contributions", fmt(payslip.employee_contributions)],
    ["Employer contributions", fmt(payslip.employer_contributions)],
    ["Income tax", fmt(payslip.income_tax)],
  ];
  doc.setFontSize(10);
  rows.forEach(([label, value], i) => {
    const y = afterY + i * 16;
    doc.setFont("helvetica", "normal");
    doc.text(label, W / 2, y);
    doc.text(value, W - M, y, { align: "right" });
  });

  const netY = afterY + rows.length * 16 + 12;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1);
  doc.line(W / 2, netY - 8, W - M, netY - 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Net pay", W / 2, netY + 4);
  doc.text(fmt(payslip.net_pay), W - M, netY + 4, { align: "right" });

  // Leave accruals (optional)
  if (payslip.accruals && payslip.accruals.length > 0) {
    autoTable(doc, {
      startY: netY + 24,
      head: [["Leave type", "Opening", "Accrued", "Taken", "Balance (days)"]],
      body: payslip.accruals.map((a) => [
        a.leave_type,
        Number(a.opening).toFixed(2),
        Number(a.accrued).toFixed(2),
        Number(a.taken).toFixed(2),
        Number(a.balance).toFixed(2),
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
      margin: { left: M, right: M },
      theme: "striped",
    });
  }

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `Generated ${new Date().toISOString().slice(0, 10)} · Payslip ID ${payslip.id}`,
    M,
    doc.internal.pageSize.getHeight() - 20,
  );

  const filename = `payslip-${employee.employee_number}-${run.period_start}_${run.period_end}.pdf`;
  return { doc, filename };
}

