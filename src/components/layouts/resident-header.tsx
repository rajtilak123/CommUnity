import Link from "next/link";
import { Bell } from "lucide-react";

import { siteConfig } from "@/config/site";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import type { Profile } from "@/types/auth";

type ResidentHeaderProps = {
  profile: Profile;
  unreadCount?: number;
};

export function ResidentHeader({ profile, unreadCount = 0 }: ResidentHeaderProps) {
  const initials = getProfileInitials(profile);

  return (
    <header className="fixed top-0 right-0 z-50 flex h-14 w-full items-center justify-between border-b border-[#E5E5E0] bg-white px-margin-mobile transition-colors md:w-[calc(100%-var(--spacing-sidebar))] md:px-lg">
      <div className="flex items-center gap-sm">
        <div className="flex size-7 shrink-0 items-center justify-center border border-[#E5E5E0] font-mono text-[10px] font-semibold text-[#525252] md:hidden">
          {initials}
        </div>
        <h1 className="font-serif text-base font-bold text-[#111111]">{siteConfig.name}</h1>
      </div>

      <Link
        href="/notifications"
        className="relative flex size-9 items-center justify-center text-[#525252] transition-colors hover:text-[#111111] cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center bg-[#CC0000] font-mono text-[8px] font-bold text-white select-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}

