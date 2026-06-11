import type { Profile } from "@/types/auth";

export function getProfileInitials(profile: Pick<Profile, "full_name">): string {
  const name = profile.full_name?.trim();

  if (name) {
    return name.charAt(0).toUpperCase();
  }

  return "U";
}
