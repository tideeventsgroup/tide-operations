import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  if (value == null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: incident } = await supabase
    .from("incidents")
    .select("*, events(name)")
    .eq("id", id)
    .maybeSingle();
  if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

  const [{ data: log }, { data: decisions }, { data: actions }, { data: resources }, { data: radio }, { data: welfare }] = await Promise.all([
    supabase.from("incident_log_entries").select("*").eq("incident_id", id).order("time"),
    supabase.from("decisions").select("*").eq("incident_id", id).order("created_at"),
    supabase.from("incident_actions").select("*").eq("incident_id", id).order("created_at"),
    supabase.from("resources").select("*").eq("incident_id", id).order("created_at"),
    supabase.from("radio_messages").select("*").eq("incident_id", id).order("time"),
    supabase.from("welfare_records").select("*").eq("incident_id", id).order("created_at"),
  ]);

  const rows: unknown[][] = [
    ["TIDE INCIDENT AUDIT EXPORT"],
    ["Incident", incident.incident_number],
    ["Event", (incident.events as { name: string } | null)?.name],
    ["Summary", incident.summary],
    ["Severity", incident.severity, "Status", incident.status],
    ["Location", incident.location, "Reported", incident.time_reported],
    ["Description", incident.description],
    ["Resolution", incident.resolution_summary],
    [],
    ["CONTEMPORANEOUS LOG"],
    ["Time", "Type", "Body", "Author ID", "Supersedes"],
    ...(log ?? []).map((entry) => [entry.time, entry.entry_type, entry.body, entry.author_id, entry.supersedes_entry_id]),
    [],
    ["DECISIONS"],
    ["Time", "Decision", "Rationale", "Outcome", "Decided by"],
    ...(decisions ?? []).map((decision) => [decision.created_at, decision.decision_text, decision.rationale, decision.outcome, decision.decided_by]),
    [],
    ["ACTIONS"],
    ["Created", "Action", "Priority", "Status", "Assigned to", "Completed", "Completion note"],
    ...(actions ?? []).map((action) => [action.created_at, action.title, action.priority, action.status, action.assigned_to, action.completed_at, action.completion_note]),
    [],
    ["RESOURCES"],
    ["Created", "Type", "Call sign", "Status", "Location", "Assigned to"],
    ...(resources ?? []).map((resource) => [resource.created_at, resource.type, resource.call_sign, resource.status, resource.location, resource.assigned_to]),
    [],
    ["RADIO TRAFFIC"],
    ["Time", "Direction", "From", "To", "Message", "Author ID"],
    ...(radio ?? []).map((message) => [message.time, message.direction, message.from_call_sign, message.to_call_sign, message.body, message.author_id]),
  ];

  if (welfare?.length) {
    rows.push([], ["RESTRICTED WELFARE RECORDS"], ["Created", "Reference", "Person", "Triage", "Status", "Disposition", "Notes"]);
    rows.push(...welfare.map((record) => [record.created_at, record.casualty_reference, record.person_details, record.triage_category, record.casualty_status, record.disposition, record.medical_notes]));
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${incident.incident_number}-audit.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
