import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TONE } from "@/components/monday";
import type { CalendarDays } from "lucide-react";

export function BoardCard({
  title,
  description,
  color,
  children,
}: {
  title: string;
  description: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 w-full ${color}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">{children}</CardContent>
    </Card>
  );
}

export function BoardRow({
  label,
  status,
  tone,
  to,
}: {
  label: string;
  status: string;
  tone: keyof typeof TONE;
  to: string;
}) {
  const t = TONE[tone];
  return (
    <Link
      to={to as any}
      className="flex items-center justify-between rounded-md px-2 py-2 transition hover:bg-muted"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} />
        <span className="text-sm">{label}</span>
      </div>
      <Badge className={`border-0 ${t.chip}`}>{status}</Badge>
    </Link>
  );
}

export function AdminTile({
  title,
  description,
  to,
  color,
  Icon,
}: {
  title: string;
  description: string;
  to: string;
  color: string;
  Icon: typeof CalendarDays;
}) {
  return (
    <Link to={to as any} className="group">
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="space-y-2">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color} text-white shadow-sm`}>
            <Icon className="h-4 w-4" />
          </span>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
