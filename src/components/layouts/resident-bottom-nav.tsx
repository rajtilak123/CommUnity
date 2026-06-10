"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { residentMobileNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function ResidentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 flex h-20 w-full items-center justify-around border-t border-outline-variant bg-surface-container-lowest px-4 pb-safe md:hidden">
      {residentMobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-90",
              isActive ? "font-bold text-primary" : "text-on-surface-variant",
            )}
          >
            <Icon className="size-5" />
            <span className="text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
