import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { AuComplianceShell } from "@/components/AuComplianceShell";
import { EmptyState, SectionCard, StatusChip } from "@/components/monday";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenantCountry, useMyTenantId } from "@/hooks/use-tenant";
import { listSuperFunds, setEmployeeSuperChoice, upsertSuperFund } from "@/lib/super.functions";
import { Landmark, Plus } from "lucide-react";

/**
 * Super funds and employee fund choice (PRD M4).
 *
 * The register listed `upsertSuperFund`, `listSuperFunds` and
 * `setEmployeeSuperChoice` as built-but-unreachable. They were: the tables,
 * RLS and tests all existed and nothing in the product called them, so the
 * "no nominated fund" branch in `generateSuperContributionsForRun` — which
 * silently skips an employee — could never be resolved from the UI.
 *
 * Gated `org.auSuperFunds` (org_admin, finance, hr), mirroring
 * `super_funds admin write`. HR maintains the register and member numbers;
 * moving money is a different key, on the Payday Super page.
 */
export const Route = createFileRoute("/admin/super-funds")({
  head: () => ({ meta: [{ title: "Super funds — HRPPL" }] }),
  component: () => (
    <AdminGate feature="org.auSuperFunds">
      <SuperFundsPage />
    </AdminGate>
  ),
});

type Fund = {
  id: string;
  name: string;
  fund_type: "apra" | "smsf";
  abn: string | null;
  usi: string | null;
  smsf_esa: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
};

const BLANK = {
  name: "",
  fund_type: "apra" as const,
  abn: "",
  usi: "",
  smsf_esa: "",
  smsf_bsb: "",
  smsf_account_number: "",
  smsf_account_name: "",
  is_default: false,
  is_active: true,
};

