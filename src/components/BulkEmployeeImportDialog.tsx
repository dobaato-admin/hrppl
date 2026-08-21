import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { bulkImportEmployees, listLeaveTypeCodes } from "@/lib/employees-bulk.functions";
import { parseCSV, toCSV, downloadCSV } from "@/lib/csv";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

const CORE_COLUMNS = [
  "employee_number",
  "first_name",
  "last_name",
  "email",
  "phone",
  "job_title",
  "department_name",
  "manager_email",
  "employment_type",
  "hire_date",
  "base_salary",
  "hourly_rate",
  "pay_frequency",
  "currency_code",
  "tax_treatment_code",
  "income_type",
  "employment_basis",
  "tfn",
  "tfn_status",
  "super_fund_name",
  "super_member_number",
  "bank_name",
  "bank_bsb",
  "bank_account_number",
  "bank_account_name",
  "next_of_kin_name",
  "next_of_kin_relationship",
  "next_of_kin_phone",
] as const;

const YTD_COLUMNS = [
  "ytd_financial_year",
  "ytd_gross",
  "ytd_taxable",
  "ytd_paye_tax",
  "ytd_super_guarantee",
  "ytd_super_salary_sacrifice",
  "ytd_super_employee_voluntary",
  "ytd_allowances",
  "ytd_deductions",
  "ytd_reportable_fringe_benefits",
] as const;

const EXAMPLE_ROW: Record<string, string | number> = {
  employee_number: "EMP-0001",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane.doe@example.com",
  phone: "+61400000000",
  job_title: "Software Engineer",
  department_name: "Engineering",
  manager_email: "",
  employment_type: "full_time",
  hire_date: "2025-07-01",
  base_salary: 95000,
  hourly_rate: "",
  pay_frequency: "fortnightly",
  currency_code: "AUD",
  tax_treatment_code: "RTRTAA",
  income_type: "SAW",
  employment_basis: "FULL_TIME",
  tfn: "123456782",
  tfn_status: "provided",
  super_fund_name: "AustralianSuper",
  super_member_number: "AS-1234",
  bank_name: "CBA",
  bank_bsb: "062-000",
  bank_account_number: "12345678",
  bank_account_name: "Jane Doe",
  next_of_kin_name: "John Doe",
  next_of_kin_relationship: "Spouse",
  next_of_kin_phone: "+61400000001",
  ytd_financial_year: 2026,
  ytd_gross: 25000,
  ytd_taxable: 25000,
  ytd_paye_tax: 5500,
  ytd_super_guarantee: 2875,
  ytd_super_salary_sacrifice: 0,
  ytd_super_employee_voluntary: 0,
  ytd_allowances: 0,
  ytd_deductions: 0,
  ytd_reportable_fringe_benefits: 0,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onImported: () => void;
}

