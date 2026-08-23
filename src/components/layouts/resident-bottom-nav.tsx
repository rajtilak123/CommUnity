"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { residentMobileNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function ResidentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t-2 border-[#111111] bg-white py-2 pb-safe text-label-sm md:hidden">
      {residentMobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors",
              isActive
                ? "text-[#111111]"
                : "text-[#A3A3A3] hover:text-[#525252]",
            )}
          >
            <Icon className={cn("size-5 shrink-0", isActive && "text-[#CC0000]")} />
            <span className={cn("font-mono text-[9px] uppercase tracking-wider", isActive ? "text-[#111111] font-semibold" : "text-[#A3A3A3]")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

