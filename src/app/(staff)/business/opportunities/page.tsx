import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { EmptyState } from "@/components/empty-state";
import { EntityReference } from "@/components/entity-reference";
import { formatBusinessDate, formatMoney } from "@/lib/business";

export default async function OpportunitiesRegisterPage() {
  const supabase = await createClient(); const { data } = await supabase.from("business_opportunities").select("*, organisations(name, client_reference), events(name, event_reference)").order("created_at", { ascending: false });
  return <div className="mx-auto max-w-[1480px]"><PageHeader eyebrow="Business register" title="Opportunities" description="Every enquiry and commercial opportunity, from first contact to won or lost." actions={<Button render={<Link href="/business/opportunities/new" />} nativeButton={false}><Plus />New opportunity</Button>} /><Card className="gap-0 py-0"><CardContent className="p-0">{data?.length ? <Table><TableHeader><TableRow><TableHead>Opportunity</TableHead><TableHead>Client / event</TableHead><TableHead>Decision</TableHead><TableHead className="text-right">Value</TableHead><TableHead className="text-right">Probability</TableHead><TableHead className="text-right">Stage</TableHead></TableRow></TableHeader><TableBody>{data.map((record) => { const org=record.organisations as {name:string;client_reference:string}|null; const event=record.events as {name:string;event_reference:string}|null; return <TableRow key={record.id}><TableCell><Link href={`/business/opportunities/${record.id}`} className="font-semibold text-tide-charcoal hover:text-tide-teal">{record.name}</Link><EntityReference label="Opportunity ID" value={record.opportunity_reference} className="mt-1" /></TableCell><TableCell><span className="block font-medium">{org?.name}</span><div className="mt-1 flex flex-wrap gap-1"><EntityReference label="Client ID" value={org?.client_reference} />{event && <EntityReference label="Event ID" value={event.event_reference} />}</div></TableCell><TableCell>{formatBusinessDate(record.expected_close_date)}</TableCell><TableCell className="text-right font-semibold">{formatMoney(record.estimated_value)}</TableCell><TableCell className="text-right">{record.probability}%</TableCell><TableCell className="text-right"><CommercialStatusBadge status={record.stage} /></TableCell></TableRow>; })}</TableBody></Table> : <EmptyState icon={BriefcaseBusiness} title="No opportunities" className="border-none py-14" />}</CardContent></Card></div>;
}
