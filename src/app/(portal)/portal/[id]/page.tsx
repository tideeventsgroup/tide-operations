import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Inbox,
  Mail,
  MapPin,
  MessageSquare,
  Milestone as MilestoneIcon,
  Send,
  CirclePoundSterling,
  FileSignature,
  ReceiptText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { raiseClientRequest } from "@/lib/actions/client-requests";
import { sendEventMessage } from "@/lib/actions/messages";
import { acceptClientProposal, acceptClientQuote } from "@/lib/actions/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StageBadge, DocumentStatusBadge, MilestoneStatusBadge, ClientRequestStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/empty-state";
import { cn, formatEventCountdown, initials } from "@/lib/utils";
import { EntityReference } from "@/components/entity-reference";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { formatBusinessDate, formatMoney } from "@/lib/business";

const STAGES = ["enquiry", "proposal", "confirmed", "planning", "live", "complete"] as const;

function formatPortalDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
}

export default async function PortalEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, organisations(name, client_reference)")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: milestones }, { data: documents }, { data: requests }, { data: messages }, { data: proposals }, { data: quotes }, { data: invoices }, { data: profile }] = await Promise.all([
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
    supabase.from("proposals").select("*").eq("event_id", id).eq("client_visible", true).neq("status", "draft").order("created_at", { ascending: false }),
    supabase.from("quotes").select("*, quote_items(*)").eq("event_id", id).eq("client_visible", true).neq("status", "draft").order("created_at", { ascending: false }),
    supabase.from("invoices").select("*, invoice_items(*), payments(*)").eq("event_id", id).eq("client_visible", true).neq("status", "draft").order("created_at", { ascending: false }),
    supabase.from("user_profiles").select("account_type").eq("id", user?.id ?? "").maybeSingle(),
  ]);
  const organisation = event.organisations as { name: string; client_reference: string } | null;
  const clientReference = organisation?.client_reference;
  const currentStageIndex = STAGES.indexOf(event.stage);
  const countdown = formatEventCountdown(event.start_date, event.end_date);
  const completedMilestones = milestones?.filter((milestone) => milestone.status === "complete").length ?? 0;
  const openRequests = requests?.filter((request) => request.status === "open").length ?? 0;
  const commercialCount = (proposals?.length ?? 0) + (quotes?.length ?? 0) + (invoices?.length ?? 0);
  const isClientAccount = profile?.account_type === "client";

  return (
    <div className="space-y-6">
      <Link
        href="/portal"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-4" />
        Your events
      </Link>

      <section className="relative overflow-hidden rounded-2xl bg-tide-charcoal text-white shadow-[0_18px_48px_rgba(55,53,54,0.13)]">
        <div className="pointer-events-none absolute -top-36 -right-24 size-96 rounded-full border border-tide-teal/15" />
        <div className="pointer-events-none absolute -top-16 -right-4 size-64 rounded-full border border-tide-teal/10" />
        <div className="relative grid lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="p-5 sm:p-7 lg:p-9">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-bold tracking-[0.13em] text-tide-teal uppercase">Your event</span>
              <StageBadge stage={event.stage} />
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/75">{countdown}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-white sm:text-[2.75rem]">
              {event.name}
            </h1>
            <p className="mt-3 text-sm font-medium text-white/55">Delivered by Tide Events Group for {organisation?.name ?? "your organisation"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <EntityReference label="Event ID" value={event.event_reference} inverse />
              <EntityReference label="Client ID" value={clientReference} inverse />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/68">
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-tide-teal" />{event.venue ?? "Venue to be confirmed"}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-tide-teal" />{formatPortalDate(event.start_date) ?? "Date to be confirmed"}{event.end_date && event.end_date !== event.start_date ? ` – ${formatPortalDate(event.end_date)}` : ""}</span>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.035] p-5 sm:p-7 lg:border-t-0 lg:border-l lg:p-8">
            <p className="text-[11px] font-bold tracking-[0.12em] text-white/42 uppercase">Planning progress</p>
            <div className="mt-4 flex gap-1.5">
              {STAGES.map((stage, index) => (
                <span key={stage} className={cn("h-1.5 flex-1 rounded-full", index <= currentStageIndex ? "bg-tide-teal" : "bg-white/12")} />
              ))}
            </div>
            <p className="mt-2 text-sm text-white/55">Current stage <span className="font-semibold capitalize text-white">{event.stage}</span></p>
            <div className="mt-7 grid grid-cols-3 gap-2">
              <PortalMetric value={documents?.length ?? 0} label="Documents" />
              <PortalMetric value={`${completedMilestones}/${milestones?.length ?? 0}`} label="Milestones" />
              <PortalMetric value={openRequests} label="Open requests" />
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview">
        <div className="overflow-x-auto border-b border-border">
          <TabsList variant="line" className="min-w-max gap-1">
            <TabsTrigger value="overview"><MilestoneIcon className="size-4" />Overview</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="size-4" />Documents <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">{documents?.length ?? 0}</span></TabsTrigger>
            <TabsTrigger value="commercial"><CirclePoundSterling className="size-4" />Commercial <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">{commercialCount}</span></TabsTrigger>
            <TabsTrigger value="requests"><Inbox className="size-4" />Requests {openRequests > 0 && <span className="rounded-full bg-warning-bg px-1.5 py-0.5 text-[11px] text-warning tabular-nums">{openRequests}</span>}</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="size-4" />Messages</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="pt-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MilestoneIcon className="size-4 text-tide-teal" />
                    Planning milestones
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Follow the key steps Tide is managing for your event.</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {milestones?.length ? (
                  <div className="divide-y divide-border/80">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 px-5 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center">
                        <div className={cn(
                          "flex size-9 items-center justify-center rounded-full border text-sm font-bold tabular-nums",
                          milestone.status === "complete" ? "border-success/20 bg-success-bg text-success" : "border-tide-teal/25 bg-tide-teal/10 text-tide-teal",
                        )}>
                          {milestone.status === "complete" ? <CheckCircle2 className="size-4" /> : index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-tide-charcoal">{milestone.title}</p>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5" />
                            {formatPortalDate(milestone.due_date) ?? "No due date set"}
                          </p>
                        </div>
                        <div className="col-start-2 sm:col-start-auto"><MilestoneStatusBadge status={milestone.status} /></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={MilestoneIcon} title="No milestones published yet" description="Tide will publish planning milestones here as your event develops." className="border-none py-12" />
                )}
              </CardContent>
            </Card>

            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Event at a glance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PortalDetail icon={CalendarDays} label="Dates" value={formatPortalDate(event.start_date) ? `${formatPortalDate(event.start_date)}${event.end_date && event.end_date !== event.start_date ? ` – ${formatPortalDate(event.end_date)}` : ""}` : "To be confirmed"} />
                  <PortalDetail icon={MapPin} label="Venue" value={event.venue ?? "To be confirmed"} />
                  <PortalDetail icon={FileText} label="Shared documents" value={`${documents?.length ?? 0} available`} />
                </CardContent>
              </Card>
              <div className="rounded-xl border border-tide-teal/25 bg-tide-teal/[0.08] p-5">
                <p className="font-semibold text-tide-charcoal">Need something from Tide?</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use Requests for files or information, or send the event team a message.</p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-tide-charcoal">
                  Your references are shown at the top <ArrowRight className="size-4 text-tide-teal" />
                </div>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="pt-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-tide-charcoal">Event documents</h2>
              <p className="mt-1 text-sm text-muted-foreground">Approved files and information shared with your organisation.</p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground tabular-nums">{documents?.length ?? 0} available</p>
          </div>
          {documents?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {documents.map((document) => (
                <Card key={document.id} className="transition-[border-color,box-shadow] hover:border-tide-teal/40 hover:shadow-[0_8px_24px_rgba(23,23,23,0.05)]">
                  <CardContent className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tide-teal/10 text-tide-teal">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold leading-5 text-tide-charcoal">{document.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{(document.document_types as { name: string } | null)?.name ?? "Document"}</p>
                        </div>
                        <DocumentStatusBadge status={document.status} />
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <span className="text-xs font-semibold text-muted-foreground">{document.reference ?? "Reference pending"}</span>
                        <Button render={<a href={`/api/documents/${document.id}/file`} />} nativeButton={false} size="sm" variant="outline">
                          <Download className="size-4" /> Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><EmptyState icon={FileText} title="No documents shared yet" description="Documents shared by the Tide team will appear here automatically." className="border-none py-14" /></Card>
          )}
        </TabsContent>

        <TabsContent value="commercial" className="pt-5">
          <div className="space-y-5">
            {commercialCount > 0 && <Card className="border-tide-teal/30 bg-tide-teal/[0.04]"><CardContent className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold text-tide-charcoal">Branded commercial documents</p><p className="mt-1 text-xs text-muted-foreground">Download the complete PDF, including pricing, permanent IDs and Tide’s terms and conditions.</p></div><div className="flex flex-wrap gap-2">{proposals?.map((item) => <Button key={item.id} render={<a href={`/api/business/proposal/${item.id}/pdf`} />} nativeButton={false} size="sm" variant="outline"><Download />{item.proposal_reference}</Button>)}{quotes?.map((item) => <Button key={item.id} render={<a href={`/api/business/quote/${item.id}/pdf`} />} nativeButton={false} size="sm" variant="outline"><Download />{item.quote_reference}</Button>)}{invoices?.map((item) => <Button key={item.id} render={<a href={`/api/business/invoice/${item.id}/pdf`} />} nativeButton={false} size="sm" variant="outline"><Download />{item.invoice_reference}</Button>)}</div></CardContent></Card>}
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4"><div><CardTitle className="flex items-center gap-2"><FileSignature className="size-4 text-tide-teal" />Proposals</CardTitle><p className="mt-1 text-sm text-muted-foreground">Tide’s recommended approach and scope.</p></div></CardHeader>
                <CardContent className="divide-y p-0">
                  {proposals?.length ? proposals.map((proposal) => <article key={proposal.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><EntityReference label="Proposal ID" value={proposal.proposal_reference} /><h3 className="mt-2 font-semibold text-tide-charcoal">{proposal.title}</h3></div><CommercialStatusBadge status={proposal.status} /></div>{proposal.summary && <p className="mt-3 text-sm leading-6 text-muted-foreground">{proposal.summary}</p>}{proposal.scope && <details className="mt-3 rounded-lg border bg-[#f8f9f9] p-3"><summary className="cursor-pointer text-sm font-semibold">View proposed scope</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{proposal.scope}</p></details>}{isClientAccount && ["sent", "viewed"].includes(proposal.status) && <form action={acceptClientProposal} className="mt-4"><input type="hidden" name="proposal_id" value={proposal.id} /><input type="hidden" name="event_id" value={id} /><Button type="submit" size="sm">Accept proposal</Button></form>}</article>) : <EmptyState icon={FileSignature} title="No proposals published" description="Published proposals will appear here." className="border-none py-10" />}
                </CardContent>
              </Card>
              <Card className="gap-0 py-0">
                <CardHeader className="border-b py-4"><div><CardTitle className="flex items-center gap-2"><CirclePoundSterling className="size-4 text-tide-teal" />Quotes</CardTitle><p className="mt-1 text-sm text-muted-foreground">Itemised pricing issued for this event.</p></div></CardHeader>
                <CardContent className="divide-y p-0">
                  {quotes?.length ? quotes.map((quote) => <article key={quote.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><EntityReference label="Quote ID" value={quote.quote_reference} /><h3 className="mt-2 font-semibold text-tide-charcoal">{quote.title}</h3><p className="mt-1 text-xs text-muted-foreground">Valid until {formatBusinessDate(quote.valid_until)}</p></div><CommercialStatusBadge status={quote.status} /></div><div className="mt-4 space-y-2 border-y py-3">{quote.quote_items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{item.description} × {item.quantity}</span><strong>{formatMoney(Number(item.quantity) * Number(item.unit_price))}</strong></div>)}</div><div className="mt-3 flex items-center justify-between"><span className="font-semibold">Total including VAT</span><strong className="text-lg">{formatMoney(quote.total)}</strong></div>{isClientAccount && quote.status === "sent" && <form action={acceptClientQuote} className="mt-4"><input type="hidden" name="quote_id" value={quote.id} /><input type="hidden" name="event_id" value={id} /><Button type="submit" size="sm">Accept quote</Button></form>}</article>) : <EmptyState icon={CirclePoundSterling} title="No quotes published" description="Quotes issued by Tide will appear here." className="border-none py-10" />}
                </CardContent>
              </Card>
            </div>
            <Card className="gap-0 py-0"><CardHeader className="border-b py-4"><div><CardTitle className="flex items-center gap-2"><ReceiptText className="size-4 text-tide-teal" />Invoices and payments</CardTitle><p className="mt-1 text-sm text-muted-foreground">The financial record for this Event ID.</p></div></CardHeader><CardContent className="divide-y p-0">{invoices?.length ? invoices.map((invoice) => <article key={invoice.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><EntityReference label="Invoice ID" value={invoice.invoice_reference} /><CommercialStatusBadge status={invoice.status} /></div><h3 className="mt-2 font-semibold text-tide-charcoal">{invoice.title}</h3><p className="mt-1 text-xs text-muted-foreground">Issued {formatBusinessDate(invoice.issue_date)} · Due {formatBusinessDate(invoice.due_date)}</p></div><div className="grid grid-cols-3 gap-5 text-right"><div><p className="section-label">Total</p><strong className="mt-1 block">{formatMoney(invoice.total)}</strong></div><div><p className="section-label">Paid</p><strong className="mt-1 block text-success">{formatMoney(invoice.amount_paid)}</strong></div><div><p className="section-label">Balance</p><strong className="mt-1 block text-lg">{formatMoney(invoice.balance_due)}</strong></div></div></article>) : <EmptyState icon={ReceiptText} title="No invoices published" description="Invoices and payment status will appear here." className="border-none py-10" />}</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="pt-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)]">
          <Card className="self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="size-4 text-tide-teal" />
                Request something from Tide
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">Ask for information or a file and the event team will respond here.</p>
            </CardHeader>
            <CardContent>
              <form action={raiseClientRequest} className="space-y-5">
                <input type="hidden" name="event_id" value={id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="request-type" className="text-sm font-semibold text-tide-charcoal">Request type</label>
                    <select id="request-type" name="type" required className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/25">
                      <option value="information">Information request</option>
                      <option value="file_upload">File request</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="request-title" className="text-sm font-semibold text-tide-charcoal">Subject</label>
                    <Input id="request-title" name="title" required placeholder="Latest risk assessment" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="request-details" className="text-sm font-semibold text-tide-charcoal">What do you need?</label>
                  <Textarea id="request-details" name="description" rows={4} placeholder="Add any details that will help the Tide team respond…" />
                </div>
                <Button type="submit">
                  <Send className="size-4" /> Send request
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle>Request history</CardTitle>
              <p className="text-sm text-muted-foreground">Track replies from the Tide team.</p>
            </CardHeader>
            <CardContent className="divide-y divide-border/80 p-0">
              {requests?.length ? (
                requests.map((request) => (
                  <div key={request.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-tide-charcoal">{request.title}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">{request.type.replace("_", " ")}</p>
                      </div>
                      <ClientRequestStatusBadge status={request.status} />
                    </div>
                    {request.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{request.description}</p>}
                    {request.response_note && (
                      <div className="mt-4 rounded-lg border border-tide-teal/20 bg-tide-teal/[0.07] p-3 text-sm leading-6 text-tide-charcoal">
                        <span className="font-semibold">Tide response:</span> {request.response_note}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState icon={Inbox} title="No requests yet" description="Requests you send will be tracked here." className="border-none py-12" />
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="pt-5">
          <Card className="mx-auto max-w-4xl gap-0 py-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-[#f7f8f8] px-5 py-4">
              <div>
                <p className="font-semibold text-tide-charcoal">Event correspondence</p>
                <p className="mt-0.5 text-xs text-muted-foreground">A shared conversation with your Tide event team</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <EntityReference label="Event ID" value={event.event_reference} />
                <EntityReference label="Client ID" value={clientReference} />
              </div>
            </div>
            <CardContent className="min-h-72 max-h-[520px] space-y-5 overflow-y-auto p-5 sm:p-6">
              {messages?.length ? (
                messages.map((m) => {
                  const sender = m.user_profiles as { full_name: string } | null;
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse text-right" : ""}`}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-xs font-bold text-tide-teal ring-1 ring-tide-teal/15">
                        {initials(sender?.full_name || "?")}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-muted-foreground">{mine ? "You" : sender?.full_name ?? "Tide Events Group"}</div>
                        <div className={cn("mt-1 inline-block max-w-lg rounded-xl px-4 py-2.5 text-left text-sm leading-6", mine ? "bg-tide-charcoal text-white" : "bg-muted text-tide-charcoal")}>
                          {m.body}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={Mail} title="Start the conversation" description="Send the Tide team a message about this event." className="border-none py-12" />
              )}
            </CardContent>
            <div className="border-t bg-[#fafbfb] p-4 sm:p-5">
              <form action={sendEventMessage} className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="event_id" value={id} />
                <input type="hidden" name="visible_to_client" value="true" />
                <div className="min-w-0 flex-1 space-y-2">
                  <label htmlFor="client-message" className="text-sm font-semibold text-tide-charcoal">Message</label>
                  <Textarea id="client-message" name="body" required rows={2} placeholder="Write a message to the Tide event team…" className="min-h-20" />
                </div>
                <Button type="submit">
                  <Send className="size-4" /> Send message
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PortalMetric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-3 text-center">
      <p className="text-xl font-semibold tracking-[-0.02em] text-white tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] leading-4 text-white/45">{label}</p>
    </div>
  );
}

function PortalDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tide-teal/10 text-tide-teal">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-5 text-tide-charcoal">{value}</p>
      </div>
    </div>
  );
}
