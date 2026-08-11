import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createQuote } from "@/lib/actions/business";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommercialLinkFields } from "@/components/business/commercial-link-fields";

export default async function NewQuotePage() {
  const supabase = await createClient();
  const [{ data: organisations }, { data: events }, { data: opportunities }, { data: terms }, { data: settings }] = await Promise.all([
    supabase.from("organisations").select("id, name, client_reference").order("name"),
    supabase.from("events").select("id, name, event_reference").order("start_date", { ascending: false }),
    supabase.from("business_opportunities").select("id, name, opportunity_reference").not("stage", "in", "(won,lost)").order("created_at", { ascending: false }),
    supabase.from("commercial_terms_templates").select("body").eq("active", true).eq("is_default", true).limit(1).maybeSingle(),
    supabase.from("system_settings").select("quote_valid_days").eq("id", "default").maybeSingle(),
  ]);
  const issueDate = new Date();
  const validUntil = new Date(issueDate);
  validUntil.setDate(validUntil.getDate() + (settings?.quote_valid_days ?? 30));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/business" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link>
      <PageHeader eyebrow="Commercial" title="New quote" description="Create the quote header first, then build its priced line items." />
      <Card><CardContent><form action={createQuote} className="grid gap-5 sm:grid-cols-2">
        <CommercialLinkFields organisations={(organisations ?? []).map((item) => ({ id: item.id, label: `${item.client_reference} · ${item.name}` }))} events={(events ?? []).map((item) => ({ id: item.id, label: `${item.event_reference} · ${item.name}` }))} opportunities={(opportunities ?? []).map((item) => ({ id: item.id, label: `${item.opportunity_reference} · ${item.name}` }))} includeOpportunity />
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="title">Quote title</Label><Input id="title" name="title" required /></div>
        <div className="space-y-1.5"><Label htmlFor="issue_date">Issue date</Label><Input id="issue_date" name="issue_date" type="date" defaultValue={issueDate.toISOString().slice(0, 10)} /></div>
        <div className="space-y-1.5"><Label htmlFor="valid_until">Valid until</Label><Input id="valid_until" name="valid_until" type="date" defaultValue={validUntil.toISOString().slice(0, 10)} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="notes">Client notes</Label><Textarea id="notes" name="notes" rows={3} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="terms">Full terms and conditions</Label><Textarea id="terms" name="terms" rows={16} defaultValue={terms?.body ?? ""} /></div>
        <Button type="submit" className="w-fit sm:col-span-2">Create quote</Button>
      </form></CardContent></Card>
    </div>
  );
}
