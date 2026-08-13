"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formStr, assertDbOk } from "@/lib/form-utils";

const idSchema = z.string().uuid();
const relationshipStatusEnum = z.enum(["prospect", "active", "past"]);

const organisationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(300),
  relationship_status: relationshipStatusEnum,
  notes: z.string().trim().max(5000).nullable(),
});

export async function createOrganisation(formData: FormData) {
  const supabase = await createClient();
  const input = organisationSchema.parse({
    name: formData.get("name"),
    relationship_status: formData.get("relationship_status") || "prospect",
    notes: formStr(formData, "notes"),
  });

  const { data, error } = await supabase.from("organisations").insert(input).select("id").single();

  assertDbOk(error, "Could not create the client. Please try again.");

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateOrganisation(formData: FormData) {
  const supabase = await createClient();
  const id = idSchema.parse(formData.get("id"));
  const input = organisationSchema.parse({
    name: formData.get("name"),
    relationship_status: formData.get("relationship_status"),
    notes: formStr(formData, "notes"),
  });

  const { error } = await supabase
    .from("organisations")
    .update({ ...input, portal_access_enabled: formData.get("portal_access_enabled") === "on" })
    .eq("id", id);

  assertDbOk(error, "Could not update the client. Please try again.");
  revalidatePath(`/clients/${id}`);
}

const contactSchema = z.object({
  organisation_id: idSchema,
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email").max(254).nullable(),
  phone: z.string().trim().max(50).nullable(),
  role: z.string().trim().max(200).nullable(),
  is_primary: z.boolean(),
});

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const input = contactSchema.parse({
    organisation_id: formData.get("organisation_id"),
    name: formData.get("name"),
    email: formStr(formData, "email"),
    phone: formStr(formData, "phone"),
    role: formStr(formData, "role"),
    is_primary: formData.get("is_primary") === "on",
  });

  const { error } = await supabase.from("contacts").insert(input);

  assertDbOk(error, "Could not add the contact. Please try again.");
  revalidatePath(`/clients/${input.organisation_id}`);
}

export async function deleteContact(formData: FormData) {
  const supabase = await createClient();
  const organisationId = idSchema.parse(formData.get("organisation_id"));
  const contactId = idSchema.parse(formData.get("contact_id"));

  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  assertDbOk(error, "Could not remove the contact. Please try again.");
  revalidatePath(`/clients/${organisationId}`);
}
