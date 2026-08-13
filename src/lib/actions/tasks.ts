"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formStr, assertDbOk } from "@/lib/form-utils";

const idSchema = z.string().uuid();
const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
const taskStatusEnum = z.enum(["to_do", "in_progress", "in_review", "complete"]);

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(5000).nullable(),
  event_id: idSchema.nullable(),
  owner_id: idSchema.nullable(),
  due_date: z.string().trim().nullable(),
  priority: taskPriorityEnum,
  milestone_id: idSchema.nullable(),
});

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const input = createTaskSchema.parse({
    title: formData.get("title"),
    description: formStr(formData, "description"),
    event_id: formStr(formData, "event_id"),
    owner_id: formStr(formData, "owner_id"),
    due_date: formStr(formData, "due_date"),
    priority: formData.get("priority") || "medium",
    milestone_id: formStr(formData, "milestone_id"),
  });

  const { error } = await supabase.from("tasks").insert(input);
  assertDbOk(error, "Could not create the task. Please try again.");
  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const supabase = await createClient();
  const id = idSchema.parse(formData.get("id"));
  const status = taskStatusEnum.parse(formData.get("status"));

  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  assertDbOk(error, "Could not update the task. Please try again.");
  revalidatePath("/tasks");
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient();
  const id = idSchema.parse(formData.get("id"));

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  assertDbOk(error, "Could not delete the task. Please try again.");
  revalidatePath("/tasks");
}
