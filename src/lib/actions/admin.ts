"use server";

import { createClient as createIsolatedClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];
type StaffRole = Database["public"]["Enums"]["staff_role"];

const idSchema = z.string().uuid();
const emailSchema = z.string().trim().email().max(254);
const nameSchema = z.string().trim().min(1).max(120);
const accountTypeSchema = z.enum(["staff", "client", "pending"]);
const staffRoleSchema = z.enum(["admin", "manager", "control_room", "field"]);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.staff_role !== "admin") throw new Error("Administrator access is required");
  return { supabase, user };
}

function accessFields(formData: FormData) {
  const accountType = accountTypeSchema.parse(formData.get("account_type")) as AccountType;
  const roleValue = String(formData.get("staff_role") ?? "");
  const organisationValue = String(formData.get("organisation_id") ?? "");
  const staffRole = roleValue ? staffRoleSchema.parse(roleValue) as StaffRole : null;
  const organisationId = organisationValue ? idSchema.parse(organisationValue) : null;

  if (accountType === "staff" && !staffRole) throw new Error("Choose a staff role");
  if (accountType === "client" && !organisationId) throw new Error("Client users must be linked to an organisation");

  return {
    account_type: accountType,
    staff_role: accountType === "staff" ? staffRole : null,
    organisation_id: accountType === "client" ? organisationId : null,
  };
}

export async function createUserAccount(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = emailSchema.parse(formData.get("email")).toLowerCase();
  const fullName = nameSchema.parse(formData.get("full_name"));
  const password = z.string().min(12).max(128).parse(formData.get("temporary_password"));
  const access = accessFields(formData);

  let createdUserId: string | undefined;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw new Error(error.message);
    createdUserId = data.user.id;
  } else {
    // Safe fallback for local installations without a service-role key. This
    // client has no admin session and cannot affect the signed-in administrator.
    const isolatedClient = createIsolatedClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await isolatedClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    createdUserId = data.user?.id;
  }

  if (!createdUserId) throw new Error("The account could not be created");

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName, ...access })
    .eq("id", createdUserId);
  if (profileError) throw new Error(profileError.message);

  if (access.account_type === "client" && access.organisation_id) {
    const { error } = await supabase
      .from("organisations")
      .update({ portal_access_enabled: true })
      .eq("id", access.organisation_id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/organisations");
  redirect(`/admin/users?created=${encodeURIComponent(email)}`);
}

export async function updateUserAccess(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const userId = idSchema.parse(formData.get("user_id"));
  const fullName = nameSchema.parse(formData.get("full_name"));
  const access = accessFields(formData);

  if (userId === user.id && (access.account_type !== "staff" || access.staff_role !== "admin")) {
    throw new Error("You cannot remove your own administrator access");
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName, ...access })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/organisations");
  revalidatePath("/portal");
}

export async function revokeAccess(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const userId = idSchema.parse(formData.get("user_id"));
  if (userId === user.id) throw new Error("You cannot revoke your own administrator access");

  const { error } = await supabase
    .from("user_profiles")
    .update({ account_type: "pending", staff_role: null, organisation_id: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/organisations");
}

export async function updateOrganisationSettings(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = idSchema.parse(formData.get("organisation_id"));
  const status = z.enum(["prospect", "active", "past"]).parse(formData.get("relationship_status"));
  const name = nameSchema.parse(formData.get("name"));

  const { error } = await supabase.from("organisations").update({
    name,
    relationship_status: status,
    portal_access_enabled: formData.get("portal_access_enabled") === "on",
  }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/organisations");
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/portal");
}

const optionalText = (value: FormDataEntryValue | null) => {
  const parsed = typeof value === "string" ? value.trim() : "";
  return parsed || null;
};

export async function updateSystemSettings(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const vatRate = z.coerce.number().min(0).max(100).parse(formData.get("default_vat_rate"));
  const quoteDays = z.coerce.number().int().min(1).max(365).parse(formData.get("quote_valid_days"));
  const invoiceDays = z.coerce.number().int().min(1).max(365).parse(formData.get("invoice_due_days"));

  const { error } = await supabase.from("system_settings").update({
    company_name: nameSchema.parse(formData.get("company_name")),
    legal_name: nameSchema.parse(formData.get("legal_name")),
    registration_number: optionalText(formData.get("registration_number")),
    vat_number: optionalText(formData.get("vat_number")),
    operations_email: emailSchema.parse(formData.get("operations_email")),
    accounts_email: optionalText(formData.get("accounts_email")),
    phone: optionalText(formData.get("phone")),
    website: optionalText(formData.get("website")),
    postal_address: optionalText(formData.get("postal_address")),
    default_currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).parse(formData.get("default_currency")),
    default_vat_rate: vatRate,
    quote_valid_days: quoteDays,
    invoice_due_days: invoiceDays,
    portal_welcome_message: z.string().trim().min(20).max(500).parse(formData.get("portal_welcome_message")),
    dark_logo_url: z.string().url().parse(formData.get("dark_logo_url")),
    light_logo_url: z.string().url().parse(formData.get("light_logo_url")),
    brand_primary: z.string().regex(/^#[0-9a-f]{6}$/i).parse(formData.get("brand_primary")),
    brand_accent: z.string().regex(/^#[0-9a-f]{6}$/i).parse(formData.get("brand_accent")),
    updated_by: user.id,
  }).eq("id", "default");
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/general");
  revalidatePath("/business");
}
