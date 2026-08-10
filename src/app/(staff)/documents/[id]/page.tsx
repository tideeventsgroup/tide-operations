import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentEditor } from "@/components/document-editor/document-editor";
import { DocumentWorkflow } from "@/components/document-editor/document-workflow";
import { DocumentStatusBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentContent, TemplateStructure } from "@/lib/document-schema";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("*, document_templates(name, structure_json, output_format), events(id, name, venue, start_date, end_date, expected_attendance, control_location)")
    .eq("id", id)
    .maybeSingle();

  if (!document) notFound();

  const [{ data: currentVersion }, { data: versions }, { data: knowledgeBlocks }, { data: viewerProfile }] =
    await Promise.all([
      document.current_version_id
        ? supabase.from("document_versions").select("*").eq("id", document.current_version_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("document_versions")
        .select("id, version_number, created_at, submitted_by, reviewed_by, approved_by")
        .eq("document_id", id)
        .order("version_number", { ascending: false }),
      supabase.from("knowledge_blocks").select("id, title, category, content").eq("approval_status", "approved"),
      (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { data: null };
        return supabase.from("user_profiles").select("staff_role").eq("id", user.id).maybeSingle();
      })(),
    ]);

  const template = document.document_templates as { name: string; structure_json: TemplateStructure; output_format: string } | null;
  const event = document.events as {
    id: string;
    name: string;
    venue: string | null;
    start_date: string | null;
    end_date: string | null;
    expected_attendance: number | null;
    control_location: string | null;
  } | null;

  if (!template || !event) notFound();

  const canApprove = viewerProfile?.staff_role === "admin" || viewerProfile?.staff_role === "manager";
  const readOnly = !["draft", "needs_updates"].includes(document.status);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-tide-charcoal">{document.title}</h1>
            <DocumentStatusBadge status={document.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {document.reference ?? "Unreferenced"} · {template.name} ·{" "}
            <Link href={`/events/${event.id}`} className="text-tide-teal underline">
              {event.name}
            </Link>
          </p>
        </div>
        <Button
          render={<a href={`/api/documents/${id}/pdf`} target="_blank" rel="noreferrer" />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          Download PDF
        </Button>
      </div>

      <DocumentWorkflow documentId={id} status={document.status} canApprove={canApprove} />

      {currentVersion && (
        <DocumentEditor
          documentId={id}
          versionId={currentVersion.id}
          structure={template.structure_json}
          initialContent={(currentVersion.content_json as DocumentContent) ?? {}}
          event={event}
          knowledgeBlocks={knowledgeBlocks ?? []}
          readOnly={readOnly}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version history</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {versions?.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-3 text-sm">
              <span>Version {v.version_number}</span>
              <span className="text-muted-foreground">{new Date(v.created_at).toLocaleString("en-GB")}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
