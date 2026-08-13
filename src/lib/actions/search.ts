"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  label: string;
  sublabel: string | null;
  href: string;
};

export type SearchResults = {
  events: SearchResult[];
  incidents: SearchResult[];
  documents: SearchResult[];
  clients: SearchResult[];
};

const EMPTY: SearchResults = { events: [], incidents: [], documents: [], clients: [] };

/**
 * Lightweight cross-workspace search. There was no way to find a document,
 * incident, or client without already knowing which event owned it — this
 * is a deliberately simple ILIKE search across the handful of tables that
 * matter for "find this thing" rather than a full search-index build-out,
 * since the data volume here doesn't yet justify one. RLS still applies to
 * every query, so results are already scoped to what the caller can see.
 */
export async function searchWorkspace(rawQuery: string): Promise<SearchResults> {
  // Commas and parentheses are syntactically meaningful in PostgREST's
  // `.or()` filter string, so strip them rather than let user input alter
  // the query structure.
  const query = rawQuery.trim().replace(/[,()]/g, " ").replace(/\s+/g, " ").trim();
  if (query.length < 2) return EMPTY;

  const supabase = await createClient();
  const like = `%${query}%`;

  const [{ data: events }, { data: incidents }, { data: documents }, { data: clients }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, event_reference, venue")
      .or(`name.ilike.${like},event_reference.ilike.${like}`)
      .limit(6),
    supabase
      .from("incidents")
      .select("id, event_id, incident_number, summary")
      .or(`summary.ilike.${like},incident_number.ilike.${like}`)
      .limit(6),
    supabase
      .from("documents")
      .select("id, title, reference")
      .or(`title.ilike.${like},reference.ilike.${like}`)
      .limit(6),
    supabase
      .from("organisations")
      .select("id, name, client_reference")
      .or(`name.ilike.${like},client_reference.ilike.${like}`)
      .limit(6),
  ]);

  return {
    events: (events ?? []).map((e) => ({
      id: e.id,
      label: e.name,
      sublabel: [e.event_reference, e.venue].filter(Boolean).join(" · ") || null,
      href: `/events/${e.id}`,
    })),
    incidents: (incidents ?? []).map((i) => ({
      id: i.id,
      label: i.incident_number ?? "Incident",
      sublabel: i.summary,
      href: `/incidents/${i.id}`,
    })),
    documents: (documents ?? []).map((d) => ({
      id: d.id,
      label: d.title,
      sublabel: d.reference,
      href: `/documents/${d.id}`,
    })),
    clients: (clients ?? []).map((c) => ({
      id: c.id,
      label: c.name,
      sublabel: c.client_reference,
      href: `/clients/${c.id}`,
    })),
  };
}
