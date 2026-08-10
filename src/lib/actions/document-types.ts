"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createDocumentType(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("document_types").insert({
    name: String(formData.get("name")),
    code: String(formData.get("code")).toUpperCase().trim(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/document-types");
}

export async function archiveDocumentType(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("document_types").update({ status: "archived" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/document-types");
}

export async function restoreDocumentType(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("document_types").update({ status: "published" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/document-types");
}
