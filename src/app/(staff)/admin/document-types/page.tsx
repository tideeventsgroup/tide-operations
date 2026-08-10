import { redirect } from "next/navigation";
import { FileCog, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createDocumentType, archiveDocumentType, restoreDocumentType } from "@/lib/actions/document-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export default async function DocumentTypesPage() {
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

  const { data: types } = await supabase.from("document_types").select("*").order("name");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Document Types"
        description="The categories staff choose from when uploading a controlled document. The code is used in reference numbers, e.g. TEG-OSSP-2026-014."
      />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <FileCog className="size-4 text-tide-teal" />
            New document type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDocumentType} className="flex flex-wrap items-end gap-2.5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Risk Assessment" required className="w-64" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Reference code</Label>
              <Input id="code" name="code" placeholder="e.g. RA" required className="w-28 uppercase" maxLength={12} />
            </div>
            <Button type="submit" size="sm">
              Add type
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardContent className="px-0 py-1">
          {types?.length ? (
            <div className="divide-y">
              {types.map((t) => (
                <div key={t.id} className="flex items-center gap-3.5 px-4 py-3.5 text-sm">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tide-teal/12 text-tide-teal">
                    <Tag className="size-4" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-tide-charcoal">{t.name}</div>
                    <div className="font-mono text-[12px] text-muted-foreground">{t.code}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={t.status === "published" ? "bg-success-bg text-success" : "bg-muted text-muted-foreground"}
                  >
                    {t.status === "published" ? "Active" : "Archived"}
                  </Badge>
                  {t.status === "archived" ? (
                    <form action={restoreDocumentType}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Restore
                      </Button>
                    </form>
                  ) : (
                    <form action={archiveDocumentType}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Archive
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileCog} title="No document types yet" className="border-none py-14" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
