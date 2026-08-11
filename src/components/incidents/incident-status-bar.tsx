"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateIncident } from "@/lib/actions/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IncidentSeverityBadge, IncidentStatusBadge } from "@/components/status-badges";

type IncidentRow = {
  status: string;
  severity: string;
  incident_commander_id: string | null;
  casualty_count: number;
};

export function IncidentStatusBar({
  incidentId,
  eventId,
  initial,
  staffDirectory,
  canManage,
}: {
  incidentId: string;
  eventId: string;
  initial: IncidentRow;
  staffDirectory: { id: string; name: string }[];
  canManage: boolean;
}) {
  const [row, setRow] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`incident-${incidentId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "incidents", filter: `id=eq.${incidentId}` },
          (payload) => {
            const next = payload.new as IncidentRow;
            setRow(next);
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [incidentId]);

  const commanderName = staffDirectory.find((s) => s.id === row.incident_commander_id)?.name;

  if (!canManage) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <IncidentStatusBadge status={row.status} />
        <IncidentSeverityBadge severity={row.severity} />
        <span className="text-sm text-muted-foreground">
          Commander: <span className="text-tide-charcoal">{commanderName ?? "Unassigned"}</span>
        </span>
        {row.casualty_count > 0 && (
          <span className="text-sm text-destructive">
            {row.casualty_count} casualt{row.casualty_count === 1 ? "y" : "ies"}
          </span>
        )}
      </div>
    );
  }

  return (
    <form action={updateIncident} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="incident_id" value={incidentId} />
      <input type="hidden" name="event_id" value={eventId} />
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Status</label>
        <select
          name="status"
          defaultValue={row.status}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12.5px]"
        >
          <option value="open">Open</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Severity</label>
        <select
          name="severity"
          defaultValue={row.severity}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12.5px]"
        >
          <option value="minor">Minor</option>
          <option value="moderate">Moderate</option>
          <option value="serious">Serious</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Incident commander</label>
        <select
          name="incident_commander_id"
          defaultValue={row.incident_commander_id ?? ""}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12.5px]"
        >
          <option value="">Unassigned</option>
          {staffDirectory.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-muted-foreground">Casualties</label>
        <Input name="casualty_count" type="number" min={0} defaultValue={row.casualty_count} className="h-8 w-20 text-[12.5px]" />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Update
      </Button>
    </form>
  );
}
