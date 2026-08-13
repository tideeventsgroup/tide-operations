"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/guards";
import { assertDbOk } from "@/lib/form-utils";

const nameSchema = z.string().trim().min(1, "Name is required").max(200);
const codeSchema = z.string().trim().min(1, "Code is required").max(20).transform((v) => v.toUpperCase());
const idSchema = z.string().uuid();

export async function createDocumentType(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = nameSchema.parse(formData.get("name"));
  const code = codeSchema.parse(formData.get("code"));

  const { error } = await supabase.from("document_types").insert({ name, code });

  assertDbOk(error, "Could not create the document type. Please try again.");
  revalidatePath("/admin/document-types");
}

export async function archiveDocumentType(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));

  const { error } = await supabase.from("document_types").update({ status: "archived" }).eq("id", id);
  assertDbOk(error, "Could not archive the document type. Please try again.");
  revalidatePath("/admin/document-types");
}

export async function restoreDocumentType(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));

  const { error } = await supabase.from("document_types").update({ status: "published" }).eq("id", id);
  assertDbOk(error, "Could not restore the document type. Please try again.");
  revalidatePath("/admin/document-types");
}
