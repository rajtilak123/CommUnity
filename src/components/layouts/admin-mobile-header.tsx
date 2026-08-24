"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile md:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2 focus-visible:outline-none">
          <Image
            src="/branding/community-icon.png"
            alt="CommUnity Logo"
            width={28}
            height={28}
            className="size-7 object-contain"
            unoptimized
          />
          <span className="font-serif text-xl font-bold tracking-tight text-on-surface">
            CommUnity
          </span>
          <span className="font-mono text-[9px] tracking-widest text-on-surface-variant uppercase">Admin</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex size-9 items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="admin-mobile-drawer"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in drawer container — dark ink */}
      <div
        id="admin-mobile-drawer"
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 left-0 z-55 flex h-full w-sidebar-admin flex-col bg-[#111111] transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#333333]">
          <Link href="/admin/dashboard" className="inline-block focus-visible:outline-none">
            <div className="inline-flex items-center gap-2 justify-center bg-[#F9F9F7] px-2 py-1 rounded">
              <Image
                src="/branding/community-icon.png"
                alt="CommUnity Logo"
                width={28}
                height={28}
                className="size-7 object-contain"
                unoptimized
              />
              <span className="font-serif text-xl font-bold tracking-tight text-[#111111]">
                CommUnity
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex size-8 items-center justify-center text-[#737373] hover:text-[#F9F9F7] transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Links inside Drawer */}
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

        {/* Profile Details & Logout Button */}
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
      </div>
    </>
  );
}
