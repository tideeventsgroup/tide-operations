import { Building2, Image as ImageIcon, ReceiptText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateSystemSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function GeneralSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("system_settings").select("*").eq("id", "default").single();
  if (!settings) return <p className="text-sm text-muted-foreground">System settings are not available.</p>;

  return (
    <form action={updateSystemSettings} className="space-y-5">
      <div><h2 className="text-lg font-semibold text-tide-charcoal">Business details & defaults</h2><p className="mt-1 text-sm text-muted-foreground">The central source for Tide identity, contact details, branding and commercial defaults.</p></div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Building2 className="size-4 text-tide-teal" />Company identity</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="company_name">Display name</Label><Input id="company_name" name="company_name" defaultValue={settings.company_name} required /></div>
            <div><Label htmlFor="legal_name">Legal name</Label><Input id="legal_name" name="legal_name" defaultValue={settings.legal_name} required /></div>
            <div><Label htmlFor="registration_number">Registration number</Label><Input id="registration_number" name="registration_number" defaultValue={settings.registration_number ?? ""} /></div>
            <div><Label htmlFor="vat_number">VAT number</Label><Input id="vat_number" name="vat_number" defaultValue={settings.vat_number ?? ""} /></div>
            <div><Label htmlFor="operations_email">Operations email</Label><Input id="operations_email" name="operations_email" type="email" defaultValue={settings.operations_email} required /></div>
            <div><Label htmlFor="accounts_email">Accounts email</Label><Input id="accounts_email" name="accounts_email" type="email" defaultValue={settings.accounts_email ?? ""} /></div>
            <div><Label htmlFor="phone">Telephone</Label><Input id="phone" name="phone" defaultValue={settings.phone ?? ""} /></div>
            <div><Label htmlFor="website">Website</Label><Input id="website" name="website" type="url" defaultValue={settings.website ?? ""} /></div>
            <div className="sm:col-span-2"><Label htmlFor="postal_address">Postal address</Label><Textarea id="postal_address" name="postal_address" rows={4} defaultValue={settings.postal_address ?? ""} /></div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><ReceiptText className="size-4 text-tide-teal" />Commercial defaults</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="default_currency">Currency</Label><Input id="default_currency" name="default_currency" maxLength={3} defaultValue={settings.default_currency} required /></div>
              <div><Label htmlFor="default_vat_rate">Default VAT (%)</Label><Input id="default_vat_rate" name="default_vat_rate" type="number" min="0" max="100" step="0.01" defaultValue={settings.default_vat_rate} required /></div>
              <div><Label htmlFor="quote_valid_days">Quote validity (days)</Label><Input id="quote_valid_days" name="quote_valid_days" type="number" min="1" max="365" defaultValue={settings.quote_valid_days} required /></div>
              <div><Label htmlFor="invoice_due_days">Invoice terms (days)</Label><Input id="invoice_due_days" name="invoice_due_days" type="number" min="1" max="365" defaultValue={settings.invoice_due_days} required /></div>
              <div className="sm:col-span-2"><Label htmlFor="portal_welcome_message">Client portal welcome message</Label><Textarea id="portal_welcome_message" name="portal_welcome_message" rows={4} defaultValue={settings.portal_welcome_message} required /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><ImageIcon className="size-4 text-tide-teal" />Brand settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label htmlFor="dark_logo_url">Logo for dark backgrounds</Label><Input id="dark_logo_url" name="dark_logo_url" type="url" defaultValue={settings.dark_logo_url} required /></div>
              <div className="sm:col-span-2"><Label htmlFor="light_logo_url">Logo for light backgrounds</Label><Input id="light_logo_url" name="light_logo_url" type="url" defaultValue={settings.light_logo_url} required /></div>
              <div><Label htmlFor="brand_primary">Primary colour</Label><div className="flex gap-2"><Input id="brand_primary" name="brand_primary" defaultValue={settings.brand_primary} pattern="#[0-9A-Fa-f]{6}" required /><input type="color" defaultValue={settings.brand_primary} aria-label="Primary colour preview" className="h-9 w-11 rounded border bg-white p-1" disabled /></div></div>
              <div><Label htmlFor="brand_accent">Accent colour</Label><div className="flex gap-2"><Input id="brand_accent" name="brand_accent" defaultValue={settings.brand_accent} pattern="#[0-9A-Fa-f]{6}" required /><input type="color" defaultValue={settings.brand_accent} aria-label="Accent colour preview" className="h-9 w-11 rounded border bg-white p-1" disabled /></div></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Button type="submit" size="lg">Save system settings</Button>
    </form>
  );
}
