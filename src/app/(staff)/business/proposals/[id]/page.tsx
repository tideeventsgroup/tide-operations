import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Settings2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addProposalService, deleteProposalService, updateProposal } from "@/lib/actions/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { EntityReference } from "@/components/entity-reference";
import { formatBusinessDate, humanise, proposalStatuses } from "@/lib/business";
import { ServicePickerForm } from "@/components/business/service-picker-form";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: proposal }, { data: services }] = await Promise.all([
    supabase.from("proposals").select("*, organisations(name, client_reference), events(name, event_reference), documents(id, title, reference), quotes(id, quote_reference, total), proposal_services(*)").eq("id", id).maybeSingle(),
    supabase.from("business_services").select("id, code, name, category, default_unit_price, unit_label").eq("active", true).order("category").order("name"),
  ]);
  if (!proposal) notFound();
  const org = proposal.organisations as { name: string; client_reference: string } | null;
  const event = proposal.events as { name: string; event_reference: string } | null;
  const proposalServices = [...proposal.proposal_services].sort((a, b) => a.position - b.position);

  return <div className="mx-auto max-w-6xl">
    <Link href="/business" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link>
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-3 flex flex-wrap gap-1.5"><EntityReference label="Proposal ID" value={proposal.proposal_reference} /><EntityReference label="Client ID" value={org?.client_reference} />{event && <EntityReference label="Event ID" value={event.event_reference} />}</div>
        <h1 className="text-3xl font-semibold tracking-tight text-tide-charcoal">{proposal.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{org?.name} · Valid until {formatBusinessDate(proposal.valid_until)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2"><CommercialStatusBadge status={proposal.status} /><Button render={<Link href={`/api/business/proposal/${proposal.id}/pdf`} />} nativeButton={false} size="sm" variant="outline"><Download />Download PDF</Button></div>
    </div>

    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card className="overflow-hidden">
        <div className="border-b bg-tide-charcoal px-6 py-5 text-white"><div className="flex items-center justify-between"><span className="section-label !text-tide-teal">Tide Events Group</span><FileText className="size-5 text-tide-teal" /></div><h2 className="mt-8 max-w-2xl text-2xl font-semibold">{proposal.title}</h2><p className="mt-2 text-sm text-white/55">Prepared for {org?.name}</p></div>
        <CardContent className="space-y-8 p-6 md:p-8">
          {proposal.summary && <section><p className="section-label mb-3">Executive summary</p><p className="whitespace-pre-wrap text-[15px] leading-7 text-tide-charcoal">{proposal.summary}</p></section>}
          {proposalServices.length > 0 && <section><p className="section-label mb-3">Included Tide services</p><div className="divide-y rounded-xl border">{proposalServices.map((service) => <div key={service.id} className="flex items-start justify-between gap-3 p-4"><div><strong className="text-sm text-tide-charcoal">{service.service_name}</strong><p className="mt-1 text-sm leading-6 text-muted-foreground">{service.description}</p></div><form action={deleteProposalService}><input type="hidden" name="proposal_id" value={proposal.id} /><input type="hidden" name="item_id" value={service.id} /><Button type="submit" size="icon-sm" variant="ghost" aria-label="Remove service"><Trash2 /></Button></form></div>)}</div></section>}
          {proposal.scope && <section><p className="section-label mb-3">Proposed scope</p><p className="whitespace-pre-wrap text-[15px] leading-7 text-tide-charcoal">{proposal.scope}</p></section>}
          {proposal.assumptions && <section className="rounded-xl border bg-[#f8f9f9] p-5"><p className="section-label mb-3">Assumptions and exclusions</p><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{proposal.assumptions}</p></section>}
          <ServicePickerForm action={addProposalService} parentName="proposal_id" parentId={proposal.id} services={services ?? []} />
          {proposal.document_id && <Link href={`/documents/${proposal.document_id}`} className="flex items-center gap-3 rounded-xl border p-4 font-semibold text-tide-charcoal hover:border-tide-teal/40"><FileText className="size-5 text-tide-teal" />Open attached proposal document</Link>}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Settings2 className="size-4 text-tide-teal" />Proposal controls</CardTitle></CardHeader>
        <CardContent><form action={updateProposal} className="space-y-4">
          <input type="hidden" name="id" value={proposal.id} />
          <div className="space-y-1.5"><Label htmlFor="status">Status</Label><select id="status" name="status" defaultValue={proposal.status} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm">{proposalStatuses.map((status) => <option key={status} value={status}>{humanise(status)}</option>)}</select></div>
          <label className="flex items-start gap-3 rounded-lg border bg-[#f8f9f9] p-3"><input type="checkbox" name="client_visible" defaultChecked={proposal.client_visible} className="mt-1 size-4" /><span><strong className="block text-sm">Show in client portal</strong><small className="text-muted-foreground">Only published proposals are visible to this client.</small></span></label>
          <div className="space-y-1.5"><Label htmlFor="valid_until">Valid until</Label><Input id="valid_until" name="valid_until" type="date" defaultValue={proposal.valid_until ?? ""} /></div>
          <div className="space-y-1.5"><Label htmlFor="accepted_by_name">Accepted by</Label><Input id="accepted_by_name" name="accepted_by_name" defaultValue={proposal.accepted_by_name ?? ""} /></div>
          <details className="rounded-lg border"><summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold marker:hidden">Edit proposal content</summary><div className="space-y-4 border-t p-3">
            <div className="space-y-1.5"><Label htmlFor="summary">Summary</Label><Textarea id="summary" name="summary" rows={4} defaultValue={proposal.summary ?? ""} /></div>
            <div className="space-y-1.5"><Label htmlFor="scope">Scope</Label><Textarea id="scope" name="scope" rows={7} defaultValue={proposal.scope ?? ""} /></div>
            <div className="space-y-1.5"><Label htmlFor="assumptions">Assumptions</Label><Textarea id="assumptions" name="assumptions" rows={4} defaultValue={proposal.assumptions ?? ""} /></div>
            <div className="space-y-1.5"><Label htmlFor="terms">Full terms and conditions</Label><Textarea id="terms" name="terms" rows={12} defaultValue={proposal.terms ?? ""} /></div>
          </div></details>
          <Button type="submit" className="w-full">Save proposal</Button>
        </form></CardContent>
      </Card>
    </div>
  </div>;
}
