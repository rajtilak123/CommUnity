import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getSettingsData } from "@/lib/settings/queries";
import { SettingsManager } from "@/components/settings/settings-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const data = await getSettingsData(profile.id, profile.society_id);
  const { society, adminProfile, invitations, stats } = data;

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full min-w-0 space-y-xl max-w-container-max mx-auto px-margin-mobile sm:px-md py-md">
      {/* ── SECTION 1 — PAGE HEADER ──────────────────────────── */}
      <div className="border-b border-outline-variant/60 pb-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm">
          <div>
            <p className="text-label-md font-semibold text-primary uppercase tracking-wider">Control Panel</p>
            <h1 className="text-headline-lg font-bold text-on-surface mt-xs">Settings</h1>
            <p className="text-body-md text-on-surface-variant mt-xs font-medium">
              Manage your society information, administrators, invitations, and system preferences.
            </p>
            <div className="mt-xs text-body-sm text-outline flex flex-wrap gap-x-4">
              <span>Society: <strong className="text-primary">{society?.name || "N/A"}</strong></span>
              <span>•</span>
              <span>Admin: <strong className="text-on-surface">{adminProfile.full_name || "N/A"}</strong></span>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-label-md text-on-surface-variant font-medium">{currentDateStr}</p>
            <p className="text-body-sm text-outline mt-xs">CommUnity Administration Settings</p>
          </div>
        </div>
      </div>

      {/* ── SETTINGS TABS MANAGER ────────────────────────────── */}
      <SettingsManager
        society={society}
        adminProfile={{
          id: adminProfile.id,
          email: adminProfile.email,
          full_name: adminProfile.full_name,
          phone: adminProfile.phone,
          role: adminProfile.role,
        }}
        invitations={invitations}
        stats={stats}
        env={process.env.NODE_ENV || "development"}
      />
    </div>
  );
}
