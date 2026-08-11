import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/actions/business";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommercialLinkFields } from "@/components/business/commercial-link-fields";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const [{ data: organisations }, { data: events }, { data: terms }] = await Promise.all([
    supabase.from("organisations").select("id, name, client_reference").order("name"),
    supabase.from("events").select("id, name, event_reference").order("start_date", { ascending: false }),
    supabase.from("commercial_terms_templates").select("body").eq("active", true).eq("is_default", true).limit(1).maybeSingle(),
  ]);
  const today = new Date(); const due = new Date(today); due.setDate(due.getDate() + 14);
  return <div className="mx-auto max-w-3xl"><Link href="/business" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link><PageHeader eyebrow="Finance" title="New invoice" description="Create an invoice linked to its Client ID and Event ID, then add the charge lines." /><Card><CardContent><form action={createInvoice} className="grid gap-5 sm:grid-cols-2"><CommercialLinkFields organisations={(organisations ?? []).map((item) => ({ id: item.id, label: `${item.client_reference} · ${item.name}` }))} events={(events ?? []).map((item) => ({ id: item.id, label: `${item.event_reference} · ${item.name}` }))} /><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="title">Invoice title</Label><Input id="title" name="title" required /></div><div className="space-y-1.5"><Label htmlFor="issue_date">Issue date</Label><Input id="issue_date" name="issue_date" type="date" defaultValue={today.toISOString().slice(0, 10)} /></div><div className="space-y-1.5"><Label htmlFor="due_date">Due date</Label><Input id="due_date" name="due_date" type="date" defaultValue={due.toISOString().slice(0, 10)} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="payment_terms">Full payment terms and conditions</Label><Textarea id="payment_terms" name="payment_terms" rows={16} defaultValue={terms?.body ?? ""} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} /></div><Button type="submit" className="w-fit sm:col-span-2">Create invoice</Button></form></CardContent></Card></div>;
}
