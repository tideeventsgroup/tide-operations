"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formStr, sanitizeFilename, assertDbOk, assertValidUpload, EVIDENCE_MIME_ALLOWLIST } from "@/lib/form-utils";

const uuid = z.string().uuid();
const severityEnum = z.enum(["minor", "moderate", "serious", "critical"]);
const statusEnum = z.enum(["open", "monitoring", "resolved", "closed"]);
const logEntryTypeEnum = z.enum(["update", "decision", "action", "correction"]);
const actionStatusEnum = z.enum(["open", "in_progress", "blocked", "complete", "cancelled"]);
const actionPriorityEnum = z.enum(["low", "normal", "high", "critical"]);
const controlSessionStatusEnum = z.enum(["standby", "active", "closed"]);
const radioDirectionEnum = z.enum(["inbound", "outbound", "internal"]);

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  return { supabase, user };
}

function revalidateIncident(eventId: string, incidentId?: string | null) {
  revalidatePath("/incidents");
  revalidatePath(`/incidents/control/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  if (incidentId) revalidatePath(`/incidents/${incidentId}`);
}

/** Parses `formData` against `schema`, turning the first validation failure into a plain user-facing message. */
function parseForm<T extends z.ZodTypeAny>(schema: T, values: Record<string, unknown>): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first ? `${first.path.join(".") || "Field"}: ${first.message}` : "Invalid input.");
  }
  return result.data;
}

const createIncidentSchema = z.object({
  event_id: uuid,
  summary: z.string().trim().min(1, "Summary is required").max(500),
  category: z.string().trim().max(200).nullable(),
  description: z.string().trim().max(10_000).nullable(),
  hazard_reference: z.string().trim().max(500).nullable(),
  severity: severityEnum,
  location: z.string().trim().max(500).nullable(),
  reported_via: z.string().trim().max(200).nullable(),
});

export async function createIncident(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(createIncidentSchema, {
    event_id: String(formData.get("event_id")),
    summary: String(formData.get("summary")),
    category: formStr(formData, "category"),
    description: formStr(formData, "description"),
    hazard_reference: formStr(formData, "hazard_reference"),
    severity: String(formData.get("severity")),
    location: formStr(formData, "location"),
    reported_via: formStr(formData, "reported_via"),
  });

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({ ...input, reporter_id: user.id, created_by: user.id })
    .select("id")
    .single();

  assertDbOk(error, "Could not create the incident. Please try again.");

  // Evidence is optional at report time — a reporter in the field may not
  // have a photo yet, or may add it via the Evidence tab afterwards. When
  // one is attached here, save it the same way uploadIncidentEvidence does
  // so the incident opens with its first piece of evidence already attached
  // instead of requiring a second trip through a separate screen.
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    assertValidUpload(file, EVIDENCE_MIME_ALLOWLIST);
    const storagePath = `${input.event_id}/incidents/${incident.id}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("event-files")
      .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });
    if (!uploadError) {
      await supabase.from("incident_attachments").insert({
        event_id: input.event_id,
        incident_id: incident.id,
        file_name: file.name,
        file_storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type || null,
        evidence_type: file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "photo",
        uploaded_by: user.id,
      });
    }
    // A failed evidence upload here does not block incident creation — the
    // incident record itself is what matters most; evidence can be retried
    // from the Evidence tab.
  }

  revalidatePath("/incidents");
  revalidatePath(`/events/${input.event_id}`);
  redirect(`/incidents/${incident.id}`);
}

const updateIncidentSchema = z.object({
  incident_id: uuid,
  event_id: uuid,
  status: statusEnum,
  severity: severityEnum,
  incident_commander_id: uuid.nullable(),
  casualty_count: z.coerce.number().int().min(0).max(9999),
  location: z.string().trim().max(500).nullable(),
  emergency_services_called: z.boolean(),
  emergency_services_call_time: z.string().trim().nullable(),
  resolution_summary: z.string().trim().max(10_000).nullable(),
});

