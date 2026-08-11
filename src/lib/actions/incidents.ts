"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type IncidentSeverity = Database["public"]["Enums"]["incident_severity"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type LogEntryType = Database["public"]["Enums"]["incident_log_entry_type"];
type ActionStatus = Database["public"]["Enums"]["incident_action_status"];
type ActionPriority = Database["public"]["Enums"]["incident_action_priority"];
type ControlSessionStatus = Database["public"]["Enums"]["control_session_status"];
type RadioDirection = Database["public"]["Enums"]["radio_message_direction"];

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  return { supabase, user };
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function revalidateIncident(eventId: string, incidentId?: string | null) {
  revalidatePath("/incidents");
  revalidatePath(`/incidents/control/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function createIncident(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({
      event_id: eventId,
      summary: String(formData.get("summary")),
      category: str(formData, "category"),
      description: str(formData, "description"),
      hazard_reference: str(formData, "hazard_reference"),
      severity: String(formData.get("severity")) as IncidentSeverity,
      location: str(formData, "location"),
      reported_via: str(formData, "reported_via"),
      reporter_id: user.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/incidents");
  revalidatePath(`/events/${eventId}`);
  redirect(`/incidents/${incident.id}`);
}

export async function updateIncident(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const incidentId = String(formData.get("incident_id"));
  const eventId = String(formData.get("event_id"));

  const { error } = await supabase
    .from("incidents")
    .update({
      status: String(formData.get("status")) as IncidentStatus,
      severity: String(formData.get("severity")) as IncidentSeverity,
      incident_commander_id: str(formData, "incident_commander_id"),
      casualty_count: Number(formData.get("casualty_count") ?? 0),
      location: str(formData, "location"),
      emergency_services_called: formData.get("emergency_services_called") === "true",
      emergency_services_call_time: str(formData, "emergency_services_call_time"),
      resolution_summary: str(formData, "resolution_summary"),
      closed_at: String(formData.get("status")) === "closed" ? new Date().toISOString() : null,
    })
    .eq("id", incidentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
  revalidatePath(`/events/${eventId}`);
}

export async function addLogEntry(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const incidentId = String(formData.get("incident_id"));

  const { error } = await supabase.from("incident_log_entries").insert({
    incident_id: incidentId,
    entry_type: String(formData.get("entry_type") || "update") as LogEntryType,
    body: String(formData.get("body")),
    author_id: user.id,
    supersedes_entry_id: str(formData, "supersedes_entry_id"),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/incidents/${incidentId}`);
}