function SuperFundsPage() {
  const { tenantId } = useMyTenantId();
  const { country } = useMyTenantCountry();
  const qc = useQueryClient();

  const fetchFunds = useServerFn(listSuperFunds);
  const fundsQ = useQuery({
    queryKey: ["au-super-funds", tenantId],
    queryFn: () => fetchFunds(),
    enabled: !!tenantId && country === "AU",
  });

  // Employees plus their current fund choice, for the Members tab. Filtered by
  // tenant_id here rather than trusted to RLS: the read policy on both tables
  // also passes unconditionally for super_admin, so an unscoped select returns
  // every tenant's people. See the Tenant scoping section in CLAUDE.md.
  const membersQ = useQuery({
    queryKey: ["au-super-members", tenantId],
    enabled: !!tenantId && country === "AU",
    queryFn: async () => {
      const { data: employees } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number, status")
        .eq("tenant_id", tenantId!)
        .order("first_name");
      const { data: choices } = await supabase
        .from("employee_super_choices")
        .select("employee_id, super_fund_id, member_number, effective_from")
        .eq("tenant_id", tenantId!)
        .order("effective_from", { ascending: false });
      return { employees: employees ?? [], choices: choices ?? [] };
    },
  });

  const funds = (fundsQ.data?.funds ?? []) as Fund[];

  /** Latest choice per employee — the list is ordered newest-first. */
  const choiceByEmployee = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of membersQ.data?.choices ?? []) {
      if (!m.has((c as any).employee_id)) m.set((c as any).employee_id, c);
    }
    return m;
  }, [membersQ.data]);

  const withoutFund = (membersQ.data?.employees ?? []).filter(
    (e: any) => !choiceByEmployee.has(e.id),
  );

  const [fundOpen, setFundOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Fund> & typeof BLANK>({ ...BLANK });
  const [choiceFor, setChoiceFor] = useState<any | null>(null);
  const [choiceFund, setChoiceFund] = useState("");
  const [memberNumber, setMemberNumber] = useState("");

  const saveFund = useServerFn(upsertSuperFund);
  const saveFundM = useMutation({
    mutationFn: (d: any) => saveFund({ data: d }),
    onSuccess: () => {
      toast.success("Fund saved");
      setFundOpen(false);
      qc.invalidateQueries({ queryKey: ["au-super-funds"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save the fund"),
  });

  const saveChoice = useServerFn(setEmployeeSuperChoice);
  const saveChoiceM = useMutation({
    mutationFn: (d: any) => saveChoice({ data: d }),
    onSuccess: () => {
      toast.success("Fund choice recorded");
      setChoiceFor(null);
      qc.invalidateQueries({ queryKey: ["au-super-members"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not record the choice"),
  });

  return (
    <AuComplianceShell
      title="Super funds"
      subtitle="The fund register, and which fund each employee has nominated"
      tenantId={tenantId}
      country={country}
      isLoading={fundsQ.isLoading || membersQ.isLoading}
      actions={
        <Button
          size="sm"
          onClick={() => {
            setEditing({ ...BLANK });
            setFundOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add fund
        </Button>
      }
    >
      {() => (
        <Tabs defaultValue="funds">
          <TabsList>
            <TabsTrigger value="funds">Funds ({funds.length})</TabsTrigger>
            <TabsTrigger value="members">
              Member choices
              {withoutFund.length > 0 ? ` (${withoutFund.length} missing)` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funds" className="mt-4">
            <SectionCard
              title="Fund register"
              description="APRA-regulated funds need a USI; a self-managed fund needs an ESA and bank details."
            >
              {funds.length === 0 ? (
                <EmptyState
                  icon={Landmark}
                  title="No super funds yet"
                  description="Add the default fund your organisation pays into. Employees with no nomination of their own are paid to the default."
                  action={
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditing({ ...BLANK, is_default: true });
                        setFundOpen(true);
                      }}
                    >
                      Add the default fund
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>ABN</TableHead>
                      <TableHead>USI / ESA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funds.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">
                          {f.name}
                          {f.is_default ? <StatusChip tone="primary">Default</StatusChip> : null}
                        </TableCell>
                        <TableCell className="uppercase">{f.fund_type}</TableCell>
                        <TableCell className="font-mono text-xs">{f.abn ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {f.fund_type === "smsf" ? (f.smsf_esa ?? "—") : (f.usi ?? "—")}
                        </TableCell>
                        <TableCell>
                          <StatusChip tone={f.is_active === false ? "stuck" : "done"}>
                            {f.is_active === false ? "Inactive" : "Active"}
                          </StatusChip>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing({ ...BLANK, ...(f as any) });
                              setFundOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <SectionCard
              title="Employee fund choice"
              description="An employee with no nominated fund is skipped when contributions are generated — silently, so this list is the only place it shows."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead>Member number</TableHead>
                    <TableHead>Effective from</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(membersQ.data?.employees ?? []).map((e: any) => {
                    const choice = choiceByEmployee.get(e.id);
                    const fund = funds.find((f) => f.id === choice?.super_fund_id);
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          {e.first_name} {e.last_name}
                          <span className="ml-2 font-mono text-xs text-muted-foreground">
                            {e.employee_number ?? ""}
                          </span>
                        </TableCell>
                        <TableCell>
                          {fund ? (
                            fund.name
                          ) : (
                            <StatusChip tone="stuck">No fund nominated</StatusChip>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {choice?.member_number ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {choice?.effective_from ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={funds.length === 0}
                            onClick={() => {
                              setChoiceFor(e);
                              setChoiceFund(choice?.super_fund_id ?? "");
                              setMemberNumber(choice?.member_number ?? "");
                            }}
                          >
                            {choice ? "Change" : "Nominate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </SectionCard>
          </TabsContent>

          <Dialog open={fundOpen} onOpenChange={setFundOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Edit fund" : "Add super fund"}</DialogTitle>
                <DialogDescription>
                  The fund details a SuperStream message needs. An APRA fund is identified by its
                  USI; a self-managed fund by its ESA and bank account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fund-name">Fund name</Label>
                  <Input
                    id="fund-name"
                    value={editing.name}
                    onChange={(ev) => setEditing({ ...editing, name: ev.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fund-type">Type</Label>
                    <Select
                      value={editing.fund_type}
                      onValueChange={(v) => setEditing({ ...editing, fund_type: v as any })}
                    >
                      <SelectTrigger id="fund-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apra">APRA-regulated</SelectItem>
                        <SelectItem value="smsf">Self-managed (SMSF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fund-abn">ABN</Label>
                    <Input
                      id="fund-abn"
                      value={editing.abn ?? ""}
                      onChange={(ev) => setEditing({ ...editing, abn: ev.target.value })}
                    />
                  </div>
                </div>
                {editing.fund_type === "apra" ? (
                  <div>
                    <Label htmlFor="fund-usi">USI</Label>
                    <Input
                      id="fund-usi"
                      value={editing.usi ?? ""}
                      onChange={(ev) => setEditing({ ...editing, usi: ev.target.value })}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fund-esa">ESA</Label>
                      <Input
                        id="fund-esa"
                        value={editing.smsf_esa ?? ""}
                        onChange={(ev) => setEditing({ ...editing, smsf_esa: ev.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fund-bsb">BSB</Label>
                      <Input
                        id="fund-bsb"
                        value={editing.smsf_bsb ?? ""}
                        onChange={(ev) => setEditing({ ...editing, smsf_bsb: ev.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fund-acct">Account number</Label>
                      <Input
                        id="fund-acct"
                        value={editing.smsf_account_number ?? ""}
                        onChange={(ev) =>
                          setEditing({ ...editing, smsf_account_number: ev.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="fund-acct-name">Account name</Label>
                      <Input
                        id="fund-acct-name"
                        value={editing.smsf_account_name ?? ""}
                        onChange={(ev) =>
                          setEditing({ ...editing, smsf_account_name: ev.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!editing.is_default}
                    onChange={(ev) => setEditing({ ...editing, is_default: ev.target.checked })}
                  />
                  Default fund for employees who have not nominated one
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFundOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!editing.name.trim() || saveFundM.isPending}
                  onClick={() => {
                    const { id, name, fund_type } = editing as any;
                    saveFundM.mutate({
                      id,
                      name: name.trim(),
                      fund_type,
                      abn: editing.abn || null,
                      usi: editing.usi || null,
                      smsf_esa: editing.smsf_esa || null,
                      smsf_bsb: editing.smsf_bsb || null,
                      smsf_account_number: editing.smsf_account_number || null,
                      smsf_account_name: editing.smsf_account_name || null,
                      is_default: !!editing.is_default,
                      is_active: editing.is_active !== false,
                    });
                  }}
                >
                  {saveFundM.isPending ? "Saving…" : "Save fund"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!choiceFor} onOpenChange={(o) => !o && setChoiceFor(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Nominate a fund — {choiceFor?.first_name} {choiceFor?.last_name}
                </DialogTitle>
                <DialogDescription>
                  Recorded with today as the effective date. Earlier contributions keep the fund
                  that applied when they were generated.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="choice-fund">Fund</Label>
                  <Select value={choiceFund} onValueChange={setChoiceFund}>
                    <SelectTrigger id="choice-fund">
                      <SelectValue placeholder="Select a fund" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds
                        .filter((f) => f.is_active !== false)
                        .map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                            {f.is_default ? " (default)" : ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="choice-member">Member number</Label>
                  <Input
                    id="choice-member"
                    value={memberNumber}
                    onChange={(ev) => setMemberNumber(ev.target.value)}
                    placeholder="As shown on the member statement"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setChoiceFor(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={!choiceFund || saveChoiceM.isPending}
                  onClick={() =>
                    saveChoiceM.mutate({
                      employee_id: choiceFor.id,
                      super_fund_id: choiceFund,
                      member_number: memberNumber || null,
                    })
                  }
                >
                  {saveChoiceM.isPending ? "Saving…" : "Record choice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Tabs>
      )}
    </AuComplianceShell>
  );
}
