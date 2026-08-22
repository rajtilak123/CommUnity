import { redirect } from "next/navigation";
import { cache } from "react";

import type { Profile, UserRole } from "@/types/auth";
import { createClient } from "@/lib/supabase/server";
import { getHomePathForRole } from "@/lib/auth/routes";

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

export const getRawProfile = cache(async (): Promise<Profile | null> => {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (error || !data) {
    return null;
  }

  const profile = data as Profile;

  // Only block deactivated accounts at the raw level
  if (!profile.is_active) {
    return null;
  }

  return profile;
});

export async function getProfile(): Promise<Profile | null> {
  const profile = await getRawProfile();

  if (!profile) {
    return null;
  }

  // Block unapproved or unassociated users
  if (profile.status !== "approved" || !profile.society_id) {
    return null;
  }

  return profile;
}



export async function requireProfile(): Promise<Profile> {
  const profile = await getRawProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.society_id || profile.status !== "approved") {
    redirect("/onboarding");
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