export async function updateIncident(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const input = parseForm(updateIncidentSchema, {
    incident_id: String(formData.get("incident_id")),
    event_id: String(formData.get("event_id")),
    status: String(formData.get("status")),
    severity: String(formData.get("severity")),
    incident_commander_id: formStr(formData, "incident_commander_id"),
    casualty_count: formData.get("casualty_count") ?? 0,
    location: formStr(formData, "location"),
    emergency_services_called: formData.get("emergency_services_called") === "true",
    emergency_services_call_time: formStr(formData, "emergency_services_call_time"),
    resolution_summary: formStr(formData, "resolution_summary"),
  });

  const { error } = await supabase
    .from("incidents")
    .update({
      status: input.status,
      severity: input.severity,
      incident_commander_id: input.incident_commander_id,
      casualty_count: input.casualty_count,
      location: input.location,
      emergency_services_called: input.emergency_services_called,
      emergency_services_call_time: input.emergency_services_call_time,
      resolution_summary: input.resolution_summary,
      closed_at: input.status === "closed" ? new Date().toISOString() : null,
    })
    .eq("id", input.incident_id);

  assertDbOk(error, "Could not update the incident. Please try again.");

  revalidatePath(`/incidents/${input.incident_id}`);
  revalidatePath("/incidents");
  revalidatePath(`/events/${input.event_id}`);
}

const addLogEntrySchema = z.object({
  incident_id: uuid,
  entry_type: logEntryTypeEnum,
  body: z.string().trim().min(1, "Entry cannot be empty").max(10_000),
  supersedes_entry_id: uuid.nullable(),
});

export async function addLogEntry(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(addLogEntrySchema, {
    incident_id: String(formData.get("incident_id")),
    entry_type: String(formData.get("entry_type") || "update"),
    body: String(formData.get("body")),
    supersedes_entry_id: formStr(formData, "supersedes_entry_id"),
  });

  const { error } = await supabase.from("incident_log_entries").insert({ ...input, author_id: user.id });

  assertDbOk(error, "Could not save the log entry. Please try again.");

  revalidatePath(`/incidents/${input.incident_id}`);
}

const logDecisionSchema = z.object({
  incident_id: uuid.nullable(),
  event_id: uuid,
  decision_text: z.string().trim().min(1, "Decision is required").max(5000),
  rationale: z.string().trim().max(5000).nullable(),
  outcome: z.string().trim().max(5000).nullable(),
});

export async function logDecision(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(logDecisionSchema, {
    incident_id: formStr(formData, "incident_id"),
    event_id: String(formData.get("event_id")),
    decision_text: String(formData.get("decision_text")),
    rationale: formStr(formData, "rationale"),
    outcome: formStr(formData, "outcome"),
  });

  const { error } = await supabase.from("decisions").insert({ ...input, decided_by: user.id });

  assertDbOk(error, "Could not log the decision. Please try again.");

  if (input.incident_id) revalidatePath(`/incidents/${input.incident_id}`);
  revalidatePath(`/events/${input.event_id}`);
}

const createResourceSchema = z.object({
  event_id: uuid,
  incident_id: uuid.nullable(),
  type: z.string().trim().min(1, "Type is required").max(200),
  call_sign: z.string().trim().max(100).nullable(),
  status: z.string().trim().max(50).nullable(),
  location: z.string().trim().max(500).nullable(),
  quantity: z.coerce.number().int().min(1).max(9999),
  assigned_to: z.string().trim().max(200).nullable(),
  contact_details: z.string().trim().max(500).nullable(),
  notes: z.string().trim().max(5000).nullable(),
});

export async function createResource(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(createResourceSchema, {
    event_id: String(formData.get("event_id")),
    incident_id: formStr(formData, "incident_id"),
    type: String(formData.get("type")),
    call_sign: formStr(formData, "call_sign"),
    status: formStr(formData, "status") ?? "available",
    location: formStr(formData, "location"),
    quantity: formData.get("quantity") ?? 1,
    assigned_to: formStr(formData, "assigned_to"),
    contact_details: formStr(formData, "contact_details"),
    notes: formStr(formData, "notes"),
  });

  const { error } = await supabase.from("resources").insert({ ...input, created_by: user.id });

  assertDbOk(error, "Could not add the resource. Please try again.");

  revalidatePath(`/events/${input.event_id}`);
  revalidatePath("/incidents");
  if (input.incident_id) revalidatePath(`/incidents/${input.incident_id}`);
}

const updateResourceStatusSchema = z.object({
  resource_id: uuid,
  event_id: uuid,
  incident_id: uuid.nullable(),
  status: z.string().trim().min(1).max(50),
  location: z.string().trim().max(500).nullable(),
  assigned_to: z.string().trim().max(200).nullable(),
});

