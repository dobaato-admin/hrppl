import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, GraduationCap, BadgeCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  listCourses,
  listEnrollments,
  assignCourse,
  updateEnrollment,
  deleteEnrollment,
  listCertifications,
} from "@/lib/training.functions";
import { useMyTenantId } from "@/hooks/use-tenant";

export const Route = createFileRoute("/org/training")({
  head: () => ({ meta: [{ title: "Training — hrppl" }] }),
  component: OrgTrainingPage,
});

function OrgTrainingPage() {
  const { user, roles, loading } = useAuth();
  const { tenantId } = useMyTenantId();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const coursesFn = useServerFn(listCourses);
  const enrollsFn = useServerFn(listEnrollments);
  const assignFn = useServerFn(assignCourse);
  const updateFn = useServerFn(updateEnrollment);
  const delFn = useServerFn(deleteEnrollment);
  const certsFn = useServerFn(listCertifications);
  const canAccess =
    roles.includes("org_admin") || roles.includes("super_admin") || roles.includes("manager");
  const [tab, setTab] = useState("enrollments");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState<{
    course_id?: string;
    due_date?: string;
    employee_ids: string[];
  }>({ employee_ids: [] });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && user && !canAccess) {
      toast.error("Manager+ required");
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, canAccess, navigate]);

  useEffect(() => {
    if (!canAccess || !tenantId) return;
    // Tenant-scoped explicitly: RLS does not narrow this for super_admin
    // (its policy on employees has no tenant predicate), so the unfiltered
    // version listed every tenant. See src/hooks/use-tenant.ts.
    supabase
      .from("employees")
      .select("id,first_name,last_name,email,job_title")
      .eq("tenant_id", tenantId)
      .order("first_name")
      .then(({ data }) => setEmployees(data ?? []));
  }, [canAccess, tenantId]);

  const { data: coursesData } = useQuery({
    queryKey: ["training-courses"],
    queryFn: () => coursesFn(),
    enabled: canAccess,
  });
  const { data: enrollData, isLoading: enrollLoading } = useQuery({
    queryKey: ["training-enrollments", statusFilter],
    queryFn: () =>
      enrollsFn({
        data: { scope: "all", status: statusFilter === "all" ? undefined : statusFilter },
      }),
    enabled: canAccess,
  });
  const { data: certsData } = useQuery({
    queryKey: ["certs-expiring"],
    queryFn: () => certsFn({ data: { scope: "expiring", days: 60 } }),
    enabled: canAccess,
  });

  const activeCourses = useMemo(
    () => (coursesData?.courses ?? []).filter((c: any) => c.is_active),
    [coursesData],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id || form.employee_ids.length === 0) {
      toast.error("Pick course and at least one employee");
      return;
    }
    setBusy(true);
    try {
      const res = await assignFn({
        data: {
          course_id: form.course_id,
          employee_ids: form.employee_ids,
          due_date: form.due_date || null,
        },
      });
      toast.success(`Assigned to ${res.count} employee(s)`);
      setOpen(false);
      setForm({ employee_ids: [] });
      qc.invalidateQueries({ queryKey: ["training-enrollments"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: string) {
    try {
      await updateFn({ data: { id, status: status as any } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["training-enrollments"] });
      qc.invalidateQueries({ queryKey: ["certs-expiring"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this enrollment?")) return;
    try {
      await delFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["training-enrollments"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  if (loading || !canAccess)
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </main>
    );

  return (
    <AppShell
      title="Training & Certifications"
      subtitle="Assign courses, track completion, monitor certificate expiries"
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/training">Manage catalog</Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Assign course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Assign a course</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-2">
                  <Label>Course*</Label>
                  <Select
                    value={form.course_id ?? ""}
                    onValueChange={(v) => setForm({ ...form, course_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick course" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCourses.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due date</Label>
                  <Input
                    type="date"
                    value={form.due_date ?? ""}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employees* ({form.employee_ids.length} selected)</Label>
                  <div className="max-h-64 space-y-1 overflow-auto rounded border p-2">
                    {employees.map((e) => {
                      const checked = form.employee_ids.includes(e.id);
                      return (
                        <label
                          key={e.id}
                          className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => {
                              const next = c
                                ? [...form.employee_ids, e.id]
                                : form.employee_ids.filter((x) => x !== e.id);
                              setForm({ ...form, employee_ids: next });
                            }}
                          />
                          <span>
                            {e.first_name} {e.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {e.job_title ?? e.email}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Assigning…" : "Assign"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <section className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="enrollments">
              <GraduationCap className="mr-1 h-4 w-4" /> Enrollments
            </TabsTrigger>
            <TabsTrigger value="expiring">
              <AlertTriangle className="mr-1 h-4 w-4" /> Expiring certs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Course enrollments</CardTitle>
                <CardDescription>Track who's assigned, in progress and complete.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-3">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned</TabsTrigger>
                    <TabsTrigger value="in_progress">In progress</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                  </TabsList>
                  <TabsContent value={statusFilter} />
                </Tabs>
                {enrollLoading ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(enrollData?.enrollments ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-muted-foreground">
                            No enrollments.
                          </TableCell>
                        </TableRow>
                      ) : (
                        enrollData!.enrollments.map((en: any) => (
                          <TableRow key={en.id}>
                            <TableCell className="font-medium">
                              {en.employees?.first_name} {en.employees?.last_name}
                              <div className="text-xs text-muted-foreground">
                                {en.employees?.job_title}
                              </div>
                            </TableCell>
                            <TableCell>
                              {en.training_courses?.title}
                              {en.training_courses?.is_mandatory && (
                                <Badge variant="outline" className="ml-2">
                                  Mandatory
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">{en.due_date ?? "—"}</TableCell>
                            <TableCell>
                              <Select
                                value={en.status}
                                onValueChange={(v) => changeStatus(en.id, v)}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="assigned">Assigned</SelectItem>
                                  <SelectItem value="in_progress">In progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="expired">Expired</SelectItem>
                                  <SelectItem value="waived">Waived</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" onClick={() => remove(en.id)}>
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Certificates expiring within 60 days</CardTitle>
                </div>
                <CardDescription>Plan renewals before lapses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(certsData?.certifications ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground">
                          No certificates expiring soon.
                        </TableCell>
                      </TableRow>
                    ) : (
                      certsData!.certifications.map((c: any) => {
                        const days = c.expires_on
                          ? Math.ceil((new Date(c.expires_on).getTime() - Date.now()) / 86400000)
                          : null;
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              {c.employees?.first_name} {c.employees?.last_name}
                            </TableCell>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.issuer ?? "—"}</TableCell>
                            <TableCell className="text-xs">{c.issued_on ?? "—"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  days !== null && days < 0
                                    ? "destructive"
                                    : days !== null && days < 30
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {c.expires_on}{" "}
                                {days !== null && (days < 0 ? `(${-days}d ago)` : `(in ${days}d)`)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}