export async function logDecision(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const incidentId = str(formData, "incident_id");
  const eventId = String(formData.get("event_id"));

  const { error } = await supabase.from("decisions").insert({
    incident_id: incidentId,
    event_id: eventId,
    decision_text: String(formData.get("decision_text")),
    rationale: str(formData, "rationale"),
    outcome: str(formData, "outcome"),
    decided_by: user.id,
  });

  if (error) throw new Error(error.message);

  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function createResource(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");

  const { error } = await supabase.from("resources").insert({
    event_id: eventId,
    incident_id: incidentId,
    type: String(formData.get("type")),
    call_sign: str(formData, "call_sign"),
    status: str(formData, "status") ?? "available",
    location: str(formData, "location"),
    quantity: Number(formData.get("quantity") ?? 1),
    assigned_to: str(formData, "assigned_to"),
    contact_details: str(formData, "contact_details"),
    notes: str(formData, "notes"),
    created_by: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/incidents");
  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function updateResourceStatus(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const resourceId = String(formData.get("resource_id"));
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");

  const { error } = await supabase
    .from("resources")
    .update({
      status: String(formData.get("status")),
      location: str(formData, "location"),
      assigned_to: str(formData, "assigned_to"),
      deployed_at: formData.get("status") === "deployed" ? new Date().toISOString() : undefined,
      released_at: formData.get("status") === "released" ? new Date().toISOString() : undefined,
    })
    .eq("id", resourceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/incidents");
  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function saveWelfareRecord(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const incidentId = str(formData, "incident_id");
  const eventId = String(formData.get("event_id"));

  const { error } = await supabase.from("welfare_records").insert({
    incident_id: incidentId,
    event_id: eventId,
    person_details: { name: str(formData, "person_name"), contact: str(formData, "person_contact") },
    casualty_reference: str(formData, "casualty_reference"),
    triage_category: str(formData, "triage_category"),
    age_band: str(formData, "age_band"),
    casualty_status: str(formData, "casualty_status"),
    disposition: str(formData, "disposition"),
    handed_over_to: str(formData, "handed_over_to"),
    handover_time: str(formData, "handover_time"),
    next_of_kin_contacted: formData.get("next_of_kin_contacted") === "true",
    medical_notes: str(formData, "medical_notes"),
    created_by: user.id,
  });

  if (error) throw new Error(error.message);

  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

export async function saveMethaneMessage(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const incidentId = String(formData.get("incident_id"));

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
      receiving_service: str(formData, "receiving_service"),
      sent_at: formData.get("mark_as_sent") === "true" ? new Date().toISOString() : undefined,
      sent_by: formData.get("mark_as_sent") === "true" ? user.id : undefined,
      updated_by: user.id,
    },
    { onConflict: "incident_id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/incidents/${incidentId}`);
}

export async function setControlSession(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const status = String(formData.get("status")) as ControlSessionStatus;
  const { error } = await supabase.from("event_control_sessions").upsert(
    {
      event_id: eventId,
      status,
      opened_at: status === "active" ? new Date().toISOString() : undefined,
      opened_by: status === "active" ? user.id : undefined,
      closed_at: status === "closed" ? new Date().toISOString() : null,
      closed_by: status === "closed" ? user.id : null,
      handover_notes: str(formData, "handover_notes"),
    },
    { onConflict: "event_id" },
  );
  if (error) throw new Error(error.message);
  revalidateIncident(eventId);
}

export async function upsertControlRole(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const roleName = String(formData.get("role_name"));
  const { error } = await supabase.from("event_control_roles").upsert(
    {
      event_id: eventId,
      role_name: roleName,
      user_id: str(formData, "user_id"),
      call_sign: str(formData, "call_sign"),
      contact_details: str(formData, "contact_details"),
      active: true,
      created_by: user.id,
    },
    { onConflict: "event_id,role_name" },
  );
  if (error) throw new Error(error.message);
  revalidateIncident(eventId);
}

export async function createOperationalLocation(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const { error } = await supabase.from("operational_locations").insert({
    event_id: eventId,
    name: String(formData.get("name")),
    location_type: String(formData.get("location_type")),
    description: str(formData, "description"),
    grid_reference: str(formData, "grid_reference"),
    what3words: str(formData, "what3words"),
    access_notes: str(formData, "access_notes"),
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidateIncident(eventId);
}

export async function addEventControlLogEntry(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const { error } = await supabase.from("event_control_log_entries").insert({
    event_id: eventId,
    incident_id: str(formData, "incident_id"),
    entry_type: String(formData.get("entry_type") || "update") as LogEntryType,
    body: String(formData.get("body")),
    author_id: user.id,
    supersedes_entry_id: str(formData, "supersedes_entry_id"),
  });
  if (error) throw new Error(error.message);
  revalidateIncident(eventId, str(formData, "incident_id"));
}

export async function createIncidentAction(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");
  const { error } = await supabase.from("incident_actions").insert({
    event_id: eventId,
    incident_id: incidentId,
    title: String(formData.get("title")),
    description: str(formData, "description"),
    priority: String(formData.get("priority") || "normal") as ActionPriority,
    assigned_to: str(formData, "assigned_to"),
    due_at: str(formData, "due_at"),
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidateIncident(eventId, incidentId);
}

export async function updateIncidentAction(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const actionId = String(formData.get("action_id"));
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");
  const status = String(formData.get("status")) as ActionStatus;
  const { error } = await supabase.from("incident_actions").update({
    status,
    completion_note: str(formData, "completion_note"),
    completed_at: status === "complete" ? new Date().toISOString() : null,
    completed_by: status === "complete" ? user.id : null,
  }).eq("id", actionId);
  if (error) throw new Error(error.message);
  revalidateIncident(eventId, incidentId);
}

export async function createRadioChannel(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const { error } = await supabase.from("radio_channels").insert({
    event_id: eventId,
    channel_name: String(formData.get("channel_name")),
    purpose: str(formData, "purpose"),
    frequency_or_talkgroup: str(formData, "frequency_or_talkgroup"),
    notes: str(formData, "notes"),
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidateIncident(eventId);
}

export async function logRadioMessage(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const incidentId = str(formData, "incident_id");
  const { error } = await supabase.from("radio_messages").insert({
    event_id: eventId,
    incident_id: incidentId,
    radio_channel_id: str(formData, "radio_channel_id"),
    direction: String(formData.get("direction") || "internal") as RadioDirection,
    from_call_sign: str(formData, "from_call_sign"),
    to_call_sign: str(formData, "to_call_sign"),
    body: String(formData.get("body")),
    author_id: user.id,
  });
  if (error) throw new Error(error.message);
  revalidateIncident(eventId, incidentId);
}

export async function uploadIncidentEvidence(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const eventId = String(formData.get("event_id"));
  const incidentId = String(formData.get("incident_id"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a file to upload.");

  const storagePath = `${eventId}/incidents/${incidentId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("event-files")
    .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("incident_attachments").insert({
    event_id: eventId,
    incident_id: incidentId,
    file_name: file.name,
    file_storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
    caption: str(formData, "caption"),
    evidence_type: String(formData.get("evidence_type") || "other"),
    captured_at: str(formData, "captured_at"),
    uploaded_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidateIncident(eventId, incidentId);
}