export async function updateResourceStatus(formData: FormData) {
  const { supabase } = await authenticatedClient();
  const input = parseForm(updateResourceStatusSchema, {
    resource_id: String(formData.get("resource_id")),
    event_id: String(formData.get("event_id")),
    incident_id: formStr(formData, "incident_id"),
    status: String(formData.get("status")),
    location: formStr(formData, "location"),
    assigned_to: formStr(formData, "assigned_to"),
  });

  const { error } = await supabase
    .from("resources")
    .update({
      status: input.status,
      location: input.location,
      assigned_to: input.assigned_to,
      deployed_at: input.status === "deployed" ? new Date().toISOString() : undefined,
      released_at: input.status === "released" ? new Date().toISOString() : undefined,
    })
    .eq("id", input.resource_id);

  assertDbOk(error, "Could not update the resource. Please try again.");

  revalidatePath(`/events/${input.event_id}`);
  revalidatePath("/incidents");
  if (input.incident_id) revalidatePath(`/incidents/${input.incident_id}`);
}

const saveWelfareRecordSchema = z.object({
  incident_id: uuid.nullable(),
  event_id: uuid,
  person_name: z.string().trim().max(200).nullable(),
  person_contact: z.string().trim().max(200).nullable(),
  casualty_reference: z.string().trim().max(100).nullable(),
  triage_category: z.string().trim().max(100).nullable(),
  age_band: z.string().trim().max(50).nullable(),
  casualty_status: z.string().trim().max(100).nullable(),
  disposition: z.string().trim().max(500).nullable(),
  handed_over_to: z.string().trim().max(200).nullable(),
  handover_time: z.string().trim().nullable(),
  next_of_kin_contacted: z.boolean(),
  medical_notes: z.string().trim().max(10_000).nullable(),
});

export async function saveWelfareRecord(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(saveWelfareRecordSchema, {
    incident_id: formStr(formData, "incident_id"),
    event_id: String(formData.get("event_id")),
    person_name: formStr(formData, "person_name"),
    person_contact: formStr(formData, "person_contact"),
    casualty_reference: formStr(formData, "casualty_reference"),
    triage_category: formStr(formData, "triage_category"),
    age_band: formStr(formData, "age_band"),
    casualty_status: formStr(formData, "casualty_status"),
    disposition: formStr(formData, "disposition"),
    handed_over_to: formStr(formData, "handed_over_to"),
    handover_time: formStr(formData, "handover_time"),
    next_of_kin_contacted: formData.get("next_of_kin_contacted") === "true",
    medical_notes: formStr(formData, "medical_notes"),
  });

  const { error } = await supabase.from("welfare_records").insert({
    incident_id: input.incident_id,
    event_id: input.event_id,
    person_details: { name: input.person_name, contact: input.person_contact },
    casualty_reference: input.casualty_reference,
    triage_category: input.triage_category,
    age_band: input.age_band,
    casualty_status: input.casualty_status,
    disposition: input.disposition,
    handed_over_to: input.handed_over_to,
    handover_time: input.handover_time,
    next_of_kin_contacted: input.next_of_kin_contacted,
    medical_notes: input.medical_notes,
    created_by: user.id,
  });

  assertDbOk(error, "Could not save the welfare record. Please try again.");

  if (input.incident_id) revalidatePath(`/incidents/${input.incident_id}`);
}

const saveMethaneMessageSchema = z.object({
  incident_id: uuid,
  major_incident_declared: z.boolean(),
  exact_location: z.string().trim().max(500).nullable(),
  incident_type: z.string().trim().max(200).nullable(),
  hazards: z.string().trim().max(2000).nullable(),
  access: z.string().trim().max(2000).nullable(),
  casualty_numbers: z.string().trim().max(2000).nullable(),
  emergency_services: z.string().trim().max(2000).nullable(),
  receiving_service: z.string().trim().max(500).nullable(),
  mark_as_sent: z.boolean(),
});

export async function saveMethaneMessage(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(saveMethaneMessageSchema, {
    incident_id: String(formData.get("incident_id")),
    major_incident_declared: formData.get("major_incident_declared") === "true",
    exact_location: formStr(formData, "exact_location"),
    incident_type: formStr(formData, "incident_type"),
    hazards: formStr(formData, "hazards"),
    access: formStr(formData, "access"),
    casualty_numbers: formStr(formData, "casualty_numbers"),
    emergency_services: formStr(formData, "emergency_services"),
    receiving_service: formStr(formData, "receiving_service"),
    mark_as_sent: formData.get("mark_as_sent") === "true",
  });

  const { error } = await supabase.from("methane_messages").upsert(
    {
      incident_id: input.incident_id,
      major_incident_declared: input.major_incident_declared,
      exact_location: input.exact_location,
      incident_type: input.incident_type,
      hazards: input.hazards,
      access: input.access,
      casualty_numbers: { notes: input.casualty_numbers },
      emergency_services: { notes: input.emergency_services },
      receiving_service: input.receiving_service,
      sent_at: input.mark_as_sent ? new Date().toISOString() : undefined,
      sent_by: input.mark_as_sent ? user.id : undefined,
      updated_by: user.id,
    },
    { onConflict: "incident_id" },
  );

  assertDbOk(error, "Could not save the M/ETHANE message. Please try again.");

  revalidatePath(`/incidents/${input.incident_id}`);
}

