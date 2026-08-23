"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { residentNavItems } from "@/config/navigation";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

type ResidentSidebarProps = {
  profile: Profile;
};

export function ResidentSidebar({ profile }: ResidentSidebarProps) {
  const pathname = usePathname();
  const initials = getProfileInitials(profile);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-full w-sidebar flex-col border-r border-primary bg-surface md:flex">
      {/* Brand header */}
      <div className="px-6 py-5 border-b border-outline-variant">
        <Link href="/dashboard" className="inline-block focus-visible:outline-none">
          <Image
            src="/branding/community-logo.png"
            alt="CommUnity Logo"
            width={160}
            height={160}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      <nav className="flex flex-grow flex-col py-2 overflow-y-auto">
        {residentNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                isActive
                  ? "border-l-2 border-error text-on-surface font-semibold bg-surface-container-low"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low",
              )}
            >
              <Icon className={cn("size-4 shrink-0", isActive ? "text-on-surface" : "text-outline")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile details and logout button */}
      <div className="border-t border-outline-variant">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center border border-outline-variant text-[10px] font-mono font-bold text-on-surface-variant select-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-on-surface">
              {profile.full_name ?? "Resident User"}
            </div>
            <div className="truncate font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">
              {profile.unit_label ? `Unit ${profile.unit_label}` : "Resident"}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <SignOutButton
            className="w-full text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low flex justify-center py-2 rounded-none border border-outline-variant transition-colors focus-visible:outline-none"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </aside>
  );
}

