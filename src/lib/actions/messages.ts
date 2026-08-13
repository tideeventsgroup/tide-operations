"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertDbOk } from "@/lib/form-utils";

const sendMessageSchema = z.object({
  event_id: z.string().uuid(),
  body: z.string().trim().min(1, "Message can't be empty.").max(5000),
  visible_to_client: z.boolean(),
});

export async function sendEventMessage(formData: FormData) {
  const supabase = await createClient();
  const input = sendMessageSchema.parse({
    event_id: formData.get("event_id"),
    body: formData.get("body"),
    visible_to_client: formData.get("visible_to_client") === "true",
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("event_messages").insert({
    event_id: input.event_id,
    sender_id: user?.id ?? null,
    body: input.body,
    visible_to_client: input.visible_to_client,
  });

  assertDbOk(error, "Could not send the message. Please try again.");

  revalidatePath(`/events/${input.event_id}`);
  revalidatePath(`/portal/${input.event_id}`);
}
