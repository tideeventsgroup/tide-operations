"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFilename, assertDbOk, assertValidUpload, DOCUMENT_MIME_ALLOWLIST } from "@/lib/form-utils";

const idSchema = z.string().uuid();

const createDocumentSchema = z.object({
  event_id: idSchema,
  document_type_id: idSchema,
  title: z.string().trim().min(1, "Title is required").max(300),
});

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  const input = createDocumentSchema.parse({
    event_id: formData.get("event_id"),
    document_type_id: formData.get("document_type_id"),
    title: formData.get("title"),
  });

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Choose a file to upload.");
  assertValidUpload(file, DOCUMENT_MIME_ALLOWLIST);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document, error } = await supabase
    .from("documents")
    .insert({ ...input, owner_id: user?.id ?? null })
    .select("id")
    .single();

  assertDbOk(error, "Could not create the document. Please try again.");

  const storagePath = `${input.event_id}/documents/${document.id}/v1-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("event-files")
    .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });

  if (uploadError) throw new Error("Could not upload the file. Please try again.");

  const { error: versionError } = await supabase.from("document_versions").insert({
    document_id: document.id,
    version_number: 1,
    file_name: file.name,
    file_storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
    created_by: user?.id ?? null,
  });

  assertDbOk(versionError, "The file uploaded but the document record could not be saved. Please contact an administrator.");

  revalidatePath(`/events/${input.event_id}`);
  redirect(`/documents/${document.id}`);
}

export async function uploadDocumentVersion(formData: FormData) {
  const supabase = await createClient();
  const documentId = idSchema.parse(formData.get("document_id"));

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Choose a file to upload.");
  assertValidUpload(file, DOCUMENT_MIME_ALLOWLIST);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("event_id")
    .eq("id", documentId)
    .single();

  assertDbOk(documentError, "Could not find that document. It may have been removed or you may not have access.");

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

  if (uploadError) throw new Error("Could not upload the file. Please try again.");

  const { error: versionError } = await supabase.from("document_versions").insert({
    document_id: documentId,
    version_number: nextVersion,
    file_name: file.name,
    file_storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
    created_by: user?.id ?? null,
  });

  assertDbOk(versionError, "The file uploaded but the new version could not be saved. Please contact an administrator.");

  revalidatePath(`/documents/${documentId}`);
}

export async function toggleDocumentVisibility(formData: FormData) {
  const supabase = await createClient();
  const documentId = idSchema.parse(formData.get("document_id"));
  const eventId = idSchema.parse(formData.get("event_id"));
  const nextVisible = formData.get("next_visible") === "true";

  const { error } = await supabase
    .from("documents")
    .update({ client_visible: nextVisible })
    .eq("id", documentId);

  assertDbOk(error, "Could not update document visibility. Please try again.");

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/documents/${documentId}`);
}

const documentStatusEnum = z.enum(["draft", "in_review", "needs_updates", "approved", "issued", "archived"]);

export async function transitionDocument(formData: FormData) {
  const supabase = await createClient();
  const documentId = idSchema.parse(formData.get("document_id"));
  const newStatus = documentStatusEnum.parse(formData.get("new_status"));
  const comment = String(formData.get("comment") ?? "").trim();

  const { error } = await supabase.rpc("transition_document_status", {
    p_document_id: documentId,
    p_new_status: newStatus,
    p_comment: comment || undefined,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/documents/${documentId}`);
}
