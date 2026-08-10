"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createOrganisation(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organisations")
    .insert({
      name: String(formData.get("name")),
      relationship_status: String(formData.get("relationship_status") || "prospect") as never,
      notes: str(formData, "notes"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateOrganisation(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("organisations")
    .update({
      name: String(formData.get("name")),
      relationship_status: String(formData.get("relationship_status")) as never,
      portal_access_enabled: formData.get("portal_access_enabled") === "on",
      notes: str(formData, "notes"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${id}`);
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const organisationId = String(formData.get("organisation_id"));

  const { error } = await supabase.from("contacts").insert({
    organisation_id: organisationId,
    name: String(formData.get("name")),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    role: str(formData, "role"),
    is_primary: formData.get("is_primary") === "on",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${organisationId}`);
}

export async function deleteContact(formData: FormData) {
  const supabase = await createClient();
  const organisationId = String(formData.get("organisation_id"));
  const contactId = String(formData.get("contact_id"));

  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${organisationId}`);
}
