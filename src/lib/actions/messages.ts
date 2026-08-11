"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendEventMessage(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Message can't be empty.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("event_messages").insert({
    event_id: eventId,
    sender_id: user?.id ?? null,
    body,
    visible_to_client: formData.get("visible_to_client") === "true",
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/portal/${eventId}`);
}
