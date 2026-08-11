import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createProposal } from "@/lib/actions/business";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommercialLinkFields } from "@/components/business/commercial-link-fields";

export default async function NewProposalPage() {
  const supabase = await createClient();
  const [{ data: organisations }, { data: events }, { data: opportunities }, { data: terms }] = await Promise.all([
    supabase.from("organisations").select("id, name, client_reference").order("name"),
    supabase.from("events").select("id, name, event_reference").order("start_date", { ascending: false }),
    supabase.from("business_opportunities").select("id, name, opportunity_reference").not("stage", "in", "(won,lost)").order("created_at", { ascending: false }),
    supabase.from("commercial_terms_templates").select("body").eq("active", true).eq("is_default", true).limit(1).maybeSingle(),
  ]);
  return <div className="mx-auto max-w-3xl"><Link href="/business" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link><PageHeader eyebrow="Commercial" title="New proposal" description="Set out Tide’s approach, scope and assumptions, then publish it to the client portal." /><Card><CardContent><form action={createProposal} className="grid gap-5 sm:grid-cols-2"><CommercialLinkFields organisations={(organisations ?? []).map((item) => ({ id: item.id, label: `${item.client_reference} · ${item.name}` }))} events={(events ?? []).map((item) => ({ id: item.id, label: `${item.event_reference} · ${item.name}` }))} opportunities={(opportunities ?? []).map((item) => ({ id: item.id, label: `${item.opportunity_reference} · ${item.name}` }))} includeOpportunity /><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="title">Proposal title</Label><Input id="title" name="title" required /></div><div className="space-y-1.5"><Label htmlFor="valid_until">Valid until</Label><Input id="valid_until" name="valid_until" type="date" /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="summary">Executive summary</Label><Textarea id="summary" name="summary" rows={4} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="scope">Proposed scope</Label><Textarea id="scope" name="scope" rows={7} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="assumptions">Assumptions and exclusions</Label><Textarea id="assumptions" name="assumptions" rows={4} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="terms">Full terms and conditions</Label><Textarea id="terms" name="terms" rows={16} defaultValue={terms?.body ?? ""} /></div><Button type="submit" className="w-fit sm:col-span-2">Create proposal</Button></form></CardContent></Card></div>;
}
