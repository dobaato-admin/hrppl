import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPayrollTrends } from "@/lib/payroll-insights.functions";
import {
  buildTrend,
  costOf,
  costPerEmployee,
  periodOnPeriod,
  yearOnYear,
  trendTotals,
  COST_VIEW_LABEL,
  COST_VIEW_HELP,
  type CostView,
  type Grouping,
  type Comparison,
} from "@/lib/payroll-trends";

/**
 * Payroll cost over time, on the payroll home page.
 *
 * The only history the page offered was a table of runs, so "is payroll going
 * up" could be answered only by opening each run and remembering the number.
 * The variance dialog that existed compared exactly two runs and drew no
 * chart at all.
 *
 * Three controls, because the question is genuinely three-dimensional:
 *
 * - **Grouping** — month, quarter, year.
 * - **Cost view** — net, gross, total cost to business, or including expenses.
 *   These are four different numbers and the difference is large; a screen
 *   that reports one of them as "cost" without saying which produces figures
 *   that disagree with the finance team's, invisibly.
 * - **Per employee** — the same series divided by headcount, which is the form
 *   that survives the business growing.
 */
export function PayrollTrends({ currency }: { currency: string }) {
  const trendsFn = useServerFn(getPayrollTrends);
  const [grouping, setGrouping] = useState<Grouping>("month");
  const [view, setView] = useState<CostView>("employer");
  const [perEmployee, setPerEmployee] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["payroll-trends"],
    queryFn: () => trendsFn({ data: {} }),
    staleTime: 60_000,
    retry: false,
  });

  const buckets = useMemo(
    () => buildTrend(data?.points ?? [], data?.expenses ?? [], grouping),
    [data, grouping],
  );

  const chartData = useMemo(
    () =>
      buckets.map((b) => ({
        label: b.label,
        cost: perEmployee ? (costPerEmployee(b, view) ?? 0) : costOf(b, view),
        headcount: b.headcount,
        // Always plotted alongside so the reader can see whether a rise is
        // more people or more pay — the two look identical on a total.
        perHead: costPerEmployee(b, view) ?? 0,
      })),
    [buckets, view, perEmployee],
  );

  const pop = periodOnPeriod(buckets, view);
  const yoy = yearOnYear(buckets, view);
  const totals = trendTotals(buckets, view);

  const money = (n: number) =>
    `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  function exportCsv() {
    const rows = [
      ["Period", "Runs", "Headcount", "Gross", "Income tax", "Employee contrib.", "Employer contrib.", "Net pay", "Expenses", COST_VIEW_LABEL[view], "Per employee"],
      ...buckets.map((b) => [
        b.label,
        b.runs,
        b.headcount,
        b.gross,
        b.incomeTax,
        b.employeeContributions,
        b.employerContributions,
        b.netPay,
        b.expenses,
        costOf(b, view),
        costPerEmployee(b, view) ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => (typeof c === "string" && /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-trend-${grouping}-${view}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Payroll over time</CardTitle>
            <CardDescription>
              Approved runs only — a draft is a proposal, not money spent. Grouped by{" "}
              <strong className="font-medium">pay date</strong>, so a run for June paid in July
              counts in July.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={view} onValueChange={(v) => setView(v as CostView)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(COST_VIEW_LABEL) as CostView[]).map((v) => (
                  <SelectItem key={v} value={v} description={COST_VIEW_HELP[v]}>
                    {COST_VIEW_LABEL[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={grouping} onValueChange={(g) => setGrouping(g as Grouping)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={perEmployee ? "default" : "outline"}
              size="sm"
              onClick={() => setPerEmployee((p) => !p)}
            >
              Per employee
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={buckets.length === 0}>
              <Download className="mr-1 h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{COST_VIEW_HELP[view]}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        {error ? (
          // An empty chart and a failed read must not look the same.
          <p className="py-8 text-center text-sm text-muted-foreground">
            Could not load payroll history. The runs table below is unaffected.
          </p>
        ) : isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading history…</p>
        ) : buckets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No approved runs yet. Once a run is approved it appears here, and the comparisons fill
            in from the second period onwards.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label={`Total (${totals.periods} periods)`} value={money(totals.total)} />
              <Stat label="Average per period" value={money(totals.averagePerPeriod)} />
              <Delta label="Period on period" c={pop} money={money} />
              <Delta label="Year on year" c={yoy} money={money} />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" fontSize={11} tickMargin={8} />
                  <YAxis
                    fontSize={11}
                    width={72}
                    tickFormatter={(n: number) =>
                      n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n))
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "Headcount" ? value : money(Number(value)),
                      name,
                    ]}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="cost"
                    name={perEmployee ? `${COST_VIEW_LABEL[view]} per employee` : COST_VIEW_LABEL[view]}
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  {!perEmployee && (
                    // Headcount on its own axis: a rise in total cost and a
                    // rise in headcount look identical on one line, and they
                    // mean completely different things.
                    <Line
                      yAxisId="right"
                      dataKey="headcount"
                      name="Headcount"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  )}
                  {!perEmployee && (
                    <YAxis yAxisId="right" orientation="right" fontSize={11} width={40} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/**
 * A comparison tile.
 *
 * "No comparison yet" is a real state and is shown as one. A first period
 * rendering "+100%" would be a fabrication, and a percentage against zero is
 * meaningless rather than infinite.
 */
function Delta({
  label,
  c,
  money,
}: {
  label: string;
  c: Comparison;
  money: (n: number) => string;
}) {
  if (c.previous === null) {
    return (
      <div className="rounded-lg border p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">Nothing to compare yet</div>
      </div>
    );
  }
  const up = (c.change ?? 0) > 0;
  const flat = (c.change ?? 0) === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <Icon
          className={`h-4 w-4 shrink-0 ${
            flat ? "text-muted-foreground" : up ? "text-status-stuck" : "text-status-done"
          }`}
        />
        <span className="text-lg font-semibold tabular-nums">
          {c.percent === null ? money(Math.abs(c.change ?? 0)) : `${c.percent > 0 ? "+" : ""}${c.percent.toFixed(1)}%`}
        </span>
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        vs {c.againstLabel} ({money(c.previous)})
      </div>
    </div>
  );
}
