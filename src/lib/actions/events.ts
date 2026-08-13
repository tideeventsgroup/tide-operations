"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formStr, formNumber, assertDbOk } from "@/lib/form-utils";

const idSchema = z.string().uuid();
const eventStageEnum = z.enum(["enquiry", "proposal", "confirmed", "planning", "live", "complete"]);
const milestoneStatusEnum = z.enum(["not_started", "on_track", "at_risk", "complete"]);

const eventSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(300),
  organisation_id: idSchema.nullable(),
  venue: z.string().trim().max(300).nullable(),
  location: z.string().trim().max(300).nullable(),
  start_date: z.string().trim().nullable(),
  end_date: z.string().trim().nullable(),
  expected_attendance: z.number().int().min(0).max(10_000_000).nullable(),
  control_location: z.string().trim().max(300).nullable(),
});

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const input = eventSchema.parse({
    name: formData.get("name"),
    organisation_id: formStr(formData, "organisation_id"),
    venue: formStr(formData, "venue"),
    location: formStr(formData, "location"),
    start_date: formStr(formData, "start_date"),
    end_date: formStr(formData, "end_date"),
    expected_attendance: formNumber(formData, "expected_attendance"),
    control_location: formStr(formData, "control_location"),
  });

  const { data, error } = await supabase.from("events").insert(input).select("id").single();

  assertDbOk(error, "Could not create the event. Please try again.");

  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(formData: FormData) {
  const supabase = await createClient();
  const id = idSchema.parse(formData.get("id"));
  const input = eventSchema.parse({
    name: formData.get("name"),
    organisation_id: formStr(formData, "organisation_id"),
    venue: formStr(formData, "venue"),
    location: formStr(formData, "location"),
    start_date: formStr(formData, "start_date"),
    end_date: formStr(formData, "end_date"),
    expected_attendance: formNumber(formData, "expected_attendance"),
    control_location: formStr(formData, "control_location"),
  });
  const financialValue = formNumber(formData, "financial_value");

  const { error } = await supabase
    .from("events")
    .update({ ...input, financial_value: financialValue })
    .eq("id", id);

  assertDbOk(error, "Could not update the event. Please try again.");

  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function updateEventStage(formData: FormData) {
  const supabase = await createClient();
  const id = idSchema.parse(formData.get("id"));
  const stage = eventStageEnum.parse(formData.get("stage"));

  const { error } = await supabase.from("events").update({ stage }).eq("id", id);
  assertDbOk(error, "Could not update the event stage. Please try again.");

  revalidatePath(`/events/${id}`);
}

const memberSchema = z.object({
  event_id: idSchema,
  user_id: idSchema,
  role_on_event: z.string().trim().min(1, "Role is required").max(100),
});

export async function addEventMember(formData: FormData) {
  const supabase = await createClient();
  const input = memberSchema.parse({
    event_id: formData.get("event_id"),
    user_id: formData.get("user_id"),
    role_on_event: formData.get("role_on_event"),
  });

  const { error } = await supabase.from("event_members").insert(input);
  assertDbOk(error, "Could not add the team member. Please try again.");

  revalidatePath(`/events/${input.event_id}`);
}

export async function removeEventMember(formData: FormData) {
  const supabase = await createClient();
  const eventId = idSchema.parse(formData.get("event_id"));
  const memberId = idSchema.parse(formData.get("member_id"));

  const { error } = await supabase.from("event_members").delete().eq("id", memberId);
  assertDbOk(error, "Could not remove the team member. Please try again.");

  revalidatePath(`/events/${eventId}`);
}

const milestoneSchema = z.object({
  event_id: idSchema,
  title: z.string().trim().min(1, "Title is required").max(300),
  due_date: z.string().trim().nullable(),
});

export async function createMilestone(formData: FormData) {
  const supabase = await createClient();
  const input = milestoneSchema.parse({
    event_id: formData.get("event_id"),
    title: formData.get("title"),
    due_date: formStr(formData, "due_date"),
  });

  const { error } = await supabase.from("milestones").insert(input);
  assertDbOk(error, "Could not create the milestone. Please try again.");
  revalidatePath(`/events/${input.event_id}`);
}

export async function updateMilestoneStatus(formData: FormData) {
  const supabase = await createClient();
  const eventId = idSchema.parse(formData.get("event_id"));
  const id = idSchema.parse(formData.get("id"));
  const status = milestoneStatusEnum.parse(formData.get("status"));

  const { error } = await supabase.from("milestones").update({ status }).eq("id", id);
  assertDbOk(error, "Could not update the milestone. Please try again.");
  revalidatePath(`/events/${eventId}`);
}
