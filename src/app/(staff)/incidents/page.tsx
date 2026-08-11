import Link from "next/link";
import { Siren } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IncidentSeverityBadge, IncidentStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/empty-state";

const STATUS_PRIORITY: Record<string, number> = { open: 0, monitoring: 1, resolved: 2, closed: 3 };

export default async function IncidentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("incidents")
    .select("id, incident_number, summary, severity, status, time_reported, events(name)")
    .order("time_reported", { ascending: false });

  const incidents = [...(data ?? [])].sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Incidents"
        description="Live incident register across every event you have access to."
        actions={
          <Button render={<Link href="/incidents/new" />} nativeButton={false} size="sm">
            Report incident
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {incidents.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Severity</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-medium text-tide-charcoal">
                      <Link href={`/incidents/${inc.id}`} className="block">
                        {inc.incident_number}
                        <span className="block text-[12px] font-normal text-muted-foreground">{inc.summary}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(inc.events as { name: string } | null)?.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inc.time_reported).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <IncidentSeverityBadge severity={inc.severity} />
                    </TableCell>
                    <TableCell className="text-right">
                      <IncidentStatusBadge status={inc.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Siren}
              title="No incidents logged"
              description="Reported incidents across all your events will appear here."
              className="border-none py-10"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
