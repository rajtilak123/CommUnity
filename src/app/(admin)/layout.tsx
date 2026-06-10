import type { ReactNode } from "react";

import { AdminShell } from "@/components/layouts/admin-shell";
import { requireAdmin } from "@/lib/auth/session";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const profile = await requireAdmin();

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
