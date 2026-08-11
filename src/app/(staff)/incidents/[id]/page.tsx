import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Gavel, HeartPulse, Radio, ShieldAlert, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logDecision, createResource, updateResourceStatus, saveWelfareRecord, saveMethaneMessage } from "@/lib/actions/incidents";
import { IncidentLog } from "@/components/incidents/incident-log";
import { IncidentRealtimeRefresh } from "@/components/incidents/realtime-refresh";
import { IncidentStatusBar } from "@/components/incidents/incident-status-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: viewerProfile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();

  const canManage = viewerProfile?.staff_role != null && ["admin", "manager", "control_room"].includes(viewerProfile.staff_role);

  const { data: incident } = await supabase
    .from("incidents")
    .select(
      "id, incident_number, summary, category, severity, status, location, time_reported, incident_commander_id, casualty_count, event_id, events(id, name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!incident) notFound();

  const eventName = (incident.events as { name: string } | null)?.name;

  const [{ data: staffProfiles }, { data: logEntries }, { data: decisions }, { data: resources }] = await Promise.all([
    supabase.from("user_profiles").select("id, full_name, email").eq("account_type", "staff"),
    supabase
      .from("incident_log_entries")
      .select("id, time, entry_type, body, author_id, supersedes_entry_id")
      .eq("incident_id", id)
      .order("time"),
    supabase.from("decisions").select("*").eq("incident_id", id).order("created_at"),
    supabase.from("resources").select("*").eq("event_id", incident.event_id).order("call_sign"),
  ]);

  const welfareRecords = canManage
    ? (await supabase.from("welfare_records").select("*").eq("incident_id", id).order("created_at")).data
    : null;

  const methane = canManage
    ? (await supabase.from("methane_messages").select("*").eq("incident_id", id).maybeSingle()).data
    : null;

  const staffDirectory = (staffProfiles ?? []).map((p) => ({ id: p.id, name: p.full_name || p.email }));
  const authorMap: Record<string, string> = Object.fromEntries(staffDirectory.map((s) => [s.id, s.name]));

  return (
    <div className="mx-auto max-w-6xl">
      <IncidentRealtimeRefresh incidentId={id} eventId={incident.event_id} />
      <Link
        href="/incidents"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        Incidents
      </Link>

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl leading-tight font-semibold tracking-tight text-tide-charcoal">
            {incident.incident_number}
          </h1>
          <span className="text-sm text-muted-foreground">
            {eventName} {incident.location ? `· ${incident.location}` : ""}
          </span>
        </div>
        <p className="mt-1 text-sm text-tide-charcoal">{incident.summary}</p>
        <div className="mt-3">
          <IncidentStatusBar
            incidentId={id}
            eventId={incident.event_id}
            initial={{
              status: incident.status,
              severity: incident.severity,
              incident_commander_id: incident.incident_commander_id,
              casualty_count: incident.casualty_count,
            }}
            staffDirectory={staffDirectory}
            canManage={canManage}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-2.5">
            <CardTitle className="text-sm">Contemporaneous log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <IncidentLog incidentId={id} initialEntries={logEntries ?? []} staffDirectory={authorMap} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Gavel className="size-3.5 text-tide-teal" />
                Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-3">
              {canManage && (
                <form action={logDecision} className="space-y-2 border-b pb-3">
                  <input type="hidden" name="incident_id" value={id} />
                  <input type="hidden" name="event_id" value={incident.event_id} />
                  <Textarea name="decision_text" required rows={2} placeholder="Decision made…" className="text-sm" />
                  <Textarea name="rationale" rows={1} placeholder="Rationale (optional)" className="text-sm" />
                  <Button type="submit" size="sm" variant="outline">
                    Log decision
                  </Button>
                </form>
              )}
              {decisions?.length ? (
                decisions.map((d) => (
                  <div key={d.id} className="text-sm">
                    <p className="text-tide-charcoal">{d.decision_text}</p>
                    {d.rationale && <p className="text-[12.5px] text-muted-foreground">{d.rationale}</p>}
                  </div>
                ))
              ) : (
                <p className="text-[12.5px] text-muted-foreground">No decisions logged.</p>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Truck className="size-3.5 text-tide-teal" />
                Resources — {eventName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-3">
              {canManage && (
                <form action={createResource} className="flex flex-wrap items-end gap-1.5 border-b pb-3">
                  <input type="hidden" name="event_id" value={incident.event_id} />
                  <input type="hidden" name="incident_id" value={id} />
                  <Input name="type" placeholder="Type (e.g. Medic)" required className="h-7 w-28 text-[12.5px]" />
                  <Input name="call_sign" placeholder="Call sign" className="h-7 w-24 text-[12.5px]" />
                  <Input name="location" placeholder="Location" className="h-7 w-28 text-[12.5px]" />
                  <Button type="submit" size="sm" variant="outline">
                    Add
                  </Button>
                </form>
              )}
              {resources?.length ? (
                resources.map((r) => (
                  <form
                    key={r.id}
                    action={updateResourceStatus}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <input type="hidden" name="resource_id" value={r.id} />
                    <input type="hidden" name="event_id" value={incident.event_id} />
                    <input type="hidden" name="incident_id" value={id} />
                    <span className="min-w-0 truncate text-tide-charcoal">
                      {r.call_sign ?? r.type} <span className="text-muted-foreground">· {r.type}</span>
                    </span>
                    {canManage ? (
                      <Input name="status" defaultValue={r.status ?? ""} className="h-7 w-28 text-[12px]" />
                    ) : (
                      <span className="text-[12.5px] text-muted-foreground">{r.status}</span>
                    )}
                  </form>
                ))
              ) : (
                <p className="text-[12.5px] text-muted-foreground">No resources logged for this event.</p>
              )}
            </CardContent>
          </Card>

          {canManage && (
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-2.5">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <HeartPulse className="size-3.5 text-tide-teal" />
                  Welfare records
                  <span className="ml-auto text-[10px] font-semibold tracking-wide text-warning uppercase">Restricted</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 p-3">
                <form action={saveWelfareRecord} className="space-y-2 border-b pb-3">
                  <input type="hidden" name="incident_id" value={id} />
                  <input type="hidden" name="event_id" value={incident.event_id} />
                  <div className="flex gap-1.5">
                    <Input name="person_name" placeholder="Name" className="h-7 text-[12.5px]" />
                    <Input name="person_contact" placeholder="Contact" className="h-7 text-[12.5px]" />
                  </div>
                  <Input name="casualty_status" placeholder="Status (e.g. treated on scene)" className="h-7 text-[12.5px]" />
                  <Textarea name="medical_notes" rows={2} placeholder="Medical notes" className="text-sm" />
                  <Button type="submit" size="sm" variant="outline">
                    Save record
                  </Button>
                </form>
                {welfareRecords?.length ? (
                  welfareRecords.map((w) => (
                    <div key={w.id} className="text-sm">
                      <p className="font-medium text-tide-charcoal">
                        {(w.person_details as { name?: string })?.name ?? "Unnamed"} — {w.casualty_status}
                      </p>
                      {w.medical_notes && <p className="text-[12.5px] text-muted-foreground">{w.medical_notes}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-[12.5px] text-muted-foreground">No welfare records.</p>
                )}
              </CardContent>
            </Card>
          )}

          {canManage && (
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-2.5">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Radio className="size-3.5 text-tide-teal" />
                  M/ETHANE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {methane?.major_incident_declared && (
                  <div className="mb-3 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-[12.5px] font-medium text-destructive">
                    <ShieldAlert className="size-3.5" />
                    Major incident declared
                  </div>
                )}
                <form action={saveMethaneMessage} className="space-y-2">
                  <input type="hidden" name="incident_id" value={id} />
                  <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <input
                      type="checkbox"
                      name="major_incident_declared"
                      value="true"
                      defaultChecked={methane?.major_incident_declared ?? false}
                      className="size-3.5"
                    />
                    Major incident declared
                  </label>
                  <Input name="exact_location" defaultValue={methane?.exact_location ?? ""} placeholder="Exact location" className="h-7 text-[12.5px]" />
                  <Input name="incident_type" defaultValue={methane?.incident_type ?? ""} placeholder="Incident type" className="h-7 text-[12.5px]" />
                  <Input name="hazards" defaultValue={methane?.hazards ?? ""} placeholder="Hazards" className="h-7 text-[12.5px]" />
                  <Input name="access" defaultValue={methane?.access ?? ""} placeholder="Access" className="h-7 text-[12.5px]" />
                  <Textarea
                    name="casualty_numbers"
                    rows={1}
                    defaultValue={(methane?.casualty_numbers as { notes?: string })?.notes ?? ""}
                    placeholder="Number of casualties"
                    className="text-sm"
                  />
                  <Textarea
                    name="emergency_services"
                    rows={1}
                    defaultValue={(methane?.emergency_services as { notes?: string })?.notes ?? ""}
                    placeholder="Emergency services present/required"
                    className="text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                </form>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Supports communication with emergency services — does not replace calling 999.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
