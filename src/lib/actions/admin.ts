"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export async function assignStaffRole(formData: FormData) {
  const userId = String(formData.get("user_id"));
  const staffRoleRaw = String(formData.get("staff_role"));
  const staffRole = (staffRoleRaw || null) as StaffRole | null;

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({
      account_type: staffRole ? "staff" : "pending",
      staff_role: staffRole,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}

export async function revokeAccess(formData: FormData) {
  const userId = String(formData.get("user_id"));
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_profiles")
    .update({ account_type: "pending", staff_role: null })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}
