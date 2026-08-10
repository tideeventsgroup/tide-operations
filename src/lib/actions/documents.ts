"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const templateId = String(formData.get("template_id"));
  const title = String(formData.get("title"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: document, error } = await supabase
    .from("documents")
    .insert({ event_id: eventId, template_id: templateId, title, owner_id: user?.id ?? null })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { error: versionError } = await supabase.from("document_versions").insert({
    document_id: document.id,
    version_number: 1,
    content_json: {},
    created_by: user?.id ?? null,
  });

  if (versionError) throw new Error(versionError.message);

  revalidatePath(`/events/${eventId}`);
  redirect(`/documents/${document.id}`);
}

export async function saveDocumentContent(formData: FormData) {
  const supabase = await createClient();
  const documentId = String(formData.get("document_id"));
  const versionId = String(formData.get("version_id"));
  const contentJson = JSON.parse(String(formData.get("content_json"))) as Json;
  const completionPct = Number(formData.get("completion_pct") ?? 0);

  const { error: versionError } = await supabase
    .from("document_versions")
    .update({ content_json: contentJson })
    .eq("id", versionId);

  if (versionError) throw new Error(versionError.message);

  const { error: docError } = await supabase
    .from("documents")
    .update({ completion_pct: completionPct })
    .eq("id", documentId);

  if (docError) throw new Error(docError.message);

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
