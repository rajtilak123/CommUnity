"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { residentNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function ResidentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-full w-[280px] flex-col gap-sm border-r border-outline-variant bg-surface-container-low p-lg md:flex">
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

      <div className="mt-auto border-t border-outline-variant pt-lg">
        <p className="text-center text-label-sm text-on-surface-variant">V1.0.2</p>
      </div>
    </aside>
  );
}
