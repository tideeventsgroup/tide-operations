"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REFRESH_TABLES = ["decisions", "resources", "methane_messages"] as const;

export function IncidentRealtimeRefresh({ incidentId, eventId }: { incidentId: string; eventId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const refresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        startTransition(() => router.refresh());
      }, 150);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      let nextChannel = supabase.channel(`incident-panels-${incidentId}`);
      for (const table of REFRESH_TABLES) {
        const filter = table === "resources" ? `event_id=eq.${eventId}` : `incident_id=eq.${incidentId}`;
        nextChannel = nextChannel.on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter },
          refresh,
        );
      }
      channel = nextChannel.subscribe();
    });

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [eventId, incidentId, router]);

  return null;
}
