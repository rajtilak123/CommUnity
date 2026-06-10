import type { ReactNode } from "react";

import { ResidentBottomNav } from "@/components/layouts/resident-bottom-nav";
import { ResidentHeader } from "@/components/layouts/resident-header";
import { ResidentSidebar } from "@/components/layouts/resident-sidebar";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

type ResidentShellProps = {
  children: ReactNode;
  profile: Profile;
  className?: string;
};

export function ResidentShell({ children, profile, className }: ResidentShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-on-background", className)}>
      <ResidentSidebar />
      <ResidentHeader profile={profile} />

      <div className="flex flex-1 md:ml-sidebar">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="mx-auto max-w-container-max space-y-xl p-margin-mobile md:p-lg lg:p-xl">
            {children}
          </div>
        </main>
      </div>

      <ResidentBottomNav />
    </div>
  );
}
