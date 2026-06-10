import { redirect } from "next/navigation";

import type { Profile, UserRole } from "@/types/auth";
import { createClient } from "@/lib/supabase/server";
import { getHomePathForRole } from "@/lib/auth/routes";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireProfile();

  if (profile.role !== role) {
    redirect(getHomePathForRole(profile.role));
  }

  return profile;
}

export async function requireResident(): Promise<Profile> {
  return requireRole("resident");
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole("admin");
}
