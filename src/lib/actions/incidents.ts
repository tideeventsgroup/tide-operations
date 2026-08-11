"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type LogEntryType = Database["public"]["Enums"]["incident_log_entry_type"];

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createIncident(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({
      event_id: eventId,
      summary: String(formData.get("summary")),
      category: str(formData, "category"),
      severity: String(formData.get("severity")) as IncidentSeverity,
      location: str(formData, "location"),
      reporter_id: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/incidents");
  revalidatePath(`/events/${eventId}`);
  redirect(`/incidents/${incident.id}`);
}

export async function updateIncident(formData: FormData) {
  const supabase = await createClient();
  const incidentId = String(formData.get("incident_id"));
  const eventId = String(formData.get("event_id"));

  const { error } = await supabase
    .from("incidents")
    .update({
      status: String(formData.get("status")) as IncidentStatus,
      severity: String(formData.get("severity")) as IncidentSeverity,
      incident_commander_id: str(formData, "incident_commander_id"),
      casualty_count: Number(formData.get("casualty_count") ?? 0),
    })
    .eq("id", incidentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
  revalidatePath(`/events/${eventId}`);
}

export async function addLogEntry(formData: FormData) {
  const supabase = await createClient();
  const incidentId = String(formData.get("incident_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("incident_log_entries").insert({
    incident_id: incidentId,
    entry_type: String(formData.get("entry_type") || "update") as LogEntryType,
    body: String(formData.get("body")),
    author_id: user?.id ?? null,
    supersedes_entry_id: str(formData, "supersedes_entry_id"),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/incidents/${incidentId}`);
}

export async function logDecision(formData: FormData) {
  const supabase = await createClient();
  const incidentId = str(formData, "incident_id");
  const eventId = String(formData.get("event_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("decisions").insert({
    incident_id: incidentId,
    event_id: eventId,
    decision_text: String(formData.get("decision_text")),
    rationale: str(formData, "rationale"),
    decided_by: user?.id ?? null,
  });

  if (error) throw new Error(error.message);

  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function createResource(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");

  const { error } = await supabase.from("resources").insert({
    event_id: eventId,
    type: String(formData.get("type")),
    call_sign: str(formData, "call_sign"),
    status: str(formData, "status") ?? "available",
    location: str(formData, "location"),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/incidents");
  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function updateResourceStatus(formData: FormData) {
  const supabase = await createClient();
  const resourceId = String(formData.get("resource_id"));
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");

  const { error } = await supabase
    .from("resources")
    .update({ status: String(formData.get("status")), location: str(formData, "location") })
    .eq("id", resourceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/incidents");
  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function saveWelfareRecord(formData: FormData) {
  const supabase = await createClient();
  const incidentId = str(formData, "incident_id");
  const eventId = String(formData.get("event_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("welfare_records").insert({
    incident_id: incidentId,
    event_id: eventId,
    person_details: { name: str(formData, "person_name"), contact: str(formData, "person_contact") },
    casualty_status: str(formData, "casualty_status"),
    medical_notes: str(formData, "medical_notes"),
    created_by: user?.id ?? null,
  });

  if (error) throw new Error(error.message);

  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function saveMethaneMessage(formData: FormData) {
  const supabase = await createClient();
  const incidentId = String(formData.get("incident_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("methane_messages").upsert(
    {
      incident_id: incidentId,
      major_incident_declared: formData.get("major_incident_declared") === "true",
      exact_location: str(formData, "exact_location"),
      incident_type: str(formData, "incident_type"),
      hazards: str(formData, "hazards"),
      access: str(formData, "access"),
      casualty_numbers: { notes: str(formData, "casualty_numbers") },
      emergency_services: { notes: str(formData, "emergency_services") },
      updated_by: user?.id ?? null,
    },
    { onConflict: "incident_id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/incidents/${incidentId}`);
}
