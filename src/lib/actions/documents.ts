"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-120);
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const documentTypeId = String(formData.get("document_type_id"));
  const title = String(formData.get("title"));
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document, error } = await supabase
    .from("documents")
    .insert({ event_id: eventId, document_type_id: documentTypeId, title, owner_id: user?.id ?? null })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const storagePath = `${eventId}/documents/${document.id}/v1-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("event-files")
    .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { error: versionError } = await supabase.from("document_versions").insert({
    document_id: document.id,
    version_number: 1,
    file_name: file.name,
    file_storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
    created_by: user?.id ?? null,
  });

  if (versionError) throw new Error(versionError.message);

  revalidatePath(`/events/${eventId}`);
  redirect(`/documents/${document.id}`);
}

export async function uploadDocumentVersion(formData: FormData) {
  const supabase = await createClient();
  const documentId = String(formData.get("document_id"));
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("event_id")
    .eq("id", documentId)
    .single();

  if (documentError) throw new Error(documentError.message);

  const { data: lastVersion } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastVersion?.version_number ?? 0) + 1;
  const storagePath = `${document.event_id}/documents/${documentId}/v${nextVersion}-${sanitizeFilename(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("event-files")
    .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { error: versionError } = await supabase.from("document_versions").insert({
    document_id: documentId,
    version_number: nextVersion,
    file_name: file.name,
    file_storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
    created_by: user?.id ?? null,
  });

  if (versionError) throw new Error(versionError.message);

  revalidatePath(`/documents/${documentId}`);
}

export async function transitionDocument(formData: FormData) {
  const supabase = await createClient();
  const documentId = String(formData.get("document_id"));
  const newStatus = String(formData.get("new_status"));
  const comment = String(formData.get("comment") ?? "").trim();

  const { error } = await supabase.rpc("transition_document_status", {
    p_document_id: documentId,
    p_new_status: newStatus as never,
    p_comment: comment || undefined,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/documents/${documentId}`);
}
