import { redirect } from "next/navigation";

import { getHomePathForRole } from "@/lib/auth/routes";
import { getProfile } from "@/lib/auth/session";

export default async function HomePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(getHomePathForRole(profile.role));
}
