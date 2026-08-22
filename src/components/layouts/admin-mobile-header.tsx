"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { adminNavItems } from "@/config/navigation";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

type AdminMobileHeaderProps = {
  profile: Profile;
};

export function AdminMobileHeader({ profile }: AdminMobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const initials = getProfileInitials(profile);

  // Close drawer on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      firstElement.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => {
      window.removeEventListener("keydown", handleTab);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile md:hidden">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-primary flex items-center justify-center text-on-primary text-xs font-black select-none">
            C
          </div>
          <span className="text-body-md font-bold tracking-tight text-on-surface">CommUnity Admin</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex size-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="admin-mobile-drawer"
        >
          <Menu className="size-6" />
        </button>
      </header>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in drawer container */}
      <div
        id="admin-mobile-drawer"
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 left-0 z-55 flex h-full w-sidebar-admin flex-col border-r border-outline-variant bg-surface-container-lowest px-md py-lg transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
      >
        {/* Drawer Header with Close button */}
        <div className="mb-lg flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary flex items-center justify-center text-on-primary text-xs font-black select-none">
              C
            </div>
            <span className="text-body-md font-bold tracking-tight text-on-surface">CommUnity Admin</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Links inside Drawer */}
        <nav className="flex flex-1 flex-col gap-0.5">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-semibold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                    isActive ? "text-primary" : "text-outline"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Details & Logout Button */}
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
            className="w-full text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low flex justify-center py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            variant="secondary"
            size="sm"
          />
        </div>
      </div>
    </>
  );
}
