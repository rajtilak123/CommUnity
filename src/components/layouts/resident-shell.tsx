import type { ReactNode } from "react";

import { ResidentBottomNav } from "@/components/layouts/resident-bottom-nav";
import { ResidentHeader } from "@/components/layouts/resident-header";
import { ResidentSidebar } from "@/components/layouts/resident-sidebar";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";
import { getUnreadNotificationsCount } from "@/lib/notifications/queries";

type ResidentShellProps = {
  children: ReactNode;
  profile: Profile;
  className?: string;
};

export async function ResidentShell({ children, profile, className }: ResidentShellProps) {
  let unreadCount = 0;
  try {
    unreadCount = await getUnreadNotificationsCount(profile.id);
  } catch (err) {
    console.error("Failed to fetch unread notifications count:", err);
  }

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background text-on-background", className)}>
      <ResidentSidebar profile={profile} />

      <div className="relative flex flex-1 flex-col overflow-y-auto md:ml-sidebar">
        <ResidentHeader profile={profile} unreadCount={unreadCount} />

        <main className="mx-auto flex w-full max-w-container-max flex-1 flex-col gap-lg px-margin-mobile pb-[100px] pt-[88px] md:gap-xl md:px-gutter md:pb-xl">
          {children}
        </main>
      </div>

      <ResidentBottomNav />
    </div>
  );
}
