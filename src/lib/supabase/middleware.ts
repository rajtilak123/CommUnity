import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getHomePathForRole,
  isAdminRoute,
  isProtectedRoute,
  isResidentRoute,
} from "@/lib/auth/routes";
import { getClientEnv } from "@/lib/env";
import type { UserRole } from "@/types/auth";

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
  } catch {
    user = null;
  }

  if (pathname === "/login" && user) {
    const role = await getProfileRole(supabase, user.id);

    if (role) {
      return redirectTo(request, supabaseResponse, getHomePathForRole(role));
    }
  }

  if (!isProtectedRoute(pathname)) {
    return supabaseResponse;
  }

  if (!user) {
    return redirectTo(request, supabaseResponse, "/login");
  }

  const role = await getProfileRole(supabase, user.id);

  if (!role) {
    return redirectTo(request, supabaseResponse, "/login");
  }

  if (pathname === "/") {
    return redirectTo(request, supabaseResponse, getHomePathForRole(role));
  }

  if (isAdminRoute(pathname) && role !== "admin") {
    return redirectTo(request, supabaseResponse, getHomePathForRole(role));
  }

  if (isResidentRoute(pathname) && role !== "resident") {
    return redirectTo(request, supabaseResponse, getHomePathForRole(role));
  }

  return supabaseResponse;
}

async function getProfileRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<UserRole | null> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (!data?.role) {
    return null;
  }

  return data.role as UserRole;
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
