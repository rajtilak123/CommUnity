"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { residentNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-full w-sidebar flex-col gap-sm border-r border-outline-variant bg-surface-container-low p-lg md:flex">
      <div className="mb-xl flex items-center gap-md px-md">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-container text-headline-sm font-bold text-on-primary-container">
          {siteConfig.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-headline-sm font-bold text-primary">{siteConfig.name}</h2>
          <p className="text-label-md text-on-surface-variant">Resident Portal</p>
        </div>
      </div>

      <nav className="flex flex-grow flex-col gap-sm">
        {residentNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-md rounded-lg px-md py-sm text-body-md transition-all",
                isActive
                  ? "border-r-4 border-primary bg-surface-container-highest font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile details and logout button */}
      <div className="mt-auto border-t border-outline-variant pt-lg">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-label-md font-bold text-primary select-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-body-sm font-bold text-on-surface">
              {profile.full_name ?? "Resident User"}
            </div>
            <div className="truncate text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
              {profile.unit_label ? `Unit ${profile.unit_label}` : "Resident"}
            </div>
          </div>
        </div>
        <SignOutButton
          className="w-full text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low flex justify-center py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          variant="secondary"
          size="sm"
        />
      </div>
    </aside>
  );
}
