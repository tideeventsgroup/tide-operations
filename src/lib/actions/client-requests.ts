"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formStr, assertDbOk } from "@/lib/form-utils";

const idSchema = z.string().uuid();
const clientRequestTypeEnum = z.enum(["information", "file_upload"]);

const raiseSchema = z.object({
  event_id: idSchema,
  type: clientRequestTypeEnum,
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(5000).nullable(),
});

export async function raiseClientRequest(formData: FormData) {
  const supabase = await createClient();
  const input = raiseSchema.parse({
    event_id: formData.get("event_id"),
    type: formData.get("type"),
    title: formData.get("title"),
    description: formStr(formData, "description"),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("client_requests").insert({ ...input, raised_by: user?.id ?? null });

  assertDbOk(error, "Could not send the request. Please try again.");
  revalidatePath(`/portal/${input.event_id}`);
}

const fulfilSchema = z.object({
  event_id: idSchema,
  request_id: idSchema,
  response_note: z.string().trim().max(2000).nullable(),
});

export async function fulfilClientRequest(formData: FormData) {
  const supabase = await createClient();
  const input = fulfilSchema.parse({
    event_id: formData.get("event_id"),
    request_id: formData.get("request_id"),
    response_note: formStr(formData, "response_note"),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("client_requests")
    .update({
      status: "fulfilled",
      response_note: input.response_note,
      fulfilled_by: user?.id ?? null,
      fulfilled_at: new Date().toISOString(),
    })
    .eq("id", input.request_id);

  assertDbOk(error, "Could not update the request. Please try again.");

  revalidatePath(`/events/${input.event_id}`);
  revalidatePath(`/portal/${input.event_id}`);
}
