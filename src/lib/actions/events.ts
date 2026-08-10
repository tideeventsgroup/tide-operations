"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type EventStage = Database["public"]["Enums"]["event_stage"];

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      name: String(formData.get("name")),
      organisation_id: str(formData, "organisation_id"),
      venue: str(formData, "venue"),
      location: str(formData, "location"),
      start_date: str(formData, "start_date"),
      end_date: str(formData, "end_date"),
      expected_attendance: str(formData, "expected_attendance")
        ? Number(str(formData, "expected_attendance"))
        : null,
      control_location: str(formData, "control_location"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("events")
    .update({
      name: String(formData.get("name")),
      organisation_id: str(formData, "organisation_id"),
      venue: str(formData, "venue"),
      location: str(formData, "location"),
      start_date: str(formData, "start_date"),
      end_date: str(formData, "end_date"),
      expected_attendance: str(formData, "expected_attendance")
        ? Number(str(formData, "expected_attendance"))
        : null,
      control_location: str(formData, "control_location"),
      financial_value: str(formData, "financial_value")
        ? Number(str(formData, "financial_value"))
        : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function updateEventStage(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const stage = String(formData.get("stage")) as EventStage;

  const { error } = await supabase.from("events").update({ stage }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/events/${id}`);
}

export async function addEventMember(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));

  const { error } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: String(formData.get("user_id")),
    role_on_event: String(formData.get("role_on_event")),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
}

export async function removeEventMember(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const memberId = String(formData.get("member_id"));

  const { error } = await supabase.from("event_members").delete().eq("id", memberId);
  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
}

export async function createMilestone(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));

  const { error } = await supabase.from("milestones").insert({
    event_id: eventId,
    title: String(formData.get("title")),
    due_date: str(formData, "due_date"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}

export async function updateMilestoneStatus(formData: FormData) {
  const supabase = await createClient();
  const eventId = String(formData.get("event_id"));
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Database["public"]["Enums"]["milestone_status"];

  const { error } = await supabase.from("milestones").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}
