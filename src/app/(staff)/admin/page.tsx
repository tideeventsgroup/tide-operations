import Link from "next/link";
import { ArrowRight, Building2, CirclePoundSterling, FileCog, Landmark, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const areas = [
  { href: "/admin/users", title: "Users & access", description: "Create accounts, choose staff permissions and link every client user to the correct organisation.", icon: Users },
  { href: "/admin/organisations", title: "Organisations", description: "Manage Client IDs, relationship status, portal access and linked client accounts.", icon: Building2 },
  { href: "/admin/general", title: "Business details", description: "Company identity, contact details, branding, VAT and commercial timing defaults.", icon: Landmark },
  { href: "/admin/commercial", title: "Services & terms", description: "Edit the service catalogue, pricing, tax rates and standard terms used by commercial documents.", icon: CirclePoundSterling },
  { href: "/admin/document-types", title: "Document types", description: "Control document categories and the codes used in permanent document references.", icon: FileCog },
];

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [{ count: users }, { count: organisations }, { count: services }, { count: documentTypes }] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("organisations").select("id", { count: "exact", head: true }),
    supabase.from("business_services").select("id", { count: "exact", head: true }),
    supabase.from("document_types").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["User accounts", users ?? 0],
          ["Organisations", organisations ?? 0],
          ["Services", services ?? 0],
          ["Document types", documentTypes ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-white p-4">
            <p className="section-label">{label}</p>
            <strong className="mt-2 block text-2xl text-tide-charcoal">{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => {
          const Icon = area.icon;
          return (
            <Link key={area.href} href={area.href} className="group rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-tide-teal/50 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-tide-charcoal text-tide-teal"><Icon className="size-5" /></span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-tide-teal" />
              </div>
              <h2 className="mt-5 font-semibold text-tide-charcoal">{area.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-tide-teal/25 bg-tide-teal/5 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-tide-teal" />
        <div><p className="text-sm font-semibold text-tide-charcoal">Access is enforced by account type and organisation</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Staff permissions are role-based. Client accounts can only see records for their linked organisation while its portal access is enabled.</p></div>
      </div>
    </div>
  );
}
