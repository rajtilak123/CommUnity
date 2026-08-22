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
    <header className="fixed top-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile transition-colors md:w-[calc(100%-var(--spacing-sidebar))] md:px-lg">
      <div className="flex items-center gap-sm">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-variant text-label-sm font-semibold text-on-surface md:hidden">
          {initials}
        </div>
        <h1 className="text-headline-sm font-bold tracking-tight text-primary">{siteConfig.name}</h1>
      </div>

      <Link
        href="/notifications"
        className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant active:scale-95 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-on-error select-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
