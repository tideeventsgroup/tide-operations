import { createClient } from "@/lib/supabase/server";

/**
 * Shared role-gate helpers for server actions that mutate staff-only
 * configuration data. RLS already enforces these same rules at the database
 * layer (confirmed against the live project: document_types is admin-only,
 * knowledge_blocks is manager-or-admin), but the rest of the admin/business
 * actions apply an application-level check on top of RLS as a second line of
 * defence and a clearer failure message — this brings document-types.ts and
 * knowledge.ts in line with that pattern instead of relying on RLS alone.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.staff_role !== "admin") throw new Error("Administrator access is required.");
  return { supabase, user };
}

export async function requireManagerOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "manager"].includes(profile.staff_role ?? "")) {
    throw new Error("Manager access is required.");
  }
  return { supabase, user };
}
