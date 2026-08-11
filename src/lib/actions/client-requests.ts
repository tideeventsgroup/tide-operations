"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ClientRequestType = Database["public"]["Enums"]["client_request_type"];

export async function raiseClientRequest(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("client_requests").insert({
    event_id: eventId,
    type: String(formData.get("type")) as ClientRequestType,
    title: String(formData.get("title")),
    description: String(formData.get("description") ?? "").trim() || null,
    raised_by: user?.id ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/portal/${eventId}`);
}

export async function fulfilClientRequest(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const requestId = String(formData.get("request_id"));
  const responseNote = String(formData.get("response_note") ?? "").trim();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("client_requests")
    .update({
      status: "fulfilled",
      response_note: responseNote || null,
      fulfilled_by: user?.id ?? null,
      fulfilled_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/portal/${eventId}`);
}
