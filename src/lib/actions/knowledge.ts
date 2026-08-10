"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createKnowledgeBlock(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("knowledge_blocks").insert({
    title: String(formData.get("title")),
    category: String(formData.get("category")),
    content: String(formData.get("content")),
    approval_status: "approved",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/knowledge");
}

export async function archiveKnowledgeBlock(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("knowledge_blocks").update({ approval_status: "superseded" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/knowledge");
}
