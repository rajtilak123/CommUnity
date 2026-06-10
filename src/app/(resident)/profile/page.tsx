import { Home, Mail, Phone, User } from "lucide-react";

import { ProfileForm } from "@/app/(resident)/profile/profile-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import { requireResident } from "@/lib/auth/session";

export default async function ProfilePage() {
  const profile = await requireResident();
  const initials = getProfileInitials(profile);

  return (
    <>
      <PageHeader title="Profile" description="Manage your account and preferences." />

      <div className="grid grid-cols-1 gap-lg md:grid-cols-12 md:gap-gutter">
        <Card className="relative overflow-hidden p-lg text-center md:col-span-4">
          <div className="absolute top-0 left-0 h-24 w-full bg-surface-container-high" />
          <div className="relative mx-auto mt-6 flex size-24 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-surface-variant text-headline-md font-bold text-on-surface">
            {initials}
          </div>
          <h2 className="mt-4 text-headline-md text-on-surface">{profile.full_name ?? "Resident"}</h2>
          {profile.unit_label ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-label-sm text-primary">
              <Home className="size-3.5" />
              {profile.unit_label}
            </span>
          ) : null}

          <div className="mt-lg space-y-md border-t border-outline-variant pt-lg text-left">
            <div className="flex items-center gap-md">
              <div className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Email</p>
                <p className="text-body-md text-on-surface">{profile.email}</p>
              </div>
            </div>
            {profile.phone ? (
              <div className="flex items-center gap-md">
                <div className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Phone</p>
                  <p className="text-body-md text-on-surface">{profile.phone}</p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="flex flex-col gap-lg md:col-span-8">
          <Card className="p-lg">
            <h3 className="mb-lg flex items-center gap-sm text-headline-sm text-on-surface">
              <User className="size-5 text-primary" />
              Edit Profile
            </h3>
            <ProfileForm profile={profile} />
          </Card>

          <Card className="p-lg">
            <h3 className="mb-lg text-headline-sm text-on-surface">Theme Settings</h3>
            <ThemeToggle className="max-w-md" />
          </Card>

          <div>
            <SignOutButton variant="secondary" className="border-error text-error hover:bg-error-container/50">
              Logout
            </SignOutButton>
          </div>
        </div>
      </div>
    </>
  );
}
