import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and applies
 * route-group guards: unauthenticated users are redirected to /sign-in,
 * pending/unassigned staff accounts are held on /account-pending, and
 * client accounts are kept out of the (staff) surface.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith("/sign-in") ||
    path.startsWith("/request-access") ||
    path.startsWith("/auth") ||
    path.startsWith("/account-pending");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("account_type, staff_role")
      .eq("id", user.id)
      .maybeSingle();

    const isStaffRoute = path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/events") || path.startsWith("/documents") || path.startsWith("/incidents") || path.startsWith("/tasks") || path.startsWith("/clients") || path.startsWith("/knowledge") || path.startsWith("/reviews");
    const isPortalRoute = path.startsWith("/portal");

    const noRole =
      !profile ||
      profile.account_type === "pending" ||
      (profile.account_type === "staff" && !profile.staff_role);

    if (noRole && (isStaffRoute || isPortalRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/account-pending";
      return NextResponse.redirect(url);
    }

    if (isStaffRoute && profile?.account_type === "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }

    if (isPortalRoute && profile?.account_type === "staff") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
