"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireManagerOrAdmin } from "@/lib/actions/guards";
import { assertDbOk } from "@/lib/form-utils";

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  category: z.string().trim().min(1, "Category is required").max(100),
  content: z.string().trim().min(1, "Content is required").max(20_000),
});
const idSchema = z.string().uuid();

export async function createKnowledgeBlock(formData: FormData) {
  const { supabase } = await requireManagerOrAdmin();
  const input = createSchema.parse({
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
  });

  const { error } = await supabase.from("knowledge_blocks").insert({ ...input, approval_status: "approved" });

  assertDbOk(error, "Could not save the knowledge block. Please try again.");
  revalidatePath("/knowledge");
}

export async function archiveKnowledgeBlock(formData: FormData) {
  const { supabase } = await requireManagerOrAdmin();
  const id = idSchema.parse(formData.get("id"));

  const { error } = await supabase.from("knowledge_blocks").update({ approval_status: "superseded" }).eq("id", id);
  assertDbOk(error, "Could not archive the knowledge block. Please try again.");
  revalidatePath("/knowledge");
}
