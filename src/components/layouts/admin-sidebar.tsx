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
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-sidebar flex-col gap-sm border-r border-outline-variant bg-surface-container-low p-md md:flex">
      <div className="mb-lg px-2 text-headline-sm font-bold text-primary">CommUnity Admin</div>

      <nav className="flex flex-1 flex-col gap-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-md rounded-lg p-md text-body-md transition-all active:translate-x-0.5",
                isActive
                  ? "bg-primary-container font-bold text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-md">
        <div className="flex items-center gap-md px-2 py-md">
          <div className="flex size-10 items-center justify-center rounded-full border border-outline-variant bg-primary-container text-label-md font-bold text-on-primary-container">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-label-md font-bold text-on-surface">
              {profile.full_name ?? "Admin User"}
            </div>
            <div className="truncate text-label-sm text-on-surface-variant capitalize">{profile.role}</div>
          </div>
        </div>
        <SignOutButton className="mt-sm w-full" variant="secondary" size="sm" />
      </div>
    </aside>
  );
}
