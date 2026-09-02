import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listBiometricDevices,
  upsertBiometricDevice,
  rotateDeviceSecret,
  listMappings,
  upsertMapping,
  listPunches,
} from "@/lib/biometric.functions";
import { BIOMETRIC_VENDORS } from "@/lib/biometric-vendors";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, RefreshCw, Copy, Fingerprint } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

import { useMyTenantId } from "@/hooks/use-tenant";

export const Route = createFileRoute("/admin/biometric")({
  head: () => ({ meta: [{ title: "Biometric attendance — hrppl" }] }),
  component: () => (
    <AdminGate feature="org.biometric">
      <BiometricPage />
    </AdminGate>
  ),
});

function BiometricPage() {
  const { tenantId } = useMyTenantId();
  const listDev = useServerFn(listBiometricDevices);
  const upDev = useServerFn(upsertBiometricDevice);
  const rotate = useServerFn(rotateDeviceSecret);
  const listMap = useServerFn(listMappings);
  const upMap = useServerFn(upsertMapping);
  const listP = useServerFn(listPunches);

  const [devices, setDevices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [mappings, setMappings] = useState<any[]>([]);
  const [punches, setPunches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>({
    name: "",
    vendor: "zkteco",
    is_active: true,
    config: {},
  });
  const [newMap, setNewMap] = useState({ raw_user_id: "", employee_id: "" });

  async function refreshDevices() {
    const r = await listDev();
    setDevices(r.devices);
  }
  async function refreshActive(id: string) {
    const [m, p] = await Promise.all([
      listMap({ data: { device_id: id } }),
      listP({ data: { device_id: id, limit: 100 } }),
    ]);
    setMappings(m.mappings);
    setPunches(p.punches);
  }
  useEffect(() => {
    refreshDevices();
    if (!tenantId) return;
    // Tenant-scoped explicitly: RLS does not narrow this for super_admin
    // (its policy on employees has no tenant predicate), so the unfiltered
    // version listed every tenant. See src/hooks/use-tenant.ts.
    supabase
      .from("employees")
      .select("id,first_name,last_name")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .limit(500)
      .order("first_name")
      .then(({ data }) => setEmployees(data ?? []));
  }, [tenantId]);
  useEffect(() => {
    if (active) refreshActive(active.id);
  }, [active]);

  async function save() {
    if (!editing.name.trim()) return toast.error("Name required");
    try {
      const r = await upDev({ data: editing });
      toast.success("Saved");
      setOpen(false);
      await refreshDevices();
      if (r.device) setActive(r.device);
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  async function doRotate() {
    if (!active) return;
    const r = await rotate({ data: { id: active.id } });
    setActive(r.device);
    await refreshDevices();
    toast.success("Secrets rotated — update your device config");
  }
  async function addMapping() {
    if (!active || !newMap.raw_user_id || !newMap.employee_id) return;
    await upMap({ data: { device_id: active.id, ...newMap } });
    setNewMap({ raw_user_id: "", employee_id: "" });
    await refreshActive(active.id);
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = active ? `${baseUrl}/api/public/biometric/${active.webhook_token}` : "";

  return (
    <AppShell
      title="Biometric attendance"
      subtitle="Devices, user mappings and punch history"
      actions={
        <Button
          onClick={() => {
            setEditing({ name: "", vendor: "zkteco", is_active: true, config: {} });
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add device
        </Button>
      }
    >
      <div className="p-4 md:p-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {devices.length === 0 && (
              <p className="text-sm text-muted-foreground">No devices yet.</p>
            )}
            {devices.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d)}
                className={
                  "w-full text-left rounded-md border p-2 hover:bg-muted " +
                  (active?.id === d.id ? "bg-muted border-primary" : "")
                }
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5" /> {d.name}
                  </div>
                  <Badge
                    variant={d.is_active ? "secondary" : "outline"}
                    className="text-[10px] capitalize"
                  >
                    {d.vendor}
                  </Badge>
                </div>
                {d.location && <div className="text-xs text-muted-foreground">{d.location}</div>}
                {d.last_punch_at && (
                  <div className="text-[10px] text-muted-foreground">
                    Last: {new Date(d.last_punch_at).toLocaleString()}
                  </div>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {active ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{active.name}</CardTitle>
                  <CardDescription>
                    {active.vendor.toUpperCase()} • {active.device_serial ?? "no serial"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(active);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={doRotate}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Rotate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Webhook URL (push punches)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input readOnly value={webhookUrl} className="font-mono text-xs" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    POST a JSON body of{" "}
                    <code>{"{punches:[{raw_user_id,punch_at,punch_type}]}"}</code> with header{" "}
                    <code>X-Device-Secret: &lt;shared_secret&gt;</code>. For ZKTeco BioTime:
                    configure HTTP push with the same structure or schedule a poller calling your
                    BioTime instance and forwarding here.
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Shared secret (sign each request)</Label>
                  <Input readOnly value={active.shared_secret} className="font-mono text-xs" />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="mappings">
              <TabsList>
                <TabsTrigger value="mappings">User mappings</TabsTrigger>
                <TabsTrigger value="punches">Recent punches</TabsTrigger>
              </TabsList>
              <TabsContent value="mappings">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Map device user IDs to employees</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                      <Input
                        placeholder="Device user ID (e.g. 1023)"
                        value={newMap.raw_user_id}
                        onChange={(e) => setNewMap({ ...newMap, raw_user_id: e.target.value })}
                      />
                      <Select
                        value={newMap.employee_id}
                        onValueChange={(v) => setNewMap({ ...newMap, employee_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.first_name} {e.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addMapping}>Add</Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device ID</TableHead>
                          <TableHead>Employee</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappings.map((m: any) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-mono text-xs">{m.raw_user_id}</TableCell>
                            <TableCell>
                              {m.employees?.first_name} {m.employees?.last_name}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="punches">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>When</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {punches.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs">
                              {new Date(p.punch_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {p.employees ? (
                                `${p.employees.first_name} ${p.employees.last_name}`
                              ) : (
                                <span className="text-muted-foreground">
                                  Unmapped: {p.raw_user_id}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {p.punch_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {p.source}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Select or create a device to begin.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.id ? "Edit device" : "Add device"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Vendor</Label>
              <Select
                value={editing.vendor}
                onValueChange={(v) => setEditing({ ...editing, vendor: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a vendor" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {BIOMETRIC_VENDORS.map((v) => (
                    <SelectItem key={v.code} value={v.code}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Device serial</Label>
                <Input
                  value={editing.device_serial ?? ""}
                  onChange={(e) => setEditing({ ...editing, device_serial: e.target.value })}
                />
              </div>
              <div>
                <Label>IP address</Label>
                <Input
                  value={editing.ip_address ?? ""}
                  onChange={(e) => setEditing({ ...editing, ip_address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Location</Label>
                <Input
                  value={editing.location ?? ""}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  placeholder="Main reception"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={editing.is_active}
                onCheckedChange={(v) => setEditing({ ...editing, is_active: !!v })}
              />{" "}
              Active
            </label>
          </div>
          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
