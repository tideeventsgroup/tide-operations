import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderDocumentHtml, buildPdfFooterTemplate, buildPdfHeaderTemplate } from "@/lib/pdf/render-document-html";
import { launchBrowser } from "@/lib/pdf/launch-browser";
import type { DocumentContent, TemplateStructure } from "@/lib/document-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const PDF_FORMAT: Record<string, string> = {
  a4: "A4",
  a3: "A3",
  a2: "A2",
  a6: "A6",
  web: "A4",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select(
      "*, document_templates(name, output_format, structure_json, locked_brand_elements), events(id, name, venue, start_date, end_date, expected_attendance, control_location), user_profiles!documents_owner_id_fkey(full_name, email)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!document.current_version_id) {
    return NextResponse.json({ error: "Document has no content yet" }, { status: 409 });
  }

  const { data: version } = await supabase
    .from("document_versions")
    .select("*")
    .eq("id", document.current_version_id)
    .maybeSingle();

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const template = document.document_templates as {
    name: string;
    output_format: string;
    structure_json: TemplateStructure;
    locked_brand_elements: Record<string, unknown>;
  };
  const event = document.events as {
    id: string;
    name: string;
    venue: string | null;
    start_date: string | null;
    end_date: string | null;
    expected_attendance: number | null;
    control_location: string | null;
  };
  const owner = document.user_profiles as { full_name: string; email: string } | null;
  const content = (version.content_json as DocumentContent) ?? {};

  // Resolve any knowledge_block_ref fields to their live content for the PDF.
  const referencedIds = new Set<string>();
  for (const section of template.structure_json.sections) {
    for (const field of section.fields) {
      if (field.type !== "knowledge_block_ref") continue;
      const value = content[section.key]?.[field.key] as { knowledge_block_id: string | null } | undefined;
      if (value?.knowledge_block_id) referencedIds.add(value.knowledge_block_id);
    }
  }

  let knowledgeBlockContentById: Record<string, { title: string; content: string }> = {};
  if (referencedIds.size > 0) {
    const { data: blocks } = await supabase
      .from("knowledge_blocks")
      .select("id, title, content")
      .in("id", Array.from(referencedIds));
    knowledgeBlockContentById = Object.fromEntries((blocks ?? []).map((b) => [b.id, { title: b.title, content: b.content }]));
  }

  const html = renderDocumentHtml({
    templateName: template.name,
    outputFormat: template.output_format,
    structure: template.structure_json,
    content,
    lockedBrandElements: template.locked_brand_elements as never,
    reference: document.reference,
    title: document.title,
    status: document.status,
    versionNumber: version.version_number,
    ownerName: owner?.full_name || owner?.email || "Unassigned",
    event,
    knowledgeBlockContentById,
  });

  const brand = template.locked_brand_elements as {
    margins_mm?: { top: number; right: number; bottom: number; left: number };
    colours?: { charcoal?: string; teal?: string };
  };
  const baseMargins = brand.margins_mm ?? { top: 20, right: 18, bottom: 20, left: 18 };
  const teal = brand.colours?.teal ?? "#60B9C5";

  const browser = await launchBrowser();
  let pdfBuffer: Buffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const format = (PDF_FORMAT[template.output_format] ?? "A4") as
      | "A4"
      | "A3"
      | "A2"
      | "A6";
    const isPresentation = template.output_format === "presentation";
    pdfBuffer = Buffer.from(
      await page.pdf({
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: buildPdfHeaderTemplate({ title: document.title, teal }),
        footerTemplate: buildPdfFooterTemplate({
          reference: document.reference,
          versionNumber: version.version_number,
        }),
        margin: {
          top: `${baseMargins.top + 8}mm`,
          bottom: `${baseMargins.bottom + 8}mm`,
          left: `${baseMargins.left}mm`,
          right: `${baseMargins.right}mm`,
        },
        ...(isPresentation
          ? { width: "13.33in", height: "7.5in" }
          : { format }),
      }),
    );
  } finally {
    await browser.close();
  }

  const storagePath = `${event.id}/documents/${document.id}/v${version.version_number}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("event-files")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (!uploadError) {
    await supabase.from("document_versions").update({ pdf_storage_path: storagePath }).eq("id", version.id);
  }

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${(document.reference ?? document.title).replace(/[^a-z0-9-_]+/gi, "_")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