const REQUIRED_COLUMNS = ["first_name", "last_name", "email", "hire_date", "employment_type"] as const;
const EMPLOYMENT_TYPES = ["full_time", "part_time", "casual", "contractor", "intern", "fixed_term"];
const PAY_FREQUENCIES = ["weekly", "fortnightly", "monthly", "quarterly", "annually"];
const TFN_STATUSES = ["provided", "applied_for", "exempt", "not_provided"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BSB_RE = /^\d{3}-?\d{3}$/;
const NUMERIC_FIELDS = [
  "base_salary", "hourly_rate",
  "ytd_financial_year", "ytd_gross", "ytd_taxable", "ytd_paye_tax",
  "ytd_super_guarantee", "ytd_super_salary_sacrifice", "ytd_super_employee_voluntary",
  "ytd_allowances", "ytd_deductions", "ytd_reportable_fringe_benefits",
];

type RowError = { row: number; email?: string; error: string };

function validateRow(
  obj: Record<string, unknown>,
  rowNum: number,
  knownLeaveCodes: Set<string>,
  seenEmails: Map<string, number>,
): RowError[] {
  const errs: RowError[] = [];
  const email = typeof obj.email === "string" ? obj.email.trim().toLowerCase() : "";
  const push = (msg: string) => errs.push({ row: rowNum, email: email || undefined, error: msg });

  for (const k of REQUIRED_COLUMNS) {
    if (!obj[k] || String(obj[k]).trim() === "") push(`Missing required field: ${k}`);
  }
  if (email && !EMAIL_RE.test(email)) push(`Invalid email format: ${email}`);
  if (email) {
    const prior = seenEmails.get(email);
    if (prior) push(`Duplicate email in file (also on row ${prior})`);
    else seenEmails.set(email, rowNum);
  }
  if (obj.manager_email && !EMAIL_RE.test(String(obj.manager_email))) push(`Invalid manager_email`);
  if (obj.hire_date && !DATE_RE.test(String(obj.hire_date))) push(`hire_date must be YYYY-MM-DD`);
  if (obj.employment_type && !EMPLOYMENT_TYPES.includes(String(obj.employment_type))) {
    push(`employment_type must be one of: ${EMPLOYMENT_TYPES.join(", ")}`);
  }
  if (obj.pay_frequency && !PAY_FREQUENCIES.includes(String(obj.pay_frequency))) {
    push(`pay_frequency must be one of: ${PAY_FREQUENCIES.join(", ")}`);
  }
  if (obj.tfn_status && !TFN_STATUSES.includes(String(obj.tfn_status))) {
    push(`tfn_status must be one of: ${TFN_STATUSES.join(", ")}`);
  }
  if (obj.tfn && !/^\d{8,9}$/.test(String(obj.tfn).replace(/\s/g, ""))) {
    push(`tfn must be 8-9 digits`);
  }
  if (obj.bank_bsb && !BSB_RE.test(String(obj.bank_bsb))) push(`bank_bsb must be 6 digits (e.g. 062-000)`);
  if (obj.currency_code && !/^[A-Z]{3}$/.test(String(obj.currency_code))) push(`currency_code must be a 3-letter ISO code`);
  if (!obj.base_salary && !obj.hourly_rate) push(`Provide base_salary or hourly_rate`);
  for (const f of NUMERIC_FIELDS) {
    if (obj[f] != null && obj[f] !== "" && Number.isNaN(Number(obj[f]))) push(`${f} must be a number`);
  }
  const lb = obj.leave_balances as Record<string, number> | undefined;
  if (lb) {
    for (const [code, val] of Object.entries(lb)) {
      if (Number.isNaN(val)) push(`leave_${code} must be a number`);
      if (knownLeaveCodes.size && !knownLeaveCodes.has(code)) push(`Unknown leave type: ${code}`);
    }
  }
  return errs;
}

export function BulkEmployeeImportDialog({ open, onOpenChange, tenantId, onImported }: Props) {
  const listFn = useServerFn(listLeaveTypeCodes);
  const importFn = useServerFn(bulkImportEmployees);
  const [leaveCodes, setLeaveCodes] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<RowError[] | null>(null);
  const [results, setResults] = useState<{ summary: { total: number; created: number; updated: number; errors: number }; results: Array<{ row: number; status: string; email?: string; error?: string }> } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || !tenantId) return;
    listFn({ data: { tenant_id: tenantId } })
      .then((r) => setLeaveCodes(r.leave_types.map((t) => t.code)))
      .catch(() => setLeaveCodes([]));
  }, [open, tenantId, listFn]);

  const leaveColumns = useMemo(() => leaveCodes.map((c) => `leave_${c}`), [leaveCodes]);
  const allColumns = useMemo(
    () => [...CORE_COLUMNS, ...leaveColumns, ...YTD_COLUMNS],
    [leaveColumns],
  );

  function handleDownloadTemplate() {
    const header = allColumns;
    const example: (string | number | null)[] = header.map((h) => {
      if (h.startsWith("leave_")) return 0;
      return (EXAMPLE_ROW[h] as string | number | undefined) ?? "";
    });
    const csv = toCSV([header as unknown as string[], example]);
    downloadCSV("employee-bulk-import-template.csv", csv);
  }

  async function handleFile(file: File) {
    setRunning(true);
    setResults(null);
    setValidationErrors(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("CSV is empty");
      const header = rows[0].map((h) => h.trim());

      const requiredMissing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
      if (requiredMissing.length) {
        throw new Error(`CSV is missing required columns: ${requiredMissing.join(", ")}`);
      }

      const body = rows.slice(1).filter((r) => r.some((v) => v && v.trim() !== ""));
      const knownLeave = new Set(leaveCodes);
      const seenEmails = new Map<string, number>();
      const allErrors: RowError[] = [];

      const payload = body.map((r, idx) => {
        const obj: Record<string, unknown> = { leave_balances: {} as Record<string, number> };
        header.forEach((col, ci) => {
          const raw = (r[ci] ?? "").trim();
          if (col.startsWith("leave_")) {
            if (raw === "") return;
            (obj.leave_balances as Record<string, number>)[col.slice("leave_".length)] = Number(raw);
            return;
          }
          if (raw === "") return;
          obj[col] = raw;
        });
        const rowErrs = validateRow(obj, idx + 2, knownLeave, seenEmails);
        allErrors.push(...rowErrs);
        return obj;
      });

      if (allErrors.length) {
        setValidationErrors(allErrors);
        toast.error(`Found ${allErrors.length} issue(s) across ${new Set(allErrors.map((e) => e.row)).size} row(s). Fix the CSV and try again — nothing was imported.`);
        return;
      }

      const res = await importFn({ data: { tenant_id: tenantId, rows: payload } });
      setResults(res);
      const { summary } = res;
      if (summary.errors === 0) {
        toast.success(`Imported ${summary.created} new, updated ${summary.updated}.`);
      } else {
        toast.warning(`${summary.errors} row(s) had errors. Review the table below.`);
      }
      onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setRunning(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk import employees</DialogTitle>
          <DialogDescription>
            Download the CSV template, fill in one employee per row (including leave opening balances and YTD figures for mid-year imports), then upload it here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Template includes</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Core: name, email, phone, job title, department, manager email, employment type, hire date.</li>
                  <li>Pay: base_salary, hourly_rate, pay_frequency, currency_code.</li>
                  <li>AU payroll: TFN, tax_treatment_code, income_type, employment_basis, super fund &amp; member, bank BSB/account.</li>
                  <li>Leave opening balances: one column per leave type (<span className="font-mono">leave_&lt;code&gt;</span>).</li>
                  <li>YTD opening: gross, taxable, PAYG, super (SG / sacrifice / voluntary), allowances, deductions, RFB.</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Rows are matched by email — existing employees in the same org will be updated, not duplicated.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Download CSV template
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={running}>
              <Upload className="h-4 w-4 mr-2" /> {running ? "Importing…" : "Upload CSV"}
            </Button>
          </div>

          {validationErrors && validationErrors.length > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm space-y-2">
              <div className="text-xs font-medium text-destructive">
                {validationErrors.length} validation issue(s) — nothing was imported. Fix the CSV and re-upload.
              </div>
              <div className="max-h-48 overflow-auto text-xs">
                <table className="w-full">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1">Row</th><th>Email</th><th>Issue</th></tr></thead>
                  <tbody>
                    {validationErrors.map((e, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-1 pr-2">{e.row}</td>
                        <td className="pr-2">{e.email ?? "—"}</td>
                        <td className="text-destructive">{e.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results && (
            <div className="rounded-lg border p-3 text-sm space-y-2">
              <div className="flex gap-4 text-xs">
                <span><strong>{results.summary.total}</strong> rows</span>
                <span className="text-green-700">created {results.summary.created}</span>
                <span className="text-blue-700">updated {results.summary.updated}</span>
                <span className="text-red-700">errors {results.summary.errors}</span>
              </div>
              {results.summary.errors > 0 && (
                <div className="max-h-48 overflow-auto text-xs">
                  <table className="w-full">
                    <thead><tr className="text-left text-muted-foreground"><th className="py-1">Row</th><th>Email</th><th>Error</th></tr></thead>
                    <tbody>
                      {results.results.filter((r) => r.status === "error").map((r) => (
                        <tr key={r.row} className="border-t">
                          <td className="py-1 pr-2">{r.row}</td>
                          <td className="pr-2">{r.email ?? "—"}</td>
                          <td className="text-red-700">{r.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
