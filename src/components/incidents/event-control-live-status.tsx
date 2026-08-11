"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Radio, WifiOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const EVENT_TABLES = [
  "incidents",
  "incident_actions",
  "event_control_log_entries",
  "radio_messages",
  "resources",
  "event_control_roles",
  "operational_locations",
  "event_control_sessions",
  "radio_channels",
  "incident_attachments",
] as const;

export function EventControlLiveStatus({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [, startTransition] = useTransition();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => startTransition(() => router.refresh()), 200);
    };
    const markOffline = () => setStatus("offline");
    const reconnect = () => {
      setStatus("connecting");
      refresh();
    };
    window.addEventListener("offline", markOffline);
    window.addEventListener("online", reconnect);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!navigator.onLine) {
        setStatus("offline");
        return;
      }
      if (session) supabase.realtime.setAuth(session.access_token);
      let nextChannel = supabase.channel(`event-control:${eventId}`);
      for (const table of EVENT_TABLES) {
        nextChannel = nextChannel.on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter: `event_id=eq.${eventId}` },
          refresh,
        );
      }
      channel = nextChannel.subscribe((nextStatus) => {
        if (nextStatus === "SUBSCRIBED") setStatus("live");
        if (nextStatus === "CHANNEL_ERROR" || nextStatus === "TIMED_OUT") setStatus("offline");
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("online", reconnect);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [eventId, router]);

  return (
    <div
      role="status"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs font-semibold",
        status === "live" && "border-success/25 bg-success-bg text-success",
        status === "connecting" && "border-warning/25 bg-warning-bg text-warning",
        status === "offline" && "border-destructive/25 bg-destructive/10 text-destructive",
      )}
    >
      {status === "offline" ? <WifiOff className="size-3.5" /> : <Radio className="size-3.5" />}
      {status === "live" ? "Live updates" : status === "connecting" ? "Connecting" : "Offline — reconnect to sync"}
    </div>
  );
}