const setControlSessionSchema = z.object({
  event_id: uuid,
  status: controlSessionStatusEnum,
  handover_notes: z.string().trim().max(5000).nullable(),
});

export async function setControlSession(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(setControlSessionSchema, {
    event_id: String(formData.get("event_id")),
    status: String(formData.get("status")),
    handover_notes: formStr(formData, "handover_notes"),
  });

  const { error } = await supabase.from("event_control_sessions").upsert(
    {
      event_id: input.event_id,
      status: input.status,
      opened_at: input.status === "active" ? new Date().toISOString() : undefined,
      opened_by: input.status === "active" ? user.id : undefined,
      closed_at: input.status === "closed" ? new Date().toISOString() : null,
      closed_by: input.status === "closed" ? user.id : null,
      handover_notes: input.handover_notes,
    },
    { onConflict: "event_id" },
  );

  assertDbOk(error, "Could not update the control session. Please try again.");
  revalidateIncident(input.event_id);
}

const upsertControlRoleSchema = z.object({
  event_id: uuid,
  role_name: z.string().trim().min(1, "Role is required").max(100),
  user_id: uuid.nullable(),
  call_sign: z.string().trim().max(100).nullable(),
  contact_details: z.string().trim().max(500).nullable(),
});

export async function upsertControlRole(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(upsertControlRoleSchema, {
    event_id: String(formData.get("event_id")),
    role_name: String(formData.get("role_name")),
    user_id: formStr(formData, "user_id"),
    call_sign: formStr(formData, "call_sign"),
    contact_details: formStr(formData, "contact_details"),
  });

  const { error } = await supabase.from("event_control_roles").upsert(
    { ...input, active: true, created_by: user.id },
    { onConflict: "event_id,role_name" },
  );

  assertDbOk(error, "Could not update the role assignment. Please try again.");
  revalidateIncident(input.event_id);
}

const createOperationalLocationSchema = z.object({
  event_id: uuid,
  name: z.string().trim().min(1, "Name is required").max(200),
  location_type: z.string().trim().min(1, "Type is required").max(100),
  description: z.string().trim().max(2000).nullable(),
  grid_reference: z.string().trim().max(100).nullable(),
  what3words: z.string().trim().max(100).nullable(),
  access_notes: z.string().trim().max(2000).nullable(),
});

export async function createOperationalLocation(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(createOperationalLocationSchema, {
    event_id: String(formData.get("event_id")),
    name: String(formData.get("name")),
    location_type: String(formData.get("location_type")),
    description: formStr(formData, "description"),
    grid_reference: formStr(formData, "grid_reference"),
    what3words: formStr(formData, "what3words"),
    access_notes: formStr(formData, "access_notes"),
  });

  const { error } = await supabase.from("operational_locations").insert({ ...input, created_by: user.id });

  assertDbOk(error, "Could not add the location. Please try again.");
  revalidateIncident(input.event_id);
}

const addEventControlLogEntrySchema = z.object({
  event_id: uuid,
  incident_id: uuid.nullable(),
  entry_type: logEntryTypeEnum,
  body: z.string().trim().min(1, "Entry cannot be empty").max(10_000),
  supersedes_entry_id: uuid.nullable(),
});

export async function addEventControlLogEntry(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(addEventControlLogEntrySchema, {
    event_id: String(formData.get("event_id")),
    incident_id: formStr(formData, "incident_id"),
    entry_type: String(formData.get("entry_type") || "update"),
    body: String(formData.get("body")),
    supersedes_entry_id: formStr(formData, "supersedes_entry_id"),
  });

  const { error } = await supabase.from("event_control_log_entries").insert({ ...input, author_id: user.id });

  assertDbOk(error, "Could not save the log entry. Please try again.");
  revalidateIncident(input.event_id, input.incident_id);
}

const createIncidentActionSchema = z.object({
  event_id: uuid,
  incident_id: uuid.nullable(),
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(5000).nullable(),
  priority: actionPriorityEnum,
  assigned_to: uuid.nullable(),
  due_at: z.string().trim().nullable(),
});

