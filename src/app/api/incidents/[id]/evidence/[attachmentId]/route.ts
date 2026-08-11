import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  const { id, attachmentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", _request.url));

  const { data: attachment } = await supabase
    .from("incident_attachments")
    .select("file_name, file_storage_path")
    .eq("id", attachmentId)
    .eq("incident_id", id)
    .maybeSingle();

  if (!attachment) return new NextResponse("Not found", { status: 404 });

  const { data: signed, error } = await supabase.storage
    .from("event-files")
    .createSignedUrl(attachment.file_storage_path, 60, { download: attachment.file_name });

  if (error || !signed) return new NextResponse("Unable to create download link", { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
