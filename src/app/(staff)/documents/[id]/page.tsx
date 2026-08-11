import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, History, Upload, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { uploadDocumentVersion } from "@/lib/actions/documents";
import { DocumentWorkflow } from "@/components/document-editor/document-workflow";
import { DocumentStatusBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { FileTypeIcon } from "@/components/file-type-icon";
import { formatFileSize } from "@/lib/file-utils";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("*, document_types(name), events(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (!document) notFound();

  const [{ data: currentVersion }, { data: versions }, { data: viewerProfile }] = await Promise.all([
    document.current_version_id
      ? supabase
          .from("document_versions")
          .select("*, user_profiles!document_versions_created_by_fkey(full_name, email)")
          .eq("id", document.current_version_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("document_versions")
      .select("id, version_number, file_name, file_size, mime_type, created_at, user_profiles!document_versions_created_by_fkey(full_name, email)")
      .eq("document_id", id)
      .order("version_number", { ascending: false }),
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { data: null };
      return supabase.from("user_profiles").select("staff_role").eq("id", user.id).maybeSingle();
    })(),
  ]);

  const documentType = document.document_types as { name: string } | null;
  const event = document.events as { id: string; name: string } | null;

  if (!event) notFound();

  const canUpload = ["draft", "needs_updates"].includes(document.status);
  const canApprove = viewerProfile?.staff_role === "admin" || viewerProfile?.staff_role === "manager";
  const uploader = currentVersion
    ? (currentVersion.user_profiles as { full_name: string; email: string } | null)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/events/${event.id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        {event.name}
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-tide-teal/12 text-tide-teal">
            <FileTypeIcon mimeType={currentVersion?.mime_type} className="size-4" strokeWidth={2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[17px] leading-tight font-bold tracking-tight text-tide-charcoal">
                {document.title}
              </h1>
              <DocumentStatusBadge status={document.status} />
            </div>
            <p className="mt-0.5 font-mono text-[12.5px] text-muted-foreground">
              {document.reference ?? "Unreferenced"} · {documentType?.name ?? "No type"}
            </p>
          </div>
        </div>
        {currentVersion && (
          <Button render={<a href={`/api/documents/${id}/file`} />} nativeButton={false} variant="outline" size="sm">
            <Download className="size-3.5" />
            Download
          </Button>
        )}
      </div>

      <DocumentWorkflow documentId={id} status={document.status} canApprove={canApprove} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current file</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentVersion ? (
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-tide-teal/12 text-tide-teal">
                <FileTypeIcon mimeType={currentVersion.mime_type} className="size-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-tide-charcoal">{currentVersion.file_name}</div>
                <div className="truncate text-[12.5px] text-muted-foreground">
                  Version {currentVersion.version_number} · {formatFileSize(currentVersion.file_size)}
                  {uploader && (
                    <>
                      {" "}
                      · <User className="mb-0.5 inline size-3" /> {uploader.full_name || uploader.email}
                    </>
                  )}
                </div>
              </div>
              <Button render={<a href={`/api/documents/${id}/file`} />} nativeButton={false} size="sm" variant="outline">
                <Download className="size-3.5" />
                Download
              </Button>
            </div>
          ) : (
            <EmptyState icon={Upload} title="No file uploaded yet" className="border-none py-5" />
          )}

          {canUpload && (
            <form action={uploadDocumentVersion} className="flex flex-wrap items-end gap-2 border-t pt-3">
              <input type="hidden" name="document_id" value={id} />
              <div className="flex-1 space-y-1">
                <label className="text-[12px] font-medium text-muted-foreground">
                  {currentVersion ? "Upload new version" : "Upload file"}
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  className="block w-full text-sm text-tide-charcoal file:mr-2.5 file:rounded-md file:border-0 file:bg-tide-teal/12 file:px-2.5 file:py-1 file:text-[13px] file:font-medium file:text-tide-teal hover:file:bg-tide-teal/20"
                />
              </div>
              <Button type="submit" size="sm">
                <Upload className="size-3.5" />
                Upload
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 gap-0 py-0">
        <CardHeader className="border-b py-2.5">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <History className="size-3.5 text-tide-teal" />
            Version history
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {versions?.map((v) => {
                const versionUploader = v.user_profiles as { full_name: string; email: string } | null;
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium text-tide-charcoal">
                        Version {v.version_number}
                        {v.id === currentVersion?.id && (
                          <span className="rounded-full bg-tide-teal/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-tide-teal">
                            Current
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.file_name} · {formatFileSize(v.file_size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {versionUploader?.full_name || versionUploader?.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(v.created_at).toLocaleString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={<a href={`/api/documents/${id}/file?v=${v.id}`} />}
                        nativeButton={false}
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Download version ${v.version_number}`}
                      >
                        <Download className="size-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
