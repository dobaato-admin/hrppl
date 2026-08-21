import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getCompanyDirectory } from "@/lib/me.functions";
import { SectionCard, EmptyState, SkeletonRows } from "@/components/monday";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, Phone, Users } from "lucide-react";

export const Route = createFileRoute("/me/directory")({
  head: () => ({ meta: [{ title: "Directory — hrppl" }] }),
  component: MeDirectory,
});

function initials(a?: string, b?: string) {
  return `${(a?.[0] ?? "").toUpperCase()}${(b?.[0] ?? "").toUpperCase()}` || "?";
}

function MeDirectory() {
  const fn = useServerFn(getCompanyDirectory);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["company-directory", search, dept],
    queryFn: () => fn({ data: { search: search || undefined, departmentId: dept === "all" ? undefined : dept } }),
  });

  const deptMap = useMemo(
    () => Object.fromEntries((data?.departments ?? []).map((d: any) => [d.id, d.name])),
    [data?.departments],
  );

  return (
    <div className="space-y-4">
      <SectionCard tone="info">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, title, or email" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={120} />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {(data?.departments ?? []).map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {isLoading ? (
        <SkeletonRows rows={8} />
      ) : !data?.employees.length ? (
        <EmptyState icon={Users} title="No coworkers found" description="Try a different search or department filter." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.employees.map((e: any) => (
            <div key={e.id} className="rounded-xl border bg-card p-4 shadow-[var(--shadow-xs)] transition hover:shadow-[var(--shadow-md)]">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-gradient-brand text-primary-foreground font-semibold">
                    {initials(e.first_name, e.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{e.first_name} {e.last_name}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.job_title ?? "—"}</div>
                  {e.department_id && deptMap[e.department_id] && (
                    <div className="mt-1 inline-flex rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                      {deptMap[e.department_id]}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <a href={`mailto:${e.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" /> <span className="truncate">{e.email}</span>
                </a>
                {e.phone && (
                  <a href={`tel:${e.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Phone className="h-3.5 w-3.5" /> {e.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
