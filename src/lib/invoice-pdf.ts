import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoicePdfData {
  invoice: {
    invoice_number: string;
    status: string;
    issue_date: string;
    due_date?: string | null;
    currency_code: string;
    subtotal: number | string;
    tax_total: number | string;
    total: number | string;
    notes?: string | null;
    terms?: string | null;
    clients?: { name?: string | null; billing_address?: string | null; contact_email?: string | null } | null;
  };
  lines: Array<{
    description: string;
    quantity: number | string;
    unit_price: number | string;
    tax_rate: number | string;
    line_total: number | string;
  }>;
  tenant?: { name?: string | null } | null;
}

export function buildInvoicePdf({ invoice, lines, tenant }: InvoicePdfData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const cur = invoice.currency_code;
  const money = (n: number | string) =>
    `${cur} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Header
  doc.setFontSize(20).setFont("helvetica", "bold");
  doc.text("INVOICE", 40, 50);
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text(`#${invoice.invoice_number}`, 40, 68);

  if (tenant?.name) {
    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text(tenant.name, 555, 50, { align: "right" });
  }

  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 555, 68, { align: "right" });

  // Bill to
  doc.setFont("helvetica", "bold").text("Bill to", 40, 110);
  doc.setFont("helvetica", "normal");
  const billLines = [
    invoice.clients?.name ?? "",
    invoice.clients?.billing_address ?? "",
    invoice.clients?.contact_email ?? "",
  ].filter(Boolean);
  billLines.forEach((l, i) => doc.text(String(l), 40, 126 + i * 14));

  // Dates
  doc.setFont("helvetica", "bold").text("Issue date", 400, 110);
  doc.setFont("helvetica", "normal").text(invoice.issue_date, 470, 110);
  doc.setFont("helvetica", "bold").text("Due date", 400, 126);
  doc.setFont("helvetica", "normal").text(invoice.due_date ?? "—", 470, 126);

  // Lines
  autoTable(doc, {
    startY: 200,
    head: [["Description", "Qty", "Unit price", "Tax %", "Total"]],
    body: lines.map((l) => [
      l.description,
      Number(l.quantity).toString(),
      money(l.unit_price),
      `${Number(l.tax_rate).toFixed(2)}%`,
      money(l.line_total),
    ]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  const endY = (doc as any).lastAutoTable.finalY + 20;
  const totalsX = 555;
  const labelX = 420;
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text("Subtotal", labelX, endY);
  doc.text(money(invoice.subtotal), totalsX, endY, { align: "right" });
  doc.text("Tax", labelX, endY + 16);
  doc.text(money(invoice.tax_total), totalsX, endY + 16, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text("Total", labelX, endY + 34);
  doc.text(money(invoice.total), totalsX, endY + 34, { align: "right" });

  let y = endY + 70;
  if (invoice.notes) {
    doc.setFont("helvetica", "bold").text("Notes", 40, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(invoice.notes, 515);
    doc.text(wrapped, 40, y + 14);
    y += 14 + wrapped.length * 12 + 14;
  }
  if (invoice.terms) {
    doc.setFont("helvetica", "bold").text("Terms", 40, y);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(invoice.terms, 515);
    doc.text(wrapped, 40, y + 14);
  }

  return { doc, filename: `invoice-${invoice.invoice_number}.pdf` };
}

export function generateInvoicePdf(data: InvoicePdfData) {
  const { doc, filename } = buildInvoicePdf(data);
  doc.save(filename);
}

