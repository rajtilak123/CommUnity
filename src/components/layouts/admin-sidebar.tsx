"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { adminNavItems } from "@/config/navigation";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  profile: Profile;
};

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const initials = getProfileInitials(profile);

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-sidebar-admin flex-col border-r border-outline-variant bg-surface-container-lowest px-md py-lg md:flex">
      {/* Brand logo header */}
      <div className="mb-lg px-2 flex items-center gap-2">
        <div className="size-6 rounded-md bg-primary flex items-center justify-center text-on-primary text-xs font-black select-none">
          C
        </div>
        <span className="text-body-md font-bold tracking-tight text-on-surface">CommUnity Admin</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-body-sm font-semibold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-surface-container-highest text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-outline group-hover:text-on-surface-variant"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="mt-auto border-t border-outline-variant pt-md">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-label-md font-bold text-primary select-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-body-sm font-bold text-on-surface">
              {profile.full_name ?? "Admin User"}
            </div>
            <div className="truncate text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider capitalize">
              {profile.role}
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