export async function createIncidentAction(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(createIncidentActionSchema, {
    event_id: String(formData.get("event_id")),
    incident_id: formStr(formData, "incident_id"),
    title: String(formData.get("title")),
    description: formStr(formData, "description"),
    priority: String(formData.get("priority") || "normal"),
    assigned_to: formStr(formData, "assigned_to"),
    due_at: formStr(formData, "due_at"),
  });

  const { error } = await supabase.from("incident_actions").insert({ ...input, created_by: user.id });

  assertDbOk(error, "Could not create the action. Please try again.");
  revalidateIncident(input.event_id, input.incident_id);
}

const updateIncidentActionSchema = z.object({
  action_id: uuid,
  event_id: uuid,
  incident_id: uuid.nullable(),
  status: actionStatusEnum,
  completion_note: z.string().trim().max(2000).nullable(),
});

export async function updateIncidentAction(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(updateIncidentActionSchema, {
    action_id: String(formData.get("action_id")),
    event_id: String(formData.get("event_id")),
    incident_id: formStr(formData, "incident_id"),
    status: String(formData.get("status")),
    completion_note: formStr(formData, "completion_note"),
  });

  const { error } = await supabase
    .from("incident_actions")
    .update({
      status: input.status,
      completion_note: input.completion_note,
      completed_at: input.status === "complete" ? new Date().toISOString() : null,
      completed_by: input.status === "complete" ? user.id : null,
    })
    .eq("id", input.action_id);

  assertDbOk(error, "Could not update the action. Please try again.");
  revalidateIncident(input.event_id, input.incident_id);
}

const createRadioChannelSchema = z.object({
  event_id: uuid,
  channel_name: z.string().trim().min(1, "Channel name is required").max(200),
  purpose: z.string().trim().max(500).nullable(),
  frequency_or_talkgroup: z.string().trim().max(100).nullable(),
  notes: z.string().trim().max(2000).nullable(),
});

export async function createRadioChannel(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(createRadioChannelSchema, {
    event_id: String(formData.get("event_id")),
    channel_name: String(formData.get("channel_name")),
    purpose: formStr(formData, "purpose"),
    frequency_or_talkgroup: formStr(formData, "frequency_or_talkgroup"),
    notes: formStr(formData, "notes"),
  });

  const { error } = await supabase.from("radio_channels").insert({ ...input, created_by: user.id });

  assertDbOk(error, "Could not add the channel. Please try again.");
  revalidateIncident(input.event_id);
}

const logRadioMessageSchema = z.object({
  event_id: uuid,
  incident_id: uuid.nullable(),
  radio_channel_id: uuid.nullable(),
  direction: radioDirectionEnum,
  from_call_sign: z.string().trim().max(100).nullable(),
  to_call_sign: z.string().trim().max(100).nullable(),
  body: z.string().trim().min(1, "Message cannot be empty").max(2000),
});

export async function logRadioMessage(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(logRadioMessageSchema, {
    event_id: String(formData.get("event_id")),
    incident_id: formStr(formData, "incident_id"),
    radio_channel_id: formStr(formData, "radio_channel_id"),
    direction: String(formData.get("direction") || "internal"),
    from_call_sign: formStr(formData, "from_call_sign"),
    to_call_sign: formStr(formData, "to_call_sign"),
    body: String(formData.get("body")),
  });

  const { error } = await supabase.from("radio_messages").insert({ ...input, author_id: user.id });

  assertDbOk(error, "Could not log the radio message. Please try again.");
  revalidateIncident(input.event_id, input.incident_id);
}

const uploadIncidentEvidenceSchema = z.object({
  event_id: uuid,
  incident_id: uuid,
  caption: z.string().trim().max(500).nullable(),
  evidence_type: z.string().trim().max(50),
  captured_at: z.string().trim().nullable(),
});

export async function uploadIncidentEvidence(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const input = parseForm(uploadIncidentEvidenceSchema, {
    event_id: String(formData.get("event_id")),
    incident_id: String(formData.get("incident_id")),
    caption: formStr(formData, "caption"),
    evidence_type: formStr(formData, "evidence_type") ?? "other",
    captured_at: formStr(formData, "captured_at"),
  });

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Choose a file to upload.");
  assertValidUpload(file, EVIDENCE_MIME_ALLOWLIST);

  const storagePath = `${input.event_id}/incidents/${input.incident_id}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("event-files")
    .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });
  if (uploadError) throw new Error("Could not upload the file. Please try again.");

  const { error } = await supabase.from("incident_attachments").insert({
    event_id: input.event_id,
    incident_id: input.incident_id,
    file_name: file.name,
    file_storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
    caption: input.caption,
    evidence_type: input.evidence_type,
    captured_at: input.captured_at,
    uploaded_by: user.id,
  });

  assertDbOk(error, "Could not save the evidence record. Please try again.");
  revalidateIncident(input.event_id, input.incident_id);
}
