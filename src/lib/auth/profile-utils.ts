import type { Profile } from "@/types/auth";

export function getProfileInitials(profile: Pick<Profile, "full_name" | "email">): string {
  if (profile.full_name) {
    const parts = profile.full_name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
  }

  return profile.email.slice(0, 2).toUpperCase();
}
