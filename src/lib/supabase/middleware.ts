import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getHomePathForRole,
  isAdminRoute,
  isProtectedRoute,
  isResidentRoute,
} from "@/lib/auth/routes";
import { getClientEnv } from "@/lib/env";
import type { UserRole, ProfileStatus } from "@/types/auth";


type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const GET_USER_TIMEOUT_MS = 10_000;

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({ request });
  const env = getClientEnv();

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;

  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`getUser timed out after ${GET_USER_TIMEOUT_MS / 1000}s`)),
          GET_USER_TIMEOUT_MS,
        );
      }),
    ]);
    user = result.data.user;
  } catch (err) {
    console.error("getUser error:", err);
    user = null;
  }

  if (pathname === "/login" && user) {
    const profile = await getProfileDetails(supabase, user.id);

    if (profile) {
      if (!profile.society_id || profile.status !== "approved") {
        return redirectTo(request, supabaseResponse, "/onboarding");
      }
      return redirectTo(request, supabaseResponse, getHomePathForRole(profile.role));
    }
  }

  if (!isProtectedRoute(pathname)) {
    return supabaseResponse;
  }

  if (!user) {
    return redirectTo(request, supabaseResponse, "/login");
  }

  const profile = await getProfileDetails(supabase, user.id);

  if (!profile) {
    return redirectTo(request, supabaseResponse, "/login");
  }

  // Onboarding firewall redirection logic (UX-only redirection)
  if (!profile.society_id || profile.status !== "approved") {
    if (pathname !== "/onboarding") {
      return redirectTo(request, supabaseResponse, "/onboarding");
    }
    return supabaseResponse;
  }

  // If already onboarded and approved, redirect home if on onboarding
  if (pathname === "/onboarding") {
    return redirectTo(request, supabaseResponse, getHomePathForRole(profile.role));
  }

  if (pathname === "/") {
    return redirectTo(request, supabaseResponse, getHomePathForRole(profile.role));
  }

  if (isAdminRoute(pathname) && profile.role !== "admin") {
    return redirectTo(request, supabaseResponse, getHomePathForRole(profile.role));
  }

  if (isResidentRoute(pathname) && profile.role !== "resident") {
    // Allow admins to preview resident facility pages
    const isAdminPreview = profile.role === "admin" && pathname.startsWith("/facilities/");
    if (!isAdminPreview) {
      return redirectTo(request, supabaseResponse, getHomePathForRole(profile.role));
    }
  }

  return supabaseResponse;
}

async function getProfileDetails(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<{ role: UserRole; society_id: string | null; status: ProfileStatus } | null> {
  const { data } = await supabase.from("profiles").select("role, society_id, status").eq("id", userId).single();

  if (!data?.role) {
    return null;
  }

  return {
    role: data.role as UserRole,
    society_id: data.society_id,
    status: data.status as ProfileStatus,
  };
}


function redirectTo(request: NextRequest, response: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

