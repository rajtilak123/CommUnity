"use client";

import Link from "next/link";
import Image from "next/image";
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
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-sidebar-admin flex-col bg-[#111111] md:flex">
      {/* Brand header */}
      <div className="px-4 py-5 border-b border-[#333333]">
        <Link href="/admin/dashboard" className="inline-block focus-visible:outline-none">
          <div className="inline-flex items-center justify-center bg-[#F9F9F7] p-1.5 rounded">
            <Image
              src="/branding/community-logo.png"
              alt="CommUnity Logo"
              width={160}
              height={160}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col py-2 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all select-none focus-visible:outline-none",
                isActive
                  ? "border-l-2 border-[#CC0000] text-[#F9F9F7] bg-white/5"
                  : "text-[#A3A3A3] hover:text-[#F9F9F7] hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  isActive ? "text-[#F9F9F7]" : "text-[#737373]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="border-t border-[#333333] bg-[#0A0A0A]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center bg-[#333333] text-[10px] font-mono font-bold text-[#F9F9F7] select-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-[#F9F9F7]">
              {profile.full_name ?? "Admin User"}
            </div>
            <div className="truncate font-mono text-[9px] text-[#737373] uppercase tracking-wider capitalize">
              {profile.role}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <SignOutButton
            className="w-full text-xs font-medium text-[#A3A3A3] hover:text-[#F9F9F7] hover:bg-white/5 flex justify-center py-2 rounded-none border border-[#333333] transition-colors focus-visible:outline-none"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </aside>
  );
}
