import { Home, Mail, Palette, Smartphone } from "lucide-react";

import { ProfileForm } from "@/app/(resident)/profile/profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import { requireResident } from "@/lib/auth/session";

export default async function ProfilePage() {
  const profile = await requireResident();
  const initials = getProfileInitials(profile);

  return (
    <>
      <div className="hidden md:block">
        <h2 className="text-headline-lg text-on-surface">Profile</h2>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-lg md:grid-cols-12 md:gap-gutter">
        {/* Profile Identity Card */}
        <section className="relative flex min-w-0 flex-col items-center overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-lg text-center ambient-shadow md:col-span-4">
          <div className="absolute left-0 top-0 h-24 w-full bg-surface-container-high" />

          <div className="relative mb-4 mt-6 flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface-container-lowest bg-surface-variant text-headline-md font-semibold text-on-surface">
            {initials}
          </div>

          <h2 className="mb-1 text-headline-md text-on-surface">
            {profile.full_name ?? "Resident"}
          </h2>

          {profile.unit_label ? (
            <div className="mb-lg flex items-center gap-xs">
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-label-sm text-primary">
                <Home className="size-3.5 shrink-0" />
                {profile.unit_label}
              </span>
            </div>
          ) : (
            <div className="mb-lg" />
          )}

          <div className="w-full space-y-md border-t border-outline-variant pt-lg text-left">
            <div className="flex items-center gap-md">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                <Mail className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </p>
                <p className="break-all text-body-md text-on-surface">{profile.email}</p>
              </div>
            </div>

            {profile.phone ? (
              <div className="flex items-center gap-md">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                  <Smartphone className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Phone Number
                  </p>
                  <p className="break-all text-body-md text-on-surface">{profile.phone}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Settings & Actions Column */}
        <section className="flex min-w-0 flex-col gap-lg md:col-span-8 md:gap-gutter">
          {/* Theme Settings Card */}
          <div className="min-w-0 rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-lg ambient-shadow">
            <h3 className="mb-lg flex items-center gap-sm text-headline-sm text-on-surface">
              <Palette className="size-5 shrink-0 text-primary" />
              Theme Settings
            </h3>
            <ThemeToggle />
          </div>

          {/* Account Management Card */}
          <div className="min-w-0 overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest ambient-shadow">
            <div className="border-b border-outline-variant bg-surface-bright p-lg">
              <h3 className="text-headline-sm text-on-surface">Account Management</h3>
            </div>
            <div className="p-lg">
              <ProfileForm profile={profile} />
            </div>
          </div>

          {/* Logout */}
          <div className="mt-md">
            <SignOutButton className="h-auto w-full rounded-lg border border-error bg-transparent px-xl py-3 text-label-md font-semibold text-error hover:bg-error-container/50 md:w-auto">
              Logout
            </SignOutButton>
          </div>
        </section>
      </div>
    </>
  );
}
