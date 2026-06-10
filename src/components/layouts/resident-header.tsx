"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import type { Profile } from "@/types/auth";

type ResidentHeaderProps = {
  profile: Profile;
};

export function ResidentHeader({ profile }: ResidentHeaderProps) {
  const initials = getProfileInitials(profile);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 md:ml-sidebar md:w-[calc(100%-var(--width-sidebar))]">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:px-lg">
        <div className="flex items-center gap-md">
          <button
            type="button"
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-high md:hidden"
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/profile" className="text-headline-md font-bold text-primary md:text-headline-sm">
            {siteConfig.name}
          </Link>
        </div>

        <div className="flex items-center gap-sm">
          <ThemeToggle className="hidden sm:flex" />
          <Link
            href="/profile"
            className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary-container"
          >
            <span className="text-label-md font-bold">{initials}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
