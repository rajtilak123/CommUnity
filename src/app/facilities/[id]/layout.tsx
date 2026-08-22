import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ResidentShell } from "@/components/layouts/resident-shell";
import { requireProfile } from "@/lib/auth/session";

type FacilityLayoutProps = {
  children: ReactNode;
};

export default async function FacilityLayout({ children }: FacilityLayoutProps) {
  const profile = await requireProfile();
  if (profile.role !== "resident" && profile.role !== "admin") {
    redirect("/login");
  }

  return <ResidentShell profile={profile}>{children}</ResidentShell>;
}
