import Link from "next/link";
import { ArrowLeft, BadgePoundSterling, BookOpenText, Plus } from "lucide-react";
import { createBusinessService, updateBusinessService, updateTermsTemplate } from "@/lib/actions/business";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/business";

export default async function CommercialLibraryPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: terms }] = await Promise.all([
    supabase.from("business_services").select("*").order("category").order("name"),
    supabase.from("commercial_terms_templates").select("*").eq("active", true).order("is_default", { ascending: false }),
  ]);

  return <div className="mx-auto max-w-7xl">
    <Link href="/business" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Business</Link>
    <PageHeader
      eyebrow="Commercial settings"
      title="Tide service and terms library"
      description="One approved catalogue feeds proposals, quotes and invoices. Prices are starting rates excluding VAT and can be edited on each commercial document."
    />

    <div className="mb-5 grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border bg-white p-4"><p className="section-label">Position</p><strong className="mt-2 block text-lg">Affordable specialist</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">Regional pricing below typical agency rates, without discounting safety-critical responsibility.</p></div>
      <div className="rounded-xl border bg-white p-4"><p className="section-label">Planning entry point</p><strong className="mt-2 block text-lg">{formatMoney(495)}</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">Small Event Safety Starter Pack, excluding VAT.</p></div>
      <div className="rounded-xl border bg-white p-4"><p className="section-label">Operational day</p><strong className="mt-2 block text-lg">{formatMoney(425)}–{formatMoney(450)}</strong><p className="mt-1 text-xs leading-5 text-muted-foreground">Standard Tide event-day starting range, excluding VAT and expenses.</p></div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4"><CardTitle className="flex items-center gap-2"><BadgePoundSterling className="size-4 text-tide-teal" />Service catalogue</CardTitle></CardHeader>
          <CardContent className="grid gap-4 p-4 lg:grid-cols-2">
            {(services ?? []).map((service) => <form key={service.id} action={updateBusinessService} className="rounded-xl border bg-white p-4">
              <input type="hidden" name="id" value={service.id} />
              <div className="mb-3 flex items-start justify-between gap-3"><div><span className="rounded bg-tide-charcoal px-2 py-1 text-[10px] font-bold tracking-wide text-white">{service.code}</span><p className="mt-2 text-xs font-semibold text-tide-teal">{service.category}</p></div><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" name="active" defaultChecked={service.active} />Active</label></div>
              <div className="space-y-3">
                <div><Label htmlFor={`name-${service.id}`}>Service name</Label><Input id={`name-${service.id}`} name="name" defaultValue={service.name} required /></div>
                <div><Label htmlFor={`description-${service.id}`}>Client description</Label><Textarea id={`description-${service.id}`} name="description" rows={4} defaultValue={service.description} required /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label htmlFor={`category-${service.id}`}>Category</Label><Input id={`category-${service.id}`} name="category" defaultValue={service.category} required /></div><div><Label htmlFor={`unit-${service.id}`}>Unit</Label><Input id={`unit-${service.id}`} name="unit_label" defaultValue={service.unit_label} required /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><Label htmlFor={`price-${service.id}`}>Starting price (£)</Label><Input id={`price-${service.id}`} name="default_unit_price" type="number" min="0" step="0.01" defaultValue={service.default_unit_price} required /></div><div><Label htmlFor={`vat-${service.id}`}>VAT (%)</Label><Input id={`vat-${service.id}`} name="tax_rate" type="number" min="0" max="100" step="0.01" defaultValue={service.tax_rate} required /></div></div>
                <Button type="submit" size="sm" variant="outline">Save service</Button>
              </div>
            </form>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Plus className="size-4 text-tide-teal" />Add a Tide service</CardTitle></CardHeader>
          <CardContent><form action={createBusinessService} className="grid gap-4 md:grid-cols-2">
            <div><Label htmlFor="new-code">Code</Label><Input id="new-code" name="code" placeholder="SAG" required /></div>
            <div><Label htmlFor="new-name">Service name</Label><Input id="new-name" name="name" required /></div>
            <div><Label htmlFor="new-category">Category</Label><Input id="new-category" name="category" defaultValue="Planning & Safety" required /></div>
            <div><Label htmlFor="new-unit">Unit</Label><Input id="new-unit" name="unit_label" defaultValue="service" required /></div>
            <div className="md:col-span-2"><Label htmlFor="new-description">Client description</Label><Textarea id="new-description" name="description" rows={4} required /></div>
            <div><Label htmlFor="new-price">Starting price (£)</Label><Input id="new-price" name="default_unit_price" type="number" min="0" step="0.01" defaultValue="0" required /></div>
            <div><Label htmlFor="new-vat">VAT (%)</Label><Input id="new-vat" name="tax_rate" type="number" min="0" max="100" step="0.01" defaultValue="20" required /></div>
            <Button type="submit" className="w-fit md:col-span-2"><Plus />Add service</Button>
          </form></CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        {(terms ?? []).map((template) => <Card key={template.id}>
          <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><BookOpenText className="size-4 text-tide-teal" />Standard terms and conditions</CardTitle></CardHeader>
          <CardContent><form action={updateTermsTemplate} className="space-y-4">
            <input type="hidden" name="id" value={template.id} />
            <div className="rounded-lg border border-warning/25 bg-warning/5 p-3 text-xs leading-5 text-muted-foreground"><strong className="text-tide-charcoal">Legal review recommended.</strong> This is a comprehensive operational template, not legal advice. Have a Scottish solicitor review it before relying on it in production.</div>
            <div><Label htmlFor={`terms-${template.id}`}>{template.name}</Label><Textarea id={`terms-${template.id}`} name="body" rows={34} defaultValue={template.body} required className="font-mono text-xs leading-5" /></div>
            <Button type="submit">Save standard terms</Button>
          </form></CardContent>
        </Card>)}
      </div>
    </div>
  </div>;
}
