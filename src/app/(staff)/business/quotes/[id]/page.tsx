import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FilePlus2, Plus, Settings2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addQuoteItem, addQuoteService, createInvoiceFromQuote, deleteQuoteItem, updateQuote } from "@/lib/actions/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { EntityReference } from "@/components/entity-reference";
import { EmptyState } from "@/components/empty-state";
import { formatBusinessDate, formatMoney, humanise, quoteStatuses } from "@/lib/business";
import { ServicePickerForm } from "@/components/business/service-picker-form";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: quote }, { data: services }] = await Promise.all([
    supabase.from("quotes").select("*, organisations(name, client_reference), events(name, event_reference), quote_items(*)").eq("id", id).maybeSingle(),
    supabase.from("business_services").select("id, code, name, category, default_unit_price, unit_label").eq("active", true).order("category").order("name"),
  ]);
  if (!quote) notFound();
  const org = quote.organisations as { name: string; client_reference: string } | null;
  const event = quote.events as { name: string; event_reference: string } | null;
  const items = [...quote.quote_items].sort((a, b) => a.position - b.position);

  return <div className="mx-auto max-w-6xl">
    <Link href="/business" className="mb-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link>

    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-1.5"><EntityReference label="Quote ID" value={quote.quote_reference} /><EntityReference label="Client ID" value={org?.client_reference} />{event && <EntityReference label="Event ID" value={event.event_reference} />}</div>
        <h1 className="text-3xl font-semibold tracking-tight text-tide-charcoal">{quote.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{org?.name} · Issued {formatBusinessDate(quote.issue_date)} · Valid until {formatBusinessDate(quote.valid_until)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2"><CommercialStatusBadge status={quote.status} /><Button render={<Link href={`/api/business/quote/${quote.id}/pdf`} />} nativeButton={false} size="sm" variant="outline"><Download />PDF</Button><form action={createInvoiceFromQuote}><input type="hidden" name="quote_id" value={quote.id} /><Button type="submit" size="sm" variant="outline"><FilePlus2 />Create invoice</Button></form></div>
    </header>

    <section className="mb-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border bg-white p-4"><p className="section-label">Quote total</p><strong className="mt-2 block text-2xl tracking-tight">{formatMoney(quote.total)}</strong></div>
      <div className="rounded-xl border bg-white p-4"><p className="section-label">Valid until</p><strong className="mt-2 block text-lg">{formatBusinessDate(quote.valid_until)}</strong></div>
      <div className="rounded-xl border bg-white p-4"><p className="section-label">Client access</p><strong className="mt-2 block text-lg">{quote.client_visible ? "Visible" : "Internal"}</strong></div>
    </section>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between border-b py-4"><div><CardTitle>Services</CardTitle><p className="mt-1 text-xs text-muted-foreground">{items.length} line{items.length === 1 ? "" : "s"} included</p></div><strong className="text-lg">{formatMoney(quote.total)}</strong></CardHeader>
          <CardContent className="p-0">
            {items.length ? <Table className="table-fixed"><TableHeader><TableRow><TableHead>Service</TableHead><TableHead className="hidden w-40 sm:table-cell">Pricing</TableHead><TableHead className="w-24 text-right">Total</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.id}>
              <TableCell className="whitespace-normal"><p className="font-medium leading-5 text-tide-charcoal">{item.description}</p><p className="mt-1 text-xs text-muted-foreground sm:hidden">{item.quantity} × {formatMoney(item.unit_price)} · {item.tax_rate}% VAT</p></TableCell>
              <TableCell className="hidden whitespace-normal text-muted-foreground sm:table-cell">{item.quantity} × {formatMoney(item.unit_price)} <span className="block text-xs">+ {item.tax_rate}% VAT</span></TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{formatMoney(Number(item.quantity) * Number(item.unit_price) * (1 + Number(item.tax_rate) / 100))}</TableCell>
              <TableCell className="text-right"><form action={deleteQuoteItem}><input type="hidden" name="quote_id" value={quote.id} /><input type="hidden" name="item_id" value={item.id} /><Button type="submit" size="icon-sm" variant="ghost" aria-label="Delete quote line"><Trash2 /></Button></form></TableCell>
            </TableRow>)}</TableBody></Table> : <EmptyState icon={Plus} title="No services added" description="Add a saved service or create a custom line below." className="border-none py-10" />}
          </CardContent>
          <div className="border-t bg-[#f8f9f9] px-5 py-4"><div className="ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><strong className="text-tide-charcoal">{formatMoney(quote.subtotal)}</strong></div><div className="flex justify-between text-muted-foreground"><span>VAT</span><strong className="text-tide-charcoal">{formatMoney(quote.tax_total)}</strong></div><div className="flex justify-between border-t pt-2 text-base"><span>Total</span><strong>{formatMoney(quote.total)}</strong></div></div></div>
        </Card>

        <ServicePickerForm action={addQuoteService} parentName="quote_id" parentId={quote.id} services={services ?? []} />

        <details className="group rounded-xl border bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold marker:hidden"><span className="flex items-center gap-2"><Plus className="size-4 text-tide-teal" />Add custom line</span><Plus className="size-4 text-muted-foreground transition-transform group-open:rotate-45" /></summary>
          <form action={addQuoteItem} className="grid gap-3 border-t bg-[#f8f9f9] p-4 md:grid-cols-[minmax(0,1fr)_80px_120px_80px_auto]"><input type="hidden" name="quote_id" value={quote.id} /><input type="hidden" name="position" value={items.length + 1} /><Input name="description" required placeholder="Service or deliverable" aria-label="Description" /><Input name="quantity" required type="number" min="0.01" step="0.01" defaultValue="1" aria-label="Quantity" /><Input name="unit_price" required type="number" min="0" step="0.01" placeholder="Unit price" aria-label="Unit price" /><Input name="tax_rate" required type="number" min="0" max="100" step="0.01" defaultValue="20" aria-label="VAT rate" /><Button type="submit"><Plus />Add</Button></form>
        </details>
      </div>

      <Card className="h-fit">
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Settings2 className="size-4 text-tide-teal" />Quote controls</CardTitle></CardHeader>
        <CardContent><form action={updateQuote} className="space-y-4"><input type="hidden" name="id" value={quote.id} />
          <div className="space-y-1.5"><Label htmlFor="status">Status</Label><select id="status" name="status" defaultValue={quote.status} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm">{quoteStatuses.map((status) => <option key={status} value={status}>{humanise(status)}</option>)}</select></div>
          <div className="space-y-1.5"><Label htmlFor="valid_until">Valid until</Label><Input id="valid_until" name="valid_until" type="date" defaultValue={quote.valid_until ?? ""} /></div>
          <label className="flex items-start gap-3 rounded-lg border bg-[#f8f9f9] p-3"><input type="checkbox" name="client_visible" defaultChecked={quote.client_visible} className="mt-1 size-4" /><span><strong className="block text-sm">Client portal</strong><small className="text-muted-foreground">Show this quote to the client.</small></span></label>
          <details className="group rounded-lg border"><summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold marker:hidden">Notes, acceptance and terms</summary><div className="space-y-4 border-t p-3"><div className="space-y-1.5"><Label htmlFor="accepted_by_name">Accepted by</Label><Input id="accepted_by_name" name="accepted_by_name" defaultValue={quote.accepted_by_name ?? ""} /></div><div className="space-y-1.5"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} defaultValue={quote.notes ?? ""} /></div><div className="space-y-1.5"><Label htmlFor="terms">Terms</Label><Textarea id="terms" name="terms" rows={8} defaultValue={quote.terms ?? ""} /></div></div></details>
          <Button type="submit" className="w-full">Save quote</Button>
        </form></CardContent>
      </Card>
    </div>
  </div>;
}
