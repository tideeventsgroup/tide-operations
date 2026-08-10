"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").insert({
    title: String(formData.get("title")),
    description: str(formData, "description"),
    event_id: str(formData, "event_id"),
    owner_id: str(formData, "owner_id"),
    due_date: str(formData, "due_date"),
    priority: String(formData.get("priority") || "medium") as never,
    milestone_id: str(formData, "milestone_id"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Database["public"]["Enums"]["task_status"];

  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}
