"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addLogEntry } from "@/lib/actions/incidents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LogEntry = {
  id: string;
  time: string;
  entry_type: string;
  body: string;
  author_id: string | null;
  supersedes_entry_id: string | null;
};

const ENTRY_TYPE_LABELS: Record<string, string> = {
  update: "Update",
  decision: "Decision",
  action: "Action",
  correction: "Correction",
};

export function IncidentLog({
  incidentId,
  initialEntries,
  staffDirectory,
}: {
  incidentId: string;
  initialEntries: LogEntry[];
  staffDirectory: Record<string, string>;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const seenIds = useRef(new Set(initialEntries.map((e) => e.id)));

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Realtime's Postgres Changes feature enforces RLS using the session JWT
    // attached to the socket. A freshly constructed browser client hasn't
    // necessarily pushed that token to the realtime layer yet, so resolve
    // the session first — otherwise the channel reports SUBSCRIBED but RLS
    // silently drops every change event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`incident-log-${incidentId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "incident_log_entries", filter: `incident_id=eq.${incidentId}` },
          (payload) => {
            const row = payload.new as LogEntry;
            if (seenIds.current.has(row.id)) return;
            seenIds.current.add(row.id);
            setEntries((prev) => [...prev, row].sort((a, b) => a.time.localeCompare(b.time)));
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [incidentId]);

  const correcting = entries.find((e) => e.id === correctingId);

  return (
    <div>
      <div className="max-h-[520px] space-y-0 overflow-y-auto">
        {entries.map((entry) => {
          const supersededBy = entries.find((e) => e.supersedes_entry_id === entry.id);
          return (
            <div
              key={entry.id}
              className={cn(
                "flex gap-3 border-b border-border/60 px-4 py-2.5 last:border-0",
                supersededBy && "opacity-50",
              )}
            >
              <div className="w-14 shrink-0 pt-0.5 text-[11.5px] tabular-nums text-muted-foreground">
                {new Date(entry.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold tracking-wide text-tide-teal uppercase">
                    {ENTRY_TYPE_LABELS[entry.entry_type] ?? entry.entry_type}
                  </span>
                  <span className="text-[11.5px] text-muted-foreground">
                    {(entry.author_id && staffDirectory[entry.author_id]) || "Unknown"}
                  </span>
                  {supersededBy && <span className="text-[11px] text-warning">superseded</span>}
                  {entry.supersedes_entry_id && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CornerDownRight className="size-3" />
                      correction
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-tide-charcoal">{entry.body}</p>
                {!supersededBy && (
                  <button
                    type="button"
                    onClick={() => setCorrectingId(entry.id)}
                    className="mt-0.5 text-[11px] font-medium text-muted-foreground hover:text-tide-teal"
                  >
                    Correct this entry
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No log entries yet.</p>
        )}
      </div>

      <form
        action={addLogEntry}
        onSubmit={() => setCorrectingId(null)}
        className="space-y-2 border-t p-3"
      >
        <input type="hidden" name="incident_id" value={incidentId} />
        {correcting && (
          <div className="flex items-center justify-between rounded-md bg-warning-bg px-2.5 py-1.5 text-[12px] text-warning">
            <span>Correcting: &ldquo;{correcting.body.slice(0, 60)}&rdquo;</span>
            <button type="button" onClick={() => setCorrectingId(null)} className="font-medium underline">
              Cancel
            </button>
          </div>
        )}
        <input type="hidden" name="supersedes_entry_id" value={correctingId ?? ""} />
        <div className="flex items-end gap-2">
          <select
            name="entry_type"
            defaultValue={correctingId ? "correction" : "update"}
            className="h-8 shrink-0 rounded-md border border-input bg-background px-2 text-[12.5px]"
          >
            <option value="update">Update</option>
            <option value="action">Action</option>
            <option value="decision">Decision</option>
            <option value="correction">Correction</option>
          </select>
          <Textarea name="body" required rows={1} placeholder="Log an update…" className="text-sm" />
          <Button type="submit" size="sm">
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}
