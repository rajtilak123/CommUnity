"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { residentMobileNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function ResidentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around rounded-t-xl border-t border-outline-variant bg-surface-container-lowest py-2 pb-safe text-label-sm shadow-lg transition-transform duration-200 md:hidden">
      {residentMobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-transform active:scale-90",
              isActive
                ? "w-auto rounded-full bg-primary-container px-4 py-1 text-on-primary-container"
                : "w-16 text-on-surface-variant hover:text-primary",
            )}
          >
            <Icon className={cn("size-6 shrink-0", isActive && "fill-current")} />
            <span className="max-[359px]:hidden truncate text-[10px] md:text-label-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
