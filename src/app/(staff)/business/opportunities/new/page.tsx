import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createOpportunity } from "@/lib/actions/business";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommercialLinkFields } from "@/components/business/commercial-link-fields";

export default async function NewOpportunityPage() {
  const supabase = await createClient();
  const [{ data: organisations }, { data: events }] = await Promise.all([
    supabase.from("organisations").select("id, name, client_reference").order("name"),
    supabase.from("events").select("id, name, event_reference").order("start_date", { ascending: false }),
  ]);
  return <div className="mx-auto max-w-3xl"><Link href="/business" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link><PageHeader eyebrow="Pipeline" title="New opportunity" description="Capture the enquiry before it becomes an event, while retaining the permanent Client ID." /><Card><CardContent><form action={createOpportunity} className="grid gap-5 sm:grid-cols-2"><CommercialLinkFields organisations={(organisations ?? []).map((item) => ({ id: item.id, label: `${item.client_reference} · ${item.name}` }))} events={(events ?? []).map((item) => ({ id: item.id, label: `${item.event_reference} · ${item.name}` }))} /><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="name">Opportunity name</Label><Input id="name" name="name" required /></div><div className="space-y-1.5"><Label htmlFor="source">Enquiry source</Label><Input id="source" name="source" placeholder="Referral, website, tender…" /></div><div className="space-y-1.5"><Label htmlFor="expected_close_date">Expected decision</Label><Input id="expected_close_date" name="expected_close_date" type="date" /></div><div className="space-y-1.5"><Label htmlFor="estimated_value">Estimated value</Label><Input id="estimated_value" name="estimated_value" type="number" min="0" step="0.01" defaultValue="0" /></div><div className="space-y-1.5"><Label htmlFor="probability">Win probability (%)</Label><Input id="probability" name="probability" type="number" min="0" max="100" defaultValue="25" /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={5} /></div><Button type="submit" className="w-fit sm:col-span-2">Create opportunity</Button></form></CardContent></Card></div>;
}
