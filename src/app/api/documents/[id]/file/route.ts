import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Issues a short-lived signed URL for a document's uploaded file and
 * redirects to it (spec 8.1: "Access via short-lived signed URLs generated
 * server-side after an authorisation check — files are never made public").
 * Defaults to the current version; pass ?v=<versionId> for a historical one.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const requestedVersionId = searchParams.get("v");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select("id, current_version_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const versionId = requestedVersionId ?? document.current_version_id;
  if (!versionId) {
    return NextResponse.json({ error: "Document has no uploaded file yet" }, { status: 409 });
  }

  const { data: version, error: versionError } = await supabase
    .from("document_versions")
    .select("document_id, file_storage_path, file_name")
    .eq("id", versionId)
    .maybeSingle();

  if (versionError || !version || version.document_id !== id) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("event-files")
    .createSignedUrl(version.file_storage_path, 60, {
      download: version.file_name,
    });

  if (signError || !signed) {
    return NextResponse.json({ error: signError?.message ?? "Could not sign file URL" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
