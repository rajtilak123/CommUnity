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
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-full w-sidebar flex-col border-r border-[#111111] bg-white md:flex">
      {/* Brand header */}
      <div className="px-6 py-5 border-b border-[#E5E5E0]">
        <div className="font-serif text-lg font-bold text-[#111111] leading-none">{siteConfig.name}</div>
        <div className="font-mono text-[9px] tracking-widest text-[#737373] uppercase mt-1">Resident Portal</div>
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
                  ? "border-l-2 border-[#CC0000] text-[#111111] font-semibold bg-[#F5F5F5]"
                  : "text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5]",
              )}
            >
              <Icon className={cn("size-4 shrink-0", isActive ? "text-[#111111]" : "text-[#A3A3A3]")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile details and logout button */}
      <div className="border-t border-[#E5E5E0]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center border border-[#E5E5E0] text-[10px] font-mono font-bold text-[#525252] select-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-[#111111]">
              {profile.full_name ?? "Resident User"}
            </div>
            <div className="truncate font-mono text-[9px] text-[#737373] uppercase tracking-wider">
              {profile.unit_label ? `Unit ${profile.unit_label}` : "Resident"}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <SignOutButton
            className="w-full text-xs font-medium text-[#525252] hover:text-[#111111] hover:bg-[#F5F5F5] flex justify-center py-2 rounded-none border border-[#E5E5E0] transition-colors focus-visible:outline-none"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </aside>
  );
}

