import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AdminMobileHeader } from "@/components/layouts/admin-mobile-header";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
  profile: Profile;
  className?: string;
};

export function AdminShell({
  children,
  profile,
  className,
}: AdminShellProps) {
  return (
    <div className={cn("min-h-screen bg-[#F9F9F7] text-[#111111]", className)}>
      <AdminMobileHeader profile={profile} />
      <AdminSidebar profile={profile} />

      <div className="flex min-h-screen flex-col md:ml-[220px]">
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-xl p-margin-mobile pt-[72px] md:p-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}