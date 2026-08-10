import { redirect } from "next/navigation";
import { FileCog, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createDocumentType, archiveDocumentType, restoreDocumentType } from "@/lib/actions/document-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-[13px]">
            <FileCog className="size-3.5 text-tide-teal" />
            New document type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDocumentType} className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Risk Assessment" required className="h-8 w-64 text-[13px]" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="code">Reference code</Label>
              <Input id="code" name="code" placeholder="e.g. RA" required className="h-8 w-28 text-[13px] uppercase" maxLength={12} />
            </div>
            <Button type="submit" size="sm">
              Add type
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {types?.length ? (
            <Table>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-tide-charcoal">
                      <span className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-tide-teal/12 text-tide-teal">
                          <Tag className="size-3" strokeWidth={2} />
                        </span>
                        {t.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{t.code}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={t.status === "published" ? "bg-success-bg text-success" : "bg-muted text-muted-foreground"}
                      >
                        {t.status === "published" ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={FileCog} title="No document types yet" className="border-none py-10" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
