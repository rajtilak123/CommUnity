import type { ReactNode } from "react";

import { ResidentShell } from "@/components/layouts/resident-shell";
import { requireResident } from "@/lib/auth/session";

type ResidentLayoutProps = {
  children: ReactNode;
};

export default async function ResidentLayout({ children }: ResidentLayoutProps) {
  const profile = await requireResident();

  return <ResidentShell profile={profile}>{children}</ResidentShell>;
}
