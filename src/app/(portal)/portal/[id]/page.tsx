import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Inbox, Mail, Milestone as MilestoneIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { raiseClientRequest } from "@/lib/actions/client-requests";
import { sendEventMessage } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StageBadge, DocumentStatusBadge, MilestoneStatusBadge, ClientRequestStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/empty-state";
import { initials } from "@/lib/utils";
import { EntityReference } from "@/components/entity-reference";

export default async function PortalEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("*, organisations(client_reference)").eq("id", id).maybeSingle();
  if (!event) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: milestones }, { data: documents }, { data: requests }, { data: messages }] = await Promise.all([
    supabase.from("milestones").select("*").eq("event_id", id).order("due_date"),
    supabase
      .from("documents")
      .select("id, title, reference, status, document_types(name)")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("client_requests").select("*").eq("event_id", id).order("created_at", { ascending: false }),
    supabase
      .from("event_messages")
      .select("id, body, sender_id, created_at, user_profiles(full_name)")
      .eq("event_id", id)
      .order("created_at"),
  ]);
  const clientReference = (event.organisations as { client_reference: string } | null)?.client_reference;

  return (
    <div>
      <Link
        href="/portal"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        Your events
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl leading-tight font-semibold tracking-tight text-tide-charcoal">{event.name}</h1>
            <StageBadge stage={event.stage} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <EntityReference label="Event ID" value={event.event_reference} />
            <EntityReference label="Client ID" value={clientReference} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.venue ?? "Venue TBC"}
            {event.start_date ? ` · ${event.start_date}${event.end_date ? ` – ${event.end_date}` : ""}` : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <MilestoneIcon className="size-3.5 text-tide-teal" />
                Planning milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {milestones?.length ? (
                <Table>
                  <TableBody>
                    {milestones.map((ms) => (
                      <TableRow key={ms.id}>
                        <TableCell className="font-medium text-tide-charcoal">{ms.title}</TableCell>
                        <TableCell className="text-muted-foreground">{ms.due_date ?? "No due date"}</TableCell>
                        <TableCell className="text-right">
                          <MilestoneStatusBadge status={ms.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={MilestoneIcon} title="No milestones published yet" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          <Card className="gap-0 py-0">
            <CardContent className="p-0">
              {documents?.length ? (
                <Table>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium text-tide-charcoal">
                          {doc.title}
                          <span className="block text-[12px] font-normal text-muted-foreground">
                            {doc.reference ?? "Unreferenced"} · {(doc.document_types as { name: string } | null)?.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DocumentStatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            render={<a href={`/api/documents/${doc.id}/file`} />}
                            nativeButton={false}
                            size="sm"
                            variant="outline"
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={FileText} title="No documents shared yet" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Inbox className="size-3.5 text-tide-teal" />
                Raise a request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={raiseClientRequest} className="space-y-3">
                <input type="hidden" name="event_id" value={id} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-muted-foreground">Type</label>
                    <select name="type" required className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm">
                      <option value="information">Information request</option>
                      <option value="file_upload">File request</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-muted-foreground">Title</label>
                    <Input name="title" required className="h-8 text-sm" placeholder="e.g. Latest risk assessment" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Details</label>
                  <Textarea name="description" rows={2} className="text-sm" />
                </div>
                <Button type="submit" size="sm">
                  Send request
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="p-0">
              {requests?.length ? (
                <Table>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-tide-charcoal">
                          {r.title}
                          {r.response_note && (
                            <span className="mt-0.5 block text-[12.5px] font-normal text-muted-foreground">
                              Tide: {r.response_note}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <ClientRequestStatusBadge status={r.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={Inbox} title="No requests raised yet" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-3">
          <Card className="gap-0 py-0">
            <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-4 py-2.5">
              <span className="mr-1 text-xs font-semibold text-muted-foreground">Use these IDs in all correspondence</span>
              <EntityReference label="Event ID" value={event.event_reference} />
              <EntityReference label="Client ID" value={clientReference} />
            </div>
            <CardContent className="max-h-[420px] space-y-3 overflow-y-auto p-4">
              {messages?.length ? (
                messages.map((m) => {
                  const sender = m.user_profiles as { full_name: string } | null;
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse text-right" : ""}`}>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[10.5px] font-bold text-tide-teal">
                        {initials(sender?.full_name || "?")}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[12px] text-muted-foreground">{sender?.full_name ?? "Tide"}</div>
                        <div className="mt-0.5 inline-block max-w-md rounded-lg bg-muted px-3 py-1.5 text-sm text-tide-charcoal">
                          {m.body}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={Mail} title="No messages yet" className="border-none py-8" />
              )}
            </CardContent>
            <div className="border-t p-3">
              <form action={sendEventMessage} className="flex items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <input type="hidden" name="visible_to_client" value="true" />
                <Textarea name="body" required rows={1} placeholder="Send a message…" className="text-sm" />
                <Button type="submit" size="sm">
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
