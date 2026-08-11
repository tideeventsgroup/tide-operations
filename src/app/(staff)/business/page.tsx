import Link from "next/link";
import { ArrowRight, Banknote, BookOpenText, BriefcaseBusiness, CirclePoundSterling, FileSignature, Plus, ReceiptText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { EmptyState } from "@/components/empty-state";
import { EntityReference } from "@/components/entity-reference";
import { formatBusinessDate, formatMoney } from "@/lib/business";

export default async function BusinessPage() {
  const supabase = await createClient();
  const [{ data: overview }, { data: opportunities }, { data: quotes }, { data: invoices }, { data: proposals }] = await Promise.all([
    supabase.from("v_commercial_overview").select("*").single(),
    supabase.from("business_opportunities").select("*, organisations(name, client_reference), events(name, event_reference)").not("stage", "in", "(won,lost)").order("expected_close_date").limit(8),
    supabase.from("quotes").select("*, organisations(name, client_reference), events(name, event_reference)").order("created_at", { ascending: false }).limit(6),
    supabase.from("invoices").select("*, organisations(name, client_reference), events(name, event_reference)").order("created_at", { ascending: false }).limit(8),
    supabase.from("proposals").select("id, status").in("status", ["sent", "viewed"]),
  ]);

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Business"
        title="Commercial command centre"
        description="Pipeline, proposals, quotations, invoices and payments connected to every Client ID and Event ID."
        actions={<div className="flex flex-wrap gap-2"><Button render={<Link href="/business/opportunities/new" />} nativeButton={false} size="sm"><Plus />Opportunity</Button><Button render={<Link href="/business/quotes/new" />} nativeButton={false} size="sm" variant="outline"><Plus />Quote</Button><Button render={<Link href="/business/invoices/new" />} nativeButton={false} size="sm" variant="outline"><Plus />Invoice</Button><Button render={<Link href="/business/library" />} nativeButton={false} size="sm" variant="outline"><BookOpenText />Services & terms</Button></div>}
      />

      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <StatCard label="Weighted pipeline" value={formatMoney(overview?.weighted_pipeline)} icon={BriefcaseBusiness} href="/business" />
        <StatCard label="Quotes awaiting decision" value={overview?.quotes_awaiting_decision ?? 0} icon={CirclePoundSterling} tone="info" href="/business" />
        <StatCard label="Outstanding invoices" value={formatMoney(overview?.outstanding_invoices)} icon={Banknote} tone="warning" href="/business" />
        <StatCard label="Overdue invoices" value={overview?.overdue_invoices ?? 0} icon={ReceiptText} tone={(overview?.overdue_invoices ?? 0) > 0 ? "warning" : "neutral"} href="/business" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between border-b py-4"><CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-tide-teal" />Live pipeline</CardTitle><Link href="/business/opportunities/new" className="text-sm font-semibold text-tide-teal">Add opportunity</Link></CardHeader>
          <CardContent className="p-0">
            {opportunities?.length ? <Table><TableHeader><TableRow><TableHead>Opportunity</TableHead><TableHead>Expected</TableHead><TableHead>Weighted</TableHead><TableHead className="text-right">Stage</TableHead></TableRow></TableHeader><TableBody>{opportunities.map((item) => {
              const org = item.organisations as { name: string; client_reference: string } | null;
              const event = item.events as { name: string; event_reference: string } | null;
              return <TableRow key={item.id}><TableCell><Link href={`/business/opportunities/${item.id}`} className="font-semibold text-tide-charcoal hover:text-tide-teal">{item.name}</Link><p className="mt-0.5 text-xs text-muted-foreground">{org?.name}</p><div className="mt-1 flex flex-wrap gap-1"><EntityReference label="Client ID" value={org?.client_reference} />{event && <EntityReference label="Event ID" value={event.event_reference} />}</div></TableCell><TableCell className="text-muted-foreground">{formatBusinessDate(item.expected_close_date)}</TableCell><TableCell className="font-semibold tabular-nums">{formatMoney(Number(item.estimated_value) * item.probability / 100)}</TableCell><TableCell className="text-right"><CommercialStatusBadge status={item.stage} /></TableCell></TableRow>;
            })}</TableBody></Table> : <EmptyState icon={BriefcaseBusiness} title="No live opportunities" description="Add an enquiry or sales opportunity to start the commercial workflow." className="border-none py-12" />}
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="gap-0 py-0"><CardHeader className="border-b py-4"><CardTitle className="flex items-center gap-2"><FileSignature className="size-4 text-tide-teal" />Commercial workflow</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3 p-4">
            <Link href="/business/proposals" className="rounded-xl border bg-white p-4 transition-colors hover:border-tide-teal/40 hover:bg-tide-teal/[0.04]"><span className="section-label">Proposals</span><strong className="mt-2 block text-2xl text-tide-charcoal">{proposals?.length ?? 0}</strong><span className="text-xs text-muted-foreground">Awaiting decision</span></Link>
            <Link href="/business/quotes" className="rounded-xl border bg-white p-4 transition-colors hover:border-tide-teal/40 hover:bg-tide-teal/[0.04]"><span className="section-label">Quotes</span><strong className="mt-2 block text-2xl text-tide-charcoal">{quotes?.length ?? 0}</strong><span className="text-xs text-muted-foreground">Recent records</span></Link>
            <Link href="/business/invoices" className="rounded-xl border bg-white p-4 transition-colors hover:border-tide-teal/40 hover:bg-tide-teal/[0.04]"><span className="section-label">Invoices</span><strong className="mt-2 block text-2xl text-tide-charcoal">{invoices?.length ?? 0}</strong><span className="text-xs text-muted-foreground">Recent records</span></Link>
          </CardContent></Card>
          <Card className="gap-0 py-0"><CardHeader className="border-b py-4"><CardTitle>Recent invoices</CardTitle></CardHeader><CardContent className="p-0">{invoices?.length ? <Table><TableBody>{invoices.map((invoice) => <TableRow key={invoice.id}><TableCell><Link href={`/business/invoices/${invoice.id}`} className="font-semibold text-tide-charcoal hover:text-tide-teal">{invoice.invoice_reference}</Link><p className="text-xs text-muted-foreground">{(invoice.organisations as { name: string } | null)?.name}</p></TableCell><TableCell className="text-right font-semibold tabular-nums">{formatMoney(invoice.balance_due)}</TableCell><TableCell className="text-right"><CommercialStatusBadge status={invoice.status} /></TableCell></TableRow>)}</TableBody></Table> : <EmptyState icon={ReceiptText} title="No invoices yet" className="border-none py-8" />}</CardContent><Link href="/business/invoices" className="flex items-center justify-between border-t px-5 py-3 text-sm font-semibold text-tide-teal">Open invoice register <ArrowRight className="size-4" /></Link></Card>
        </div>
      </div>
    </div>
  );
}
