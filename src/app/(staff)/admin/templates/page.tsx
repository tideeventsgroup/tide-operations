import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateStructure } from "@/lib/document-schema";

export default async function TemplateAdministrationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: viewerProfile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();

  if (viewerProfile?.staff_role !== "admin") redirect("/dashboard");

  const { data: templates } = await supabase
    .from("document_templates")
    .select("*")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tide-charcoal">Template Administration</h1>
        <p className="text-sm text-muted-foreground">
          Master layouts, structure and locked brand elements. Authors in Document Studio cannot
          move the logo, change margins or alter section numbering — those live here.
        </p>
      </div>

      <div className="space-y-4">
        {templates?.map((t) => {
          const structure = t.structure_json as TemplateStructure;
          const brand = t.locked_brand_elements as {
            typeface?: string;
            colours?: Record<string, string>;
          };
          return (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Code {t.code} · v{t.version} · {t.output_format.toUpperCase()}
                  </p>
                </div>
                <Badge variant="outline" className={t.status === "published" ? "bg-emerald-100 text-emerald-800" : ""}>
                  {t.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Sections: </span>
                  {structure.sections.map((s) => `${s.number}. ${s.title}`).join(" · ")}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Locked typeface: {brand.typeface ?? "Arial"}</span>
                  {brand.colours &&
                    Object.entries(brand.colours).map(([name, hex]) => (
                      <span key={name} className="flex items-center gap-1">
                        <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: hex }} />
                        {name}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
