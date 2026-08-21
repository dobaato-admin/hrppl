import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface EmpPay {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  hire_date: string;
  base_salary: number | null;
  hourly_rate: number | null;
  pay_frequency: string | null;
  currency_code: string | null;
}

const FREQS = ["hourly", "weekly", "fortnightly", "monthly", "annually"];

export function PaySetupPanel({ tenantId, tenantCurrency }: { tenantId: string; tenantCurrency: string }) {
  const [rows, setRows] = useState<EmpPay[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<EmpPay>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"missing" | "all">("missing");

  async function load() {
    const { data } = await supabase
      .from("employees")
      .select("id,employee_number,first_name,last_name,job_title,hire_date,base_salary,hourly_rate,pay_frequency,currency_code")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("hire_date", { ascending: false });
    setRows((data ?? []) as EmpPay[]);
  }

  useEffect(() => { load(); }, [tenantId]);

  const visible = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.pay_frequency == null || (r.base_salary == null && r.hourly_rate == null));
  }, [rows, filter]);

  const missingCount = rows.filter((r) => r.pay_frequency == null || (r.base_salary == null && r.hourly_rate == null)).length;

  function patch(id: string, key: keyof EmpPay, value: string | number | null) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));
  }

  async function save(emp: EmpPay) {
    const d = drafts[emp.id] ?? {};
    const payload: { base_salary?: number | null; hourly_rate?: number | null; pay_frequency?: string | null } = {};
    if ("base_salary" in d) payload.base_salary = d.base_salary == null ? null : Number(d.base_salary);
    if ("hourly_rate" in d) payload.hourly_rate = d.hourly_rate == null ? null : Number(d.hourly_rate);
    if ("pay_frequency" in d) payload.pay_frequency = d.pay_frequency || null;
    if (Object.keys(payload).length === 0) return toast.info("No changes");
    setSavingId(emp.id);
    const { error } = await supabase.from("employees").update(payload).eq("id", emp.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(`Pay set for ${emp.first_name} ${emp.last_name}`);
    setDrafts((d) => { const c = { ...d }; delete c[emp.id]; return c; });
    load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Set pay for new joinees</CardTitle>
          <CardDescription>
            Enter the hourly rate, base salary, and pay frequency for each new joinee before their first pay run.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {missingCount > 0 ? (
            <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> {missingCount} missing</Badge>
          ) : (
            <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> All set</Badge>
          )}
          <Select value={filter} onValueChange={(v) => setFilter(v as "missing" | "all")}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="missing">Missing pay only</SelectItem>
              <SelectItem value="all">All active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filter === "missing" ? "Every active employee has pay configured. 🎉" : "No active employees."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Hire date</TableHead>
                  <TableHead className="w-[140px]">Hourly rate</TableHead>
                  <TableHead className="w-[140px]">Base salary</TableHead>
                  <TableHead className="w-[150px]">Frequency</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((emp) => {
                  const d = drafts[emp.id] ?? {};
                  const cur = emp.currency_code ?? tenantCurrency;
                  const hr = (d.hourly_rate ?? emp.hourly_rate ?? "") as number | string;
                  const sal = (d.base_salary ?? emp.base_salary ?? "") as number | string;
                  const freq = (d.pay_frequency ?? emp.pay_frequency ?? "") as string;
                  const dirty = Object.keys(d).length > 0;
                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                        <div className="text-xs text-muted-foreground">{emp.employee_number} · {emp.job_title ?? "—"}</div>
                      </TableCell>
                      <TableCell className="text-xs">{emp.hire_date}</TableCell>
                      <TableCell>
                        <Input
                          type="number" step="0.0001" placeholder={cur}
                          value={hr}
                          onChange={(e) => patch(emp.id, "hourly_rate", e.target.value === "" ? null : Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" step="0.01" placeholder={cur}
                          value={sal}
                          onChange={(e) => patch(emp.id, "base_salary", e.target.value === "" ? null : Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={freq || "none"} onValueChange={(v) => patch(emp.id, "pay_frequency", v === "none" ? null : v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— Not set —</SelectItem>
                            {FREQS.map((f) => <SelectItem key={f} value={f}>{f[0].toUpperCase() + f.slice(1)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" disabled={!dirty || savingId === emp.id} onClick={() => save(emp)}>
                          {savingId === emp.id ? "Saving…" : "Save"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
