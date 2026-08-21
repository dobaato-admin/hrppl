import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  listHolidayCategories,
  upsertHolidayCategory,
  deleteHolidayCategory,
  upsertHolidayCategoryDate,
  deleteHolidayCategoryDate,
} from "@/lib/holiday-categories.functions";
import { AdminGate } from "@/components/AdminGate";
import { ORG_ADMIN_ONLY } from "@/lib/rbac";

export const Route = createFileRoute("/admin/holiday-categories")({
  head: () => ({ meta: [{ title: "Holiday categories — hrppl" }] }),
  component: () => (
    <AdminGate allow={ORG_ADMIN_ONLY}>
      <HolidayCategoriesPage />
    </AdminGate>
  ),
});

interface Cat { id: string; country_code: string; name: string; is_default: boolean; notes: string | null }
interface CatDate { id: string; category_id: string; holiday_date: string; name: string; is_paid: boolean; pay_multiplier: number | null }

function HolidayCategoriesPage() {
  const { user, roles, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listHolidayCategories);
  const saveCat = useServerFn(upsertHolidayCategory);
  const delCat = useServerFn(deleteHolidayCategory);
  const saveDate = useServerFn(upsertHolidayCategoryDate);
  const delDate = useServerFn(deleteHolidayCategoryDate);

  const canAccess = roles.includes("org_admin") || roles.includes("super_admin");
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ id?: string; country_code: string; name: string; is_default: boolean }>({ country_code: "", name: "", is_default: false });
  const [dateOpen, setDateOpen] = useState(false);
  const [dateForm, setDateForm] = useState<{ id?: string; category_id: string; holiday_date: string; name: string; is_paid: boolean; pay_multiplier: string }>({ category_id: "", holiday_date: "", name: "", is_paid: true, pay_multiplier: "" });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) { toast.error("Admin only"); navigate({ to: "/dashboard" }); }
  }, [loading, user, canAccess, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("countries").select("code,name").order("name");
      setCountries((data ?? []) as any);
    })();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["holiday-categories"],
    queryFn: () => listFn(),
    enabled: canAccess,
  });
  const categories: Cat[] = (data?.categories ?? []) as Cat[];
  const dates: CatDate[] = (data?.dates ?? []) as CatDate[];
  const datesByCat = useMemo(() => {
    const m = new Map<string, CatDate[]>();
    for (const d of dates) {
      const arr = m.get(d.category_id) ?? [];
      arr.push(d); m.set(d.category_id, arr);
    }
    return m;
  }, [dates]);

  function startNewCat() { setCatForm({ country_code: countries[0]?.code ?? "", name: "", is_default: false }); setCatOpen(true); }
  function startEditCat(c: Cat) { setCatForm({ id: c.id, country_code: c.country_code, name: c.name, is_default: c.is_default }); setCatOpen(true); }
  function startNewDate(catId: string) { setDateForm({ category_id: catId, holiday_date: "", name: "", is_paid: true, pay_multiplier: "" }); setDateOpen(true); }

  async function saveCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveCat({ data: { id: catForm.id, country_code: catForm.country_code, name: catForm.name, is_default: catForm.is_default } });
      toast.success("Saved");
      setCatOpen(false);
      qc.invalidateQueries({ queryKey: ["holiday-categories"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function removeCat(c: Cat) {
    if (!confirm(`Delete category "${c.name}"? Dates inside it will also be removed.`)) return;
    try {
      await delCat({ data: { id: c.id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["holiday-categories"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function saveDateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveDate({ data: {
        id: dateForm.id, category_id: dateForm.category_id, holiday_date: dateForm.holiday_date,
        name: dateForm.name, is_paid: dateForm.is_paid,
        pay_multiplier: dateForm.pay_multiplier === "" ? null : Number(dateForm.pay_multiplier),
      } });
      toast.success("Saved");
      setDateOpen(false);
      qc.invalidateQueries({ queryKey: ["holiday-categories"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }
  async function removeDate(id: string) {
    if (!confirm("Remove this date?")) return;
    try {
      await delDate({ data: { id } });
      qc.invalidateQueries({ queryKey: ["holiday-categories"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  if (loading || (user && !rolesLoaded)) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  }

  if (!user) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;

  return (
    <AppShell title="Holiday categories" subtitle="Group employees by which public holidays they observe">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Assign categories to employees or departments. Payroll adds these dates on top of country-wide public holidays.
          </p>
          <div className="flex gap-2">
            <Link to="/admin/departments"><Button variant="outline" size="sm">Departments</Button></Link>
            <Button size="sm" onClick={startNewCat} data-testid="add-category">Add category</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
            <CardDescription>
              {isLoading ? "Loading…" : `${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No categories yet.
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((c) => (
                  <TableRow key={c.id} data-testid="category-row">
                    <TableCell className="font-mono text-xs">{c.country_code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{datesByCat.get(c.id)?.length ?? 0}</Badge>
                    </TableCell>
                    <TableCell>{c.is_default ? <Badge>Default</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => startNewDate(c.id)} data-testid="add-date">Add date</Button>
                      <Button size="sm" variant="ghost" onClick={() => startEditCat(c)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => removeCat(c)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {categories.map((c) => {
          const ds = datesByCat.get(c.id) ?? [];
          if (ds.length === 0) return null;
          return (
            <Card key={`d_${c.id}`}>
              <CardHeader>
                <CardTitle className="text-sm">{c.name} <span className="text-muted-foreground font-normal">— {c.country_code}</span></CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ds.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs">{d.holiday_date}</TableCell>
                        <TableCell>{d.name}</TableCell>
                        <TableCell>{d.is_paid ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-xs">{d.pay_multiplier ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => removeDate(d.id)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{catForm.id ? "Edit category" : "Add category"}</DialogTitle></DialogHeader>
          <form onSubmit={saveCatSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={catForm.country_code} onValueChange={(v) => setCatForm({ ...catForm, country_code: v })}>
                <SelectTrigger data-testid="category-country"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required data-testid="category-name" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
              <Button type="submit" data-testid="category-save">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dateOpen} onOpenChange={setDateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add observed date</DialogTitle></DialogHeader>
          <form onSubmit={saveDateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={dateForm.holiday_date} onChange={(e) => setDateForm({ ...dateForm, holiday_date: e.target.value })} required data-testid="date-date" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={dateForm.name} onChange={(e) => setDateForm({ ...dateForm, name: e.target.value })} required data-testid="date-name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pay multiplier (optional)</Label>
              <Input type="number" step="0.05" min={1} max={10} value={dateForm.pay_multiplier} placeholder="Country default" onChange={(e) => setDateForm({ ...dateForm, pay_multiplier: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDateOpen(false)}>Cancel</Button>
              <Button type="submit" data-testid="date-save">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
