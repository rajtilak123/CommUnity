"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { residentNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function ResidentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-sidebar flex-col gap-sm border-r border-outline-variant bg-surface-container-low p-md md:flex">
      <div className="mb-lg flex items-center gap-sm px-md font-bold text-primary">
        <span className="text-headline-sm">{siteConfig.name}</span>
      </div>

      <nav className="flex flex-col gap-1">
        {residentNavItems.map((item) => {
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
    </aside>
  );
}
