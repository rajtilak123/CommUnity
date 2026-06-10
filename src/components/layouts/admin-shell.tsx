import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
  profile: Profile;
  className?: string;
};

export function AdminShell({ children, profile, className }: AdminShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-on-background", className)}>
      <AdminSidebar profile={profile} />

      <div className="flex min-h-screen flex-col md:ml-sidebar">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-container-max space-y-xl p-margin-mobile md:p-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
