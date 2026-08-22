import { redirect } from "next/navigation";
import { getRawProfile } from "@/lib/auth/session";
import { getHomePathForRole } from "@/lib/auth/routes";
import { OnboardingView } from "@/components/auth/onboarding-view";

export const revalidate = 0; // Dynamic server component

export default async function OnboardingPage() {
  const profile = await getRawProfile();

  // Redirect to login if user is not authenticated
  if (!profile) {
    redirect("/login");
  }

  // If the user is already onboarded and approved, redirect to their home page
  if (profile.society_id && profile.status === "approved") {
    redirect(getHomePathForRole(profile.role));
  }

  // Render the onboarding interface
  return <OnboardingView profile={profile} />;
}
